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
    <section style={{ background: 'var(--black)', padding: 'clamp(48px, 7vw, 88px) clamp(20px, 5vw, 80px)', textAlign: 'center' }}>
      <p style={{ fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '16px', fontFamily: 'Jost, sans-serif' }}>
        El menú
      </p>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 52px)', color: 'var(--cream)', fontWeight: '400', marginBottom: '32px', lineHeight: '1.1' }}>
        14 platos fijos,<br />siempre disponibles.
      </h2>
      <a href="/menu" style={{
        background: 'var(--cream)',
        color: 'var(--black)',
        border: 'none',
        padding: '16px 40px',
        fontSize: '10px',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        fontFamily: 'Jost, sans-serif',
        fontWeight: '400',
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-block',
        marginBottom: '56px',
      }}>
        Ver todo el menú
      </a>

      <div className="menu-grid-wrapper">
        <div className="menu-grid">
          {platos.map((plato) => (
            <div key={plato.nombre} style={{ border: '1px solid rgba(247,243,236,0.1)', background: 'rgba(247,243,236,0.04)', cursor: 'pointer', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(247,243,236,0.07)', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>
                {plato.emoji}
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: 'var(--cream)', fontWeight: '400', marginBottom: '4px' }}>
                  {plato.nombre}
                </h3>
                <p style={{ fontSize: '12px', color: 'rgba(247,243,236,0.4)', fontWeight: '300', marginBottom: '16px' }}>
                  {plato.descripcion}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {[`⏱ ${plato.tiempo}`, '❄️ Freezer', plato.puntos].map((tag) => (
                    <span key={tag} style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(184,154,94,0.1)', padding: '4px 10px', fontWeight: '300' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: 'var(--cream)' }}>
                    {plato.precio}
                  </span>
                  <a href="/menu" style={{ background: 'var(--cream)', color: 'var(--black)', border: 'none', padding: '10px 20px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
                    Agregar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
