export default function MenuDestacado() {
  return (
    <section style={{ background: 'var(--cream)', padding: 'clamp(64px, 8vw, 100px) clamp(20px, 5vw, 80px)', textAlign: 'center' }}>
      <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '14px' }}>
        El menú
      </p>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--black)', fontWeight: '400', lineHeight: '1.05' }}>
        14 platos fijos,<br />siempre disponibles.
      </h2>
    </section>
  )
}
