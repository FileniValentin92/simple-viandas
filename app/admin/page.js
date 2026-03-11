'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const ADMIN_PASSWORD = 'simple2026'

const estadoColores = {
  pendiente:  { bg: '#FFF3CD', color: '#856404', label: 'Pendiente' },
  preparando: { bg: '#CCE5FF', color: '#004085', label: 'Preparando' },
  enviado:    { bg: '#D4EDDA', color: '#155724', label: 'Enviado' },
  entregado:  { bg: '#E2E3E5', color: '#383D41', label: 'Entregado' },
  cancelado:  { bg: '#F8D7DA', color: '#721C24', label: 'Cancelado' },
}

export default function AdminPage() {
  const [logueado, setLogueado] = useState(false)
  const [password, setPassword] = useState('')
  const [errorPass, setErrorPass] = useState(false)
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [pedidoAbierto, setPedidoAbierto] = useState(null)
  const [filtro, setFiltro] = useState('todos')

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setLogueado(true)
      setErrorPass(false)
    } else {
      setErrorPass(true)
    }
  }

  const cargarPedidos = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setPedidos(data || [])
    setCargando(false)
  }

  useEffect(() => {
    if (logueado) cargarPedidos()
  }, [logueado])

  const cambiarEstado = async (id, nuevoEstado) => {
    await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', id)
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p))
    if (pedidoAbierto?.id === id) setPedidoAbierto(prev => ({ ...prev, estado: nuevoEstado }))
  }

  const formatFecha = (str) => {
    const d = new Date(str)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPrecio = (n) => '$' + Number(n).toLocaleString('es-AR')

  const pedidosFiltrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro)

  // Stats
  const hoy = new Date().toDateString()
  const pedidosHoy = pedidos.filter(p => new Date(p.created_at).toDateString() === hoy)
  const totalHoy = pedidosHoy.reduce((acc, p) => acc + p.total, 0)
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length

  // Login
  if (!logueado) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--black)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Jost, sans-serif',
      }}>
        <div style={{ width: '100%', maxWidth: '360px', padding: '0 24px' }}>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--cream)', fontWeight: '400', marginBottom: '8px', textAlign: 'center' }}>
            SIMPLE
          </p>
          <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '40px', textAlign: 'center' }}>
            Panel de administración
          </p>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              background: 'rgba(247,243,236,0.08)',
              border: errorPass ? '1px solid #e74c3c' : '1px solid rgba(247,243,236,0.2)',
              color: 'var(--cream)',
              padding: '14px 16px',
              fontSize: '14px',
              fontFamily: 'Jost, sans-serif',
              fontWeight: '300',
              outline: 'none',
              marginBottom: '12px',
            }}
          />
          {errorPass && <p style={{ color: '#e74c3c', fontSize: '11px', marginBottom: '12px' }}>Contraseña incorrecta</p>}
          <button onClick={handleLogin} style={{
            width: '100%',
            background: 'var(--cream)',
            color: 'var(--black)',
            border: 'none',
            padding: '14px',
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'Jost, sans-serif',
            fontWeight: '400',
            cursor: 'pointer',
          }}>
            Ingresar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', fontFamily: 'Jost, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'var(--black)', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--cream)', fontWeight: '400', letterSpacing: '3px' }}>SIMPLE</span>
          <span style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginLeft: '16px' }}>Admin</span>
        </div>
        <button onClick={cargarPedidos} style={{
          background: 'transparent',
          border: '1px solid rgba(247,243,236,0.3)',
          color: 'var(--cream)',
          padding: '8px 16px',
          fontSize: '9px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'Jost, sans-serif',
          cursor: 'pointer',
        }}>
          ↻ Actualizar
        </button>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total pedidos', valor: pedidos.length, color: 'var(--black)' },
            { label: 'Pedidos hoy', valor: pedidosHoy.length, color: 'var(--olive)' },
            { label: 'Pendientes', valor: pendientes, color: '#856404' },
            { label: 'Recaudado hoy', valor: formatPrecio(totalHoy), color: 'var(--black)' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', padding: '20px 24px', border: '1px solid #E0E0E0' }}>
              <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', fontWeight: '300', marginBottom: '8px' }}>{stat.label}</p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: stat.color, fontWeight: '400' }}>{stat.valor}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['todos', 'pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{
              background: filtro === f ? 'var(--black)' : '#fff',
              color: filtro === f ? 'var(--cream)' : 'var(--black)',
              border: '1px solid #E0E0E0',
              padding: '8px 16px',
              fontSize: '9px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif',
              cursor: 'pointer',
            }}>
              {f === 'todos' ? `Todos (${pedidos.length})` : `${estadoColores[f]?.label} (${pedidos.filter(p => p.estado === f).length})`}
            </button>
          ))}
        </div>

        {/* Tabla de pedidos + detalle */}
        <div style={{ display: 'grid', gridTemplateColumns: pedidoAbierto ? '1fr 400px' : '1fr', gap: '20px', alignItems: 'start' }}>

          {/* Lista */}
          <div style={{ background: '#fff', border: '1px solid #E0E0E0' }}>
            {cargando ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#999', fontSize: '13px' }}>Cargando pedidos...</div>
            ) : pedidosFiltrados.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#999', fontSize: '13px' }}>No hay pedidos</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                    {['Fecha', 'Cliente', 'Dirección', 'Platos', 'Total', 'Estado', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', fontWeight: '400', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map((pedido) => {
                    const estado = estadoColores[pedido.estado] || estadoColores.pendiente
                    const activo = pedidoAbierto?.id === pedido.id
                    return (
                      <tr key={pedido.id} style={{
                        borderBottom: '1px solid #F0F0F0',
                        background: activo ? '#FAFAFA' : '#fff',
                        cursor: 'pointer',
                      }}
                        onClick={() => setPedidoAbierto(activo ? null : pedido)}
                      >
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>{formatFecha(pedido.created_at)}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: '13px', color: 'var(--black)', fontWeight: '400', marginBottom: '2px' }}>{pedido.nombre}</p>
                          <p style={{ fontSize: '11px', color: '#999', fontWeight: '300' }}>{pedido.telefono}</p>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#666', maxWidth: '160px' }}>
                          <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pedido.direccion}</p>
                          {pedido.piso && <p style={{ fontSize: '11px', color: '#999' }}>{pedido.piso}</p>}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#666' }}>
                          {Array.isArray(pedido.items) ? pedido.items.reduce((acc, i) => acc + i.cantidad, 0) : '—'}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'Playfair Display, serif', fontSize: '15px', color: 'var(--black)', whiteSpace: 'nowrap' }}>
                          {formatPrecio(pedido.total)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            background: estado.bg,
                            color: estado.color,
                            padding: '4px 10px',
                            fontSize: '9px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            fontWeight: '400',
                          }}>
                            {estado.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#999' }}>
                          {activo ? '▲' : '▼'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Panel detalle */}
          {pedidoAbierto && (
            <div style={{ background: '#fff', border: '1px solid #E0E0E0', position: 'sticky', top: '20px' }}>
              <div style={{ background: 'var(--black)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', color: 'var(--cream)', fontWeight: '400' }}>
                  Detalle del pedido
                </p>
                <button onClick={() => setPedidoAbierto(null)} style={{ background: 'transparent', border: 'none', color: 'var(--cream)', cursor: 'pointer', fontSize: '18px', opacity: 0.6 }}>✕</button>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Cliente */}
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #F0F0F0' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '10px' }}>Cliente</p>
                  <p style={{ fontSize: '15px', color: 'var(--black)', fontWeight: '400', marginBottom: '4px' }}>{pedidoAbierto.nombre}</p>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>📱 {pedidoAbierto.telefono}</p>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>📍 {pedidoAbierto.direccion}{pedidoAbierto.piso ? ` — ${pedidoAbierto.piso}` : ''}</p>
                  {pedidoAbierto.comentarios && <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', fontStyle: 'italic' }}>💬 {pedidoAbierto.comentarios}</p>}
                  <p style={{ fontSize: '11px', color: '#bbb', marginTop: '8px' }}>{formatFecha(pedidoAbierto.created_at)}</p>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #F0F0F0' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Platos</p>
                  {Array.isArray(pedidoAbierto.items) && pedidoAbierto.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{item.emoji}</span>
                        <div>
                          <p style={{ fontSize: '13px', color: 'var(--black)' }}>{item.nombre}</p>
                          <p style={{ fontSize: '11px', color: '#999' }}>x{item.cantidad}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--black)' }}>{item.precio}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F0F0F0', paddingTop: '12px', marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999' }}>Total</span>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--black)' }}>{formatPrecio(pedidoAbierto.total)}</span>
                  </div>
                </div>

                {/* Cambiar estado */}
                <div>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Cambiar estado</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(estadoColores).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => cambiarEstado(pedidoAbierto.id, key)}
                        style={{
                          background: pedidoAbierto.estado === key ? val.bg : 'transparent',
                          color: pedidoAbierto.estado === key ? val.color : '#999',
                          border: pedidoAbierto.estado === key ? `1px solid ${val.color}40` : '1px solid #E0E0E0',
                          padding: '10px 16px',
                          fontSize: '10px',
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          fontFamily: 'Jost, sans-serif',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: pedidoAbierto.estado === key ? '400' : '300',
                        }}
                      >
                        {pedidoAbierto.estado === key ? '● ' : '○ '}{val.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}