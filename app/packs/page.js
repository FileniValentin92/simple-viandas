'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../components/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const PACKS = [
  {
    id: 'tarta',
    nombre: 'Pack de tartas',
    descripcion: 'Combiná libremente entre todas las opciones de tarta',
    viandas: ['Tarta de jamón y queso', 'Tarta de verdura', 'Tarta de pollo', 'Tarta de calabaza y queso'],
    precios: { 5: 39000, 10: 74000, 15: 105000, 20: 134000 },
    emoji: '🥧',
  },
  {
    id: 'lasagna',
    nombre: 'Pack de lasagna',
    descripcion: 'Lasagna de carne y verdura · Lasagna de verdura',
    viandas: ['Lasagna de carne y verdura', 'Lasagna de verdura'],
    precios: { 5: 43000, 10: 82000, 15: 117000, 20: 148000 },
    emoji: '🍝',
  },
  {
    id: 'pastel',
    nombre: 'Pack pastel de papa',
    descripcion: 'Pastel de papa mixto (papa y calabaza)',
    viandas: ['Pastel de papa mixto'],
    precios: { 5: 41000, 10: 78000, 15: 111000, 20: 140000 },
    emoji: '🥘',
  },
]

const SIZES = [5, 10, 15, 20]

export default function PacksPage() {
  const { agregarItem } = useCart()
  const [stock, setStock] = useState({})
  const [modal, setModal] = useState(null) // { pack, size }
  const [cantidades, setCantidades] = useState({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarStock()
  }, [])

  const cargarStock = async () => {
    const { data } = await supabase.from('stock').select('nombre, cantidad')
    if (data) {
      const map = {}
      data.forEach(s => { map[s.nombre] = s.cantidad })
      setStock(map)
    }
    setCargando(false)
  }

  const abrirModal = (pack, size) => {
    const init = {}
    pack.viandas.forEach(v => { init[v] = 0 })
    setCantidades(init)
    setModal({ pack, size })
  }

  const cerrarModal = () => setModal(null)

  const cambiar = (nombre, delta) => {
    const stockDisp = stock[nombre] ?? 0
    const actual = cantidades[nombre] || 0
    const total = Object.values(cantidades).reduce((a, b) => a + b, 0)
    if (delta > 0 && total >= modal.size) return
    if (delta > 0 && actual >= stockDisp) return
    if (delta < 0 && actual <= 0) return
    setCantidades(prev => ({ ...prev, [nombre]: actual + delta }))
  }

  const totalSeleccionado = Object.values(cantidades).reduce((a, b) => a + b, 0)

  const confirmarPack = () => {
    const { pack, size } = modal
    const precio = pack.precios[size]
    const precioPorUnidad = Math.round(precio / size)

    Object.entries(cantidades).forEach(([nombre, cant]) => {
      if (cant > 0) {
        agregarItem({
          nombre: `${nombre} (pack ×${size})`,
          descripcion: pack.nombre,
          emoji: pack.emoji,
          precio: `$${precioPorUnidad.toLocaleString('es-AR')}`,
          precioNum: precioPorUnidad,
          puntos: `+${Math.round(precioPorUnidad / 200)} pts`,
          cantidad: cant,
        }, cant)
      }
    })
    cerrarModal()
  }

  const stockTotal = (viandas) => viandas.reduce((acc, v) => acc + (stock[v] ?? 0), 0)

  if (cargando) return (
    <main>
      <Navbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#999', fontFamily: 'Jost, sans-serif' }}>Cargando...</p>
      </div>
      <Footer />
    </main>
  )

  return (
    <main>
      <Navbar />

      {/* Header */}
      <section style={{ background: 'var(--black)', padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 80px)', textAlign: 'center' }}>
        <div style={{ border: '1px solid var(--gold)', background: 'var(--cream)', padding: 'clamp(40px, 5vw, 64px) clamp(24px, 4vw, 56px)', maxWidth: '720px', margin: '0 auto' }}>
          <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
            Ahorrá más
          </p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '48px', color: 'var(--black)', fontWeight: '400', marginBottom: '16px' }}>
            Packs
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(14,14,12,0.6)', maxWidth: '480px', margin: '0 auto', fontFamily: 'Jost, sans-serif', fontWeight: '300', lineHeight: '1.7' }}>
            Armá tu pack de tartas, lasagna o pastel de papa. Combiná las opciones que quieras dentro de cada categoría.
          </p>
        </div>
      </section>

      {/* Packs */}
      <section style={{ background: 'var(--cream)', padding: '60px 24px 80px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {PACKS.map(pack => {
            const dispTotal = stockTotal(pack.viandas)
            const sinStock = dispTotal === 0
            return (
              <div key={pack.id} style={{ border: '1px solid var(--cream-deep)', background: 'var(--white)', padding: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
                  <span style={{ fontSize: '40px' }}>{pack.emoji}</span>
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', color: 'var(--black)', fontWeight: '400', marginBottom: '6px' }}>{pack.nombre}</h2>
                    <p style={{ fontSize: '13px', color: 'var(--black)', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>{pack.descripcion}</p>
                    {sinStock && (
                      <p style={{ fontSize: '12px', color: '#e74c3c', marginTop: '8px', fontFamily: 'Jost, sans-serif' }}>Sin stock disponible</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {SIZES.map(size => {
                    const precio = pack.precios[size]
                    const disponible = dispTotal >= size && !sinStock
                    return (
                      <button
                        key={size}
                        onClick={() => disponible && abrirModal(pack, size)}
                        disabled={!disponible}
                        style={{
                          border: disponible ? '1px solid var(--black)' : '1px solid #ddd',
                          background: 'transparent',
                          color: disponible ? 'var(--black)' : '#bbb',
                          padding: '20px 12px',
                          cursor: disponible ? 'pointer' : 'not-allowed',
                          fontFamily: 'Jost, sans-serif',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (disponible) { e.target.style.background = 'var(--black)'; e.target.style.color = 'var(--cream)' }}}
                        onMouseLeave={e => { if (disponible) { e.target.style.background = 'transparent'; e.target.style.color = 'var(--black)' }}}
                      >
                        <div style={{ fontSize: '18px', fontFamily: 'Playfair Display, serif', marginBottom: '4px' }}>×{size}</div>
                        <div style={{ fontSize: '12px', fontWeight: '300' }}>${precio.toLocaleString('es-AR')}</div>
                        <div style={{ fontSize: '10px', color: 'inherit', opacity: 0.6, marginTop: '2px' }}>${Math.round(precio / size).toLocaleString('es-AR')}/u</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Modal */}
      {modal && (
        <div
          onClick={cerrarModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--white)', maxWidth: '480px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
          >
            {/* Modal header */}
            <div style={{ background: 'var(--black)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0 }}>
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '4px' }}>
                  Pack ×{modal.size}
                </p>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--cream)', fontWeight: '400' }}>
                  {modal.pack.nombre}
                </h3>
              </div>
              <button onClick={cerrarModal} style={{ background: 'transparent', border: 'none', color: 'var(--cream)', fontSize: '20px', cursor: 'pointer', opacity: 0.6 }}>✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px 28px' }}>
              <p style={{ fontSize: '13px', color: '#999', fontFamily: 'Jost, sans-serif', marginBottom: '24px' }}>
                Elegí {modal.size} viandas en total. Podés repetir opciones.
              </p>

              {modal.pack.viandas.map(nombre => {
                const stockDisp = stock[nombre] ?? 0
                const cant = cantidades[nombre] || 0
                const sinStock = stockDisp === 0
                return (
                  <div key={nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--cream-deep)' }}>
                    <div>
                      <p style={{ fontSize: '14px', color: sinStock ? '#bbb' : 'var(--black)', fontFamily: 'Jost, sans-serif', marginBottom: '2px' }}>{nombre}</p>
                      <p style={{ fontSize: '11px', fontFamily: 'Jost, sans-serif', color: stockDisp <= 3 && !sinStock ? '#e74c3c' : '#999' }}>
                        {sinStock ? 'Sin stock' : stockDisp <= 3 ? `⚠ Solo ${stockDisp} disponibles` : `${stockDisp} disponibles`}
                      </p>
                    </div>
                    {!sinStock && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => cambiar(nombre, -1)} style={{ width: '32px', height: '32px', border: '1px solid var(--cream-deep)', background: 'transparent', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--black)' }}>−</button>
                        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', minWidth: '20px', textAlign: 'center' }}>{cant}</span>
                        <button onClick={() => cambiar(nombre, 1)} style={{ width: '32px', height: '32px', border: '1px solid var(--black)', background: totalSeleccionado >= modal.size ? '#eee' : 'var(--black)', cursor: totalSeleccionado >= modal.size ? 'not-allowed' : 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: totalSeleccionado >= modal.size ? '#bbb' : 'var(--cream)' }}>+</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '20px 28px', borderTop: '1px solid var(--cream-deep)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 0, background: 'var(--white)' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#999', fontFamily: 'Jost, sans-serif' }}>Elegidas: <strong style={{ color: 'var(--black)' }}>{totalSeleccionado}</strong> / {modal.size}</p>
                <p style={{ fontSize: '16px', fontFamily: 'Playfair Display, serif', color: 'var(--black)' }}>${modal.pack.precios[modal.size].toLocaleString('es-AR')}</p>
              </div>
              <button
                onClick={confirmarPack}
                disabled={totalSeleccionado !== modal.size}
                style={{
                  background: totalSeleccionado === modal.size ? 'var(--black)' : '#eee',
                  color: totalSeleccionado === modal.size ? 'var(--cream)' : '#bbb',
                  border: 'none',
                  padding: '14px 28px',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: 'Jost, sans-serif',
                  cursor: totalSeleccionado === modal.size ? 'pointer' : 'not-allowed',
                }}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}