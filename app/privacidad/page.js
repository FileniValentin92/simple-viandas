import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Política de Privacidad — SIMPLE',
  description: 'Cómo recopilamos, usamos y protegemos tu información personal.',
}

const secciones = [
  {
    titulo: '1. Información que recopilamos',
    contenido: null,
    lista: [
      'Nombre y apellido',
      'Dirección de email',
      'Dirección de entrega',
      'Historial de pedidos y preferencias',
      'Datos de navegación (cookies técnicas)',
    ],
  },
  {
    titulo: '2. Cómo usamos tu información',
    contenido: 'Usamos tus datos exclusivamente para:',
    lista: [
      'Procesar y entregar tus pedidos',
      'Comunicarte el estado de tu compra',
      'Gestionar tu cuenta y puntos acumulados',
      'Enviarte novedades del menú (solo si lo autorizás)',
      'Mejorar nuestra plataforma y experiencia de usuario',
    ],
  },
  {
    titulo: '3. Compartir información con terceros',
    contenido: 'No vendemos ni cedemos tus datos personales a terceros. Solo compartimos información con proveedores necesarios para operar el servicio:',
    lista: [
      'MercadoPago — procesamiento de pagos',
      'Supabase — almacenamiento seguro de datos',
      'Resend — envío de emails transaccionales',
    ],
    extra: 'Todos operan bajo sus propias políticas de privacidad y estándares de seguridad.',
  },
  {
    titulo: '4. Seguridad',
    contenido: 'Implementamos medidas técnicas y organizativas para proteger tu información contra accesos no autorizados, alteraciones o divulgaciones. Los datos de pago son procesados íntegramente por MercadoPago — nunca almacenamos datos de tarjetas en nuestros sistemas.',
    lista: null,
  },
  {
    titulo: '5. Tus derechos',
    contenido: 'Conforme a la Ley 25.326 de Protección de Datos Personales (Argentina), tenés derecho a:',
    lista: [
      'Acceder a tus datos personales',
      'Rectificar información incorrecta',
      'Solicitar la eliminación de tus datos',
      'Oponerte al tratamiento de tus datos',
    ],
    extra: 'Para ejercer estos derechos, escribinos a hola@simpleviandas.com.ar',
  },
  {
    titulo: '6. Cookies',
    contenido: 'Usamos cookies técnicas estrictamente necesarias para el funcionamiento del sitio (sesión, carrito, autenticación). No usamos cookies de seguimiento publicitario ni de terceros.',
    lista: null,
  },
  {
    titulo: '7. Contacto',
    contenido: 'Ante cualquier consulta sobre esta política, podés escribirnos a hola@simpleviandas.com.ar o por WhatsApp. Respondemos en un plazo máximo de 72 horas hábiles.',
    lista: null,
  },
]

export default function PrivacidadPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'var(--black)', padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 80px)', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '16px' }}>
          Legal
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--cream)', fontWeight: '400' }}>
          Política de Privacidad
        </h1>
        <p style={{ fontSize: '12px', color: 'rgba(247,243,236,0.3)', marginTop: '16px', letterSpacing: '1px', fontFamily: 'Jost, sans-serif' }}>
          Última actualización: marzo 2026
        </p>
      </section>

      {/* Contenido */}
      <section style={{ background: 'var(--cream)', padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {secciones.map((s, i) => (
            <div key={i} style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '22px',
                color: 'var(--black)',
                fontWeight: '400',
                marginBottom: '14px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
              }}>
                {s.titulo}
              </h2>
              {s.contenido && (
                <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', marginBottom: s.lista ? '12px' : '0', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
                  {s.contenido}
                </p>
              )}
              {s.lista && (
                <ul style={{ paddingLeft: '20px', marginBottom: s.extra ? '12px' : '0' }}>
                  {s.lista.map((item, j) => (
                    <li key={j} style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '4px' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {s.extra && (
                <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginTop: '12px' }}>
                  {s.extra}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}