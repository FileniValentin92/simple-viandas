'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

export default function PagoExitosoPage() {
  const searchParams = useSearchParams()
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    const guardarPedido = async () => {
      const paymentId = searchParams.get('payment_id')
      const status = searchParams.get('status')

      if (status !== 'approved' || !paymentId) return
      if (guardado) return

      // Recuperar datos del pedido guardados en sessionStorage
      const datosStr = sessionStorage.getItem('pedido_pendiente')
      if (!datosStr) return

      const datos = JSON.parse(datosStr)

      await supabase.from('pedidos').insert([{
        nombre: datos.nombre,
        telefono: datos.telefono,
        direccion: datos.direccion,
        piso: datos.piso,
        comentarios: datos.comentarios,
        items: datos.items,
        total: datos.total,
        puntos: datos.puntos,
        estado: 'pendiente',
        pago_metodo: 'mercadopago',
        pago_estado: 'pagado',
        mp_payment_id: paymentId,
      }])

      sessionStorage.removeItem('pedido_pendiente')
      setGuardado(true)
    }

    guardarPedido()
  }, [searchParams])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--black)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Jost, sans-serif', padding: '40px 20px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <p style={{ fontSize: '64px', marginBottom: '24px' }}>✓</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--cream)', fontWeight: '400', marginBottom: '16px' }}>
          ¡Pago confirmado!
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--cream-mid)', fontWeight: '300', lineHeight: '1.7', marginBottom: '8px' }}>
          Tu pago fue procesado correctamente.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '300', marginBottom: '40px' }}>
          Nos comunicaremos a la brevedad para coordinar la entrega.
        </p>
        <Link href="/menu" style={{
          display: 'inline-block', background: 'var(--cream)', color: 'var(--black)',
          padding: '14px 32px', fontSize: '9px', letterSpacing: '3px',
          textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', textDecoration: 'none',
        }}>
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}