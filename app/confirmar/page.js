'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../components/CartContext'

export default function ConfirmarPage() {
  const { items, totalPrecio, totalPuntos, totalItems, vaciarCarrito } = useCart()
  const router = useRouter()

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    piso: '',
    comentarios: '',
  })

  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const formatPrecio = (n) => '$' + n.toLocaleString('es-AR')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleConfirmar = () => {
    if (!form.nombre.trim() || !form.telefono.trim() || !form.direccion.trim()) {
      setError('Por favor completá nombre, teléfono y dirección.')
      return
    }
    setError('')
    setEnviado(true)
    vaciarCarrito()
  }

  // Pantalla de éxito
  if (enviado) {
    return (
      <main>
        <Navbar />
        <section style={{
          minHeight: '70vh',
          background: 'var(--white)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          gap: '24px',
        }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
            ✓
          </div>
          <div>
            <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '12px' }}>
              Pedido recibido
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '40px', color: 'var(--black)', fontWeight: '400', marginBottom: '16px' }}>
              ¡Gracias, {form.nombre.split(' ')[0]}!
            </h1>
            <p style={{ fontSize: '14px', color: '#888', fontWeight: '300', maxWidth: '400px', lineHeight: '1.8' }}>
              Tu pedido fue registrado. Nos pondremos en contacto por WhatsApp al <strong>{form.telefono}</strong> para coordinar la entrega.
            </p>
          </div>
          <div style={{ background: 'var(--cream)', padding: '20px 40px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: '300' }}>
              Puntos acreditados: <strong>+{totalPuntos > 0 ? totalPuntos : '—'} pts</strong>
            </p>
          </div>
          <button onClick={() => router.push('/menu')} style={{
            background: 'var(--black)',
            color: 'var(--cream)',
            border: 'none',
            padding: '16px 48px',
            fontSize: '10px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'Jost, sans-serif',
            fontWeight: '300',
            cursor: 'pointer',
          }}>
            Volver al menú
          </button>
        </section>
        <Footer />
      </main>
    )
  }

  // Carrito vacío
  if (items.length === 0) {
    return (
      <main>
        <Navbar />
        <section style={{ minHeight: '60vh', background: 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', textAlign: 'center', padding: '40px 20px' }}>
          <span style={{ fontSize: '48px' }}>🍽️</span>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)', fontWeight: '400' }}>Tu carrito está vacío</p>
          <button onClick={() => router.push('/menu')} style={{ background: 'var(--black)', color: 'var(--cream)', border: 'none', padding: '14px 40px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '300', cursor: 'pointer' }}>
            Ver el menú
          </button>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Navbar />

      {/* Header */}
      <section style={{ background: 'var(--black)', padding: '40px 24px' }}>
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '10px' }}>
          Último paso
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '40px', color: 'var(--cream)', fontWeight: '400' }}>
          Confirmá tu pedido
        </h1>
      </section>

      {/* Contenido */}
      <section className="confirmar-content">

        {/* Formulario */}
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)', fontWeight: '400', marginBottom: '32px' }}>
            Datos de entrega
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Nombre completo *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: María García" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp / Teléfono *</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Ej: 11 5555-1234" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Dirección *</label>
              <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Ej: Av. Corrientes 1234, CABA" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Piso / Depto (opcional)</label>
              <input name="piso" value={form.piso} onChange={handleChange} placeholder="Ej: 3° B" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Comentarios (opcional)</label>
              <textarea name="comentarios" value={form.comentarios} onChange={handleChange} placeholder="Ej: Sin cebolla, timbre roto..." rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} />
            </div>
          </div>

          {error && (
            <p style={{ marginTop: '16px', fontSize: '11px', color: '#c0392b', letterSpacing: '1px', fontWeight: '300' }}>
              ⚠ {error}
            </p>
          )}
        </div>

        {/* Resumen */}
        <div style={{ border: '1px solid var(--cream-deep)', background: 'var(--cream)' }}>
          <div style={{ background: 'var(--black)', padding: '20px 24px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '4px' }}>
              Tu pedido
            </p>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--cream)', fontWeight: '400' }}>
              {totalItems} {totalItems === 1 ? 'plato' : 'platos'}
            </p>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item) => (
              <div key={item.nombre} style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--cream-deep)' }}>
                <div style={{ width: '44px', height: '44px', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '14px', color: 'var(--black)', fontWeight: '400', marginBottom: '2px' }}>
                    {item.nombre}
                  </p>
                  <p style={{ fontSize: '10px', color: '#999', fontWeight: '300' }}>x{item.cantidad}</p>
                </div>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: 'var(--black)', flexShrink: 0 }}>
                  {item.precio}
                </span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
              <span style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--olive-mid)', fontWeight: '300' }}>Puntos a ganar</span>
              <span style={{ fontSize: '12px', color: 'var(--olive)', fontWeight: '400' }}>+{totalPuntos} pts</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--cream-deep)', paddingTop: '16px', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '300' }}>Total</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--black)' }}>
                {formatPrecio(totalPrecio)}
              </span>
            </div>

            <button onClick={handleConfirmar} style={{
              width: '100%',
              background: 'var(--black)',
              color: 'var(--cream)',
              border: 'none',
              padding: '18px',
              fontSize: '10px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif',
              fontWeight: '300',
              cursor: 'pointer',
              marginTop: '8px',
            }}>
              Hacer pedido
            </button>

            <p style={{ fontSize: '9px', color: '#bbb', textAlign: 'center', fontWeight: '300', letterSpacing: '1px' }}>
              Te contactamos por WhatsApp para coordinar
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '9px',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  color: 'var(--black)',
  fontWeight: '300',
  marginBottom: '8px',
  fontFamily: 'Jost, sans-serif',
}

const inputStyle = {
  width: '100%',
  border: '1px solid var(--cream-deep)',
  background: 'var(--white)',
  padding: '14px 16px',
  fontSize: '14px',
  fontFamily: 'Jost, sans-serif',
  fontWeight: '300',
  color: 'var(--black)',
  outline: 'none',
}