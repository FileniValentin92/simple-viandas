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
  { nombre: 'Básico', sufijo: 'Simple', rango: '0–9 pedidos', maxViandas: 1 },
  { nombre: 'Frecuente', sufijo: 'Simple', rango: '10–19 pedidos', maxViandas: 2 },
  { nombre: 'VIP', sufijo: 'Simple', rango: '20+ pedidos', maxViandas: 3 },
]

export default function PerfilPage() {
  const router = useRouter()
  const { agregarItem, setAbierto, canjeActivo, quitarCanje } = useCart()
  const { user, perfil, cargando: cargandoAuth } = useAuth()

  const [pedidos, setPedidos] = useState([])
  const [cargandoPedidos, setCargandoPedidos] = useState(false)
  const [repetidoId, setRepetidoId] = useState(null)
  const [puntosLocales, setPuntosLocales] = useState(null)

  // Modal de canje
  const [modalCanje, setModalCanje] = useState(null) // { viandas: N, puntos: P }
  const [seleccion, setSeleccion] = useState({}) // { nombrePlato: cantidad }

  useEffect(() => {
    if (!cargandoAuth && !user) router.push('/login')
  }, [user, cargandoAuth, router])

  useEffect(() => {
    if (!user || !perfil) return
    const cargarPedidos = async () => {
      setCargandoPedidos(true)
      const { data } = await supabase.from('pedidos').select('*')
        .or(`user_id.eq.${user.id},telefono.eq.${perfil.telefono || 'NULO'}`)
        .order('created_at', { ascending: false })
      setPedidos(data || [])
      setCargandoPedidos(false)
    }
    cargarPedidos()
  }, [user, perfil])

  useEffect(() => {
    if (perfil) setPuntosLocales(perfil.puntos || 0)
  }, [perfil])

  const puntosAcumulados = puntosLocales !== null ? puntosLocales : (perfil?.puntos || 0)

  const cantidadPedidos = pedidos.length
  const nivel = cantidadPedidos >= 20 ? 'VIP' : cantidadPedidos >= 10 ? 'Frecuente' : 'Básico'

  const totalViandas = pedidos.reduce((acc, p) => acc + (p.items || []).reduce((a, i) => a + (i.cantidad || 0), 0), 0)
  const totalCanjeadas = pedidos.reduce((acc, p) => acc + (p.viandas_canjeadas || 0), 0)

  const opcionesCanje = []
  if (puntosAcumulados >= 200) opcionesCanje.push({ viandas: 1, puntos: 200 })
  if (puntosAcumulados >= 300 && (nivel === 'Frecuente' || nivel === 'VIP')) opcionesCanje.push({ viandas: 2, puntos: 300 })
  if (puntosAcumulados >= 400 && nivel === 'VIP') opcionesCanje.push({ viandas: 3, puntos: 400 })

  const mejorCanje = opcionesCanje.length > 0 ? opcionesCanje[opcionesCanje.length - 1] : null

  let canjeHint = ''
  if (mejorCanje) {
    if (nivel === 'Frecuente' && puntosAcumulados < 300) canjeHint = `o esperá ${300 - puntosAcumulados} pts más para canjear 2`
    else if (nivel === 'VIP' && puntosAcumulados < 400) {
      const sig = puntosAcumulados < 300 ? { pts: 300, v: 2 } : { pts: 400, v: 3 }
      canjeHint = `o esperá ${sig.pts - puntosAcumulados} pts más para canjear ${sig.v}`
    }
  }

  let barraObjetivo
  if (puntosAcumulados < 200) barraObjetivo = 200
  else if ((nivel === 'Frecuente' || nivel === 'VIP') && puntosAcumulados < 300) barraObjetivo = 300
  else if (nivel === 'VIP' && puntosAcumulados < 400) barraObjetivo = 400
  else barraObjetivo = null
  const progresoPorc = barraObjetivo ? Math.min(100, (puntosAcumulados / barraObjetivo) * 100) : 100

  const pedidosParaSiguiente = nivel === 'Básico' ? 10 - cantidadPedidos : nivel === 'Frecuente' ? 20 - cantidadPedidos : 0

  // --- Modal de canje ---
  const abrirModal = (opcion) => {
    if (canjeActivo) {
      quitarCanje() // Remove existing canje before starting new one
    }
    setSeleccion({})
    setModalCanje(opcion)
  }

  const totalSeleccionado = Object.values(seleccion).reduce((a, b) => a + b, 0)

  const cambiarSeleccion = (nombre, delta) => {
    const actual = seleccion[nombre] || 0
    if (delta > 0 && totalSeleccionado >= modalCanje.viandas) return
    if (delta < 0 && actual <= 0) return
    setSeleccion(prev => ({ ...prev, [nombre]: actual + delta }))
  }

  const confirmarCanje = () => {
    if (!modalCanje || totalSeleccionado !== modalCanje.viandas) return

    const ptsPorVianda = Math.floor(modalCanje.puntos / modalCanje.viandas)
    const ptsExtra = modalCanje.puntos - ptsPorVianda * modalCanje.viandas
    let idx = 0

    Object.entries(seleccion).forEach(([nombre, cant]) => {
      if (cant <= 0) return
      const plato = platos.find(p => p.nombre === nombre)
      if (!plato) return

      for (let i = 0; i < cant; i++) {
        const ptsEste = idx === 0 ? ptsPorVianda + ptsExtra : ptsPorVianda
        agregarItem({
          nombre: `${nombre} (canje)`,
          emoji: plato.emoji,
          descripcion: 'Vianda por canje de puntos',
          precio: plato.precio,
          precioNum: plato.precioNum,
          puntos: '+0 pts',
          esCanje: true,
          canjeValor: PRECIO_MIN_VIANDA,
          puntosUsados: ptsEste,
        }, 1)
        idx++
      }
    })

    setModalCanje(null)
    setAbierto(true)
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

  const formatearFecha = (d) => d ? new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  const formatPrecio = (n) => '$' + n.toLocaleString('es-AR')

  if (cargandoAuth) {
    return (<main><Navbar /><div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--cream)', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>Cargando...</p></div></main>)
  }
  if (!user) return null

  const nombreMostrar = perfil?.nombre || user.email?.split('@')[0] || 'Usuario'

  return (
    <main>
      <Navbar />

      {/* Header */}
      <section style={{ background: 'var(--black)', padding: '48px 64px' }} className="perfil-header">
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '10px' }}>Tu cuenta</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '40px', color: 'var(--cream)', fontWeight: '400' }}>Hola, {nombreMostrar.split(' ')[0]}</h1>
        <p style={{ fontSize: '12px', color: 'rgba(247,243,236,0.4)', fontWeight: '300', marginTop: '8px' }}>{user.email}{perfil?.telefono && ` · ${perfil.telefono}`}</p>
      </section>

      {/* Contenido */}
      <section className="perfil-section">
        <div className="perfil-grid">
          {/* Columna izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Puntos */}
            <div style={{ background: 'var(--black)', padding: '28px', borderRadius: '4px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '3px', color: 'rgba(247,243,236,0.4)', marginBottom: '16px' }}>TUS PUNTOS SIMPLE</p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '52px', color: 'var(--cream)', lineHeight: '1', marginBottom: '4px' }}>{puntosAcumulados.toLocaleString('es-AR')}</p>
              <p style={{ fontSize: '11px', color: 'rgba(247,243,236,0.4)', marginBottom: '20px' }}>puntos acumulados</p>
              <div style={{ background: 'var(--gold)', color: 'var(--black)', padding: '6px 14px', fontSize: '9px', letterSpacing: '2px', display: 'inline-block', fontWeight: '500' }}>★ {nivel.toUpperCase()} · SIMPLE</div>
            </div>

            {/* Canje */}
            <div style={{ background: 'var(--white)', border: '1px solid rgba(0,0,0,0.08)', padding: '20px', borderRadius: '4px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '14px' }}>CANJE DISPONIBLE</p>

              {canjeActivo && (
                <div style={{ marginBottom: '14px', padding: '12px', background: 'rgba(74,85,48,0.08)', border: '1px solid var(--olive)' }}>
                  <p style={{ fontSize: '12px', color: 'var(--olive)', fontWeight: '400' }}>✅ Tenés viandas por canje en tu carrito. Los puntos se descontarán al confirmar el pedido.</p>
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                  <span>{puntosAcumulados} / {barraObjetivo || (mejorCanje?.puntos || 200)} pts</span>
                  <span>{mejorCanje ? `${mejorCanje.viandas} vianda${mejorCanje.viandas > 1 ? 's' : ''} disponible${mejorCanje.viandas > 1 ? 's' : ''}` : 'Sin canjes disponibles'}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--cream-mid)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progresoPorc}%`, height: '100%', background: 'var(--gold)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                </div>
              </div>

              {puntosAcumulados < 200 && (
                <p style={{ fontSize: '11px', color: '#888' }}>Te faltan {200 - puntosAcumulados} pts para tu primera vianda gratis.</p>
              )}

              {opcionesCanje.length > 0 && !canjeActivo && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                  {opcionesCanje.map(op => (
                    <button key={op.puntos} onClick={() => abrirModal(op)} style={{
                      width: '100%', background: 'var(--black)', color: 'var(--cream)', border: 'none',
                      padding: '12px', fontSize: '10px', letterSpacing: '2px', cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                    }}>
                      ELEGIR {op.viandas} VIANDA{op.viandas > 1 ? 'S' : ''} · {op.puntos} PTS
                    </button>
                  ))}
                  {canjeHint && <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--gold)' }}>{canjeHint}</p>}
                </div>
              )}
            </div>

            {/* Niveles */}
            <div style={{ background: 'var(--white)', border: '1px solid rgba(0,0,0,0.08)', padding: '20px', borderRadius: '4px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '14px' }}>NIVELES DEL PROGRAMA</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {nivelesInfo.map(n => {
                  const esActual = nivel === n.nombre
                  const esFuturo = !esActual && ((n.nombre === 'Frecuente' && nivel === 'Básico') || (n.nombre === 'VIP' && nivel !== 'VIP'))
                  return (
                    <div key={n.nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '2px', background: esActual ? 'var(--black)' : 'var(--cream)', opacity: esFuturo ? 0.5 : 1 }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '500', color: esActual ? 'var(--gold)' : 'var(--black)' }}>{esActual ? '★ ' : ''}{n.nombre} · {n.sufijo}</p>
                        <p style={{ fontSize: '11px', color: esActual ? 'rgba(247,243,236,0.5)' : '#888' }}>{n.rango} · hasta {n.maxViandas} vianda{n.maxViandas > 1 ? 's' : ''}</p>
                      </div>
                      {esActual && <span style={{ fontSize: '9px', color: 'var(--gold)', border: '1px solid rgba(184,154,94,0.3)', padding: '3px 8px' }}>ACTUAL</span>}
                      {esFuturo && n.nombre === (nivel === 'Básico' ? 'Frecuente' : 'VIP') && pedidosParaSiguiente > 0 && (
                        <span style={{ fontSize: '10px', color: '#888' }}>{pedidosParaSiguiente} pedidos más</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Historial stats */}
            <div style={{ background: 'var(--white)', border: '1px solid rgba(0,0,0,0.08)', padding: '20px', borderRadius: '4px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '14px' }}>TU HISTORIAL</p>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[{ val: cantidadPedidos, label: 'pedidos', color: 'var(--black)' }, { val: totalViandas, label: 'viandas', color: 'var(--black)' }, { val: totalCanjeadas, label: 'canjeadas', color: 'var(--gold)' }].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: s.color }}>{s.val}</p>
                    <p style={{ fontSize: '11px', color: '#888' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha — Historial */}
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)', fontWeight: '400', marginBottom: '24px' }}>Historial de pedidos</h2>
            {cargandoPedidos ? (
              <div style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--cream-deep)' }}><p style={{ fontSize: '13px', color: '#999' }}>Cargando pedidos...</p></div>
            ) : pedidos.length === 0 ? (
              <div style={{ padding: '48px 32px', textAlign: 'center', border: '1px solid var(--cream-deep)', background: 'var(--cream)' }}>
                <p style={{ fontSize: '32px', marginBottom: '16px' }}>🛒</p>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--black)', marginBottom: '8px' }}>Todavía no hiciste pedidos</p>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '24px' }}>Tus pedidos van a aparecer acá</p>
                <a href="/menu" style={{ display: 'inline-block', background: 'var(--black)', color: 'var(--cream)', padding: '12px 28px', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', textDecoration: 'none' }}>Ver menú</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pedidos.map(pedido => {
                  const items = pedido.items || []
                  const colorEstado = estadoColor[pedido.estado] || estadoColor['pendiente']
                  return (
                    <div key={pedido.id} style={{ background: 'var(--white)', border: '1px solid rgba(0,0,0,0.08)', padding: '16px 20px', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--black)' }}>Pedido #{String(pedido.id).slice(-4).toUpperCase()} · {formatearFecha(pedido.created_at)}</span>
                          <span style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: colorEstado.color, background: colorEstado.bg, padding: '3px 10px' }}>{pedido.estado}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '11px', color: '#888', marginBottom: '10px', lineHeight: '1.5' }}>
                        {items.reduce((a, i) => a + i.cantidad, 0)} viandas
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', color: 'var(--black)' }}>${pedido.total?.toLocaleString('es-AR')}</span>
                          <span style={{ fontSize: '11px', color: 'var(--gold)' }}>+{pedido.puntos} pts</span>
                          {pedido.pago_metodo && <span style={{ fontSize: '10px', color: '#999' }}>{pedido.pago_metodo === 'efectivo' ? '💵' : '💳'}</span>}
                        </div>
                        <button onClick={() => repetirPedido(pedido)} style={{ background: repetidoId === pedido.id ? 'var(--olive)' : 'var(--black)', color: 'var(--cream)', border: 'none', padding: '8px 16px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer', transition: 'background 0.2s ease' }}>
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

      {/* Cómo funciona */}
      <section style={{ background: 'var(--black)', padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '16px', textAlign: 'center' }}>Programa de fidelidad</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--cream)', fontWeight: '400', marginBottom: '48px', textAlign: 'center' }}>Cómo funciona tu programa de puntos</h2>
          <div className="perfil-puntos-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
            <div style={{ border: '1px solid rgba(247,243,236,0.12)', padding: '32px 28px' }}>
              <p style={{ fontSize: '32px', marginBottom: '16px' }}>⭐</p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--cream)', marginBottom: '12px' }}>+10 pts por cada vianda comprada</p>
              <p style={{ fontSize: '13px', color: 'rgba(247,243,236,0.5)', lineHeight: '1.6' }}>Sumás puntos en cada pedido. Los puntos no usados quedan en tu cuenta.</p>
            </div>
            <div style={{ border: '1px solid rgba(247,243,236,0.12)', padding: '32px 28px' }}>
              <p style={{ fontSize: '32px', marginBottom: '16px' }}>🎁</p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--cream)', marginBottom: '12px' }}>200 pts = 1 vianda gratis</p>
              <p style={{ fontSize: '13px', color: 'rgba(247,243,236,0.5)', lineHeight: '1.6' }}>El canje cubre hasta {formatPrecio(PRECIO_MIN_VIANDA)}. Si elegís una más cara, pagás solo la diferencia.</p>
            </div>
          </div>
          <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '24px', textAlign: 'center' }}>Cuántas viandas podés canjear según tu nivel</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {nivelesInfo.map(n => {
              const esActual = nivel === n.nombre
              return (
                <div key={n.nombre} style={{ border: esActual ? '1px solid var(--gold)' : '1px solid rgba(247,243,236,0.08)', padding: '24px 28px', background: esActual ? 'rgba(184,154,94,0.08)' : 'transparent', position: 'relative' }}>
                  {esActual && <span style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '8px', letterSpacing: '2px', color: 'var(--gold)' }}>Tu nivel actual</span>}
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: esActual ? 'var(--gold)' : 'var(--cream)', marginBottom: '4px' }}>
                    {n.nombre} <span style={{ fontSize: '12px', color: 'rgba(247,243,236,0.4)', fontFamily: 'Jost, sans-serif' }}>({n.rango})</span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                    <p style={{ fontSize: '13px', color: 'rgba(247,243,236,0.6)' }}>→ 200 pts = 1 vianda gratis</p>
                    {n.maxViandas >= 2 && <p style={{ fontSize: '13px', color: 'rgba(247,243,236,0.6)' }}>→ 300 pts = 2 viandas gratis ✦</p>}
                    {n.maxViandas >= 3 && <p style={{ fontSize: '13px', color: 'rgba(247,243,236,0.6)' }}>→ 400 pts = 3 viandas gratis ✦✦</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />

      {/* ===== Modal selector de viandas ===== */}
      {modalCanje && (
        <div onClick={() => setModalCanje(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--white)', maxWidth: '480px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

            {/* Modal header */}
            <div style={{ background: 'var(--black)', padding: '24px 28px', position: 'sticky', top: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '4px' }}>CANJE · {modalCanje.puntos} PTS</p>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--cream)' }}>
                    Elegí {modalCanje.viandas} vianda{modalCanje.viandas > 1 ? 's' : ''}
                  </h3>
                </div>
                <button onClick={() => setModalCanje(null)} style={{ background: 'transparent', border: 'none', color: 'var(--cream)', fontSize: '20px', cursor: 'pointer', opacity: 0.6 }}>✕</button>
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '16px 28px', background: 'rgba(184,154,94,0.06)', borderBottom: '1px solid var(--cream-deep)' }}>
              <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                El canje cubre hasta <strong>{formatPrecio(PRECIO_MIN_VIANDA)}</strong> por vianda (precio más bajo del menú). Si elegís una más cara, pagás solo la diferencia.
              </p>
            </div>

            {/* Viandas list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px' }}>
              {platos.map(plato => {
                const cant = seleccion[plato.nombre] || 0
                const diff = Math.max(0, plato.precioNum - PRECIO_MIN_VIANDA)
                return (
                  <div key={plato.nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--cream-deep)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '20px' }}>{plato.emoji}</span>
                        <p style={{ fontSize: '14px', color: 'var(--black)', fontFamily: 'Jost, sans-serif' }}>{plato.nombre}</p>
                      </div>
                      <p style={{ fontSize: '12px', color: '#999', marginLeft: '30px' }}>{plato.precio}</p>
                      <p style={{ fontSize: '11px', marginLeft: '30px', color: diff > 0 ? 'var(--gold)' : 'var(--olive)', fontWeight: '400' }}>
                        {diff > 0 ? `Diferencia a abonar: ${formatPrecio(diff)}` : '¡Gratis por canje!'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {cant > 0 && (
                        <button onClick={() => cambiarSeleccion(plato.nombre, -1)} style={{ width: '32px', height: '32px', border: '1px solid var(--cream-deep)', background: 'transparent', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--black)' }}>−</button>
                      )}
                      {cant > 0 && (
                        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', minWidth: '20px', textAlign: 'center' }}>{cant}</span>
                      )}
                      <button
                        onClick={() => cambiarSeleccion(plato.nombre, 1)}
                        disabled={totalSeleccionado >= modalCanje.viandas}
                        style={{
                          width: '32px', height: '32px',
                          border: '1px solid var(--black)',
                          background: totalSeleccionado >= modalCanje.viandas ? '#eee' : 'var(--black)',
                          cursor: totalSeleccionado >= modalCanje.viandas ? 'not-allowed' : 'pointer',
                          fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: totalSeleccionado >= modalCanje.viandas ? '#bbb' : 'var(--cream)',
                        }}
                      >+</button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '20px 28px', borderTop: '1px solid var(--cream-deep)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 0, background: 'var(--white)' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#999' }}>Elegidas: <strong style={{ color: 'var(--black)' }}>{totalSeleccionado}</strong> / {modalCanje.viandas}</p>
              </div>
              <button
                onClick={confirmarCanje}
                disabled={totalSeleccionado !== modalCanje.viandas}
                style={{
                  background: totalSeleccionado === modalCanje.viandas ? 'var(--black)' : '#eee',
                  color: totalSeleccionado === modalCanje.viandas ? 'var(--cream)' : '#bbb',
                  border: 'none', padding: '14px 28px', fontSize: '10px', letterSpacing: '2px', fontFamily: 'Jost, sans-serif',
                  cursor: totalSeleccionado === modalCanje.viandas ? 'pointer' : 'not-allowed',
                }}
              >
                AGREGAR AL CARRITO
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
