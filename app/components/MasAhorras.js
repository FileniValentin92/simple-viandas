export default function MasAhorras() {
    const items = [
      { cant: '×5',  off: '$400 off' },
      { cant: '×10', off: '$900 off' },
      { cant: '×15', off: '$1.500 off', popular: true },
      { cant: '×20', off: '$2.200 off' },
    ]
  
    return (
      <section style={{ background: 'var(--cream)', padding: '72px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '12px' }}>
          Cuanto más comprás
        </p>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--black)', fontWeight: '400', marginBottom: '48px' }}>
          Más ahorrás
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(0,0,0,0.08)', maxWidth: '700px', margin: '0 auto' }} className="mas-ahorras-grid">
          {items.map(item => (
            <div key={item.cant} style={{ background: item.popular ? '#EDE9E1' : 'var(--cream)', padding: '32px 16px' }}>
              {item.popular && (
                <p style={{ fontSize: '7px', letterSpacing: '2px', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--black)', padding: '3px 8px', display: 'inline-block', marginBottom: '10px', fontFamily: 'Jost, sans-serif' }}>
                  Más popular
                </p>
              )}
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--black)', marginBottom: '10px' }}>{item.cant}</p>
              <p style={{ fontSize: '20px', color: 'var(--gold)', fontWeight: '500', fontFamily: 'Jost, sans-serif', marginBottom: '6px' }}>{item.off}</p>
              <p style={{ fontSize: '10px', color: 'rgba(14,14,12,0.35)', letterSpacing: '1px', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>en el total</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(14,14,12,0.4)', marginTop: '28px', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
          Los descuentos se aplican automáticamente al agregar viandas al carrito.
        </p>
      </section>
    )
  }