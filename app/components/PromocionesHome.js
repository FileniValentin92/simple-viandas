import Link from 'next/link'

export default function PromocionesHome() {
  return (
    <section style={{ background: 'var(--cream)', padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px)', textAlign: 'center' }}>
      <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '14px' }}>
        Promociones
      </p>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--black)', fontWeight: '400', marginBottom: '48px' }}>
        Aprovechá nuestras ofertas
      </h2>
      <div className="promo-grid">

        {/* $500 OFF */}
        <div className="promo-card">
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--gold)', marginBottom: '6px' }}>$500 OFF</p>
            <p style={{ fontSize: '13px', color: 'var(--black)', fontWeight: '500', marginBottom: '8px', fontFamily: 'Jost, sans-serif' }}>Primera compra</p>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px', lineHeight: '1.6', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
              Usá el código SIMPLE500 en tu primer pedido y ahorrás desde el día uno.
            </p>
          </div>
          <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', border: '1px solid rgba(184,154,94,0.4)', padding: '8px 16px', display: 'inline-block', fontFamily: 'Jost, sans-serif' }}>
            SIMPLE500
          </div>
        </div>

        {/* Puntos */}
        <div className="promo-card">
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--gold)', marginBottom: '6px' }}>+300 pts</p>
            <p style={{ fontSize: '13px', color: 'var(--black)', fontWeight: '500', marginBottom: '8px', fontFamily: 'Jost, sans-serif' }}>Puntos por compra</p>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px', lineHeight: '1.6', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
              Acumulás puntos en cada pedido. 300 pts = 1 vianda gratis.
            </p>
          </div>
          <Link href="/login" style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', border: '1px solid rgba(184,154,94,0.4)', padding: '8px 16px', display: 'inline-block', fontFamily: 'Jost, sans-serif', textDecoration: 'none' }}>
            REGISTRARSE
          </Link>
        </div>

        {/* Más ahorrás */}
        <div className="promo-card">
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--gold)', marginBottom: '6px' }}>Más ahorrás</p>
            <p style={{ fontSize: '13px', color: 'var(--black)', fontWeight: '500', marginBottom: '8px', fontFamily: 'Jost, sans-serif' }}>Descuentos por cantidad</p>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px', lineHeight: '1.6', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
              ×5 = $400 off · ×10 = $900 off · ×15 = $1.500 off
            </p>
          </div>
          <Link href="/menu" style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', border: '1px solid rgba(184,154,94,0.4)', padding: '8px 16px', display: 'inline-block', fontFamily: 'Jost, sans-serif', textDecoration: 'none' }}>
            VER MENÚ
          </Link>
        </div>

      </div>
    </section>
  )
}
