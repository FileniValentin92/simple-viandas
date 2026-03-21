'use client'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const cards = [
  { emoji: '👤', titulo: 'Cuenta y perfil', desc: 'Nombre, email, contraseña y preferencias de cuenta.' },
  { emoji: '📦', titulo: 'Historial de pedidos', desc: 'Todos los pedidos y registros de compra asociados a tu cuenta.' },
  { emoji: '⭐', titulo: 'Puntos acumulados', desc: 'Tu saldo de puntos será eliminado junto con tu cuenta.' },
  { emoji: '📍', titulo: 'Direcciones guardadas', desc: 'Todas las direcciones de entrega registradas en tu cuenta.' },
]

export default function EliminarDatosPage() {
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [motivo, setMotivo] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async () => {
    if (!email || !nombre || !confirmado) return
    setCargando(true)
    await new Promise(r => setTimeout(r, 1200))
    setEnviado(true)
    setCargando(false)
  }

  const valido = email && nombre && confirmado

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'var(--black)', padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 80px)', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '16px' }}>
          Tu privacidad
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--cream)', fontWeight: '400', marginBottom: '20px' }}>
          Eliminación de datos
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(247,243,236,0.5)', maxWidth: '480px', margin: '0 auto', fontFamily: 'Jost, sans-serif', fontWeight: '300', lineHeight: '1.7' }}>
          Podés solicitar la eliminación de tu cuenta y todos tus datos personales en cualquier momento, sin costo y sin justificación.
        </p>
      </section>

      {/* Contenido */}
      <section style={{ background: 'var(--cream)', padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {/* Qué se elimina */}
          <div style={{ marginBottom: '56px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '12px' }}>
              ¿Qué se elimina?
            </p>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--black)', fontWeight: '400', marginBottom: '32px' }}>
              Tus datos, completamente
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {cards.map((c, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid var(--cream-deep)', padding: '28px 24px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>{c.emoji}</div>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', color: 'var(--black)', marginBottom: '8px', fontWeight: '400' }}>{c.titulo}</p>
                  <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.6', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario */}
          <div style={{ border: '1px solid var(--gold)', background: 'var(--black)', padding: 'clamp(32px, 4vw, 56px)' }}>
            <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '12px' }}>
              Solicitar eliminación
            </p>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--cream)', fontWeight: '400', marginBottom: '8px' }}>
              Completá el formulario
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(247,243,236,0.45)', marginBottom: '32px', lineHeight: '1.7', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
              Procesamos todas las solicitudes en un plazo máximo de 30 días hábiles conforme a la Ley 25.326.
            </p>

            {enviado ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>✓</div>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: 'var(--cream)', marginBottom: '12px' }}>Solicitud enviada</p>
                <p style={{ fontSize: '13px', color: 'rgba(247,243,236,0.45)', fontFamily: 'Jost, sans-serif', fontWeight: '300', lineHeight: '1.7' }}>
                  Te contactaremos a <strong style={{ color: 'var(--gold)' }}>{email}</strong> dentro de las próximas 72 horas hábiles para confirmar la eliminación.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                  <label style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '8px', fontFamily: 'Jost, sans-serif' }}>
                    Email de tu cuenta *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    style={{ width: '100%', background: '#1A1A17', border: '1px solid rgba(247,243,236,0.15)', padding: '14px 16px', color: 'var(--cream)', fontSize: '14px', fontFamily: 'Jost, sans-serif', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '8px', fontFamily: 'Jost, sans-serif' }}>
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    style={{ width: '100%', background: '#1A1A17', border: '1px solid rgba(247,243,236,0.15)', padding: '14px 16px', color: 'var(--cream)', fontSize: '14px', fontFamily: 'Jost, sans-serif', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '8px', fontFamily: 'Jost, sans-serif' }}>
                    Motivo (opcional)
                  </label>
                  <textarea
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    placeholder="Contanos por qué querés eliminar tu cuenta..."
                    rows={3}
                    style={{ width: '100%', background: '#1A1A17', border: '1px solid rgba(247,243,236,0.15)', padding: '14px 16px', color: 'var(--cream)', fontSize: '14px', fontFamily: 'Jost, sans-serif', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div
                  onClick={() => setConfirmado(!confirmado)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: 'rgba(247,243,236,0.05)', border: '1px solid rgba(247,243,236,0.08)', cursor: 'pointer' }}
                >
                  <div style={{ width: '16px', height: '16px', border: `1px solid ${confirmado ? 'var(--gold)' : 'rgba(184,154,94,0.4)'}`, background: confirmado ? 'var(--gold)' : 'transparent', marginTop: '2px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {confirmado && <span style={{ color: '#0E0E0C', fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(247,243,236,0.45)', lineHeight: '1.6', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
                    Entiendo que esta acción es irreversible y que se eliminarán permanentemente mi cuenta, historial de pedidos y puntos acumulados.
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!valido || cargando}
                  style={{
                    background: valido ? 'var(--gold)' : 'rgba(184,154,94,0.2)',
                    color: valido ? 'var(--black)' : 'rgba(247,243,236,0.3)',
                    border: 'none',
                    padding: '16px',
                    fontSize: '10px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    fontFamily: 'Jost, sans-serif',
                    fontWeight: '600',
                    cursor: valido ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    marginTop: '8px',
                  }}
                >
                  {cargando ? 'Enviando...' : 'Enviar solicitud de eliminación'}
                </button>

              </div>
            )}
          </div>

          {/* Alternativa email */}
          <div style={{ marginTop: '24px', padding: '24px', background: '#fff', border: '1px solid var(--cream-deep)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '28px' }}>✉️</div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--black)', fontWeight: '500', marginBottom: '4px', fontFamily: 'Jost, sans-serif' }}>También podés escribirnos</p>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.6', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
                Mandá un email a <strong style={{ color: 'var(--black)' }}>hola@simpleviandas.com.ar</strong> con el asunto "Eliminación de cuenta" y te respondemos en 72hs hábiles.
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  )
}