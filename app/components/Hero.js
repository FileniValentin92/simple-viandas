export default function Hero() {
    return (
      <section style={{
        background: 'var(--black)',
        padding: '100px 64px 120px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Fondo degradado */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(74,85,48,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
  
        {/* Contenido */}
        <div style={{ position: 'relative', maxWidth: '800px' }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            fontWeight: '300',
            marginBottom: '32px',
          }}>
            Viandas al vacío · Sin conservantes · Lista en 10 minutos
          </p>
  
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '72px',
            color: 'var(--cream)',
            fontWeight: '400',
            lineHeight: '1.1',
            marginBottom: '24px',
          }}>
            Comida real,<br />
            <em>lista en<br />10 minutos.</em>
          </h1>
  
          <p style={{
            fontSize: '16px',
            color: 'rgba(247,243,236,0.5)',
            fontWeight: '300',
            lineHeight: '1.7',
            marginBottom: '48px',
            maxWidth: '480px',
          }}>
            Viandas envasadas al vacío. Solo agua hirviendo, sin ensuciar nada. 
            Comida casera de verdad, cuando vos querés.
          </p>
  
          <div style={{ display: 'flex', gap: '16px' }}>
          <a href="/menu" style={{
            background: 'var(--cream)',
            color: 'var(--black)',
            border: 'none',
            padding: '16px 40px',
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'Jost, sans-serif',
            fontWeight: '400',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            }}>
              Ver el menú
                </a>
  
            <button style={{
              background: 'transparent',
              color: 'var(--cream)',
              border: '1px solid rgba(247,243,236,0.3)',
              padding: '16px 40px',
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif',
              fontWeight: '300',
              cursor: 'pointer',
            }}>
              Armar pack
            </button>
          </div>
        </div>
      </section>
    )
  }