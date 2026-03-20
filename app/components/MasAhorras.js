'use client'
import { useState } from 'react'

function AhorraCard({ cant, off, popular }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--cream)' : (popular ? 'rgba(247,243,236,0.07)' : 'transparent'),
        border: '1px solid var(--gold)',
        padding: 'clamp(20px, 4vw, 48px) clamp(8px, 2vw, 20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.25s ease',
      }}
    >
      <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        {popular && (
          <p style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', background: 'var(--gold)', color: '#fff', padding: '4px 10px', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap', margin: 0 }}>
            Más popular
          </p>
        )}
      </div>
      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 4vw, 52px)', color: hovered ? 'var(--black)' : 'var(--cream)', marginBottom: '14px', lineHeight: '1', transition: 'color 0.25s ease' }}>
        {cant}
      </p>
      <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--gold)', fontWeight: '500', fontFamily: 'Jost, sans-serif', marginBottom: '8px', whiteSpace: 'nowrap' }}>
        {off}
      </p>
      <p style={{ fontSize: '11px', color: hovered ? 'rgba(14,14,12,0.4)' : 'rgba(247,243,236,0.4)', letterSpacing: '1px', fontFamily: 'Jost, sans-serif', fontWeight: '300', transition: 'color 0.25s ease' }}>
        en el total
      </p>
    </div>
  )
}

export default function MasAhorras() {
  const items = [
    { cant: '×5',  off: '$400 off' },
    { cant: '×10', off: '$900 off' },
    { cant: '×15', off: '$1.500 off', popular: true },
    { cant: '×20', off: '$2.200 off' },
  ]

  return (
    <section style={{ background: 'var(--cream)', padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 80px)' }}>
      <div style={{ border: '1px solid var(--gold)', background: 'var(--black)', padding: 'clamp(40px, 5vw, 64px) clamp(24px, 4vw, 56px)', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '16px' }}>
          Cuanto más comprás
        </p>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 52px)', color: 'var(--cream)', fontWeight: '400', marginBottom: '52px' }}>
          Más ahorrás
        </h2>
        <div className="mas-ahorras-grid" style={{ background: 'rgba(184,154,94,0.2)' }}>
          {items.map(item => (
            <AhorraCard key={item.cant} {...item} />
          ))}
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(247,243,236,0.4)', marginTop: '32px', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
          Los descuentos se aplican automáticamente al agregar viandas al carrito.
        </p>
      </div>
    </section>
  )
}
