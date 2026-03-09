const packs = [
  { qty: 'x5', precio: '$8.900', unidad: 'por vianda', descuento: null, popular: false },
  { qty: 'x10', precio: '$7.900', unidad: 'por vianda', descuento: '11% off', popular: true },
  { qty: 'x15', precio: '$7.400', unidad: 'por vianda', descuento: '17% off', popular: false },
  { qty: 'x20', precio: '$6.900', unidad: 'por vianda', descuento: '22% off', popular: false },
]

export default function Packs() {
  return (
    <section style={{
      background: 'var(--cream)',
      padding: '80px 24px',
    }}>
      <p style={{
        fontSize: '10px',
        letterSpacing: '5px',
        textTransform: 'uppercase',
        color: 'var(--gold)',
        fontWeight: '300',
        marginBottom: '12px',
      }}>
        Elegí tu pack
      </p>

      <h2 className="section-titulo" style={{
        fontFamily: 'Playfair Display, serif',
        color: 'var(--black)',
        fontWeight: '400',
        marginBottom: '40px',
      }}>
        Más comprás, más ahorrás.
      </h2>

      <div className="packs-grid">
        {packs.map((pack) => (
          <div key={pack.qty} style={{
            background: pack.popular ? 'var(--black)' : 'var(--white)',
            border: pack.popular ? 'none' : '1px solid var(--cream-deep)',
            padding: '32px 24px',
            position: 'relative',
            cursor: 'pointer',
          }}>
            {pack.popular && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--gold)',
                color: 'var(--black)',
                fontSize: '8px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding: '4px 10px',
                fontWeight: '500',
              }}>
                Popular
              </div>
            )}

            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '48px',
              color: pack.popular ? 'var(--cream)' : 'var(--black)',
              fontWeight: '400',
              lineHeight: '1',
              marginBottom: '4px',
            }}>
              {pack.qty}
            </p>

            <p style={{
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: pack.popular ? 'rgba(247,243,236,0.4)' : 'var(--olive-mid)',
              fontWeight: '300',
              marginBottom: '24px',
            }}>
              viandas
            </p>

            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '28px',
              color: pack.popular ? 'var(--cream)' : 'var(--black)',
              fontWeight: '400',
              marginBottom: '4px',
            }}>
              {pack.precio}
            </p>

            <p style={{
              fontSize: '11px',
              color: pack.popular ? 'rgba(247,243,236,0.4)' : '#999',
              fontWeight: '300',
              marginBottom: '8px',
            }}>
              {pack.unidad}
            </p>

            {pack.descuento && (
              <p style={{
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                fontWeight: '300',
              }}>
                {pack.descuento}
              </p>
            )}

            <button style={{
              width: '100%',
              background: pack.popular ? 'var(--cream)' : 'var(--black)',
              color: pack.popular ? 'var(--black)' : 'var(--cream)',
              border: 'none',
              padding: '14px',
              fontSize: '9px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif',
              fontWeight: '400',
              cursor: 'pointer',
              marginTop: '24px',
            }}>
              Elegir pack
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}