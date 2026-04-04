'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '../components/CartContext'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { platos } from '../data/platos'

const PRECIO_MIN_VIANDA = Math.min(...platos.map(p => p.precioNum))

export default function ConfirmarPage() {
  const router = useRouter()
  const {
    items, totalPrecio, totalPuntos, subtotalBruto, totalDescuentoCanje,
    vaciarCarrito, calcularDescuentos, canjeItems, canjeActivo, puntosEnCanje, quitarCanje,
  } = useCart()
  const { user, perfil, cargarPerfil } = useAuth()

  const [form, setForm] = useState({
    nombre: '', telefono: '', calle: '', altura: '',
    codigoPostal: '', localidad: '', piso: '', comentarios: '',
  })
  const [pagoMetodo, setPagoMetodo] = useState('efectivo')
  const [enviando, setEnviando] = useState(false)
  const [redirigiendo, setRedirigiendo] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    const cargarDatos = async () => {
      const nombre = perfil?.nombre || ''
      const telefono = perfil?.telefono || ''
      let calle = perfil?.calle || '', altura = perfil?.altura || ''
      let codigoPostal = perfil?.codigo_postal || '', localidad = perfil?.localidad || '', piso = perfil?.piso || ''
      if (!calle) {
        const { data: ultimoPedido } = await supabase.from('pedidos').select('direccion, piso')
          .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single()
        if (ultimoPedido?.direccion) {
          const partes = ultimoPedido.direccion.split(',').map(p => p.trim())
          const ca = partes[0] || '', ue = ca.lastIndexOf(' ')
          if (ue > 0) { calle = ca.substring(0, ue); altura = ca.substring(ue + 1) }
          partes.slice(1).forEach(p => { if (p.startsWith('CP ')) codigoPostal = p.replace('CP ', ''); else if (!localidad) localidad = p })
          if (ultimoPedido.piso) piso = ultimoPedido.piso
        }
      }
      setForm(prev => ({ ...prev, nombre, telefono, calle, altura, codigoPostal, localidad, piso }))
    }
    cargarDatos()
  }, [user, perfil])

  // Separar items
  const viandasSueltas = items.filter(i => !i.nombre.includes('(pack') && !i.esCanje)
  const packsItems = items.filter(i => i.nombre.includes('(pack'))
  const cantViandasSueltas = viandasSueltas.reduce((acc, i) => acc + i.cantidad, 0)

  // Agrupar packs
  const packsAgrupados = {}
  packsItems.forEach(item => {
    const key = item.descripcion || 'Pack'
    if (!packsAgrupados[key]) packsAgrupados[key] = { items: [], subtotal: 0 }
    packsAgrupados[key].items.push(item)
    packsAgrupados[key].subtotal += item.precioNum * item.cantidad
  })

  // Descuentos (excluyen canje items)
  const descuentos = calcularDescuentos(pagoMetodo)
  // Total final = totalPrecio (ya tiene canje descontado) - descuentos efectivo
  const descuentoEfectivo = descuentos.descuentoViandas + descuentos.descuentoPacks
  const totalFinal = Math.max(0, totalPrecio - descuentoEfectivo)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validar = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio'
    if (!form.telefono.trim()) return 'El teléfono es obligatorio'
    if (!form.calle.trim()) return 'La calle es obligatoria'
    if (!form.altura.trim()) return 'La altura es obligatoria'
    if (!form.codigoPostal.trim()) return 'El código postal es obligatorio'
    if (!form.localidad.trim()) return 'La localidad es obligatoria'
    return null
  }

  const direccionCompleta = () => {
    let d = `${form.calle} ${form.altura}`
    if (form.piso) d += `, ${form.piso}`
    d += `, CP ${form.codigoPostal}, ${form.localidad}`
    return d
  }

  const guardarDireccionEnPerfil = async () => {
    if (!user?.id) return
    await supabase.from('perfiles').update({ calle: form.calle, altura: form.altura, codigo_postal: form.codigoPostal, localidad: form.localidad, piso: form.piso || null }).eq('id', user.id)
  }

  const descontarStock = async () => {
    try { await fetch('/api/descontar-stock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) }) } catch (err) { console.error(err) }
  }

  const enviarEmailConfirmacion = async (emailDestino) => {
    try { await fetch('/api/enviar-confirmacion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: form.nombre, email: emailDestino, items, total: totalFinal, direccion: direccionCompleta(), telefono: form.telefono }) }) } catch (err) { console.error(err) }
  }

  const handleConfirmar = async () => {
    const errV = validar()
    if (errV) { setError(errV); return }
    if (items.length === 0) { setError('Tu carrito está vacío'); return }
    setError(null); setEnviando(true)

    try {
      const datosOrden = {
        nombre: form.nombre, telefono: form.telefono, direccion: direccionCompleta(), piso: form.piso || null,
        comentarios: form.comentarios || null, items,
        total: totalFinal, puntos: totalPuntos,
        puntos_canjeados: puntosEnCanje, viandas_canjeadas: canjeItems.length,
        estado: 'pendiente', pago_metodo: pagoMetodo, pago_estado: 'pendiente', mp_payment_id: null,
        user_id: user?.id ?? null,
      }

      if (pagoMetodo === 'mercadopago') {
        setRedirigiendo(true)
        const { data: pedidoGuardado, error: errorPedido } = await supabase.from('pedidos').insert([datosOrden]).select().single()
        if (errorPedido) throw errorPedido
        await guardarDireccionEnPerfil()
        await descontarStock()
        // Descontar puntos del canje
        if (user?.id && puntosEnCanje > 0) {
          const { data: pf } = await supabase.from('perfiles').select('puntos').eq('id', user.id).single()
          await supabase.from('perfiles').update({ puntos: (pf?.puntos ?? 0) - puntosEnCanje }).eq('id', user.id)
        }
        sessionStorage.setItem('pedidoMP', JSON.stringify({
          pedidoId: pedidoGuardado.id, puntosGanados: totalPuntos, user_id: user?.id ?? null,
          emailUsuario: user?.email ?? null, nombre: form.nombre, items, total: totalFinal,
          direccion: direccionCompleta(), telefono: form.telefono,
        }))
        const res = await fetch('/api/mp-crear-preferencia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, total: totalFinal }) })
        const data = await res.json()
        if (data.init_point) { vaciarCarrito(); window.location.href = data.init_point }
        else throw new Error('No se pudo crear la preferencia de pago')
        return
      }

      // Flujo efectivo
      const { error: errorPedido } = await supabase.from('pedidos').insert([datosOrden])
      if (errorPedido) throw errorPedido
      await guardarDireccionEnPerfil()
      await descontarStock()
      if (user?.id) {
        const { data: pf } = await supabase.from('perfiles').select('puntos').eq('id', user.id).single()
        const nuevosPuntos = (pf?.puntos ?? 0) + totalPuntos - puntosEnCanje
        await supabase.from('perfiles').update({ puntos: nuevosPuntos }).eq('id', user.id)
      }
      if (user?.email) await enviarEmailConfirmacion(user.email)
      if (user?.id) cargarPerfil(user.id) // Refresh perfil context
      vaciarCarrito(); setExito(true)
    } catch (err) {
      console.error(err); setError('Hubo un problema al confirmar el pedido. Intentá de nuevo.'); setRedirigiendo(false)
    } finally { setEnviando(false) }
  }

  const formatPrecio = (n) => '$' + n.toLocaleString('es-AR')

  if (exito) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-deep)', padding: '56px 48px', maxWidth: '480px', width: '100%' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>✅</div>
          <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>Pedido recibido</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--black)', fontWeight: '400', marginBottom: '16px' }}>¡Gracias por tu pedido!</h1>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '8px' }}>Te avisamos por WhatsApp cuando esté en camino.</p>
          {user && totalPuntos > 0 && <p style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '500', marginTop: '12px' }}>+{totalPuntos} puntos sumados a tu cuenta 🎉</p>}
          {canjeActivo && <p style={{ fontSize: '13px', color: 'var(--olive)', marginTop: '8px' }}>Canjeaste {canjeItems.length} vianda{canjeItems.length > 1 ? 's' : ''} gratis ({puntosEnCanje} pts)</p>}
          <button onClick={() => router.push('/')} style={{ marginTop: '32px', width: '100%', background: 'var(--black)', color: 'var(--cream)', border: 'none', padding: '18px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>Volver al inicio</button>
        </div>
      </div>
    )
  }

  if (redirigiendo) {
    return (<div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>Redirigiendo</p>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)', fontWeight: '400' }}>Te llevamos a MercadoPago...</h2>
    </div>)
  }

  if (items.length === 0) {
    return (<div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: 'var(--black)', marginBottom: '24px' }}>Tu carrito está vacío</p>
      <button onClick={() => router.push('/menu')} style={{ background: 'var(--black)', color: 'var(--cream)', border: 'none', padding: '16px 40px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>Ver menú</button>
    </div>)
  }

  const inputStyle = { width: '100%', border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '14px 16px', fontSize: '14px', fontFamily: 'Jost, sans-serif', color: 'var(--black)', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--olive-mid)', marginBottom: '8px', fontWeight: '300' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>Último paso</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--black)', fontWeight: '400', marginBottom: '40px' }}>Confirmá tu pedido</h1>

        {/* Items agrupados */}
        <div style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'var(--white)', borderRadius: '4px', overflow: 'hidden', marginBottom: '32px' }}>

          {/* Viandas por canje */}
          {canjeItems.length > 0 && (
            <>
              <div style={{ padding: '12px 20px', background: 'var(--gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--black)', fontWeight: '500' }}>🎁 VIANDA{canjeItems.length > 1 ? 'S' : ''} POR CANJE · {puntosEnCanje} PTS</p>
                <button onClick={quitarCanje} style={{ background: 'transparent', border: 'none', fontSize: '9px', color: 'rgba(14,14,12,0.5)', cursor: 'pointer', letterSpacing: '1px', fontFamily: 'Jost, sans-serif' }}>QUITAR</button>
              </div>
              {canjeItems.map((item, i) => {
                const diff = Math.max(0, item.precioNum - (item.canjeValor || 0))
                const nombreDisplay = item.nombre.replace(' (canje)', '')
                return (
                  <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--black)' }}>{item.emoji} {nombreDisplay}</p>
                      <p style={{ fontSize: '11px', color: 'var(--gold)' }}>
                        Canje cubre {formatPrecio(item.canjeValor || 0)}
                        {diff > 0 ? ` · Diferencia: ${formatPrecio(diff)}` : ' · ¡Gratis!'}
                      </p>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: diff > 0 ? 'var(--black)' : 'var(--olive)' }}>
                      {diff > 0 ? formatPrecio(diff) : '$0'}
                    </span>
                  </div>
                )
              })}
            </>
          )}

          {/* Viandas sueltas */}
          {viandasSueltas.length > 0 && (
            <>
              <div style={{ padding: '12px 20px', background: 'var(--black)' }}>
                <p style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--gold)' }}>VIANDAS SUELTAS · {cantViandasSueltas} UNIDADES</p>
              </div>
              {viandasSueltas.map((item, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--black)' }}>{item.emoji} {item.nombre} ×{item.cantidad}</p>
                    <p style={{ fontSize: '11px', color: '#888' }}>{formatPrecio(item.precioNum)} c/u</p>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--black)' }}>{formatPrecio(item.precioNum * item.cantidad)}</span>
                </div>
              ))}
              {pagoMetodo === 'efectivo' && descuentos.descuentoViandas > 0 && (
                <div style={{ padding: '12px 20px', background: 'rgba(0,180,0,0.06)', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#2a7a2a', fontWeight: '500' }}>Descuento ×{cantViandasSueltas} viandas ({descuentos.porcentajeViandas}% efectivo)</span>
                  <span style={{ fontSize: '13px', color: '#2a7a2a', fontWeight: '500' }}>−{formatPrecio(descuentos.descuentoViandas)}</span>
                </div>
              )}
            </>
          )}

          {/* Packs */}
          {Object.entries(packsAgrupados).map(([nombre, grupo]) => (
            <div key={nombre}>
              <div style={{ padding: '12px 20px', background: 'var(--olive)' }}>
                <p style={{ fontSize: '9px', letterSpacing: '2px', color: 'rgba(247,243,236,0.7)' }}>{nombre.toUpperCase()}</p>
              </div>
              {grupo.items.map((item, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--black)' }}>{item.emoji} {item.nombre} ×{item.cantidad}</p>
                    <p style={{ fontSize: '11px', color: '#888' }}>{formatPrecio(item.precioNum)} c/u</p>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--black)' }}>{formatPrecio(item.precioNum * item.cantidad)}</span>
                </div>
              ))}
              {pagoMetodo === 'efectivo' && descuentos.descuentoPacks > 0 && (
                <div style={{ padding: '12px 20px', background: 'rgba(0,180,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#2a7a2a', fontWeight: '500' }}>Descuento pack (5% efectivo)</span>
                  <span style={{ fontSize: '13px', color: '#2a7a2a', fontWeight: '500' }}>−{formatPrecio(Math.round(grupo.subtotal * 5 / 100))}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info descuentos */}
        {pagoMetodo === 'efectivo' && (descuentos.descuentoViandas > 0 || descuentos.descuentoPacks > 0) && (
          <div style={{ background: 'rgba(184,154,94,0.1)', border: '1px solid rgba(184,154,94,0.3)', padding: '14px 20px', borderRadius: '4px', marginBottom: '32px' }}>
            <p style={{ fontSize: '11px', color: '#7a6030', fontWeight: '500', marginBottom: '4px' }}>💡 Descuentos aplicados por pago en efectivo</p>
            <p style={{ fontSize: '11px', color: '#7a6030' }}>Las viandas sueltas y los packs tienen descuentos separados. Si pagás con MercadoPago no aplican.</p>
          </div>
        )}

        {/* Datos de entrega */}
        <div style={{ border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '28px', marginBottom: '32px', borderRadius: '4px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '24px' }}>Datos de entrega</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div><label style={labelStyle}>Nombre *</label><input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" style={inputStyle} /></div>
            <div><label style={labelStyle}>Teléfono *</label><input name="telefono" value={form.telefono} onChange={handleChange} placeholder="" style={inputStyle} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div><label style={labelStyle}>Calle *</label><input name="calle" value={form.calle} onChange={handleChange} placeholder="Nombre de la calle" style={inputStyle} /></div>
            <div><label style={labelStyle}>Altura *</label><input name="altura" value={form.altura} onChange={handleChange} placeholder="1234" style={inputStyle} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
            <div><label style={labelStyle}>Código postal *</label><input name="codigoPostal" value={form.codigoPostal} onChange={handleChange} placeholder="1900" style={inputStyle} /></div>
            <div><label style={labelStyle}>Localidad *</label><input name="localidad" value={form.localidad} onChange={handleChange} placeholder="" style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Piso / Depto (opcional)</label><input name="piso" value={form.piso} onChange={handleChange} placeholder="3° B" style={inputStyle} /></div>
          <div><label style={labelStyle}>Comentarios (opcional)</label><textarea name="comentarios" value={form.comentarios} onChange={handleChange} placeholder="Sin sal, alergia a..., etc." rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
        </div>

        {/* Método de pago */}
        <div style={{ border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '28px', marginBottom: '32px', borderRadius: '4px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '20px' }}>Método de pago</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'efectivo', label: '💵 Efectivo al momento de la entrega', sub: (descuentos.descuentoViandas > 0 || descuentos.descuentoPacks > 0 || cantViandasSueltas >= 5 || packsItems.length > 0) ? '✓ Descuentos por cantidad aplicados' : 'Pagás al recibir', subColor: '#2a7a2a' },
              { id: 'mercadopago', label: '💳 MercadoPago', sub: 'Sin descuento por cantidad', subColor: '#888' },
            ].map(m => (
              <div key={m.id} onClick={() => setPagoMetodo(m.id)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                border: pagoMetodo === m.id ? '2px solid var(--black)' : '1px solid rgba(0,0,0,0.1)',
                cursor: 'pointer', borderRadius: '2px',
              }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {pagoMetodo === m.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--black)' }} />}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--black)' }}>{m.label}</p>
                  <p style={{ fontSize: '11px', color: pagoMetodo === m.id && m.id === 'efectivo' ? m.subColor : '#888' }}>{m.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen final */}
        <div style={{ border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '28px', marginBottom: '32px', borderRadius: '4px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px' }}>RESUMEN FINAL</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#888' }}>Subtotal</span><span>{formatPrecio(subtotalBruto)}</span>
            </div>
            {totalDescuentoCanje > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--gold)' }}>
                <span>Canje {canjeItems.length} vianda{canjeItems.length > 1 ? 's' : ''} (−{puntosEnCanje} pts)</span>
                <span>−{formatPrecio(totalDescuentoCanje)}</span>
              </div>
            )}
            {pagoMetodo === 'efectivo' && descuentos.descuentoViandas > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#2a7a2a' }}>
                <span>Desc. efectivo viandas ({descuentos.porcentajeViandas}%)</span><span>−{formatPrecio(descuentos.descuentoViandas)}</span>
              </div>
            )}
            {pagoMetodo === 'efectivo' && descuentos.descuentoPacks > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#2a7a2a' }}>
                <span>Desc. efectivo pack (5%)</span><span>−{formatPrecio(descuentos.descuentoPacks)}</span>
              </div>
            )}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '500' }}>
              <span>Total</span><span style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px' }}>{formatPrecio(totalFinal)}</span>
            </div>
          </div>
          <p style={{ fontSize: '10px', color: '#888', textAlign: 'center', marginBottom: '12px' }}>Ganás +{totalPuntos} pts con este pedido</p>
          <button onClick={handleConfirmar} disabled={enviando} style={{
            width: '100%', background: enviando ? '#999' : 'var(--black)', color: 'var(--cream)', border: 'none', padding: '14px',
            fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif',
            cursor: enviando ? 'not-allowed' : 'pointer', borderRadius: '2px',
          }}>
            {enviando ? 'Procesando...' : pagoMetodo === 'mercadopago' ? 'PAGAR CON MERCADOPAGO →' : 'CONFIRMAR Y PAGAR EN EFECTIVO'}
          </button>
        </div>

        {error && <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
        <button onClick={() => router.back()} style={{ width: '100%', background: 'transparent', border: 'none', color: '#999', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>← Volver al carrito</button>
      </div>
    </div>
  )
}
