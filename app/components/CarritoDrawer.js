'use client'

import { useRouter } from 'next/navigation'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'

export default function CarritoDrawer() {
  const { items, abierto, setAbierto, quitarItem, agregarItem, eliminarItem, totalPrecio, totalPuntos, totalItems, calcularDescuentos } = useCart()
  const { user, perfil, pedidosCount } = useAuth()
  const router = useRouter()

  const formatPrecio = (n) => '$' + n.toLocaleString('es-AR')

  const handleConfirmar = () => {
    setAbierto(false)
    router.push('/confirmar')
  }

  // Calcular nivel del usuario
  const nivel = pedidosCount >= 20 ? 'VIP' : pedidosCount >= 10 ? 'Frecuente' : 'Básico'
  const puntosUsuario = perfil?.puntos || 0

  // Calcular ahorro potencial en efectivo
  const descuentosEfectivo = calcularDescuentos('efectivo')
  const ahorroEfectivo = descuentosEfectivo.descuentoViandas + descuentosEfectivo.descuentoPacks

  return (
    <>
      {/* Overlay */}
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(14,14,12,0.5)',
            zIndex: 999,
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: abierto ? 0 : '-480px',
        width: '460px',
        height: '100vh',
        background: 'var(--white)',
        zIndex: 1000,
        transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
      }}>

        {/* Header */}
        <div style={{
          background: 'var(--black)',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{
              fontSize: '9px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              fontWeight: '300',
              marginBottom: '4px',
            }}>
              Tu pedido
            </p>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px',
              color: 'var(--cream)',
              fontWeight: '400',
            }}>
              {totalItems === 0 ? 'Carrito vacío' : `${totalItems} ${totalItems === 1 ? 'plato' : 'platos'}`}
            </h2>
          </div>
          <button
            onClick={() => setAbierto(false)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(247,243,236,0.2)',
              color: 'var(--cream)',
              width: '40px',
              height: '40px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
        }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '16px',
              color: '#999',
            }}>
              <span style={{ fontSize: '48px' }}>🍽️</span>
              <p style={{
                fontSize: '11px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: '300',
              }}>
                Agregá platos del menú
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div key={item.nombre} style={{
                  border: '1px solid var(--cream-deep)',
                  padding: '16px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'var(--cream)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    flexShrink: 0,
                  }}>
                    {item.emoji}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '15px',
                      color: 'var(--black)',
                      fontWeight: '400',
                      marginBottom: '2px',
                    }}>
                      {item.nombre}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: '#999',
                      fontWeight: '300',
                      marginBottom: '10px',
                    }}>
                      {item.descripcion}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => quitarItem(item.nombre)}
                        style={{
                          width: '28px',
                          height: '28px',
                          border: '1px solid var(--cream-deep)',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--black)',
                        }}
                      >−</button>
                      <span style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '16px',
                        minWidth: '20px',
                        textAlign: 'center',
                      }}>
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => agregarItem(item)}
                        style={{
                          width: '28px',
                          height: '28px',
                          border: '1px solid var(--black)',
                          background: 'var(--black)',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--cream)',
                        }}
                      >+</button>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '8px',
                  }}>
                    <span style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '16px',
                      color: 'var(--black)',
                    }}>
                      {item.precio}
                    </span>
                    <button
                      onClick={() => eliminarItem(item.nombre)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '10px',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        color: '#bbb',
                        cursor: 'pointer',
                        fontFamily: 'Jost, sans-serif',
                        fontWeight: '300',
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con total */}
        {items.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--cream-deep)',
            padding: '24px 32px',
            background: 'var(--cream)',
          }}>
            {/* Resumen de puntos del usuario */}
            {user && perfil && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '10px 14px',
                background: 'rgba(74,85,48,0.06)',
                border: '1px solid rgba(74,85,48,0.12)',
              }}>
                <span style={{ fontSize: '11px', color: 'var(--olive)', fontWeight: '300' }}>
                  Tenés {puntosUsuario.toLocaleString('es-AR')} pts · Nivel {nivel}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--olive)', fontWeight: '400' }}>
                  Ganás +{totalPuntos} pts
                </span>
              </div>
            )}

            {/* Aviso de descuento efectivo */}
            {ahorroEfectivo > 0 && (
              <div style={{
                marginBottom: '12px',
                padding: '10px 14px',
                background: 'rgba(184,154,94,0.08)',
                border: '1px solid rgba(184,154,94,0.2)',
              }}>
                <p style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '400', lineHeight: '1.5' }}>
                  💵 Pagando en efectivo ahorrás {formatPrecio(ahorroEfectivo)} — confirmá el pedido para aplicar
                </p>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--olive-mid)',
                fontWeight: '300',
              }}>
                Puntos a ganar
              </span>
              <span style={{
                fontSize: '13px',
                color: 'var(--olive)',
                fontWeight: '400',
              }}>
                +{totalPuntos} pts
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
            }}>
              <span style={{
                fontSize: '10px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontWeight: '300',
              }}>
                Total
              </span>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '28px',
                color: 'var(--black)',
              }}>
                {formatPrecio(totalPrecio)}
              </span>
            </div>

            {ahorroEfectivo > 0 && (
              <p style={{ fontSize: '10px', color: '#999', fontWeight: '300', textAlign: 'right', marginBottom: '16px' }}>
                El descuento se aplica al confirmar en efectivo
              </p>
            )}

            <button
              onClick={handleConfirmar}
              style={{
                width: '100%',
                background: 'var(--black)',
                color: 'var(--cream)',
                border: 'none',
                padding: '18px',
                fontSize: '10px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontFamily: 'Jost, sans-serif',
                fontWeight: '300',
                cursor: 'pointer',
                marginTop: ahorroEfectivo > 0 ? '0' : '16px',
              }}
            >
              Confirmar pedido
            </button>
          </div>
        )}
      </div>
    </>
  )
}
