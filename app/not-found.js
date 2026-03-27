import Link from 'next/link'

export const metadata = {
  title: 'Página no encontrada | SIMPLE',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--black)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Jost, sans-serif',
      padding: '40px 20px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <p style={{ fontSize: '64px', marginBottom: '24px' }}>404</p>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '32px',
          color: 'var(--cream)',
          fontWeight: '400',
          marginBottom: '16px',
        }}>
          Página no encontrada
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'rgba(247,243,236,0.5)',
          fontWeight: '300',
          lineHeight: '1.7',
          marginBottom: '40px',
        }}>
          La página que buscás no existe o fue movida.
        </p>
        <Link href="/menu" style={{
          display: 'inline-block',
          background: 'var(--cream)',
          color: 'var(--black)',
          padding: '14px 32px',
          fontSize: '9px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          fontFamily: 'Jost, sans-serif',
          textDecoration: 'none',
        }}>
          Ver menú
        </Link>
      </div>
    </div>
  )
}
