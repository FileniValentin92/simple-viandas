const resenas = [
  { nombre: 'Sofía M.', inicial: 'S', color: '#4A5530', estrellas: '★★★★★', texto: 'Llego a casa a las 10 de la noche y en 10 minutos tengo algo rico de verdad. Cambió mi vida.', plato: 'Milanesa napolitana' },
  { nombre: 'Lucas R.', inicial: 'L', color: '#0E0E0C', estrellas: '★★★★★', texto: 'Compré el pack x10 y lo tuve un mes en el freezer. Todo salió impecable, como recién hecho.', plato: 'Pack x10' },
  { nombre: 'Valentina G.', inicial: 'V', color: '#636E43', estrellas: '★★★★★', texto: 'El pollo al limón es increíble. No puedo creer que algo tan rico se haga en 10 minutos.', plato: 'Pollo al limón' },
  { nombre: 'Martín P.', inicial: 'M', color: '#8A7060', estrellas: '★★★★★', texto: 'Cero conservantes y se nota. Empecé con el x5, ahora compro el x20 cada mes.', plato: 'Pack x20' },
]

export default function Resenas() {
  return (
    <section style={{
      background: 'var(--cream)',
      padding: '80px 24px',
    }}>
      <div style={{ marginBottom: '48px' }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '5px',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          fontWeight: '300',
          marginBottom: '12px',
        }}>
          Lo que dicen
        </p>
        <h2 className="section-titulo" style={{
          fontFamily: 'Playfair Display, serif',
          color: 'var(--black)',
          fontWeight: '400',
        }}>
          4.9 ★★★★★
        </h2>
        <p style={{ fontSize: '12px', color: '#999', fontWeight: '300', marginTop: '8px' }}>
          Más de 127 reseñas verificadas
        </p>
      </div>

      <div className="resenas-grid">
        {resenas.map((r) => (
          <div key={r.nombre} style={{
            background: 'var(--white)',
            border: '1px solid var(--cream-deep)',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: r.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Playfair Display, serif',
                fontSize: '16px',
                color: 'var(--cream)',
                flexShrink: 0,
              }}>
                {r.inicial}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '400', color: 'var(--black)', marginBottom: '3px' }}>{r.nombre}</p>
                <p style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '2px' }}>{r.estrellas}</p>
              </div>
            </div>

            <p style={{
              fontSize: '13px',
              lineHeight: '1.7',
              color: '#666',
              fontWeight: '300',
              fontStyle: 'italic',
              marginBottom: '16px',
            }}>
              "{r.texto}"
            </p>

            <p style={{
              fontSize: '9px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--olive-mid)',
              fontWeight: '300',
            }}>
              {r.plato}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}