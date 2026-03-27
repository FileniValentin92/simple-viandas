'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../components/CartContext'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { catalogoPlatos } from '../data/platos'

const PUNTOS_PARA_CANJE = 300

const niveles = [
  { nombre: 'Básico',    desde: 0,    hasta: 299,      color: '#999' },
  { nombre: 'Regular',   desde: 300,  hasta: 799,      color: '#B89A5E' },
  { nombre: 'Frecuente', desde: 800,  hasta: 1999,     color: '#636E43' },
  { nombre: 'VIP',       desde: 2000, hasta: Infinity,  color: '#0E0E0C' },
]

const estadoColor = {
  pendiente:   { bg: 'rgba(184,154,94,0.1)',  color: '#B89A5E' },
  preparando:  { bg: 'rgba(99,110,67,0.1)',   color: '#636E43' },
  enviado:     { bg: 'rgba(0,158,227,0.1)',   color: '#009ee3' },
  entregado:   { bg: 'rgba(46,204,113,0.1)',  color: '#2ecc71' },
  cancelado:   { bg: 'rgba(231,76,60,0.1)',   color: '#e74c3c' },
}

export default function PerfilPage() {
  const router = useRouter()
  const { agregarItem, setAbierto } = useCart()
  const { user, perfil, cargando: cargandoAuth } = useAuth()

  const [pedidos, setPedidos] = useState([])
  const [cargandoPedidos, setCargandoPedidos] = useState(false)
  const [repetidoId, setRepetidoId] = useState(null)

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
      // Buscar por user_id O por teléfono/email
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

  const puntosAcumulados = perfil?.puntos || 0
  const nivelActual = niveles.find(n => puntosAcumulados >= n.desde && puntosAcumulados <= n.hasta) || niveles[0]
  const puntosRestantes = PUNTOS_PARA_CANJE - (puntosAcumulados % PUNTOS_PARA_CANJE)
  const progresoPorc = ((puntosAcumulados % PUNTOS_PARA_CANJE) / PUNTOS_PARA_CANJE) * 100
  const canjesDisponibles = Math.floor(puntosAcumulados / PUNTOS_PARA_CANJE)

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
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: nivelActual.color === '#0E0E0C' ? 'var(--gold)' : nivelActual.color }} />
                <span style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream)', fontWeight: '300' }}>
                  Nivel {nivelActual.nombre}
                </span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div style={{ border: '1px solid var(--cream-deep)', padding: '28px', background: 'var(--cream)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '300', color: 'var(--black)' }}>Próximo canje</p>
                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: '300' }}>{puntosRestantes} pts restantes</p>
              </div>
              <div style={{ height: '6px', background: 'var(--cream-deep)', marginBottom: '12px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progresoPorc}%`, background: 'var(--olive)', transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '11px', color: '#999', fontWeight: '300' }}>{puntosAcumulados % PUNTOS_PARA_CANJE} / {PUNTOS_PARA_CANJE} pts</p>
                <p style={{ fontSize: '11px', color: 'var(--olive)', fontWeight: '300' }}>= 1 vianda gratis 🎁</p>
              </div>
            </div>

            {/* Canjes disponibles */}
            {canjesDisponibles > 0 && (
              <div style={{ border: '1px solid var(--olive)', padding: '24px 28px', background: 'rgba(74,85,48,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: '300', marginBottom: '4px' }}>Canjes disponibles</p>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--black)', fontWeight: '400' }}>
                    {canjesDisponibles} vianda{canjesDisponibles > 1 ? 's' : ''} gratis
                  </p>
                </div>
                <button style={{ background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '14px 24px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '300', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Canjear
                </button>
              </div>
            )}

            {/* Niveles */}
            <div style={{ border: '1px solid var(--cream-deep)', padding: '28px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '300', color: 'var(--black)', marginBottom: '20px' }}>Niveles del programa</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {niveles.map((n) => {
                  const activo = nivelActual.nombre === n.nombre
                  return (
                    <div key={n.nombre} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: activo ? 1 : 0.4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.color === '#0E0E0C' ? 'var(--gold)' : n.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', fontWeight: activo ? '400' : '300', color: 'var(--black)' }}>{n.nombre}</span>
                        {activo && <span style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: '300' }}>← actual</span>}
                      </div>
                      <span style={{ fontSize: '11px', color: '#999', fontWeight: '300' }}>
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

      <Footer />
    </main>
  )
}