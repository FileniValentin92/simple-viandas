export default function MasAhorras() {
  const items = [
    { cant: '×5',  off: '$400 off' },
    { cant: '×10', off: '$900 off' },
    { cant: '×15', off: '$1.500 off', popular: true },
    { cant: '×20', off: '$2.200 off' },
  ]

  return (
    <section style={{ background: 'var(--cream)', padding: '88px 80px', textAlign: 'center' }}>
      <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '16px' }}>
        Cuanto más comprás
      </p>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '52px', color: 'var(--black)', fontWeight: '400', marginBottom: '52px' }}>
        Más ahorrás
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(0,0,0,0.08)' }}>
        {items.map(item => (
          <div key={item.cant} style={{ background: item.popular ? '#EDE9E1' : 'var(--cream)', padding: '48px 20px' }}>
            {item.popular && (
              <p style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', background: 'var(--gold)', color: '#fff', padding: '4px 10px', display: 'inline-block', marginBottom: '12px', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
                Más popular
              </p>
            )}
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '52px', color: 'var(--black)', marginBottom: '14px', lineHeight: '1' }}>{item.cant}</p>
            <p style={{ fontSize: "18px", color: "var(--gold)", fontWeight: '500', fontFamily: 'Jost, sans-serif', marginBottom: '8px', whiteSpace: 'nowrap' }}>{item.off}</p>
            <p style={{ fontSize: '11px', color: 'rgba(14,14,12,0.3)', letterSpacing: '1px', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>en el total</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '13px', color: 'rgba(14,14,12,0.4)', marginTop: '32px', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
        Los descuentos se aplican automáticamente al agregar viandas al carrito.
      </p>
    </section>
  )
}