'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { totalItems, setAbierto } = useCart()
  const { user, perfil, cerrarSesion } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const router = useRouter()

  const handleCerrarSesion = async () => {
    await cerrarSesion()
    setMenuAbierto(false)
    router.push('/')
  }

  const nombreUsuario = perfil?.nombre?.split(' ')[0] || user?.email?.split('@')[0] || null

  return (
    <>
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
      }} className="navbar">

        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: 'var(--cream)', fontWeight: '400', letterSpacing: '4px' }}>
            SIMPLE
          </span>
        </Link>

        <div className="navbar-links" style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <Link href="/menu" style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream)', textDecoration: 'none', fontWeight: '300', opacity: 0.7 }}>
            Menú
          </Link>
          <Link href="/packs" style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream)', textDecoration: 'none', fontWeight: '300', opacity: 0.7 }}>
            Packs
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/perfil" style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', fontWeight: '400', border: '1px solid rgba(184,154,94,0.4)', padding: '7px 14px' }}>
                ✦ {nombreUsuario}
              </Link>
              <button onClick={handleCerrarSesion} style={{ background: 'transparent', border: '1px solid rgba(247,243,236,0.2)', color: 'rgba(247,243,236,0.5)', padding: '7px 14px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: 'pointer' }}>
                Salir
              </button>
            </div>
          ) : (
            <Link href="/login" style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', fontWeight: '400', border: '1px solid rgba(184,154,94,0.4)', padding: '7px 14px' }}>
              Mi Perfil
            </Link>
          )}

          <button onClick={() => setAbierto(true)} style={{ background: 'transparent', border: '1px solid rgba(247,243,236,0.3)', color: 'var(--cream)', padding: '10px 20px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '300', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🛒</span>
            <span>Carrito</span>
            {totalItems > 0 && (
              <span style={{ background: 'var(--gold)', color: 'var(--black)', width: '20px', height: '20px', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500' }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>

        <div className="navbar-mobile-actions" style={{ display: 'none', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setAbierto(true)} style={{ background: 'transparent', border: '1px solid rgba(247,243,236,0.3)', color: 'var(--cream)', padding: '8px 14px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: '300', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛒</span>
            {totalItems > 0 && (
              <span style={{ background: 'var(--gold)', color: 'var(--black)', width: '18px', height: '18px', borderRadius: '50%', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500' }}>
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px' }}>
            <span style={{ display: 'block', width: '22px', height: '1px', background: 'var(--cream)', transition: 'all 0.2s', transform: menuAbierto ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span style={{ display: 'block', width: '22px', height: '1px', background: 'var(--cream)', transition: 'all 0.2s', opacity: menuAbierto ? 0 : 1 }} />
            <span style={{ display: 'block', width: '22px', height: '1px', background: 'var(--cream)', transition: 'all 0.2s', transform: menuAbierto ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {menuAbierto && (
        <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, background: 'var(--black)', zIndex: 99, padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: '0', borderTop: '1px solid rgba(247,243,236,0.1)' }}>
          <Link href="/menu" onClick={() => setMenuAbierto(false)} style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream)', textDecoration: 'none', fontWeight: '300', opacity: 0.7, padding: '16px 0', borderBottom: '1px solid rgba(247,243,236,0.08)' }}>
            Menú
          </Link>
          <Link href="/packs" onClick={() => setMenuAbierto(false)} style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream)', textDecoration: 'none', fontWeight: '300', opacity: 0.7, padding: '16px 0', borderBottom: '1px solid rgba(247,243,236,0.08)' }}>
            Packs
          </Link>
          {user ? (
            <>
              <Link href="/perfil" onClick={() => setMenuAbierto(false)} style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', fontWeight: '400', padding: '16px 0', borderBottom: '1px solid rgba(247,243,236,0.08)' }}>
                ✦ {nombreUsuario}
              </Link>
              <button onClick={handleCerrarSesion} style={{ background: 'transparent', border: 'none', color: 'rgba(247,243,236,0.4)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', padding: '16px 0', textAlign: 'left', cursor: 'pointer' }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuAbierto(false)} style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', fontWeight: '400', padding: '16px 0' }}>
              Mi Perfil ✦
            </Link>
          )}
        </div>
      )}
    </>
  )
}