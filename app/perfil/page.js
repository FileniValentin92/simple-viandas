'use client'

import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../components/CartContext'

const PUNTOS_PARA_CANJE = 300

const niveles = [
  { nombre: 'Básico', desde: 0, hasta: 299, color: '#999' },
  { nombre: 'Regular', desde: 300, hasta: 799, color: '#B89A5E' },
  { nombre: 'Frecuente', desde: 800, hasta: 1999, color: '#636E43' },
  { nombre: 'VIP', desde: 2000, hasta: Infinity, color: '#0E0E0C' },
]

const pedidosEjemplo = [
  { id: '#0012', fecha: '28 Feb 2026', items: ['Milanesa napolitana x2', 'Pollo al limón x1'], total: '$27.300', puntos: '+135 pts', estado: 'Entregado' },
  { id: '#0011', fecha: '21 Feb 2026', items: ['Lasagna de carne x1', 'Ñoquis con salsa rosa x2'], total: '$25.300', puntos: '+128 pts', estado: 'Entregado' },
  { id: '#0010', fecha: '14 Feb 2026', items: ['Salmón con limón x1', 'Cazuela de mariscos x1'], total: '$20.700', puntos: '+104 pts', estado: 'Entregado' },
]

export default function PerfilPage() {
  const { totalPuntos } = useCart()

  // Puntos simulados para demo (en producción vendrán de Supabase)
  const [puntosAcumulados] = useState(680)
  const puntosTotal = puntosAcumulados + totalPuntos

  // Calcular nivel actual
  const nivelActual = niveles.find(n => puntosTotal >= n.desde && puntosTotal <= n.hasta) || niveles[0]

  // Calcular progreso hacia próximo canje
  const puntosRestantes = PUNTOS_PARA_CANJE - (puntosTotal % PUNTOS_PARA_CANJE)
  const progresoPorc = ((puntosTotal % PUNTOS_PARA_CANJE) / PUNTOS_PARA_CANJE) * 100
  const canjesDisponibles = Math.floor(puntosTotal / PUNTOS_PARA_CANJE)

  return (
    <main>
      <Navbar />

      {/* Header */}
      <section style={{
        background: 'var(--black)',
        padding: '48px 64px',
      }}>
        <p style={{
          fontSize: '9px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          fontWeight: '300',
          marginBottom: '10px',
        }}>
          Tu cuenta
        </p>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '40px',
          color: 'var(--cream)',
          fontWeight: '400',
        }}>
          Mi Perfil
        </h1>
      </section>

      {/* Contenido */}
      <section style={{
        background: 'var(--white)',
        padding: '48px 64px',
      }} className="perfil-section">
        <div className="perfil-grid">

          {/* Columna izquierda — Puntos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Card puntos principales */}
            <div style={{
              background: 'var(--black)',
              padding: '36px',
            }}>
              <p style={{
                fontSize: '9px',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                fontWeight: '300',
                marginBottom: '8px',
              }}>
                Tus puntos SIMPLE
              </p>
              <p style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '72px',
                color: 'var(--cream)',
                fontWeight: '400',
                lineHeight: '1',
                marginBottom: '8px',
              }}>
                {puntosTotal.toLocaleString('es-AR')}
              </p>
              <p style={{
                fontSize: '11px',
                color: 'rgba(247,243,236,0.4)',
                fontWeight: '300',
                letterSpacing: '1px',
              }}>
                puntos acumulados
              </p>

              {/* Nivel */}
              <div style={{
                marginTop: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(247,243,236,0.08)',
                padding: '8px 16px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: nivelActual.color === '#0E0E0C' ? 'var(--gold)' : nivelActual.color,
                }} />
                <span style={{
                  fontSize: '9px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: 'var(--cream)',
                  fontWeight: '300',
                }}>
                  Nivel {nivelActual.nombre}
                </span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div style={{
              border: '1px solid var(--cream-deep)',
              padding: '28px',
              background: 'var(--cream)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <p style={{
                  fontSize: '9px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  fontWeight: '300',
                  color: 'var(--black)',
                }}>
                  Próximo canje
                </p>
                <p style={{
                  fontSize: '9px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'var(--olive)',
                  fontWeight: '300',
                }}>
                  {puntosRestantes} pts restantes
                </p>
              </div>

              {/* Barra */}
              <div style={{
                height: '6px',
                background: 'var(--cream-deep)',
                marginBottom: '12px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progresoPorc}%`,
                  background: 'var(--olive)',
                  transition: 'width 0.6s ease',
                }} />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <p style={{
                  fontSize: '11px',
                  color: '#999',
                  fontWeight: '300',
                }}>
                  {puntosTotal % PUNTOS_PARA_CANJE} / {PUNTOS_PARA_CANJE} pts
                </p>
                <p style={{
                  fontSize: '11px',
                  color: 'var(--olive)',
                  fontWeight: '300',
                }}>
                  = 1 vianda gratis 🎁
                </p>
              </div>
            </div>

            {/* Canjes disponibles */}
            {canjesDisponibles > 0 && (
              <div style={{
                border: '1px solid var(--olive)',
                padding: '24px 28px',
                background: 'rgba(74,85,48,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}>
                <div>
                  <p style={{
                    fontSize: '9px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: 'var(--olive)',
                    fontWeight: '300',
                    marginBottom: '4px',
                  }}>
                    Canjes disponibles
                  </p>
                  <p style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '32px',
                    color: 'var(--black)',
                    fontWeight: '400',
                  }}>
                    {canjesDisponibles} vianda{canjesDisponibles > 1 ? 's' : ''} gratis
                  </p>
                </div>
                <button style={{
                  background: 'var(--olive)',
                  color: 'var(--cream)',
                  border: 'none',
                  padding: '14px 24px',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: '300',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  Canjear
                </button>
              </div>
            )}

            {/* Niveles */}
            <div style={{
              border: '1px solid var(--cream-deep)',
              padding: '28px',
            }}>
              <p style={{
                fontSize: '9px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontWeight: '300',
                color: 'var(--black)',
                marginBottom: '20px',
              }}>
                Niveles del programa
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {niveles.map((n) => {
                  const activo = nivelActual.nombre === n.nombre
                  return (
                    <div key={n.nombre} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: activo ? 1 : 0.4,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: n.color === '#0E0E0C' ? 'var(--gold)' : n.color,
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: '12px',
                          fontWeight: activo ? '400' : '300',
                          color: 'var(--black)',
                        }}>
                          {n.nombre}
                        </span>
                        {activo && (
                          <span style={{
                            fontSize: '8px',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            color: 'var(--olive)',
                            fontWeight: '300',
                          }}>
                            ← actual
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: '#999',
                        fontWeight: '300',
                      }}>
                        {n.hasta === Infinity ? `+${n.desde.toLocaleString()} pts` : `${n.desde}–${n.hasta} pts`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Columna derecha — Historial */}
          <div>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '28px',
              color: 'var(--black)',
              fontWeight: '400',
              marginBottom: '24px',
            }}>
              Historial de pedidos
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pedidosEjemplo.map((pedido) => (
                <div key={pedido.id} style={{
                  border: '1px solid var(--cream-deep)',
                  padding: '24px',
                  background: 'var(--cream)',
                }}>
                  {/* Header pedido */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '16px',
                        color: 'var(--black)',
                        fontWeight: '400',
                      }}>
                        {pedido.id}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: '#999',
                        fontWeight: '300',
                      }}>
                        {pedido.fecha}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '8px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: 'var(--olive)',
                      background: 'rgba(74,85,48,0.1)',
                      padding: '4px 12px',
                      fontWeight: '300',
                    }}>
                      {pedido.estado}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={{ marginBottom: '16px' }}>
                    {pedido.items.map(item => (
                      <p key={item} style={{
                        fontSize: '13px',
                        color: '#666',
                        fontWeight: '300',
                        marginBottom: '4px',
                      }}>
                        · {item}
                      </p>
                    ))}
                  </div>

                  {/* Footer pedido */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--cream-deep)',
                    paddingTop: '14px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}>
                    <span style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '20px',
                      color: 'var(--black)',
                    }}>
                      {pedido.total}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--olive)',
                      fontWeight: '300',
                      letterSpacing: '1px',
                    }}>
                      {pedido.puntos}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Nota Supabase */}
            <p style={{
              marginTop: '20px',
              fontSize: '10px',
              color: '#ccc',
              fontWeight: '300',
              letterSpacing: '1px',
              textAlign: 'center',
            }}>
              El historial real se cargará al conectar Supabase
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  )
}