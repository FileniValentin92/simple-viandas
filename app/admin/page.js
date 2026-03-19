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

const pagoEstadoColores = {
  pendiente: { bg: '#FFF3CD', color: '#856404', label: 'Pendiente de pago' },
  pagado:    { bg: '#D4EDDA', color: '#155724', label: 'Pagado' },
}

const pagoMetodoIconos = {
  efectivo:      { emoji: '💵', label: 'Efectivo' },
  transferencia: { emoji: '🏦', label: 'Transferencia' },
  mercadopago:   { emoji: '💳', label: 'MercadoPago' },
}

export default function AdminPage() {
  const [logueado, setLogueado] = useState(false)
  const [password, setPassword] = useState('')
  const [errorPass, setErrorPass] = useState(false)
  const [vistaActiva, setVistaActiva] = useState('pedidos')

  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [pedidoAbierto, setPedidoAbierto] = useState(null)
  const [filtro, setFiltro] = useState('todos')
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false)
  const [borrando, setBorrando] = useState(false)

  const [stock, setStock] = useState([])
  const [stockCambios, setStockCambios] = useState({})
  const [aplicandoCambios, setAplicandoCambios] = useState(false)

  const [periodo, setPeriodo] = useState('semana')
  const [reporte, setReporte] = useState(null)
  const [cargandoReporte, setCargandoReporte] = useState(false)

  const [cantidadesCocina, setCantidadesCocina] = useState({})
  const [notasCocina, setNotasCocina] = useState({})
  const [vendidosSemana, setVendidosSemana] = useState({})

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setLogueado(true); setErrorPass(false) }
    else setErrorPass(true)
  }

  const cargarPedidos = async () => {
    setCargando(true)
    const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false })
    if (!error) setPedidos(data || [])
    setCargando(false)
  }

  const cargarStock = async () => {
    const { data } = await supabase.from('stock').select('*').order('categoria').order('nombre')
    if (data) setStock(data)
  }

  const cargarReporte = async (p) => {
    setCargandoReporte(true)
    try {
      const res = await fetch(`/api/reportes?periodo=${p}`)
      const data = await res.json()
      setReporte(data)
      if (p === 'semana') {
        const mapa = {}
        data.ranking?.forEach(item => { mapa[item.nombre] = item.cantidad })
        setVendidosSemana(mapa)
      }
    } catch (err) { console.error('Error cargando reporte:', err) }
    setCargandoReporte(false)
  }

  useEffect(() => {
    if (logueado) { cargarPedidos(); cargarStock(); cargarReporte('semana') }
  }, [logueado])

  useEffect(() => {
    if (logueado && vistaActiva === 'reportes') cargarReporte(periodo)
  }, [periodo, vistaActiva])

  const cambiarEstado = async (id, nuevoEstado) => {
    await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', id)
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p))
    if (pedidoAbierto?.id === id) setPedidoAbierto(prev => ({ ...prev, estado: nuevoEstado }))
  }

  const cambiarPagoEstado = async (id, nuevoPagoEstado) => {
    await supabase.from('pedidos').update({ pago_estado: nuevoPagoEstado }).eq('id', id)
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, pago_estado: nuevoPagoEstado } : p))
    if (pedidoAbierto?.id === id) setPedidoAbierto(prev => ({ ...prev, pago_estado: nuevoPagoEstado }))
  }

  const borrarPedido = async (id) => {
    setBorrando(true)
    const { error } = await supabase.from('pedidos').delete().eq('id', id)
    if (!error) { setPedidos(prev => prev.filter(p => p.id !== id)); setPedidoAbierto(null); setConfirmandoBorrar(false) }
    setBorrando(false)
  }

  const aplicarCambiosStock = async () => {
    const cambios = Object.entries(stockCambios).filter(([_, v]) => v !== '' && parseInt(v) !== 0)
    if (cambios.length === 0) return
    setAplicandoCambios(true)
    for (const [id, valor] of cambios) {
      const item = stock.find(s => s.id === id)
      if (!item) continue
      const delta = parseInt(valor) || 0
      const nuevaCantidad = Math.max(0, item.cantidad + delta)
      await supabase.from('stock').update({ cantidad: nuevaCantidad, updated_at: new Date().toISOString() }).eq('id', id)
      setStock(prev => prev.map(s => s.id === id ? { ...s, cantidad: nuevaCantidad } : s))
    }
    setStockCambios({})
    setAplicandoCambios(false)
  }

  const exportarCocina = async () => {
    const filas = stock.filter(item => parseInt(cantidadesCocina[item.id]) > 0)
    if (filas.length === 0) { alert('Ingresá al menos una cantidad antes de exportar.'); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    script.onload = () => {
      const { jsPDF } = window.jspdf
      const doc = new jsPDF()
      const fecha = new Date().toLocaleDateString('es-AR')
      doc.setFillColor(26, 26, 26)
      doc.rect(0, 0, 210, 30, 'F')
      doc.setTextColor(247, 243, 236)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('SIMPLE', 14, 14)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(200, 169, 110)
      doc.text('PEDIDO A COCINA', 14, 22)
      doc.setTextColor(180, 180, 180)
      doc.text(`Fecha: ${fecha}`, 150, 22)
      let y = 44
      doc.setFillColor(240, 240, 240)
      doc.rect(14, y - 6, 182, 9, 'F')
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('VIANDA', 16, y)
      doc.text('CANTIDAD', 138, y)
      doc.text('NOTAS', 162, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      filas.forEach((item, i) => {
        const cantidad = parseInt(cantidadesCocina[item.id]) || 0
        const nota = notasCocina[item.id] || ''
        if (i % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(14, y - 5, 182, 8, 'F') }
        doc.setTextColor(30, 30, 30)
        doc.text(item.nombre.substring(0, 50), 16, y)
        doc.setFont('helvetica', 'bold')
        doc.text(String(cantidad), 142, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(nota.substring(0, 20), 162, y)
        y += 9
        if (y > 270) { doc.addPage(); y = 20 }
      })
      y += 4
      doc.setDrawColor(200, 200, 200)
      doc.line(14, y, 196, y)
      y += 8
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(`Total a producir: ${totalCocina} viandas`, 16, y)
      doc.save(`pedido-cocina-${fecha.replace(/\//g, '-')}.pdf`)
    }
    document.head.appendChild(script)
  }

  const exportarReporte = () => {
    if (!reporte) return
    const rows = [['Plato', 'Unidades vendidas']]
    reporte.ranking?.forEach(item => rows.push([item.nombre, item.cantidad]))
    rows.push(['', ''], ['Total viandas', reporte.totalViandas], ['Total pedidos', reporte.totalPedidos], ['Total recaudado', reporte.totalRecaudado])
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `reporte-ventas-${periodo}-${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const exportarStock = () => {
    const rows = [['Plato', 'Categoría', 'Stock actual', 'Vendidos histórico', 'Estado']]
    stock.forEach(item => {
      const estado = item.cantidad === 0 ? 'Sin stock' : item.cantidad <= item.alerta_minima ? 'Stock bajo' : 'OK'
      rows.push([item.nombre, item.categoria, item.cantidad, item.vendidos_total || 0, estado])
    })
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `stock-${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const totalCocina = Object.values(cantidadesCocina).reduce((acc, v) => acc + (parseInt(v) || 0), 0)
  const hayCambiosStock = Object.values(stockCambios).some(v => v !== '' && parseInt(v) !== 0)

  const formatFecha = (str) => {
    const d = new Date(str)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }
  const formatPrecio = (n) => '$' + Number(n).toLocaleString('es-AR')

  const pedidosFiltrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro)
  const hoy = new Date().toDateString()
  const pedidosHoy = pedidos.filter(p => new Date(p.created_at).toDateString() === hoy)
  const totalHoy = pedidosHoy.reduce((acc, p) => acc + p.total, 0)
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length
  const sinPagar = pedidos.filter(p => p.pago_estado === 'pendiente').length
  const alertasStock = stock.filter(s => s.cantidad <= s.alerta_minima && s.cantidad > 0)
  const sinStockItems = stock.filter(s => s.cantidad === 0)

  if (!logueado) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Jost, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '360px', padding: '0 24px' }}>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--cream)', fontWeight: '400', marginBottom: '8px', textAlign: 'center' }}>SIMPLE</p>
          <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '40px', textAlign: 'center' }}>Panel de administración</p>
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ display: 'block', width: '100%', background: 'rgba(247,243,236,0.08)', border: errorPass ? '1px solid #e74c3c' : '1px solid rgba(247,243,236,0.2)', color: 'var(--cream)', padding: '14px 16px', fontSize: '14px', fontFamily: 'Jost, sans-serif', fontWeight: '300', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }} />
          {errorPass && <p style={{ color: '#e74c3c', fontSize: '11px', marginBottom: '12px' }}>Contraseña incorrecta</p>}
          <button onClick={handleLogin} style={{ width: '100%', background: 'var(--cream)', color: 'var(--black)', border: 'none', padding: '14px', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>Ingresar</button>
        </div>
      </div>
    )
  }

  const btnVista = (active) => ({ background: active ? 'rgba(247,243,236,0.15)' : 'transparent', border: 'none', color: active ? 'var(--cream)' : 'rgba(247,243,236,0.4)', padding: '8px 16px', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer', position: 'relative' })

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', fontFamily: 'Jost, sans-serif' }}>

      <div style={{ background: 'var(--black)', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--cream)', fontWeight: '400', letterSpacing: '3px' }}>SIMPLE</span>
            <span style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginLeft: '16px' }}>Admin</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['pedidos', 'stock', 'reportes', 'cocina'].map(vista => (
              <button key={vista} onClick={() => setVistaActiva(vista)} style={btnVista(vistaActiva === vista)}>
                {vista}
                {vista === 'stock' && (alertasStock.length > 0 || sinStockItems.length > 0) && (
                  <span style={{ position: 'absolute', top: '6px', right: '8px', width: '6px', height: '6px', borderRadius: '50%', background: '#e74c3c' }} />
                )}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => { cargarPedidos(); cargarStock(); cargarReporte(periodo) }} style={{ background: 'transparent', border: '1px solid rgba(247,243,236,0.3)', color: 'var(--cream)', padding: '8px 16px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>↻ Actualizar</button>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* ── PEDIDOS ── */}
        {vistaActiva === 'pedidos' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Total pedidos', valor: pedidos.length, color: 'var(--black)' },
                { label: 'Pedidos hoy', valor: pedidosHoy.length, color: 'var(--olive)' },
                { label: 'Pendientes', valor: pendientes, color: '#856404' },
                { label: 'Sin cobrar', valor: sinPagar, color: '#721C24' },
                { label: 'Recaudado hoy', valor: formatPrecio(totalHoy), color: 'var(--black)' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#fff', padding: '20px 24px', border: '1px solid #E0E0E0' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', fontWeight: '300', marginBottom: '8px' }}>{stat.label}</p>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', color: stat.color, fontWeight: '400' }}>{stat.valor}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['todos', 'pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'].map(f => (
                <button key={f} onClick={() => setFiltro(f)} style={{ background: filtro === f ? 'var(--black)' : '#fff', color: filtro === f ? 'var(--cream)' : 'var(--black)', border: '1px solid #E0E0E0', padding: '8px 16px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>
                  {f === 'todos' ? `Todos (${pedidos.length})` : `${estadoColores[f]?.label} (${pedidos.filter(p => p.estado === f).length})`}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: pedidoAbierto ? '1fr 420px' : '1fr', gap: '20px', alignItems: 'start' }}>
              <div style={{ background: '#fff', border: '1px solid #E0E0E0' }}>
                {cargando ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: '#999', fontSize: '13px' }}>Cargando pedidos...</div>
                ) : pedidosFiltrados.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: '#999', fontSize: '13px' }}>No hay pedidos</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                        {['Fecha', 'Cliente', 'Dirección', 'Total', 'Pago', 'Estado pedido', ''].map(h => (
                          <th key={h} style={{ padding: '12px 16px', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', fontWeight: '400', textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosFiltrados.map(pedido => {
                        const estado = estadoColores[pedido.estado] || estadoColores.pendiente
                        const pagoEst = pagoEstadoColores[pedido.pago_estado] || pagoEstadoColores.pendiente
                        const metodo = pagoMetodoIconos[pedido.pago_metodo] || pagoMetodoIconos.efectivo
                        const activo = pedidoAbierto?.id === pedido.id
                        return (
                          <tr key={pedido.id} style={{ borderBottom: '1px solid #F0F0F0', background: activo ? '#FAFAFA' : '#fff', cursor: 'pointer' }}
                            onClick={() => { setPedidoAbierto(activo ? null : pedido); setConfirmandoBorrar(false) }}>
                            <td style={{ padding: '14px 16px', fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>{formatFecha(pedido.created_at)}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <p style={{ fontSize: '13px', color: 'var(--black)', fontWeight: '400', marginBottom: '2px' }}>{pedido.nombre}</p>
                              <p style={{ fontSize: '11px', color: '#999', fontWeight: '300' }}>{pedido.telefono}</p>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '12px', color: '#666', maxWidth: '140px' }}>
                              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pedido.direccion}</p>
                            </td>
                            <td style={{ padding: '14px 16px', fontFamily: 'Playfair Display, serif', fontSize: '15px', color: 'var(--black)', whiteSpace: 'nowrap' }}>{formatPrecio(pedido.total)}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '13px' }}>{metodo.emoji} {metodo.label}</span>
                                <span style={{ background: pagoEst.bg, color: pagoEst.color, padding: '2px 8px', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', display: 'inline-block' }}>{pagoEst.label}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ background: estado.bg, color: estado.color, padding: '4px 10px', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase' }}>{estado.label}</span>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '12px', color: '#999' }}>{activo ? '▲' : '▼'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              {pedidoAbierto && (
                <div style={{ background: '#fff', border: '1px solid #E0E0E0', position: 'sticky', top: '20px' }}>
                  <div style={{ background: 'var(--black)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', color: 'var(--cream)', fontWeight: '400' }}>Detalle del pedido</p>
                    <button onClick={() => { setPedidoAbierto(null); setConfirmandoBorrar(false) }} style={{ background: 'transparent', border: 'none', color: 'var(--cream)', cursor: 'pointer', fontSize: '18px', opacity: 0.6 }}>✕</button>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #F0F0F0' }}>
                      <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '10px' }}>Cliente</p>
                      <p style={{ fontSize: '15px', color: 'var(--black)', fontWeight: '400', marginBottom: '4px' }}>{pedidoAbierto.nombre}</p>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>📱 {pedidoAbierto.telefono}</p>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>📍 {pedidoAbierto.direccion}{pedidoAbierto.piso ? ` — ${pedidoAbierto.piso}` : ''}</p>
                      {pedidoAbierto.comentarios && <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', fontStyle: 'italic' }}>💬 {pedidoAbierto.comentarios}</p>}
                      <p style={{ fontSize: '11px', color: '#bbb', marginTop: '8px' }}>{formatFecha(pedidoAbierto.created_at)}</p>
                    </div>
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
                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #F0F0F0' }}>
                      <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Pago</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '18px' }}>{pagoMetodoIconos[pedidoAbierto.pago_metodo]?.emoji || '💵'}</span>
                        <span style={{ fontSize: '14px', color: 'var(--black)' }}>{pagoMetodoIconos[pedidoAbierto.pago_metodo]?.label || 'Efectivo'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {Object.entries(pagoEstadoColores).map(([key, val]) => (
                          <button key={key} onClick={() => cambiarPagoEstado(pedidoAbierto.id, key)} style={{ background: pedidoAbierto.pago_estado === key ? val.bg : 'transparent', color: pedidoAbierto.pago_estado === key ? val.color : '#999', border: pedidoAbierto.pago_estado === key ? `1px solid ${val.color}60` : '1px solid #E0E0E0', padding: '10px 12px', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>
                            {pedidoAbierto.pago_estado === key ? '● ' : '○ '}{val.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #F0F0F0' }}>
                      <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Estado del pedido</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(estadoColores).map(([key, val]) => (
                          <button key={key} onClick={() => cambiarEstado(pedidoAbierto.id, key)} style={{ background: pedidoAbierto.estado === key ? val.bg : 'transparent', color: pedidoAbierto.estado === key ? val.color : '#999', border: pedidoAbierto.estado === key ? `1px solid ${val.color}40` : '1px solid #E0E0E0', padding: '10px 16px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer', textAlign: 'left' }}>
                            {pedidoAbierto.estado === key ? '● ' : '○ '}{val.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      {!confirmandoBorrar ? (
                        <button onClick={() => setConfirmandoBorrar(true)} style={{ width: '100%', background: 'transparent', border: '1px solid #F8D7DA', color: '#721C24', padding: '10px 16px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>🗑 Eliminar pedido</button>
                      ) : (
                        <div style={{ background: '#FFF5F5', border: '1px solid #F8D7DA', padding: '16px' }}>
                          <p style={{ fontSize: '12px', color: '#721C24', marginBottom: '12px', textAlign: 'center' }}>¿Confirmar eliminación? Esta acción no se puede deshacer.</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button onClick={() => setConfirmandoBorrar(false)} style={{ background: '#fff', border: '1px solid #E0E0E0', color: '#666', padding: '10px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={() => borrarPedido(pedidoAbierto.id)} disabled={borrando} style={{ background: '#721C24', border: 'none', color: '#fff', padding: '10px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: borrando ? 'not-allowed' : 'pointer' }}>
                              {borrando ? 'Borrando...' : 'Sí, eliminar'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── STOCK ── */}
        {vistaActiva === 'stock' && (
          <>
            {(alertasStock.length > 0 || sinStockItems.length > 0) && (
              <div style={{ marginBottom: '24px' }}>
                {sinStockItems.length > 0 && (
                  <div style={{ background: '#F8D7DA', border: '1px solid #f5c2c7', padding: '14px 18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px' }}>🚨</span>
                    <p style={{ fontSize: '13px', color: '#721C24' }}><strong>Sin stock:</strong> {sinStockItems.map(s => s.nombre).join(', ')}</p>
                  </div>
                )}
                {alertasStock.length > 0 && (
                  <div style={{ background: '#FFF3CD', border: '1px solid #ffecb5', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <p style={{ fontSize: '13px', color: '#856404' }}><strong>Stock bajo:</strong> {alertasStock.map(s => `${s.nombre} (${s.cantidad})`).join(', ')}</p>
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={exportarStock} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #E0E0E0', background: '#fff', fontSize: '12px', fontFamily: 'Jost, sans-serif', cursor: 'pointer', color: 'var(--black)' }}>↓ Exportar CSV</button>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E0E0E0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                    {['Plato', 'Categoría', 'Stock actual', 'Vendidos (histórico)', 'Alerta mínima', 'Ajuste (+/-)'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', fontWeight: '400', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stock.map(item => {
                    const critico = item.cantidad === 0
                    const bajo = item.cantidad > 0 && item.cantidad <= item.alerta_minima
                    const cambio = parseInt(stockCambios[item.id]) || 0
                    const preview = item.cantidad + cambio
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F0F0F0', background: critico ? '#FFF5F5' : bajo ? '#FFFDF0' : '#fff' }}>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--black)' }}>{item.nombre}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', background: '#F0F0F0', color: '#666', padding: '3px 8px' }}>{item.categoria}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: critico ? '#721C24' : bajo ? '#856404' : 'var(--black)' }}>{item.cantidad}</span>
                          {stockCambios[item.id] && cambio !== 0 && (
                            <span style={{ fontSize: '12px', color: cambio > 0 ? '#155724' : '#721C24', marginLeft: '8px' }}>
                              → {Math.max(0, preview)}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--black)' }}>{item.vendidos_total || 0}</td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#999' }}>{item.alerta_minima} uds</td>
                        <td style={{ padding: '14px 16px' }}>
                          <input
                            type="number"
                            value={stockCambios[item.id] || ''}
                            onChange={e => setStockCambios(prev => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="ej: +10 o -5"
                            style={{ width: '120px', padding: '7px 10px', border: stockCambios[item.id] ? '1px solid var(--black)' : '1px solid #E0E0E0', fontSize: '13px', fontFamily: 'Jost, sans-serif', textAlign: 'center' }}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Botón único abajo */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
              {hayCambiosStock && (
                <p style={{ fontSize: '12px', color: '#856404' }}>
                  {Object.values(stockCambios).filter(v => v !== '' && parseInt(v) !== 0).length} plato(s) con cambios pendientes
                </p>
              )}
              <button
                onClick={aplicarCambiosStock}
                disabled={!hayCambiosStock || aplicandoCambios}
                style={{ background: hayCambiosStock ? 'var(--black)' : '#E0E0E0', color: hayCambiosStock ? 'var(--cream)' : '#999', border: 'none', padding: '12px 28px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: hayCambiosStock ? 'pointer' : 'not-allowed' }}
              >
                {aplicandoCambios ? 'Aplicando...' : 'Aplicar cambios'}
              </button>
            </div>
          </>
        )}

        {/* ── REPORTES ── */}
        {vistaActiva === 'reportes' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[{ id: 'hoy', label: 'Hoy' }, { id: 'semana', label: 'Esta semana' }, { id: 'mes', label: 'Este mes' }].map(p => (
                  <button key={p.id} onClick={() => setPeriodo(p.id)} style={{ background: periodo === p.id ? 'var(--black)' : '#fff', color: periodo === p.id ? 'var(--cream)' : 'var(--black)', border: '1px solid #E0E0E0', padding: '8px 16px', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>{p.label}</button>
                ))}
              </div>
              <button onClick={exportarReporte} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #E0E0E0', background: '#fff', fontSize: '12px', fontFamily: 'Jost, sans-serif', cursor: 'pointer', color: 'var(--black)' }}>↓ Exportar CSV</button>
            </div>
            {cargandoReporte ? (
              <p style={{ color: '#999', fontSize: '13px' }}>Cargando reporte...</p>
            ) : reporte ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                  {[
                    { label: 'Viandas vendidas', valor: reporte.totalViandas },
                    { label: 'Pedidos', valor: reporte.totalPedidos },
                    { label: 'Recaudado', valor: formatPrecio(reporte.totalRecaudado) },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#fff', padding: '20px 24px', border: '1px solid #E0E0E0' }}>
                      <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', fontWeight: '300', marginBottom: '8px' }}>{stat.label}</p>
                      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)', fontWeight: '400' }}>{stat.valor}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fff', border: '1px solid #E0E0E0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                        {['Plato', 'Unidades vendidas', '% del total', ''].map(h => (
                          <th key={h} style={{ padding: '12px 16px', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', fontWeight: '400', textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.ranking?.map((item, i) => {
                        const pct = reporte.totalViandas > 0 ? Math.round((item.cantidad / reporte.totalViandas) * 100) : 0
                        const maxCant = reporte.ranking[0]?.cantidad || 1
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #F0F0F0' }}>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--black)' }}>{item.nombre}</td>
                            <td style={{ padding: '14px 16px', fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--black)' }}>{item.cantidad}</td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#666' }}>{pct}%</td>
                            <td style={{ padding: '14px 16px', width: '160px' }}>
                              <div style={{ background: '#F0F0F0', borderRadius: '2px', height: '6px' }}>
                                <div style={{ background: 'var(--black)', height: '6px', borderRadius: '2px', width: `${Math.round((item.cantidad / maxCant) * 100)}%` }} />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {(!reporte.ranking || reporte.ranking.length === 0) && (
                        <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#999', fontSize: '13px' }}>No hay ventas en este período</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </>
        )}

        {/* ── COCINA ── */}
        {vistaActiva === 'cocina' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '4px' }}>Pedido a cocina</p>
                <p style={{ fontSize: '13px', color: '#666' }}>Completá las cantidades a producir y exportá el PDF.</p>
              </div>
              <button onClick={exportarCocina} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', border: 'none', background: 'var(--black)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer', color: 'var(--cream)' }}>
                ↓ Descargar PDF
              </button>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E0E0E0', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                    {['Plato', 'Stock actual', 'Vendidos esta semana', 'Cantidad a producir', 'Notas'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', fontWeight: '400', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stock.map(item => {
                    const critico = item.cantidad === 0
                    const bajo = item.cantidad > 0 && item.cantidad <= item.alerta_minima
                    const vendidos = vendidosSemana[item.nombre] || 0
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F0F0F0', background: critico ? '#FFF5F5' : bajo ? '#FFFDF0' : '#fff' }}>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--black)' }}>
                          {item.nombre}
                          {critico && <span style={{ display: 'block', fontSize: '10px', color: '#721C24' }}>Sin stock</span>}
                          {bajo && <span style={{ display: 'block', fontSize: '10px', color: '#856404' }}>Stock bajo</span>}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'Playfair Display, serif', fontSize: '22px', color: critico ? '#721C24' : bajo ? '#856404' : 'var(--black)' }}>{item.cantidad}</td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#666' }}>{vendidos > 0 ? `${vendidos} uds` : '—'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <input type="number" min="0" value={cantidadesCocina[item.id] || ''}
                            onChange={e => setCantidadesCocina(prev => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="0"
                            style={{ width: '80px', padding: '8px 10px', border: '1px solid #E0E0E0', fontSize: '14px', fontFamily: 'Jost, sans-serif', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <input type="text" value={notasCocina[item.id] || ''}
                            onChange={e => setNotasCocina(prev => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="Ej: sin gluten..."
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #E0E0E0', fontSize: '13px', fontFamily: 'Jost, sans-serif' }} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E0E0E0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '13px', color: '#666' }}>Total a producir</p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--black)' }}>{totalCocina} viandas</p>
            </div>
          </>
        )}

      </div>
    </div>
  )
}