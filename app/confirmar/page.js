'use client'

import { useState } from 'react'
import { useCart } from '../components/CartContext'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

export default function ConfirmarPage() {
  const { items, totalPrecio, totalPuntos, vaciarCarrito } = useCart()
  const [form, setForm] = useState({ nombre: '', telefono: '', direccion: '', piso: '', comentarios: '' })
  const [pagoMetodo, setPagoMetodo] = useState('efectivo')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.nombre || !form.telefono || !form.direccion) {
      setError('Por favor completá nombre, teléfono y dirección.')
      return
    }
    setEnviando(true)
    setError('')

    if (pagoMetodo === 'efectivo') {
      const { error: supaError } = await supabase.from('pedidos').insert([{
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: form.direccion,
        piso: form.piso,
        comentarios: form.comentarios,
        items: items,
        total: totalPrecio,
        puntos: totalPuntos,
        estado: 'pendiente',
        pago_metodo: 'efectivo',
        pago_estado: 'pendiente',
      }])
      setEnviando(false)
      if (supaError) {
        setError('Hubo un error al enviar el pedido. Intentá de nuevo.')
      } else {
        vaciarCarrito()
        setExito(true)
      }

    } else if (pagoMetodo === 'mercadopago') {
      sessionStorage.setItem('pedido_pendiente', JSON.stringify({
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: form.direccion,
        piso: form.piso,
        comentarios: form.comentarios,
        items: items,
        total: totalPrecio,
        puntos: totalPuntos,
      }))

      try {
        const res = await fetch('/api/mp-crear-preferencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            nombre: form.nombre,
            telefono: form.telefono,
            direccion: form.direccion,
            piso: form.piso,
            comentarios: form.comentarios,
          }),
        })
        const data = await res.json()
        if (data.init_point) {
          vaciarCarrito()
          window.location.href = data.init_point
        } else {
          setError('Error al conectar con MercadoPago. Intentá de nuevo.')
          setEnviando(false)
        }
      } catch (e) {
        setError('Error al conectar con MercadoPago. Intentá de nuevo.')
        setEnviando(false)
      }
    }
  }

  if (exito) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Jost, sans-serif', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <p style={{ fontSize: '48px', marginBottom: '24px' }}>✓</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--cream)', fontWeight: '400', marginBottom: '16px' }}>¡Pedido recibido!</h1>
          <p style={{ fontSize: '14px', color: 'var(--cream-mid)', fontWeight: '300', lineHeight: '1.7', marginBottom: '8px' }}>
            Nos comunicaremos a la brevedad para coordinar la entrega.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '300', marginBottom: '40px' }}>
            💵 Pagás en efectivo al recibir el pedido
          </p>
          <Link href="/menu" style={{ display: 'inline-block', background: 'var(--cream)', color: 'var(--black)', padding: '14px 32px', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', textDecoration: 'none' }}>
            Seguir comprando
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Jost, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</p>
          <p style={{ color: 'var(--cream)', fontSize: '18px', marginBottom: '32px' }}>Tu carrito está vacío</p>
          <Link href="/menu" style={{ color: 'var(--gold)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none' }}>Ver menú →</Link>
        </div>
      </div>
    )
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    background: '#fff',
    border: '1px solid #E0E0E0',
    color: 'var(--black)',
    padding: '14px 16px',
    fontSize: '14px',
    fontFamily: 'Jost, sans-serif',
    fontWeight: '300',
    outline: 'none',
    marginBottom: '12px',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', fontFamily: 'Jost, sans-serif', padding: '60px 20px' }}>
      <div className="confirmar-content">

        {/* Formulario */}
        <div>
          <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '8px' }}>Confirmar pedido</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--cream)', fontWeight: '400', marginBottom: '40px', lineHeight: '1.2' }}>Datos de entrega</h1>

          {[
            { name: 'nombre', placeholder: 'Nombre completo *', type: 'text' },
            { name: 'telefono', placeholder: 'Teléfono / WhatsApp *', type: 'tel' },
            { name: 'direccion', placeholder: 'Dirección *', type: 'text' },
            { name: 'piso', placeholder: 'Piso / Depto (opcional)', type: 'text' },
          ].map(field => (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={handleChange}
              style={inputStyle}
            />
          ))}

          <textarea
            name="comentarios"
            placeholder="Comentarios (opcional)"
            value={form.comentarios}
            onChange={handleChange}
            rows={3}
            style={{ ...inputStyle, marginBottom: '28px', resize: 'vertical' }}
          />

          {/* Método de pago */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '16px' }}>
              Forma de pago
            </p>
            <div className="pago-metodos-grid">
              {[
                { value: 'efectivo', label: 'Efectivo', emoji: '💵', desc: 'Al recibir el pedido' },
                { value: 'mercadopago', label: 'MercadoPago', emoji: '💳', desc: 'Pago online seguro' },
              ].map(op => (
                <button
                  key={op.value}
                  onClick={() => setPagoMetodo(op.value)}
                  style={{
                    background: pagoMetodo === op.value ? '#1a3a2a' : '#fff',
                    border: pagoMetodo === op.value ? '2px solid #2ecc71' : '2px solid #E0E0E0',
                    color: pagoMetodo === op.value ? '#fff' : 'var(--black)',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Jost, sans-serif',
                    transition: 'all 0.2s',
                  }}
                >
                  <p style={{ fontSize: '22px', marginBottom: '6px' }}>{op.emoji}</p>
                  <p style={{ fontSize: '13px', fontWeight: '400', marginBottom: '4px', color: pagoMetodo === op.value ? 'var(--gold)' : 'var(--black)' }}>{op.label}</p>
                  <p style={{ fontSize: '11px', fontWeight: '300', color: pagoMetodo === op.value ? 'rgba(247,243,236,0.6)' : '#999' }}>{op.desc}</p>
                </button>
              ))}
            </div>
            {pagoMetodo === 'mercadopago' && (
              <p style={{ fontSize: '12px', color: 'rgba(247,243,236,0.5)', marginTop: '12px', fontWeight: '300' }}>
                💳 Vas a ser redirigido a MercadoPago para completar el pago de forma segura.
              </p>
            )}
          </div>

          {error && <p style={{ color: '#e74c3c', fontSize: '12px', marginBottom: '16px' }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={enviando}
            style={{
              width: '100%',
              background: enviando ? '#ccc' : pagoMetodo === 'mercadopago' ? '#009ee3' : 'var(--cream)',
              color: pagoMetodo === 'mercadopago' ? '#fff' : 'var(--black)',
              border: 'none', padding: '16px',
              fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif', fontWeight: '400',
              cursor: enviando ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {enviando ? 'Procesando...' : pagoMetodo === 'mercadopago' ? '💳 Pagar con MercadoPago' : 'Confirmar pedido'}
          </button>
        </div>

        {/* Resumen */}
        <div style={{ background: '#fff', border: '1px solid #E0E0E0', padding: '28px', position: 'sticky', top: '20px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: '300', marginBottom: '20px' }}>Tu pedido</p>

          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{item.emoji}</span>
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--black)', fontWeight: '300' }}>{item.nombre}</p>
                  <p style={{ fontSize: '11px', color: '#999' }}>x{item.cantidad}</p>
                </div>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--black)' }}>{item.precio}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999' }}>Total</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: 'var(--black)' }}>${totalPrecio.toLocaleString('es-AR')}</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '300', textAlign: 'right' }}>+{totalPuntos} puntos SIMPLE</p>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F0F0F0' }}>
            <p style={{ fontSize: '11px', color: '#999', fontWeight: '300' }}>
              {pagoMetodo === 'efectivo' ? '💵 Pagás en efectivo al recibir' : '💳 Pago online — serás redirigido a MP'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}