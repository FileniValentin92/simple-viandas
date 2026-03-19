'use client'
import Link from 'next/link'

export default function Hero() {
  return (
    <section style={{ background: 'var(--black)', padding: '90px 24px 100px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(74,85,48,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: '680px', width: '100%' }}>
        <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '28px', lineHeight: '1.8' }}>
          Viandas al vacío · Sin conservantes · Lista en 10 minutos
        </p>
        <h1 className="hero-titulo" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--cream)', fontWeight: '400', lineHeight: '1.05', marginBottom: '24px' }}>
          Comida real,<br /><em>lista en 10 minutos.</em>
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(247,243,236,0.5)', fontWeight: '300', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 40px' }}>
          Viandas envasadas al vacío. Solo agua hirviendo, sin ensuciar nada. Comida casera de verdad, cuando vos querés.
        </p>
        <div className="hero-botones" style={{ justifyContent: 'center' }}>
          <Link href="/menu" style={{ background: 'var(--cream)', color: 'var(--black)', padding: '16px 40px', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '400', textDecoration: 'none', display: 'inline-block' }}>
            Ver el menú
          </Link>
          <Link href="/packs" style={{ background: 'transparent', color: 'var(--cream)', border: '1px solid rgba(247,243,236,0.3)', padding: '16px 40px', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '300', textDecoration: 'none', display: 'inline-block' }}>
            Armar pack
          </Link>
        </div>
      </div>
    </section>
  )
}