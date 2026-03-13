'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [sesionLista, setSesionLista] = useState(false)

  useEffect(() => {
    // Supabase maneja el token de la URL automáticamente via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSesionLista(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleGuardar = async () => {
    if (!password) { setError('Ingresá una nueva contraseña'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return }

    setCargando(true)
    const { error } = await supabase.auth.updateUser({ password })
    setCargando(false)

    if (error) { setError('Error al actualizar la contraseña. Intentá de nuevo.'); return }

    setExito(true)
    setTimeout(() => router.push('/perfil'), 2000)
  }

  const inputStyle = {
    display: 'block', width: '100%', background: '#fff',
    border: '1px solid #E0E0E0', color: 'var(--black)',
    padding: '14px 16px', fontSize: '14px',
    fontFamily: 'Jost, sans-serif', fontWeight: '300',
    outline: 'none', marginBottom: '12px', boxSizing: 'border-box',
  }

  return (
    <main>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Jost, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--cream)', fontWeight: '400', marginBottom: '8px' }}>
            Nueva contraseña
          </h1>
          <p style={{ fontSize: '12px', color: 'rgba(247,243,236,0.4)', marginBottom: '32px', fontWeight: '300' }}>
            Ingresá y confirmá tu nueva contraseña
          </p>

          {exito ? (
            <p style={{ color: '#2ecc71', fontSize: '14px', fontWeight: '300' }}>
              ✓ Contraseña actualizada. Redirigiendo...
            </p>
          ) : (
            <>
              <input
                type="password"
                placeholder="Nueva contraseña * (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Confirmá la nueva contraseña *"
                value={confirmar}
                onChange={(e) => { setConfirmar(e.target.value); setError('') }}
                style={{ ...inputStyle, marginBottom: '24px' }}
              />

              {error && <p style={{ color: '#e74c3c', fontSize: '12px', marginBottom: '16px', fontWeight: '300' }}>⚠ {error}</p>}

              <button
                onClick={handleGuardar}
                disabled={cargando}
                style={{
                  width: '100%', background: cargando ? '#ccc' : 'var(--cream)',
                  color: 'var(--black)', border: 'none', padding: '16px',
                  fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
                  fontFamily: 'Jost, sans-serif', fontWeight: '400',
                  cursor: cargando ? 'not-allowed' : 'pointer', marginBottom: '24px',
                }}
              >
                {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>

              <p style={{ textAlign: 'center' }}>
                <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Jost, sans-serif' }}>
                  ← Volver a iniciar sesión
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    </main>
  )
}