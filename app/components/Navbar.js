'use client'

import Link from 'next/link'
import { useCart } from './CartContext'

export default function Navbar() {
  const { totalItems, setAbierto } = useCart()

  return (
    <nav style={{
      background: 'var(--black)',
      padding: '0 64px',
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '22px',
          color: 'var(--cream)',
          fontWeight: '400',
          letterSpacing: '4px',
        }}>
          SIMPLE
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        <Link href="/menu" style={{
          fontSize: '9px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--cream)',
          textDecoration: 'none',
          fontWeight: '300',
          opacity: 0.7,
        }}>
          Menú
        </Link>
        <Link href="/#packs" style={{
          fontSize: '9px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--cream)',
          textDecoration: 'none',
          fontWeight: '300',
          opacity: 0.7,
        }}>
          Packs
        </Link>
        <Link href="/perfil" style={{
          fontSize: '9px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--cream)',
          textDecoration: 'none',
          fontWeight: '300',
          opacity: 0.7,
        }}>
          Mi Perfil
        </Link>

        {/* Carrito */}
        <button
          onClick={() => setAbierto(true)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(247,243,236,0.3)',
            color: 'var(--cream)',
            padding: '10px 20px',
            fontSize: '9px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: 'Jost, sans-serif',
            fontWeight: '300',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
          }}
        >
          <span>🛒</span>
          <span>Carrito</span>
          {totalItems > 0 && (
            <span style={{
              background: 'var(--gold)',
              color: 'var(--black)',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '500',
            }}>
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}