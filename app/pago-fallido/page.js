'use client'

import Link from 'next/link'

export default function PagoFallidoPage() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--black)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Jost, sans-serif', padding: '40px 20px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <p style={{ fontSize: '64px', marginBottom: '24px' }}>✕</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--cream)', fontWeight: '400', marginBottom: '16px' }}>
          El pago no se completó
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--cream-mid)', fontWeight: '300', lineHeight: '1.7', marginBottom: '40px' }}>
          Hubo un problema con tu pago. Podés intentarlo de nuevo o elegir otra forma de pago.
        </p>
        <Link href="/confirmar" style={{
          display: 'inline-block', background: 'var(--cream)', color: 'var(--black)',
          padding: '14px 32px', fontSize: '9px', letterSpacing: '3px',
          textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', textDecoration: 'none',
        }}>
          Volver al pedido
        </Link>
      </div>
    </div>
  )
}