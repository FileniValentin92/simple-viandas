'use client'

import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const platos = [
  { emoji: '🍖', nombre: 'Milanesa napolitana', descripcion: 'Con puré rústico de papa', categoria: 'carne', tiempo: '10 min', precio: '$8.900', puntos: '+45 pts' },
  { emoji: '🥩', nombre: 'Carne al verdeo', descripcion: 'Con papas al natural', categoria: 'carne', tiempo: '10 min', precio: '$9.200', puntos: '+46 pts' },
  { emoji: '🫕', nombre: 'Tuco de carne', descripcion: 'Bolognesa casera', categoria: 'carne', tiempo: '10 min', precio: '$8.200', puntos: '+41 pts' },
  { emoji: '🍗', nombre: 'Pollo al limón', descripcion: 'Con papas al olivo', categoria: 'pollo', tiempo: '10 min', precio: '$8.500', puntos: '+43 pts' },
  { emoji: '🍗', nombre: 'Pollo al verdeo', descripcion: 'Con arroz blanco', categoria: 'pollo', tiempo: '10 min', precio: '$8.300', puntos: '+42 pts' },
  { emoji: '🍗', nombre: 'Suprema a la maryland', descripcion: 'Con puré y banana', categoria: 'pollo', tiempo: '10 min', precio: '$8.600', puntos: '+43 pts' },
  { emoji: '🥦', nombre: 'Tarta de verdura', descripcion: 'Espinaca y ricota', categoria: 'vegetariano', tiempo: '10 min', precio: '$7.800', puntos: '+39 pts' },
  { emoji: '🍳', nombre: 'Tortilla de papas', descripcion: 'Con ensalada verde', categoria: 'vegetariano', tiempo: '10 min', precio: '$7.500', puntos: '+38 pts' },
  { emoji: '🫘', nombre: 'Guiso de lentejas', descripcion: 'Con verduras de estación', categoria: 'vegetariano', tiempo: '10 min', precio: '$7.900', puntos: '+40 pts' },
  { emoji: '🍝', nombre: 'Ñoquis con salsa rosa', descripcion: 'Salsa casera cremosa', categoria: 'pasta', tiempo: '10 min', precio: '$8.100', puntos: '+41 pts' },
  { emoji: '🍝', nombre: 'Fideos con tuco', descripcion: 'Salsa de tomate casera', categoria: 'pasta', tiempo: '10 min', precio: '$7.900', puntos: '+40 pts' },
  { emoji: '🍝', nombre: 'Lasagna de carne', descripcion: 'Con bechamel casera', categoria: 'pasta', tiempo: '10 min', precio: '$9.100', puntos: '+46 pts' },
  { emoji: '🐟', nombre: 'Merluza al vapor', descripcion: 'Con puré de calabaza', categoria: 'pescado', tiempo: '10 min', precio: '$9.500', puntos: '+48 pts' },
  { emoji: '🐟', nombre: 'Salmon con limón', descripcion: 'Con arroz yamaní', categoria: 'pescado', tiempo: '10 min', precio: '$10.200', puntos: '+51 pts' },
  { emoji: '🥘', nombre: 'Cazuela de mariscos', descripcion: 'Con papas y verduras', categoria: 'pescado', tiempo: '10 min', precio: '$10.500', puntos: '+53 pts' },
]

const filtros = [
  { id: 'todos', label: 'Todos' },
  { id: 'carne', label: 'Carne' },
  { id: 'pollo', label: 'Pollo' },
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'pescado', label: 'Pescado' },
]

export default function MenuPage() {
  const [filtroActivo, setFiltroActivo] = useState('todos')

  const platosFiltrados = filtroActivo === 'todos'
    ? platos
    : platos.filter(p => p.categoria === filtroActivo)

  return (
    <main>
      <Navbar />

      {/* Header */}
      <section style={{
        background: 'var(--black)',
        padding: '64px',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '5px',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          fontWeight: '300',
          marginBottom: '12px',
        }}>
          El menú completo
        </p>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '56px',
          color: 'var(--cream)',
          fontWeight: '400',
        }}>
          15 platos fijos,<br /><em>siempre disponibles.</em>
        </h1>
      </section>

      {/* Filtros */}
      <section style={{
        background: 'var(--cream)',
        padding: '32px 64px',
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid var(--cream-deep)',
      }}>
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltroActivo(f.id)}
            style={{
              background: filtroActivo === f.id ? 'var(--black)' : 'transparent',
              color: filtroActivo === f.id ? 'var(--cream)' : 'var(--black)',
              border: '1px solid var(--black)',
              padding: '10px 24px',
              fontSize: '9px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif',
              fontWeight: '300',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </section>

      {/* Grilla de platos */}
      <section style={{
        background: 'var(--white)',
        padding: '48px 64px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          {platosFiltrados.map((plato) => (
            <div key={plato.nombre} style={{
              border: '1px solid var(--cream-deep)',
              background: 'var(--white)',
              cursor: 'pointer',
              overflow: 'hidden',
            }}>
              <div style={{
                background: 'var(--cream)',
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '56px',
              }}>
                {plato.emoji}
              </div>

              <div style={{ padding: '20px' }}>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '18px',
                  color: 'var(--black)',
                  fontWeight: '400',
                  marginBottom: '4px',
                }}>
                  {plato.nombre}
                </h3>

                <p style={{
                  fontSize: '12px',
                  color: '#999',
                  fontWeight: '300',
                  marginBottom: '16px',
                }}>
                  {plato.descripcion}
                </p>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                }}>
                  {[`⏱ ${plato.tiempo}`, '❄️ Freezer', plato.puntos].map((tag) => (
                    <span key={tag} style={{
                      fontSize: '9px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: 'var(--olive-mid)',
                      background: 'var(--cream)',
                      padding: '4px 10px',
                      fontWeight: '300',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '22px',
                    color: 'var(--black)',
                  }}>
                    {plato.precio}
                  </span>
                  <button style={{
                    background: 'var(--black)',
                    color: 'var(--cream)',
                    border: 'none',
                    padding: '10px 20px',
                    fontSize: '9px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontFamily: 'Jost, sans-serif',
                    cursor: 'pointer',
                  }}>
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}