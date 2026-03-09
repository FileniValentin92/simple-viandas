const platos = [
  { emoji: '🍖', nombre: 'Milanesa napolitana', descripcion: 'Con puré rústico de papa', tiempo: '10 min', puntos: '+45 pts', precio: '$8.900' },
  { emoji: '🍗', nombre: 'Pollo al limón', descripcion: 'Con papas al olivo', tiempo: '10 min', puntos: '+40 pts', precio: '$8.500' },
  { emoji: '🫕', nombre: 'Tuco de carne', descripcion: 'Bolognesa casera', tiempo: '10 min', puntos: '+40 pts', precio: '$8.200' },
  { emoji: '🥦', nombre: 'Tarta de verdura', descripcion: 'Espinaca y ricota', tiempo: '10 min', puntos: '+35 pts', precio: '$7.800' },
  { emoji: '🍝', nombre: 'Ñoquis con salsa rosa', descripcion: 'Salsa casera cremosa', tiempo: '10 min', puntos: '+40 pts', precio: '$8.100' },
  { emoji: '🍲', nombre: 'Guiso de lentejas', descripcion: 'Con verduras de estación', tiempo: '10 min', puntos: '+35 pts', precio: '$7.900' },
]

export default function MenuDestacado() {
  return (
    <section style={{
      background: 'var(--white)',
      padding: '80px 24px',
    }}>
      <div className="menu-destacado-header">
        <div>
          <p style={{
            fontSize: '10px',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            fontWeight: '300',
            marginBottom: '12px',
          }}>
            El menú
          </p>
          <h2 className="section-titulo" style={{
            fontFamily: 'Playfair Display, serif',
            color: 'var(--black)',
            fontWeight: '400',
          }}>
            15 platos fijos,<br />siempre disponibles.
          </h2>
        </div>
        <a href="/menu" style={{
          background: 'transparent',
          color: 'var(--black)',
          border: '1px solid var(--black)',
          padding: '14px 24px',
          fontSize: '9px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          fontFamily: 'Jost, sans-serif',
          fontWeight: '300',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'inline-block',
          whiteSpace: 'nowrap',
          alignSelf: 'flex-end',
        }}>
          Ver todo el menú
        </a>
      </div>

      <div className="menu-grid" style={{ marginTop: '40px' }}>
        {platos.map((plato) => (
          <div key={plato.nombre} style={{
            border: '1px solid var(--cream-deep)',
            background: 'var(--white)',
            cursor: 'pointer',
            overflow: 'hidden',
          }}>
            <div style={{
              background: 'var(--cream)',
              height: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '56px',
            }}>
              {plato.emoji}
            </div>

            <div style={{ padding: '20px' }}>
              <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '18px',
                color: 'var(--black)',
                fontWeight: '400',
                marginBottom: '4px',
              }}>
                {plato.nombre}
              </h3>

              <p style={{
                fontSize: '12px',
                color: '#999',
                fontWeight: '300',
                marginBottom: '16px',
              }}>
                {plato.descripcion}
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[`⏱ ${plato.tiempo}`, '❄️ Freezer', plato.puntos].map((tag) => (
                  <span key={tag} style={{
                    fontSize: '9px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: 'var(--olive-mid)',
                    background: 'var(--cream)',
                    padding: '4px 10px',
                    fontWeight: '300',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '22px',
                  color: 'var(--black)',
                }}>
                  {plato.precio}
                </span>
                <a href="/menu" style={{
                  background: 'var(--black)',
                  color: 'var(--cream)',
                  border: 'none',
                  padding: '10px 20px',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: 'Jost, sans-serif',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}>
                  Agregar
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}