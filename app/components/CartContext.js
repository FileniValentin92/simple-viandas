'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [abierto, setAbierto] = useState(false)
  const [cargado, setCargado] = useState(false)

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    try {
      const guardado = localStorage.getItem('carrito_simple')
      if (guardado) setItems(JSON.parse(guardado))
    } catch (e) {}
    setCargado(true)
  }, [])

  // Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    if (!cargado) return
    try {
      localStorage.setItem('carrito_simple', JSON.stringify(items))
    } catch (e) {}
  }, [items, cargado])

  const agregarItem = (plato, cantidad = 1) => {
    setItems(prev => {
      const existente = prev.find(i => i.nombre === plato.nombre)
      if (existente) {
        return prev.map(i =>
          i.nombre === plato.nombre ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      }
      return [...prev, { ...plato, cantidad }]
    })
  }

  const quitarItem = (nombre) => {
    setItems(prev => {
      const existente = prev.find(i => i.nombre === nombre)
      if (existente?.cantidad === 1) return prev.filter(i => i.nombre !== nombre)
      return prev.map(i => i.nombre === nombre ? { ...i, cantidad: i.cantidad - 1 } : i)
    })
  }

  const eliminarItem = (nombre) => {
    setItems(prev => prev.filter(i => i.nombre !== nombre))
  }

  const vaciarCarrito = () => {
    setItems([])
    try { localStorage.removeItem('carrito_simple') } catch (e) {}
  }

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  const totalPrecio = items.reduce((acc, i) => {
    const precio = parseInt(i.precio.replace(/\$|\./g, '').replace(',', ''))
    return acc + precio * i.cantidad
  }, 0)

  const totalPuntos = items.reduce((acc, i) => {
    const pts = parseInt(i.puntos.replace('+', '').replace(' pts', ''))
    return acc + pts * i.cantidad
  }, 0)

  return (
    <CartContext.Provider value={{
      items,
      setItems,
      abierto,
      setAbierto,
      agregarItem,
      quitarItem,
      eliminarItem,
      vaciarCarrito,
      totalItems,
      totalPrecio,
      totalPuntos,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}