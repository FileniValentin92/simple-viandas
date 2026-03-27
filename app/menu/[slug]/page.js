'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useCart } from '../../components/CartContext'
import { platos, nombreASlug } from '../../data/platos'

export default function DetallePlato() {
  const params = useParams()
  const { agregarItem, items } = useCart()
  const [cantidad, setCantidad] = useState(1)

  const plato = platos.find(p => nombreASlug(p.nombre) === params.slug)
  const enCarrito = items.find(i => i.nombre === plato?.nombre)?.cantidad || 0

  if (!plato) {
    return (
      <main>
        <Navbar />
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px' }}>Plato no encontrado</p>
          <Link href="/menu" style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--black)' }}>← Volver al menú</Link>
        </div>
        <Footer />
      </main>
    )
  }

  const handleAgregar = () => {
    agregarItem(plato, cantidad)
    setCantidad(1)
  }

  return (
    <main>
      <Navbar />

      <div style={{ background: 'var(--cream)', padding: '16px 24px', borderBottom: '1px solid var(--cream-deep)' }}>
        <Link href="/menu" style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--black)', textDecoration: 'none', opacity: 0.5, fontWeight: '300' }}>
          ← Volver al menú
        </Link>
      </div>

      <section className="detalle-content">

        {/* Imagen */}
        <div className="detalle-imagen" style={{
          background: 'var(--cream)',
          aspectRatio: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '140px',
          position: 'relative',
        }}>
          {plato.emoji}
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            background: 'var(--black)',
            color: 'var(--cream)',
            padding: '6px 16px',
            fontSize: '8px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'Jost, sans-serif',
            fontWeight: '300',
          }}>
            {plato.categoria}
          </div>
        </div>

        {/* Info */}
        <div style={{ paddingTop: '8px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '300', marginBottom: '12px' }}>
            {plato.descripcion}
          </p>

          <h1 className="detalle-titulo" style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '48px',
            color: 'var(--black)',
            fontWeight: '400',
            lineHeight: '1.1',
            marginBottom: '24px',
          }}>
            {plato.nombre}
          </h1>

          <p style={{ fontSize: '14px', color: '#666', fontWeight: '300', lineHeight: '1.8', marginBottom: '32px' }}>
            {plato.descripcionLarga}
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {[`⏱ ${plato.tiempo}`, '❄️ Freezer hasta 3 meses', '🔥 Listo en microondas', plato.puntos].map(tag => (
              <span key={tag} style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--olive-mid)', background: 'var(--cream)', padding: '6px 14px', fontWeight: '300' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Info nutricional */}
          <div className="detalle-nutri" style={{ borderTop: '1px solid var(--cream-deep)', borderBottom: '1px solid var(--cream-deep)', padding: '24px 0', marginBottom: '40px' }}>
            {[
              { label: 'Calorías', valor: plato.kcal, unidad: 'kcal' },
              { label: 'Proteínas', valor: plato.proteinas, unidad: '' },
              { label: 'Carbos', valor: plato.carbos, unidad: '' },
              { label: 'Grasas', valor: plato.grasas, unidad: '' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: 'var(--black)', fontWeight: '400', marginBottom: '4px' }}>
                  {item.valor}<span style={{ fontSize: '12px' }}>{item.unidad}</span>
                </p>
                <p style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', fontWeight: '300' }}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* Precio */}
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '40px', color: 'var(--black)', display: 'block', marginBottom: '24px' }}>
            {plato.precio}
          </span>

          {/* Selector cantidad + botón */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            {/* Controles */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--cream-deep)', overflow: 'hidden' }}>
              <button
                onClick={() => setCantidad(c => Math.max(1, c - 1))}
                style={{ width: '40px', height: '44px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >−</button>
              <span style={{ width: '36px', textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: '18px', color: 'var(--black)' }}>
                {cantidad}
              </span>
              <button
                onClick={() => setCantidad(c => c + 1)}
                style={{ width: '40px', height: '44px', background: 'var(--black)', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >+</button>
            </div>

            {/* Botón agregar */}
            <button
              onClick={handleAgregar}
              style={{
                flex: 1,
                background: 'var(--black)',
                color: 'var(--cream)',
                border: 'none',
                padding: '14px 24px',
                fontSize: '10px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontFamily: 'Jost, sans-serif',
                fontWeight: '300',
                cursor: 'pointer',
              }}
            >
              Agregar al carrito
            </button>
          </div>

          {enCarrito > 0 && (
            <p style={{ fontSize: '9px', color: 'var(--olive)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '300' }}>
              ✓ {enCarrito} {enCarrito === 1 ? 'unidad' : 'unidades'} en tu carrito
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}