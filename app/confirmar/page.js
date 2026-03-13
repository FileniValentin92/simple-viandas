'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '../components/CartContext'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function ConfirmarPage() {
  const router = useRouter()
  const { items, totalPrecio, totalPuntos, vaciarCarrito } = useCart()
  const { user } = useAuth()

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    calle: '',
    altura: '',
    codigoPostal: '',
    localidad: '',
    piso: '',
    comentarios: '',
  })
  const [pagoMetodo, setPagoMetodo] = useState('efectivo')
  const [enviando, setEnviando] = useState(false)
  const [redirigiendo, setRedirigiendo] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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

  const handleConfirmar = async () => {
    const errValidacion = validar()
    if (errValidacion) { setError(errValidacion); return }
    if (items.length === 0) { setError('Tu carrito está vacío'); return }

    setError(null)
    setEnviando(true)

    try {
      if (pagoMetodo === 'mercadopago') {
        setRedirigiendo(true)

        sessionStorage.setItem('pedidoPendiente', JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono,
          direccion: direccionCompleta(),
          piso: form.piso,
          comentarios: form.comentarios,
          items,
          total: totalPrecio,
          puntosGanados: totalPuntos,
          metodoPago: 'mercadopago',
          user_id: user?.id ?? null,
        }))

        const res = await fetch('/api/mp-crear-preferencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, total: totalPrecio }),
        })
        const data = await res.json()
        if (data.init_point) {
          window.location.href = data.init_point
        } else {
          throw new Error('No se pudo crear la preferencia de pago')
        }
        return
      }

      // Flujo efectivo
      const { error: errorPedido } = await supabase.from('pedidos').insert([{
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: direccionCompleta(),
        piso: form.piso || null,
        comentarios: form.comentarios || null,
        items,
        total: totalPrecio,
        puntos: totalPuntos,
        estado: 'pendiente',
        pago_metodo: 'efectivo',
        pago_estado: 'pendiente',
        mp_payment_id: null,
        user_id: user?.id ?? null,
      }])

      if (errorPedido) throw errorPedido

      // Sumar puntos al perfil si está logueado
      if (user?.id && totalPuntos > 0) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('puntos')
          .eq('id', user.id)
          .single()

        if (perfil) {
          await supabase
            .from('perfiles')
            .update({ puntos: (perfil.puntos ?? 0) + totalPuntos })
            .eq('id', user.id)
        }
      }

      vaciarCarrito()
      setExito(true)

    } catch (err) {
      console.error('Error al confirmar pedido:', err)
      setError('Hubo un problema al confirmar el pedido. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (exito) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-deep)', padding: '56px 48px', maxWidth: '480px', width: '100%' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>✅</div>
          <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>Pedido recibido</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--black)', fontWeight: '400', marginBottom: '16px' }}>¡Gracias por tu pedido!</h1>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '8px' }}>Te avisamos por WhatsApp cuando esté en camino.</p>
          {user && totalPuntos > 0 && (
            <p style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '500', marginTop: '8px' }}>+{totalPuntos} puntos sumados a tu cuenta 🎉</p>
          )}
          {!user && totalPuntos > 0 && (
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Iniciá sesión para acumular puntos en tu próximo pedido</p>
          )}
          <button onClick={() => router.push('/')} style={{ marginTop: '32px', width: '100%', background: 'var(--black)', color: 'var(--cream)', border: 'none', padding: '18px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // ── Redirigiendo a MP ──────────────────────────────────────────────────────
  if (redirigiendo) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>Redirigiendo</p>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)', fontWeight: '400' }}>Te llevamos a MercadoPago...</h2>
      </div>
    )
  }

  // ── Carrito vacío ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: 'var(--black)', marginBottom: '24px' }}>Tu carrito está vacío</p>
        <button onClick={() => router.push('/menu')} style={{ background: 'var(--black)', color: 'var(--cream)', border: 'none', padding: '16px 40px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>
          Ver menú
        </button>
      </div>
    )
  }

  // ── Formulario principal ───────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    border: '1px solid var(--cream-deep)',
    background: 'var(--white)',
    padding: '14px 16px',
    fontSize: '14px',
    fontFamily: 'Jost, sans-serif',
    color: 'var(--black)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '9px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--olive-mid)',
    marginBottom: '8px',
    fontWeight: '300',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>Último paso</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--black)', fontWeight: '400', marginBottom: '40px' }}>Confirmá tu pedido</h1>

        {/* Resumen del carrito */}
        <div style={{ border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--olive-mid)', marginBottom: '20px', fontWeight: '300' }}>Tu pedido</p>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--black)' }}>{item.emoji} {item.nombre} <span style={{ color: '#999' }}>×{item.cantidad}</span></span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: 'var(--black)' }}>${(item.precioNum * item.cantidad).toLocaleString('es-AR')}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--cream-deep)', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '300' }}>Total</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)' }}>${totalPrecio.toLocaleString('es-AR')}</span>
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

          {/* Nombre y Teléfono */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono *</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="" style={inputStyle} />
            </div>
          </div>

          {/* Calle y Altura */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Calle *</label>
              <input name="calle" value={form.calle} onChange={handleChange} placeholder="Nombre de la calle" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Altura *</label>
              <input name="altura" value={form.altura} onChange={handleChange} placeholder="1234" style={inputStyle} />
            </div>
          </div>

          {/* Código Postal y Localidad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Código postal *</label>
              <input name="codigoPostal" value={form.codigoPostal} onChange={handleChange} placeholder="1900" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Localidad *</label>
              <input name="localidad" value={form.localidad} onChange={handleChange} placeholder="" style={inputStyle} />
            </div>
          </div>

          {/* Piso/Depto */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Piso / Depto (opcional)</label>
            <input name="piso" value={form.piso} onChange={handleChange} placeholder="3° B" style={inputStyle} />
          </div>

          {/* Comentarios */}
          <div>
            <label style={labelStyle}>Comentarios (opcional)</label>
            <textarea name="comentarios" value={form.comentarios} onChange={handleChange} placeholder="Sin sal, alergia a..., etc." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        {/* Método de pago */}
        <div style={{ border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--olive-mid)', marginBottom: '20px', fontWeight: '300' }}>Método de pago</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[{ id: 'efectivo', label: 'Efectivo', icon: '💵' }, { id: 'mercadopago', label: 'MercadoPago', icon: '💳' }].map(({ id, label, icon }) => (
              <button key={id} onClick={() => setPagoMetodo(id)} style={{ border: pagoMetodo === id ? '2px solid var(--black)' : '1px solid var(--cream-deep)', background: pagoMetodo === id ? 'var(--black)' : 'var(--white)', color: pagoMetodo === id ? 'var(--cream)' : 'var(--black)', padding: '20px 16px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '12px', letterSpacing: '1px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                <span style={{ fontSize: '24px' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

        <button onClick={handleConfirmar} disabled={enviando} style={{ width: '100%', background: enviando ? '#999' : 'var(--black)', color: 'var(--cream)', border: 'none', padding: '20px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '300', cursor: enviando ? 'not-allowed' : 'pointer', transition: 'background 0.2s ease' }}>
          {enviando ? 'Procesando...' : pagoMetodo === 'mercadopago' ? 'Pagar con MercadoPago →' : 'Confirmar pedido'}
        </button>

        <button onClick={() => router.back()} style={{ width: '100%', marginTop: '12px', background: 'transparent', border: 'none', color: '#999', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
          ← Volver al carrito
        </button>

      </div>
    </div>
  )
}