'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MasAhorras from '../components/MasAhorras'
import ComoFunciona from '../components/ComoFunciona'
import { useCart } from '../components/CartContext'

const platos = [
  { emoji: '🍖', nombre: 'Milanesa napolitana', descripcion: 'Con puré rústico de papa', categoria: 'carne', tiempo: '10 min', precio: '$8.900', precioNum: 8900, puntos: '+45 pts' },
  { emoji: '🥩', nombre: 'Carne al verdeo', descripcion: 'Con papas al natural', categoria: 'carne', tiempo: '10 min', precio: '$9.200', precioNum: 9200, puntos: '+46 pts' },
  { emoji: '🫕', nombre: 'Tuco de carne', descripcion: 'Bolognesa casera', categoria: 'carne', tiempo: '10 min', precio: '$8.200', precioNum: 8200, puntos: '+41 pts' },
  { emoji: '🍗', nombre: 'Pollo al limón', descripcion: 'Con papas al olivo', categoria: 'pollo', tiempo: '10 min', precio: '$8.500', precioNum: 8500, puntos: '+43 pts' },
  { emoji: '🍗', nombre: 'Pollo al verdeo', descripcion: 'Con arroz blanco', categoria: 'pollo', tiempo: '10 min', precio: '$8.300', precioNum: 8300, puntos: '+42 pts' },
  { emoji: '🍗', nombre: 'Suprema a la maryland', descripcion: 'Con puré y banana', categoria: 'pollo', tiempo: '10 min', precio: '$8.600', precioNum: 8600, puntos: '+43 pts' },
  { emoji: '🥦', nombre: 'Tarta de verdura', descripcion: 'Espinaca y ricota', categoria: 'vegetariano', tiempo: '10 min', precio: '$7.800', precioNum: 7800, puntos: '+39 pts' },
  { emoji: '🍳', nombre: 'Tortilla de papas', descripcion: 'Con ensalada verde', categoria: 'vegetariano', tiempo: '10 min', precio: '$7.500', precioNum: 7500, puntos: '+38 pts' },
  { emoji: '🫘', nombre: 'Guiso de lentejas', descripcion: 'Con verduras de estación', categoria: 'vegetariano', tiempo: '10 min', precio: '$7.900', precioNum: 7900, puntos: '+40 pts' },
  { emoji: '🍝', nombre: 'Ñoquis con salsa rosa', descripcion: 'Salsa casera cremosa', categoria: 'pasta', tiempo: '10 min', precio: '$8.100', precioNum: 8100, puntos: '+41 pts' },
  { emoji: '🍝', nombre: 'Fideos con tuco', descripcion: 'Salsa de tomate casera', categoria: 'pasta', tiempo: '10 min', precio: '$7.900', precioNum: 7900, puntos: '+40 pts' },
  { emoji: '🍝', nombre: 'Lasagna de carne', descripcion: 'Con bechamel casera', categoria: 'pasta', tiempo: '10 min', precio: '$9.100', precioNum: 9100, puntos: '+46 pts' },
  { emoji: '🐟', nombre: 'Merluza al vapor', descripcion: 'Con puré de calabaza', categoria: 'pescado', tiempo: '10 min', precio: '$9.500', precioNum: 9500, puntos: '+48 pts' },
  { emoji: '🐟', nombre: 'Salmon con limón', descripcion: 'Con arroz yamaní', categoria: 'pescado', tiempo: '10 min', precio: '$10.200', precioNum: 10200, puntos: '+51 pts' },
  { emoji: '🥘', nombre: 'Cazuela de mariscos', descripcion: 'Con papas y verduras', categoria: 'pescado', tiempo: '10 min', precio: '$10.500', precioNum: 10500, puntos: '+53 pts' },
]

const filtros = [
  { id: 'todos', label: 'Todos' },
  { id: 'carne', label: 'Carne' },
  { id: 'pollo', label: 'Pollo' },
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'pescado', label: 'Pescado' },
]

function nombreASlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function SelectorCantidad({ plato }) {
  const [cantidad, setCantidad] = useState(1)
  const { agregarItem, items } = useCart()

  const enCarrito = items.find(i => i.nombre === plato.nombre)?.cantidad || 0

  const restar = () => setCantidad(c => Math.max(1, c - 1))
  const sumar = () => setCantidad(c => c + 1)

  const handleAgregar = () => {
    agregarItem(plato, cantidad)
    setCantidad(1)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(247,243,236,0.2)', overflow: 'hidden' }}>
          <button onClick={restar} style={{ width: '32px', height: '36px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
          <span style={{ width: '28px', textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: '15px', color: 'var(--cream)' }}>{cantidad}</span>
          <button onClick={sumar} style={{ width: '32px', height: '36px', background: 'rgba(247,243,236,0.15)', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
        <button onClick={handleAgregar} style={{ flex: 1, background: 'var(--gold)', color: 'var(--black)', border: 'none', padding: '10px 12px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' }}>
          Agregar
        </button>
      </div>
      {enCarrito > 0 && (
        <p style={{ marginTop: '8px', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300' }}>
          ✓ {enCarrito} en tu carrito
        </p>
      )}
    </div>
  )
}

export default function MenuPage() {
  const [filtroActivo, setFiltroActivo] = useState('todos')
  const platosFiltrados = filtroActivo === 'todos' ? platos : platos.filter(p => p.categoria === filtroActivo)

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="menu-header">
        <p>El menú completo</p>
        <h1>15 platos fijos,<br /><em>siempre disponibles.</em></h1>
      </section>

      {/* Más ahorrás */}
      <MasAhorras />

      {/* Filtros */}
      <section className="menu-filtros">
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltroActivo(f.id)}
            style={{
              background: filtroActivo === f.id ? 'var(--cream)' : 'transparent',
              color: filtroActivo === f.id ? 'var(--black)' : 'rgba(247,243,236,0.6)',
              border: `1px solid ${filtroActivo === f.id ? 'var(--cream)' : 'rgba(247,243,236,0.2)'}`,
              padding: '10px 20px',
              fontSize: '9px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif',
              fontWeight: '300',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </section>

      {/* Grilla */}
      <section className="menu-grilla">
        <div className="menu-grid">
          {platosFiltrados.map((plato) => {
            const slug = nombreASlug(plato.nombre)
            return (
              <div key={plato.nombre} style={{ background: '#1A1A17', border: '1px solid rgba(247,243,236,0.07)', overflow: 'hidden' }}>
                <Link href={`/menu/${slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#141411', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', position: 'relative', cursor: 'pointer' }}>
                    {plato.emoji}
                    <div style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.7, fontFamily: 'Jost, sans-serif' }}>Ver detalle →</div>
                  </div>
                </Link>
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
                    {plato.categoria}
                  </div>
                  <Link href={`/menu/${slug}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: 'var(--cream)', fontWeight: '400', marginBottom: '4px', cursor: 'pointer' }}>{plato.nombre}</h3>
                  </Link>
                  <p style={{ fontSize: '12px', color: 'rgba(247,243,236,0.4)', fontWeight: '300', marginBottom: '16px' }}>{plato.descripcion}</p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {[`⏱ ${plato.tiempo}`, '❄️ Freezer', plato.puntos].map((tag) => (
                      <span key={tag} style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(247,243,236,0.4)', background: 'rgba(247,243,236,0.06)', padding: '4px 10px', fontWeight: '300' }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: 'var(--cream)' }}>{plato.precio}</span>
                  </div>
                  <SelectorCantidad plato={plato} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Cómo funciona */}
      <ComoFunciona />

      <Footer />
    </main>
  )
}
