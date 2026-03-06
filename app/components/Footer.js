export default function Footer() {
  return (
    <footer style={{
      background: 'var(--black)',
      padding: '64px',
    }}>
      {/* Grid principal */}
      <div className="footer-grid" style={{ marginBottom: '48px' }}>

        {/* Logo y descripción */}
        <div>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '28px',
            color: 'var(--cream)',
            letterSpacing: '10px',
            marginBottom: '16px',
          }}>
            SIMPLE
          </p>
          <p style={{
            fontSize: '13px',
            color: 'rgba(247,243,236,0.4)',
            fontWeight: '300',
            lineHeight: '1.7',
          }}>
            Viandas envasadas al vacío, listas en 10 minutos. Sin conservantes, sin aditivos. Comida casera de verdad.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <p style={{
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            fontWeight: '300',
            marginBottom: '20px',
          }}>
            Navegación
          </p>
          {['Menú', 'Packs', 'Mis puntos', 'Nosotros'].map((item) => (
            <p key={item} style={{
              fontSize: '13px',
              color: 'rgba(247,243,236,0.45)',
              fontWeight: '300',
              marginBottom: '10px',
              cursor: 'pointer',
            }}>
              {item}
            </p>
          ))}
        </div>

        {/* Contacto */}
        <div>
          <p style={{
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            fontWeight: '300',
            marginBottom: '20px',
          }}>
            Contacto
          </p>
          {['Instagram', 'WhatsApp', 'hola@simple.com.ar'].map((item) => (
            <p key={item} style={{
              fontSize: '13px',
              color: 'rgba(247,243,236,0.45)',
              fontWeight: '300',
              marginBottom: '10px',
              cursor: 'pointer',
            }}>
              {item}
            </p>
          ))}
        </div>

        {/* Entregas */}
        <div>
          <p style={{
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            fontWeight: '300',
            marginBottom: '20px',
          }}>
            Entregas
          </p>
          <p style={{
            fontSize: '13px',
            color: 'rgba(247,243,236,0.45)',
            fontWeight: '300',
            lineHeight: '1.7',
          }}>
            CABA y GBA<br />
            Lunes a sábados<br />
            16hs a 20hs
          </p>
        </div>

      </div>

      {/* Línea divisora */}
      <div style={{
        height: '1px',
        background: 'rgba(247,243,236,0.08)',
        marginBottom: '24px',
      }} />

      {/* Copyright */}
      <div className="footer-bottom">
        <p style={{
          fontSize: '11px',
          color: 'rgba(247,243,236,0.2)',
          fontWeight: '300',
          letterSpacing: '1px',
        }}>
          © 2026 SIMPLE · Todos los derechos reservados
        </p>
        <p style={{
          fontSize: '11px',
          color: 'rgba(247,243,236,0.2)',
          fontWeight: '300',
          letterSpacing: '1px',
        }}>
          Sin conservantes · Sin aditivos · Sin complicaciones
        </p>
      </div>

    </footer>
  )
}