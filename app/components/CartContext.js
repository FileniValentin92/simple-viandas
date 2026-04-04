'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [abierto, setAbierto] = useState(false)
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    try {
      const guardado = localStorage.getItem('carrito_simple')
      if (guardado) setItems(JSON.parse(guardado))
    } catch (e) {}
    setCargado(true)
  }, [])

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

  // Quitar TODOS los items de canje del carrito
  const quitarCanje = () => {
    setItems(prev => prev.filter(i => !i.esCanje))
  }

  const vaciarCarrito = () => {
    setItems([])
    try { localStorage.removeItem('carrito_simple') } catch (e) {}
  }

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  // Para canje items: solo sumar la diferencia (lo que el usuario paga)
  const totalPrecio = items.reduce((acc, i) => {
    const precio = typeof i.precioNum === 'number' ? i.precioNum : parseInt(i.precio.replace(/\$|\./g, '').replace(',', ''))
    if (i.esCanje) {
      const diff = Math.max(0, precio - (i.canjeValor || 0))
      return acc + diff * i.cantidad
    }
    return acc + precio * i.cantidad
  }, 0)

  // Subtotal sin descuento de canje (para mostrar en resumen)
  const subtotalBruto = items.reduce((acc, i) => {
    const precio = typeof i.precioNum === 'number' ? i.precioNum : parseInt(i.precio.replace(/\$|\./g, '').replace(',', ''))
    return acc + precio * i.cantidad
  }, 0)

  // Total del descuento por canje
  const totalDescuentoCanje = items.reduce((acc, i) => {
    if (!i.esCanje) return acc
    const precio = typeof i.precioNum === 'number' ? i.precioNum : parseInt(i.precio.replace(/\$|\./g, '').replace(',', ''))
    return acc + Math.min(precio, i.canjeValor || 0) * i.cantidad
  }, 0)

  // Canje items no ganan puntos
  const totalPuntos = items.filter(i => !i.esCanje).reduce((acc, i) => acc + i.cantidad, 0) * 10

  // Info de canje activo
  const canjeItems = items.filter(i => i.esCanje)
  const canjeActivo = canjeItems.length > 0
  const puntosEnCanje = canjeItems.reduce((acc, i) => acc + (i.puntosUsados || 0) * i.cantidad, 0)

  const calcularDescuentos = (metodoPago) => {
    // Excluir canje items del cálculo de descuentos
    const viandasSueltas = items.filter(i => !i.nombre.includes('(pack') && !i.esCanje)
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
      descuentoViandas, descuentoPacks, porcentajeViandas, porcentajePacks,
      subtotalViandas, subtotalPacks, cantViandasSueltas, totalConDescuento, totalSinDescuento,
    }
  }

  return (
    <CartContext.Provider value={{
      items, setItems, abierto, setAbierto,
      agregarItem, quitarItem, eliminarItem, quitarCanje, vaciarCarrito,
      totalItems, totalPrecio, subtotalBruto, totalDescuentoCanje,
      totalPuntos, calcularDescuentos,
      canjeItems, canjeActivo, puntosEnCanje,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
