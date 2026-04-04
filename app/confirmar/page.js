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
  const { items, totalPrecio, totalPuntos, vaciarCarrito, calcularDescuentos } = useCart()
  const { user, perfil } = useAuth()

  const [form, setForm] = useState({
    nombre: '', telefono: '', calle: '', altura: '',
    codigoPostal: '', localidad: '', piso: '', comentarios: '',
  })
  const [pagoMetodo, setPagoMetodo] = useState('efectivo')
  const [enviando, setEnviando] = useState(false)
  const [redirigiendo, setRedirigiendo] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  // Estado para canje de puntos
  const [puntosUsuario, setPuntosUsuario] = useState(0)
  const [cantidadPedidos, setCantidadPedidos] = useState(0)
  const [canjeSeleccionado, setCanjeSeleccionado] = useState(null)

  // Cargar datos del perfil
  useEffect(() => {
    if (!user?.id) return
    const cargarDatos = async () => {
      const nombre = perfil?.nombre || ''
      const telefono = perfil?.telefono || ''
      let calle = perfil?.calle || ''
      let altura = perfil?.altura || ''
      let codigoPostal = perfil?.codigo_postal || ''
      let localidad = perfil?.localidad || ''
      let piso = perfil?.piso || ''

      if (!calle) {
        const { data: ultimoPedido } = await supabase
          .from('pedidos').select('direccion, piso')
          .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single()
        if (ultimoPedido?.direccion) {
          const dir = ultimoPedido.direccion
          const partes = dir.split(',').map(p => p.trim())
          const calleAltura = partes[0] || ''
          const ultimoEspacio = calleAltura.lastIndexOf(' ')
          if (ultimoEspacio > 0) { calle = calleAltura.substring(0, ultimoEspacio); altura = calleAltura.substring(ultimoEspacio + 1) }
          partes.slice(1).forEach(parte => {
            if (parte.startsWith('CP ')) codigoPostal = parte.replace('CP ', '')
            else if (!localidad && !parte.startsWith('CP ')) localidad = parte
          })
          if (ultimoPedido.piso) piso = ultimoPedido.piso
        }
      }
      setForm(prev => ({ ...prev, nombre, telefono, calle, altura, codigoPostal, localidad, piso }))
    }
    cargarDatos()
  }, [user, perfil])

  // Cargar puntos y cantidad de pedidos
  useEffect(() => {
    if (!user?.id) return
    const cargarPuntos = async () => {
      const { data: perfilData } = await supabase.from('perfiles').select('puntos').eq('id', user.id).single()
      setPuntosUsuario(perfilData?.puntos || 0)

      const { count } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      setCantidadPedidos(count || 0)
    }
    cargarPuntos()
  }, [user])

  // Calcular nivel
  const nivel = cantidadPedidos >= 20 ? 'VIP' : cantidadPedidos >= 10 ? 'Frecuente' : 'Básico'

  // Opciones de canje disponibles
  const opcionesCanje = []
  if (puntosUsuario >= 200) opcionesCanje.push({ viandas: 1, puntos: 200 })
  if (puntosUsuario >= 300 && (nivel === 'Frecuente' || nivel === 'VIP')) opcionesCanje.push({ viandas: 2, puntos: 300 })
  if (puntosUsuario >= 400 && nivel === 'VIP') opcionesCanje.push({ viandas: 3, puntos: 400 })

  // Calcular descuentos
  const descuentos = calcularDescuentos(pagoMetodo)
  const valorCanje = canjeSeleccionado ? canjeSeleccionado.viandas * PRECIO_MIN_VIANDA : 0
  const totalFinal = Math.max(0, descuentos.totalConDescuento - valorCanje)
  const ahorroEfectivo = pagoMetodo === 'efectivo' ? (descuentos.descuentoViandas + descuentos.descuentoPacks) : 0

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
    await supabase.from('perfiles').update({
      calle: form.calle, altura: form.altura,
      codigo_postal: form.codigoPostal, localidad: form.localidad,
      piso: form.piso || null,
    }).eq('id', user.id)
  }

  const descontarStock = async () => {
    try {
      await fetch('/api/descontar-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
    } catch (err) {
      console.error('Error descontando stock:', err)
    }
  }

  const enviarEmailConfirmacion = async (emailDestino) => {
    try {
      await fetch('/api/enviar-confirmacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre, email: emailDestino, items,
          total: totalFinal, direccion: direccionCompleta(), telefono: form.telefono,
        }),
      })
    } catch (err) { console.error('Error enviando email:', err) }
  }

  const handleConfirmar = async () => {
    const errValidacion = validar()
    if (errValidacion) { setError(errValidacion); return }
    if (items.length === 0) { setError('Tu carrito está vacío'); return }

    setError(null)
    setEnviando(true)

    try {
      const datosOrden = {
        nombre: form.nombre, telefono: form.telefono,
        direccion: direccionCompleta(), piso: form.piso || null,
        comentarios: form.comentarios || null, items,
        total: totalFinal, puntos: totalPuntos,
        puntos_canjeados: canjeSeleccionado?.puntos || 0,
        viandas_canjeadas: canjeSeleccionado?.viandas || 0,
        estado: 'pendiente', pago_metodo: pagoMetodo,
        pago_estado: 'pendiente', mp_payment_id: null,
        user_id: user?.id ?? null,
      }

      if (pagoMetodo === 'mercadopago') {
        setRedirigiendo(true)

        const { data: pedidoGuardado, error: errorPedido } = await supabase
          .from('pedidos').insert([datosOrden]).select().single()

        if (errorPedido) throw errorPedido

        await guardarDireccionEnPerfil()
        await descontarStock()

        // Restar puntos canjeados inmediatamente
        if (user?.id && canjeSeleccionado) {
          const { data: perfilData } = await supabase.from('perfiles').select('puntos').eq('id', user.id).single()
          await supabase.from('perfiles').update({ puntos: (perfilData?.puntos ?? 0) - canjeSeleccionado.puntos }).eq('id', user.id)
        }

        sessionStorage.setItem('pedidoMP', JSON.stringify({
          pedidoId: pedidoGuardado.id,
          puntosGanados: totalPuntos,
          user_id: user?.id ?? null,
          emailUsuario: user?.email ?? null,
          nombre: form.nombre, items, total: totalFinal,
          direccion: direccionCompleta(), telefono: form.telefono,
        }))

        const res = await fetch('/api/mp-crear-preferencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, total: totalFinal }),
        })
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

      // Sumar puntos ganados y restar puntos canjeados
      if (user?.id) {
        const { data: perfilData } = await supabase.from('perfiles').select('puntos').eq('id', user.id).single()
        const puntosActuales = perfilData?.puntos ?? 0
        const nuevosPuntos = puntosActuales + totalPuntos - (canjeSeleccionado?.puntos || 0)
        await supabase.from('perfiles').update({ puntos: nuevosPuntos }).eq('id', user.id)
      }

      if (user?.email) await enviarEmailConfirmacion(user.email)

      vaciarCarrito()
      setExito(true)

    } catch (err) {
      console.error('Error al confirmar pedido:', err)
      setError('Hubo un problema al confirmar el pedido. Intentá de nuevo.')
      setRedirigiendo(false)
    } finally {
      setEnviando(false)
    }
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
          {user?.email && <p style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>📧 Te enviamos una confirmación a {user.email}</p>}
          {user && totalPuntos > 0 && <p style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '500', marginTop: '12px' }}>+{totalPuntos} puntos sumados a tu cuenta 🎉</p>}
          {canjeSeleccionado && <p style={{ fontSize: '13px', color: 'var(--olive)', fontWeight: '400', marginTop: '8px' }}>Canjeaste {canjeSeleccionado.viandas} vianda{canjeSeleccionado.viandas > 1 ? 's' : ''} gratis ({canjeSeleccionado.puntos} pts)</p>}
          {!user && totalPuntos > 0 && <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Iniciá sesión para acumular puntos en tu próximo pedido</p>}
          <button onClick={() => router.push('/')} style={{ marginTop: '32px', width: '100%', background: 'var(--black)', color: 'var(--cream)', border: 'none', padding: '18px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (redirigiendo) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>Redirigiendo</p>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)', fontWeight: '400' }}>Te llevamos a MercadoPago...</h2>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: 'var(--black)', marginBottom: '24px' }}>Tu carrito está vacío</p>
        <button onClick={() => router.push('/menu')} style={{ background: 'var(--black)', color: 'var(--cream)', border: 'none', padding: '16px 40px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>Ver menú</button>
      </div>
    )
  }

  const inputStyle = { width: '100%', border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '14px 16px', fontSize: '14px', fontFamily: 'Jost, sans-serif', color: 'var(--black)', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--olive-mid)', marginBottom: '8px', fontWeight: '300' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>Último paso</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--black)', fontWeight: '400', marginBottom: '40px' }}>Confirmá tu pedido</h1>

        {/* Tu pedido — items */}
        <div style={{ border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--olive-mid)', marginBottom: '20px', fontWeight: '300' }}>Tu pedido</p>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--black)' }}>{item.emoji} {item.nombre} <span style={{ color: '#999' }}>×{item.cantidad}</span></span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: 'var(--black)' }}>{formatPrecio(item.precioNum * item.cantidad)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--cream-deep)', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '300' }}>Subtotal</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--black)' }}>{formatPrecio(totalPrecio)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--olive)', fontWeight: '300' }}>
              {user ? `Ganás +${totalPuntos} pts con este pedido` : `Iniciá sesión para sumar +${totalPuntos} pts`}
            </span>
          </div>
        </div>

        {/* Datos de entrega */}
        <div style={{ border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--olive-mid)', marginBottom: '24px', fontWeight: '300' }}>Datos de entrega</p>
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

        {/* Canjear puntos */}
        {user && puntosUsuario >= 200 && (
          <div style={{ border: '1px solid var(--olive)', background: 'rgba(74,85,48,0.04)', padding: '28px', marginBottom: '32px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--olive)', marginBottom: '16px', fontWeight: '300' }}>Canjear puntos</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', color: 'var(--black)', fontWeight: '300' }}>
                Tenés <strong>{puntosUsuario.toLocaleString('es-AR')}</strong> pts · Nivel {nivel}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {opcionesCanje.map((opcion) => {
                const seleccionada = canjeSeleccionado?.puntos === opcion.puntos
                return (
                  <button
                    key={opcion.puntos}
                    onClick={() => setCanjeSeleccionado(seleccionada ? null : opcion)}
                    style={{
                      border: seleccionada ? '2px solid var(--olive)' : '1px solid var(--cream-deep)',
                      background: seleccionada ? 'var(--olive)' : 'var(--white)',
                      color: seleccionada ? 'var(--cream)' : 'var(--black)',
                      padding: '14px 20px',
                      cursor: 'pointer',
                      fontFamily: 'Jost, sans-serif',
                      fontSize: '13px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>Canjear {opcion.viandas} vianda{opcion.viandas > 1 ? 's' : ''} · {opcion.puntos} pts</span>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px' }}>
                      −{formatPrecio(opcion.viandas * PRECIO_MIN_VIANDA)}
                    </span>
                  </button>
                )
              })}
            </div>

            {canjeSeleccionado && (
              <p style={{ fontSize: '11px', color: 'var(--olive)', fontWeight: '300', marginTop: '12px', lineHeight: '1.5' }}>
                Cada vianda canjeada equivale al precio más bajo del menú ({formatPrecio(PRECIO_MIN_VIANDA)}). Si elegís una más cara, pagás la diferencia.
              </p>
            )}
          </div>
        )}

        {/* Método de pago */}
        <div style={{ border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--olive-mid)', marginBottom: '20px', fontWeight: '300' }}>Método de pago</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[{ id: 'efectivo', label: 'Efectivo', icon: '💵' }, { id: 'mercadopago', label: 'MercadoPago', icon: '💳' }].map(({ id, label, icon }) => (
              <button key={id} onClick={() => { setPagoMetodo(id); }} style={{ border: pagoMetodo === id ? '2px solid var(--black)' : '1px solid var(--cream-deep)', background: pagoMetodo === id ? 'var(--black)' : 'var(--white)', color: pagoMetodo === id ? 'var(--cream)' : 'var(--black)', padding: '20px 16px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '12px', letterSpacing: '1px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                <span style={{ fontSize: '24px' }}>{icon}</span>{label}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen de precio */}
        <div style={{ border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--olive-mid)', marginBottom: '20px', fontWeight: '300' }}>Resumen</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '300' }}>Subtotal</span>
            <span style={{ fontSize: '13px', color: 'var(--black)' }}>{formatPrecio(totalPrecio)}</span>
          </div>

          {pagoMetodo === 'efectivo' && descuentos.descuentoViandas > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--olive)', fontWeight: '300' }}>Desc. viandas sueltas ({descuentos.porcentajeViandas}%)</span>
              <span style={{ fontSize: '13px', color: 'var(--olive)', fontWeight: '400' }}>−{formatPrecio(descuentos.descuentoViandas)}</span>
            </div>
          )}

          {pagoMetodo === 'efectivo' && descuentos.descuentoPacks > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--olive)', fontWeight: '300' }}>Desc. packs (5%)</span>
              <span style={{ fontSize: '13px', color: 'var(--olive)', fontWeight: '400' }}>−{formatPrecio(descuentos.descuentoPacks)}</span>
            </div>
          )}

          {canjeSeleccionado && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '300' }}>Canje {canjeSeleccionado.viandas} vianda{canjeSeleccionado.viandas > 1 ? 's' : ''} ({canjeSeleccionado.puntos} pts)</span>
              <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '400' }}>−{formatPrecio(valorCanje)}</span>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--cream-deep)', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '300' }}>Total</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)' }}>{formatPrecio(totalFinal)}</span>
          </div>

          {(ahorroEfectivo > 0 || valorCanje > 0) && (
            <p style={{ fontSize: '12px', color: 'var(--olive)', fontWeight: '300', marginTop: '12px', textAlign: 'right' }}>
              Ahorrás {formatPrecio(ahorroEfectivo + valorCanje)} en este pedido
            </p>
          )}

          {pagoMetodo === 'mercadopago' && descuentos.descuentoViandas + descuentos.descuentoPacks > 0 && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(184,154,94,0.08)', border: '1px solid rgba(184,154,94,0.2)' }}>
              <p style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '300', lineHeight: '1.5' }}>
                💵 Pagando en efectivo ahorrás {formatPrecio(calcularDescuentos('efectivo').descuentoViandas + calcularDescuentos('efectivo').descuentoPacks)} adicionales
              </p>
            </div>
          )}
        </div>

        {error && <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

        <button onClick={handleConfirmar} disabled={enviando} style={{ width: '100%', background: enviando ? '#999' : 'var(--black)', color: 'var(--cream)', border: 'none', padding: '20px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '300', cursor: enviando ? 'not-allowed' : 'pointer' }}>
          {enviando ? 'Procesando...' : pagoMetodo === 'mercadopago' ? 'Pagar con MercadoPago →' : 'Confirmar pedido'}
        </button>
        <button onClick={() => router.back()} style={{ width: '100%', marginTop: '12px', background: 'transparent', border: 'none', color: '#999', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>← Volver al carrito</button>
      </div>
    </div>
  )
}
