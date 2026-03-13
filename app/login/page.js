'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../components/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function LoginPage() {
  const router = useRouter()
  const { cargarPerfil } = useAuth()
  const [modo, setModo] = useState('login') // 'login' | 'registro' | 'reset'
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Completá email y contraseña'); return }
    setCargando(true)
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    setCargando(false)
    if (error) { setError('Email o contraseña incorrectos'); return }
    router.push('/perfil')
  }

  const handleRegistro = async () => {
    if (!form.nombre || !form.email || !form.password || !form.telefono) {
      setError('Completá todos los campos obligatorios')
      return
    }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setCargando(true)

    // Verificar si el email ya está registrado
    const { data: existe } = await supabase
      .from('perfiles')
      .select('id')
      .eq('email', form.email)
      .single()

    if (existe) {
      setError('Este email ya está registrado. ¿Querés iniciar sesión?')
      setCargando(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (error) {
      if (error.message?.includes('already registered')) {
        setError('Este email ya está registrado. ¿Querés iniciar sesión?')
      } else {
        setError('Error al crear la cuenta: ' + error.message)
      }
      setCargando(false)
      return
    }

    await supabase.from('perfiles').insert([{
      id: data.user.id,
      email: form.email,
      nombre: form.nombre,
      telefono: form.telefono,
      puntos: 0,
    }])

    await cargarPerfil(data.user.id)
    setCargando(false)
    setExito('¡Cuenta creada! Redirigiendo...')
    setTimeout(() => router.push('/perfil'), 1500)
  }

  const handleReset = async () => {
    if (!form.email) { setError('Ingresá tu email para restablecer la contraseña'); return }
    setCargando(true)
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setCargando(false)
    if (error) { setError('Error al enviar el email. Verificá que el email sea correcto.'); return }
    setExito('Te enviamos un email con el link para restablecer tu contraseña.')
  }

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setError('')
    setExito('')
    setForm({ nombre: '', email: '', password: '', telefono: '' })
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

          {/* Tabs — solo para login y registro */}
          {modo !== 'reset' && (
            <div style={{ display: 'flex', marginBottom: '40px', borderBottom: '1px solid rgba(247,243,236,0.15)' }}>
              {[{ id: 'login', label: 'Iniciar sesión' }, { id: 'registro', label: 'Crear cuenta' }].map(tab => (
                <button key={tab.id} onClick={() => cambiarModo(tab.id)} style={{
                  flex: 1, background: 'transparent', border: 'none',
                  borderBottom: modo === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
                  color: modo === tab.id ? 'var(--gold)' : 'rgba(247,243,236,0.4)',
                  padding: '12px', fontSize: '11px', letterSpacing: '3px',
                  textTransform: 'uppercase', fontFamily: 'Jost, sans-serif',
                  cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px',
                }}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Título */}
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--cream)', fontWeight: '400', marginBottom: '32px' }}>
            {modo === 'login' && 'Bienvenido de nuevo'}
            {modo === 'registro' && 'Creá tu cuenta'}
            {modo === 'reset' && 'Restablecer contraseña'}
          </h1>

          {/* Campos según modo */}
          {modo === 'registro' && (
            <input type="text" name="nombre" placeholder="Nombre completo *" value={form.nombre} onChange={handleChange} style={inputStyle} />
          )}

          <input type="email" name="email" placeholder="Email *" value={form.email} onChange={handleChange} style={inputStyle} />

          {modo !== 'reset' && (
            <input type="password" name="password" placeholder={modo === 'registro' ? 'Contraseña * (mínimo 6 caracteres)' : 'Contraseña *'} value={form.password} onChange={handleChange} style={inputStyle} />
          )}

          {modo === 'registro' && (
            <input type="tel" name="telefono" placeholder="Teléfono / WhatsApp *" value={form.telefono} onChange={handleChange} style={{ ...inputStyle, marginBottom: '24px' }} />
          )}

          {/* Olvidé mi contraseña — solo en login */}
          {modo === 'login' && (
            <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '20px' }}>
              <button onClick={() => cambiarModo('reset')} style={{ background: 'none', border: 'none', color: 'rgba(247,243,236,0.4)', cursor: 'pointer', fontSize: '11px', fontFamily: 'Jost, sans-serif', fontWeight: '300' }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {error && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: '#e74c3c', fontSize: '12px', fontWeight: '300', marginBottom: '4px' }}>⚠ {error}</p>
              {/* Si el error es de email ya registrado, mostrar botón para ir a login */}
              {error.includes('ya está registrado') && (
                <button onClick={() => cambiarModo('login')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Jost, sans-serif', textDecoration: 'underline', padding: 0 }}>
                  Ir a iniciar sesión →
                </button>
              )}
            </div>
          )}

          {exito && <p style={{ color: '#2ecc71', fontSize: '12px', marginBottom: '16px', fontWeight: '300' }}>✓ {exito}</p>}

          <button
            onClick={modo === 'login' ? handleLogin : modo === 'registro' ? handleRegistro : handleReset}
            disabled={cargando}
            style={{
              width: '100%', background: cargando ? '#ccc' : 'var(--cream)',
              color: 'var(--black)', border: 'none', padding: '16px',
              fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif', fontWeight: '400',
              cursor: cargando ? 'not-allowed' : 'pointer', marginBottom: '24px',
            }}
          >
            {cargando ? 'Procesando...' : modo === 'login' ? 'Iniciar sesión' : modo === 'registro' ? 'Crear cuenta' : 'Enviar link de restablecimiento'}
          </button>

          {/* Footer links */}
          <p style={{ fontSize: '12px', color: 'rgba(247,243,236,0.4)', textAlign: 'center', fontWeight: '300' }}>
            {modo === 'reset' ? (
              <button onClick={() => cambiarModo('login')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Jost, sans-serif' }}>
                ← Volver a iniciar sesión
              </button>
            ) : (
              <>
                {modo === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
                <button onClick={() => cambiarModo(modo === 'login' ? 'registro' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Jost, sans-serif' }}>
                  {modo === 'login' ? 'Registrate acá' : 'Iniciá sesión'}
                </button>
              </>
            )}
          </p>

        </div>
      </div>
    </main>
  )
}