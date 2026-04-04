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
    const precio = typeof i.precioNum === 'number' ? i.precioNum : parseInt(i.precio.replace(/\$|\./g, '').replace(',', ''))
    return acc + precio * i.cantidad
  }, 0)

  // 10 puntos por cada vianda (suelta o dentro de pack)
  const totalPuntos = totalItems * 10

  const calcularDescuentos = (metodoPago) => {
    const viandasSueltas = items.filter(i => !i.nombre.includes('(pack'))
    const packs = items.filter(i => i.nombre.includes('(pack'))

    const cantViandasSueltas = viandasSueltas.reduce((acc, i) => acc + i.cantidad, 0)
    const subtotalViandas = viandasSueltas.reduce((acc, i) => {
      const precio = typeof i.precioNum === 'number' ? i.precioNum : parseInt(i.precio.replace(/\$|\./g, '').replace(',', ''))
      return acc + precio * i.cantidad
    }, 0)
    const subtotalPacks = packs.reduce((acc, i) => {
      const precio = typeof i.precioNum === 'number' ? i.precioNum : parseInt(i.precio.replace(/\$|\./g, '').replace(',', ''))
      return acc + precio * i.cantidad
    }, 0)

    let porcentajeViandas = 0
    if (cantViandasSueltas >= 20) porcentajeViandas = 15
    else if (cantViandasSueltas >= 15) porcentajeViandas = 12
    else if (cantViandasSueltas >= 10) porcentajeViandas = 10
    else if (cantViandasSueltas >= 5) porcentajeViandas = 5

    const porcentajePacks = packs.length > 0 ? 5 : 0

    const esEfectivo = metodoPago === 'efectivo'

    const descuentoViandas = esEfectivo ? Math.round(subtotalViandas * porcentajeViandas / 100) : 0
    const descuentoPacks = esEfectivo ? Math.round(subtotalPacks * porcentajePacks / 100) : 0

    const totalSinDescuento = subtotalViandas + subtotalPacks
    const totalConDescuento = totalSinDescuento - descuentoViandas - descuentoPacks

    return {
      descuentoViandas,
      descuentoPacks,
      porcentajeViandas,
      porcentajePacks,
      subtotalViandas,
      subtotalPacks,
      cantViandasSueltas,
      totalConDescuento,
      totalSinDescuento,
    }
  }

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
      calcularDescuentos,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
