export default function Navbar() {
    return (
      <nav style={{
        background: 'var(--black)',
        padding: '0 32px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '22px',
          color: 'var(--cream)',
          letterSpacing: '8px',
        }}>
          SIMPLE
        </div>
  
        <div style={{ display: 'flex', gap: '32px' }}>
          {['Menú', 'Packs', 'Mis puntos', 'Nosotros'].map((item) => (
            <span key={item} style={{
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'rgba(247,243,236,0.45)',
              fontWeight: '300',
              cursor: 'pointer',
            }}>
              {item}
            </span>
          ))}
        </div>
  
        <div style={{
          fontSize: '11px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          fontWeight: '300',
          cursor: 'pointer',
        }}>
          Carrito (0)
        </div>
      </nav>
    )
  }