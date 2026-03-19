'use client'
import { useState } from 'react'
import Link from 'next/link'

const SIZES = [
  { cant: '×5',  precio: '$39.000' },
  { cant: '×10', precio: '$74.000' },
  { cant: '×15', precio: '$105.000' },
  { cant: '×20', precio: '$134.000' },
]

function PackBox({ cant, precio }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid rgba(247,243,236,0.2)',
        padding: '24px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        background: hovered ? 'var(--cream)' : 'transparent',
        transition: 'all 0.25s ease',
        flex: '1',
        minWidth: '100px',
      }}
    >
      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: hovered ? 'var(--black)' : 'var(--cream)', marginBottom: '6px', transition: 'color 0.25s ease' }}>
        {cant}
      </p>
      <p style={{ fontSize: '10px', color: hovered ? 'var(--black)' : 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', opacity: hovered ? 0.7 : 1, transition: 'all 0.25s ease' }}>
        desde {precio}
      </p>
    </div>
  )
}

export default function ArmaTuPack() {
  return (
    <section style={{ background: 'var(--black)', padding: '72px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(247,243,236,0.35)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '12px' }}>
        ¿Querés elegir lo que llevás?
      </p>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--cream)', fontWeight: '400', marginBottom: '12px' }}>
        Armá tu pack
      </h2>
      <p style={{ fontSize: '14px', color: 'rgba(247,243,236,0.5)', fontFamily: 'Jost, sans-serif', fontWeight: '300', lineHeight: '1.7', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px' }}>
        Tartas, lasagna o pastel de papa. Combiná las opciones que quieras dentro de cada categoría.
      </p>
      <div className="pack-boxes">
        {SIZES.map(s => <PackBox key={s.cant} {...s} />)}
      </div>
      <Link href="/packs" style={{ background: 'var(--cream)', color: 'var(--black)', padding: '16px 40px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '400', textDecoration: 'none', display: 'inline-block' }}>
        Ver packs →
      </Link>
    </section>
  )
}