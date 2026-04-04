'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [pedidosCount, setPedidosCount] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) cargarPerfil(session.user.id)
      setCargando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) cargarPerfil(session.user.id)
      else { setPerfil(null); setPedidosCount(0) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const cargarPerfil = async (userId) => {
    const { data } = await supabase.from('perfiles').select('*').eq('id', userId).single()
    setPerfil(data)

    const { count } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    setPedidosCount(count || 0)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPerfil(null)
    setPedidosCount(0)
    try { localStorage.removeItem('carrito_simple') } catch (e) {}
  }

  return (
    <AuthContext.Provider value={{ user, perfil, pedidosCount, cargando, cerrarSesion, cargarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
