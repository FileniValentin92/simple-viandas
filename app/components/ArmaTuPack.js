'use client'
import Link from 'next/link'

export default function ArmaTuPack() {
  return (
    <section style={{ background: 'var(--black)', padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px)', textAlign: 'center' }}>
      <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '14px' }}>
        Elegí tu modalidad
      </p>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--cream)', fontWeight: '400', marginBottom: '48px' }}>
        ¿Cómo querés pedir?
      </h2>
      <div className="modalidad-grid">

        {/* Viandas sueltas */}
        <div style={{ background: '#1A1A17', border: '1px solid rgba(247,243,236,0.1)', padding: 'clamp(32px, 4vw, 48px) clamp(20px, 3vw, 36px)', textAlign: 'left' }}>
          <div style={{ fontSize: '32px', marginBottom: '20px' }}>🍽️</div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(20px, 2.5vw, 26px)', color: 'var(--cream)', fontWeight: '400', marginBottom: '10px' }}>
            Viandas sueltas
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(247,243,236,0.5)', lineHeight: '1.7', marginBottom: '28px', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
            Elegí los platos que quieras, en la cantidad que quieras. Cuanto más comprás, más ahorrás.
          </p>
          <Link href="/menu" style={{ background: 'var(--cream)', color: 'var(--black)', padding: '14px 28px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '400', textDecoration: 'none', display: 'inline-block' }}>
            Ver menú
          </Link>
        </div>

        {/* Packs */}
        <div style={{ background: '#1A1A17', border: '1px solid rgba(184,154,94,0.2)', padding: 'clamp(32px, 4vw, 48px) clamp(20px, 3vw, 36px)', textAlign: 'left' }}>
          <div style={{ fontSize: '32px', marginBottom: '20px' }}>📦</div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(20px, 2.5vw, 26px)', color: 'var(--cream)', fontWeight: '400', marginBottom: '10px' }}>
            Packs
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(247,243,236,0.5)', lineHeight: '1.7', marginBottom: '28px', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
            Armá tu pack de tartas, lasagna o pastel de papa. Combiná como quieras y ahorrás más.
          </p>
          <Link href="/packs" style={{ background: 'var(--gold)', color: 'var(--black)', padding: '14px 28px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '400', textDecoration: 'none', display: 'inline-block' }}>
            Ver packs
          </Link>
        </div>

      </div>
    </section>
  )
}
