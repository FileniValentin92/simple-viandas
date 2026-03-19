'use client'
import Link from 'next/link'

export default function Hero() {
  return (
    <section style={{ background: 'var(--black)', padding: 'clamp(72px, 10vw, 110px) clamp(24px, 5vw, 80px) clamp(80px, 10vw, 120px)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(74,85,48,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '1100px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '32px', lineHeight: '1.8', fontFamily: 'Jost, sans-serif' }}>
          Viandas al vacío · Sin conservantes · Lista en 10 minutos
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(48px, 6vw, 80px)', color: 'var(--cream)', fontWeight: '400', lineHeight: '1.05', marginBottom: '28px' }}>
          Comida real,<br /><em>lista en 10 minutos.</em>
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(247,243,236,0.5)', fontWeight: '300', lineHeight: '1.7', maxWidth: '560px', margin: '0 auto 44px', fontFamily: 'Jost, sans-serif' }}>
          Viandas envasadas al vacío. Solo agua hirviendo, sin ensuciar nada. Comida casera de verdad, cuando vos querés.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/menu" style={{ background: 'var(--cream)', color: 'var(--black)', padding: '18px 48px', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '400', textDecoration: 'none', display: 'inline-block' }}>
            Ver el menú
          </Link>
          <Link href="/packs" style={{ background: 'transparent', color: 'var(--cream)', border: '1px solid rgba(247,243,236,0.3)', padding: '18px 48px', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '300', textDecoration: 'none', display: 'inline-block' }}>
            Armar pack
          </Link>
        </div>
      </div>
    </section>
  )
}