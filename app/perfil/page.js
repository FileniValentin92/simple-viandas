'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../components/CartContext'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { catalogoPlatos, platos } from '../data/platos'

const PRECIO_MIN_VIANDA = Math.min(...platos.map(p => p.precioNum))

const estadoColor = {
  pendiente:   { bg: 'rgba(184,154,94,0.1)',  color: '#B89A5E' },
  preparando:  { bg: 'rgba(99,110,67,0.1)',   color: '#636E43' },
  enviado:     { bg: 'rgba(0,158,227,0.1)',   color: '#009ee3' },
  entregado:   { bg: 'rgba(46,204,113,0.1)',  color: '#2ecc71' },
  cancelado:   { bg: 'rgba(231,76,60,0.1)',   color: '#e74c3c' },
}

const nivelesInfo = [
  { nombre: 'Básico', rango: '0–9 pedidos', opciones: [{ pts: 200, viandas: 1 }] },
  { nombre: 'Frecuente', rango: '10–19 pedidos', opciones: [{ pts: 200, viandas: 1 }, { pts: 300, viandas: 2 }] },
  { nombre: 'VIP', rango: '20+ pedidos', opciones: [{ pts: 200, viandas: 1 }, { pts: 300, viandas: 2 }, { pts: 400, viandas: 3 }] },
]

export default function PerfilPage() {
  const router = useRouter()
  const { agregarItem, setAbierto } = useCart()
  const { user, perfil, cargando: cargandoAuth, cargarPerfil } = useAuth()

  const [pedidos, setPedidos] = useState([])
  const [cargandoPedidos, setCargandoPedidos] = useState(false)
  const [repetidoId, setRepetidoId] = useState(null)
  const [puntosLocales, setPuntosLocales] = useState(null)
  const [canjeExito, setCanjeExito] = useState(null)
  const [canjeando, setCanjeando] = useState(false)

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!cargandoAuth && !user) {
      router.push('/login')
    }
  }, [user, cargandoAuth, router])

  // Cargar pedidos reales desde Supabase
  useEffect(() => {
    if (!user || !perfil) return
    const cargarPedidos = async () => {
      setCargandoPedidos(true)
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .or(`user_id.eq.${user.id},telefono.eq.${perfil.telefono || 'NULO'}`)
        .order('created_at', { ascending: false })
      setPedidos(data || [])
      setCargandoPedidos(false)
    }
    cargarPedidos()
  }, [user, perfil])

  // Sincronizar puntos locales con perfil
  useEffect(() => {
    if (perfil) setPuntosLocales(perfil.puntos || 0)
  }, [perfil])

  const puntosAcumulados = puntosLocales !== null ? puntosLocales : (perfil?.puntos || 0)

  // Nivel basado en cantidad de pedidos
  const cantidadPedidos = pedidos.length
  const nivel = cantidadPedidos >= 20 ? 'VIP' : cantidadPedidos >= 10 ? 'Frecuente' : 'Básico'
  const nivelColor = nivel === 'VIP' ? 'var(--gold)' : nivel === 'Frecuente' ? 'var(--olive)' : '#999'

  // Barra de progreso hacia próximo canje
  let barraObjetivo, barraLabel
  if (puntosAcumulados < 200) {
    barraObjetivo = 200
    barraLabel = '1 vianda gratis'
  } else if ((nivel === 'Frecuente' || nivel === 'VIP') && puntosAcumulados < 300) {
    barraObjetivo = 300
    barraLabel = '2 viandas gratis'
  } else if (nivel === 'VIP' && puntosAcumulados < 400) {
    barraObjetivo = 400
    barraLabel = '3 viandas gratis'
  } else {
    barraObjetivo = null
    barraLabel = null
  }
  const progresoPorc = barraObjetivo ? Math.min(100, (puntosAcumulados / barraObjetivo) * 100) : 100
  const ptsRestantes = barraObjetivo ? barraObjetivo - puntosAcumulados : 0

  // Opciones de canje
  const opcionesCanje = []
  if (puntosAcumulados >= 200) opcionesCanje.push({ viandas: 1, puntos: 200 })
  if (puntosAcumulados >= 300 && (nivel === 'Frecuente' || nivel === 'VIP')) opcionesCanje.push({ viandas: 2, puntos: 300 })
  if (puntosAcumulados >= 400 && nivel === 'VIP') opcionesCanje.push({ viandas: 3, puntos: 400 })

  const handleCanje = async (opcion) => {
    if (canjeando) return
    setCanjeando(true)
    try {
      const { data: perfilData } = await supabase.from('perfiles').select('puntos').eq('id', user.id).single()
      const puntosActuales = perfilData?.puntos ?? 0
      if (puntosActuales < opcion.puntos) {
        setCanjeando(false)
        return
      }
      await supabase.from('perfiles').update({ puntos: puntosActuales - opcion.puntos }).eq('id', user.id)
      setPuntosLocales(puntosActuales - opcion.puntos)
      setCanjeExito(opcion)
      setTimeout(() => setCanjeExito(null), 5000)
    } catch (err) {
      console.error('Error en canje:', err)
    } finally {
      setCanjeando(false)
    }
  }

  const repetirPedido = (pedido) => {
    const items = pedido.items || []
    items.forEach(item => {
      const datos = catalogoPlatos[item.nombre]
      if (datos) agregarItem({ nombre: item.nombre, ...datos }, item.cantidad)
    })
    setRepetidoId(pedido.id)
    setAbierto(true)
    setTimeout(() => setRepetidoId(null), 2500)
  }

  const formatearFecha = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatPrecio = (n) => '$' + n.toLocaleString('es-AR')

  if (cargandoAuth) {
    return (
      <main>
        <Navbar />
        <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--cream)', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>Cargando...</p>
        </div>
      </main>
    )
  }

  if (!user) return null

  const nombreMostrar = perfil?.nombre || user.email?.split('@')[0] || 'Usuario'

  return (
    <main>
      <Navbar />

      {/* Header */}
      <section style={{ background: 'var(--black)', padding: '48px 64px' }} className="perfil-header">
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '10px' }}>
          Tu cuenta
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '40px', color: 'var(--cream)', fontWeight: '400' }}>
          Hola, {nombreMostrar.split(' ')[0]}
        </h1>
        <p style={{ fontSize: '12px', color: 'rgba(247,243,236,0.4)', fontWeight: '300', marginTop: '8px' }}>
          {user.email}
          {perfil?.telefono && ` · ${perfil.telefono}`}
        </p>
      </section>

      {/* Contenido */}
      <section className="perfil-section">
        <div className="perfil-grid">

          {/* Columna izquierda — Puntos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Card puntos */}
            <div style={{ background: 'var(--black)', padding: '36px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '8px' }}>
                Tus puntos SIMPLE
              </p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '72px', color: 'var(--cream)', fontWeight: '400', lineHeight: '1', marginBottom: '8px' }}>
                {puntosAcumulados.toLocaleString('es-AR')}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(247,243,236,0.4)', fontWeight: '300', letterSpacing: '1px' }}>
                puntos acumulados
              </p>
              <div style={{ marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(247,243,236,0.08)', padding: '8px 16px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: nivelColor }} />
                <span style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream)', fontWeight: '300' }}>
                  Nivel {nivel} · {cantidadPedidos} pedido{cantidadPedidos !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div style={{ border: '1px solid var(--cream-deep)', padding: '28px', background: 'var(--cream)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '300', color: 'var(--black)' }}>
                  {barraObjetivo ? 'Próximo canje' : 'Canje disponible'}
                </p>
                {barraObjetivo ? (
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: '300' }}>{ptsRestantes} pts restantes</p>
                ) : (
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: '400' }}>Listo para canjear</p>
                )}
              </div>
              <div style={{ height: '6px', background: 'var(--cream-deep)', marginBottom: '12px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progresoPorc}%`, background: 'var(--olive)', transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '11px', color: '#999', fontWeight: '300' }}>{puntosAcumulados} / {barraObjetivo || (nivel === 'VIP' ? 400 : nivel === 'Frecuente' ? 300 : 200)} pts</p>
                <p style={{ fontSize: '11px', color: 'var(--olive)', fontWeight: '300' }}>= {barraLabel || (nivel === 'VIP' ? '3 viandas gratis' : nivel === 'Frecuente' ? '2 viandas gratis' : '1 vianda gratis')} 🎁</p>
              </div>
            </div>

            {/* Opciones de canje */}
            {opcionesCanje.length > 0 && (
              <div style={{ border: '1px solid var(--olive)', padding: '24px 28px', background: 'rgba(74,85,48,0.05)' }}>
                <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: '300', marginBottom: '16px' }}>Canjes disponibles</p>

                {canjeExito && (
                  <div style={{ marginBottom: '16px', padding: '14px', background: 'rgba(74,85,48,0.1)', border: '1px solid var(--olive)' }}>
                    <p style={{ fontSize: '13px', color: 'var(--olive)', fontWeight: '400', lineHeight: '1.5' }}>
                      ✅ Canjeaste {canjeExito.viandas} vianda{canjeExito.viandas > 1 ? 's' : ''} gratis. Usá el descuento en tu próximo pedido desde la página de confirmar.
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {opcionesCanje.map((opcion) => (
                    <button
                      key={opcion.puntos}
                      onClick={() => handleCanje(opcion)}
                      disabled={canjeando}
                      style={{
                        border: '1px solid var(--olive)',
                        background: 'var(--olive)',
                        color: 'var(--cream)',
                        padding: '14px 20px',
                        cursor: canjeando ? 'not-allowed' : 'pointer',
                        fontFamily: 'Jost, sans-serif',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        opacity: canjeando ? 0.6 : 1,
                      }}
                    >
                      <span>Canjear {opcion.viandas} vianda{opcion.viandas > 1 ? 's' : ''} · {opcion.puntos} pts</span>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '14px' }}>
                        = {formatPrecio(opcion.viandas * PRECIO_MIN_VIANDA)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Niveles del programa */}
            <div style={{ border: '1px solid var(--cream-deep)', padding: '28px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '300', color: 'var(--black)', marginBottom: '20px' }}>Niveles del programa</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {nivelesInfo.map((n) => {
                  const activo = nivel === n.nombre
                  return (
                    <div key={n.nombre} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: activo ? 1 : 0.4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.nombre === 'VIP' ? 'var(--gold)' : n.nombre === 'Frecuente' ? 'var(--olive)' : '#999', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', fontWeight: activo ? '400' : '300', color: 'var(--black)' }}>{n.nombre}</span>
                        {activo && <span style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: '300' }}>← actual</span>}
                      </div>
                      <span style={{ fontSize: '11px', color: '#999', fontWeight: '300' }}>
                        {n.rango}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Columna derecha — Historial */}
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)', fontWeight: '400', marginBottom: '24px' }}>
              Historial de pedidos
            </h2>

            {cargandoPedidos ? (
              <div style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--cream-deep)' }}>
                <p style={{ fontSize: '13px', color: '#999', fontWeight: '300' }}>Cargando pedidos...</p>
              </div>
            ) : pedidos.length === 0 ? (
              <div style={{ padding: '48px 32px', textAlign: 'center', border: '1px solid var(--cream-deep)', background: 'var(--cream)' }}>
                <p style={{ fontSize: '32px', marginBottom: '16px' }}>🛒</p>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--black)', fontWeight: '400', marginBottom: '8px' }}>
                  Todavía no hiciste pedidos
                </p>
                <p style={{ fontSize: '12px', color: '#999', fontWeight: '300', marginBottom: '24px' }}>
                  Tus pedidos van a aparecer acá
                </p>
                <a href="/menu" style={{ display: 'inline-block', background: 'var(--black)', color: 'var(--cream)', padding: '12px 28px', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', textDecoration: 'none' }}>
                  Ver menú
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pedidos.map((pedido) => {
                  const items = pedido.items || []
                  const colorEstado = estadoColor[pedido.estado] || estadoColor['pendiente']
                  return (
                    <div key={pedido.id} style={{ border: '1px solid var(--cream-deep)', padding: '24px', background: 'var(--cream)' }}>

                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', color: 'var(--black)', fontWeight: '400' }}>
                            #{String(pedido.id).slice(-4).toUpperCase()}
                          </span>
                          <span style={{ fontSize: '11px', color: '#999', fontWeight: '300' }}>{formatearFecha(pedido.created_at)}</span>
                        </div>
                        <span style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: colorEstado.color, background: colorEstado.bg, padding: '4px 12px', fontWeight: '300' }}>
                          {pedido.estado}
                        </span>
                      </div>

                      {/* Items */}
                      <div style={{ marginBottom: '16px' }}>
                        {items.map((item, i) => {
                          const datos = catalogoPlatos[item.nombre]
                          const precioUnitario = datos?.precioNum || 0
                          const precioTotal = precioUnitario * item.cantidad
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '12px' }}>
                              <span style={{ fontSize: '13px', color: '#666', fontWeight: '300' }}>
                                {datos?.emoji} {item.nombre} x{item.cantidad}
                              </span>
                              <span style={{ fontSize: '13px', color: 'var(--black)', fontWeight: '300', whiteSpace: 'nowrap' }}>
                                ${precioTotal.toLocaleString('es-AR')}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--cream-deep)', paddingTop: '14px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--black)' }}>
                            ${pedido.total?.toLocaleString('es-AR')}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--olive)', fontWeight: '300' }}>
                            +{pedido.puntos} pts
                          </span>
                          {pedido.pago_metodo && (
                            <span style={{ fontSize: '10px', color: '#999', fontWeight: '300' }}>
                              {pedido.pago_metodo === 'efectivo' ? '💵 Efectivo' : '💳 MercadoPago'}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => repetirPedido(pedido)}
                          style={{ background: repetidoId === pedido.id ? 'var(--olive)' : 'var(--black)', color: 'var(--cream)', border: 'none', padding: '10px 20px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '300', cursor: 'pointer', transition: 'background 0.2s ease', whiteSpace: 'nowrap' }}>
                          {repetidoId === pedido.id ? '✓ Agregado' : 'Repetir pedido'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cómo funciona tu programa de puntos */}
      <section style={{ background: 'var(--black)', padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '16px', textAlign: 'center' }}>
            Programa de fidelidad
          </p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--cream)', fontWeight: '400', marginBottom: '48px', textAlign: 'center' }}>
            Cómo funciona tu programa de puntos
          </h2>

          {/* Cards info */}
          <div className="perfil-puntos-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
            <div style={{ border: '1px solid rgba(247,243,236,0.12)', padding: '32px 28px' }}>
              <p style={{ fontSize: '32px', marginBottom: '16px' }}>⭐</p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--cream)', fontWeight: '400', marginBottom: '12px' }}>
                +10 pts por cada vianda comprada
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(247,243,236,0.5)', fontWeight: '300', lineHeight: '1.6' }}>
                Sumás puntos en cada pedido. Los puntos no usados quedan en tu cuenta.
              </p>
            </div>
            <div style={{ border: '1px solid rgba(247,243,236,0.12)', padding: '32px 28px' }}>
              <p style={{ fontSize: '32px', marginBottom: '16px' }}>🎁</p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--cream)', fontWeight: '400', marginBottom: '12px' }}>
                200 pts = 1 vianda gratis
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(247,243,236,0.5)', fontWeight: '300', lineHeight: '1.6' }}>
                Siempre 200 pts por vianda. El valor equivale al precio más bajo del menú ({formatPrecio(PRECIO_MIN_VIANDA)}). Si elegís una más cara, pagás la diferencia.
              </p>
            </div>
          </div>

          {/* Niveles detallados */}
          <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '24px', textAlign: 'center' }}>
            Cuántas viandas podés canjear según tu nivel
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {nivelesInfo.map((n) => {
              const esActual = nivel === n.nombre
              return (
                <div key={n.nombre} style={{
                  border: esActual ? '1px solid var(--gold)' : '1px solid rgba(247,243,236,0.08)',
                  padding: '24px 28px',
                  background: esActual ? 'rgba(184,154,94,0.08)' : 'transparent',
                  position: 'relative',
                }}>
                  {esActual && (
                    <span style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '400' }}>
                      Tu nivel actual
                    </span>
                  )}
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: esActual ? 'var(--gold)' : 'var(--cream)', fontWeight: '400', marginBottom: '4px' }}>
                    {n.nombre} <span style={{ fontSize: '12px', color: 'rgba(247,243,236,0.4)', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>({n.rango})</span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                    {n.opciones.map((op, i) => {
                      const esUltima = i === n.opciones.length - 1 && n.opciones.length > 1
                      return (
                        <p key={op.pts} style={{ fontSize: '13px', color: 'rgba(247,243,236,0.6)', fontWeight: '300' }}>
                          → {op.pts} pts = {op.viandas} vianda{op.viandas > 1 ? 's' : ''} gratis {esUltima && n.nombre === 'Frecuente' ? '✦' : ''}{esUltima && n.nombre === 'VIP' ? '✦✦' : ''}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
