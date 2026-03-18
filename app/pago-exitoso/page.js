'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

function PagoExitosoContent() {
  const searchParams = useSearchParams()
  const procesando = useRef(false)

  useEffect(() => {
    const actualizarPedido = async () => {
      if (procesando.current) return
      procesando.current = true

      const paymentId = searchParams.get('payment_id')
      const status = searchParams.get('status')

      if (status !== 'approved' || !paymentId) return

      // Buscar el pedido MP más reciente que esté pendiente de pago
      // (el que se creó justo antes de redirigir a MP)
      const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select('id, puntos, user_id, nombre, telefono, direccion, items, total')
        .eq('pago_metodo', 'mercadopago')
        .eq('pago_estado', 'pendiente')
        .is('mp_payment_id', null)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error || !pedidos?.length) {
        console.error('No se encontró el pedido:', error)
        return
      }

      const pedido = pedidos[0]

      // 1. Actualizar el pedido con el payment_id y marcar como pagado
      await supabase
        .from('pedidos')
        .update({ pago_estado: 'pagado', mp_payment_id: paymentId })
        .eq('id', pedido.id)

      // 2. Sumar puntos al perfil si hay usuario
      if (pedido.user_id && pedido.puntos > 0) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('puntos')
          .eq('id', pedido.user_id)
          .single()

        if (perfil) {
          await supabase
            .from('perfiles')
            .update({ puntos: (perfil.puntos ?? 0) + pedido.puntos })
            .eq('id', pedido.user_id)
        }
      }

      // 3. Intentar enviar email si hay datos en sessionStorage
      try {
        const datosStr = sessionStorage.getItem('pedidoMP')
        if (datosStr) {
          const datos = JSON.parse(datosStr)
          if (datos.emailUsuario) {
            await fetch('/api/enviar-confirmacion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nombre: pedido.nombre,
                email: datos.emailUsuario,
                items: pedido.items,
                total: pedido.total,
                direccion: pedido.direccion,
                telefono: pedido.telefono,
              }),
            })
          }
          sessionStorage.removeItem('pedidoMP')
        }
      } catch (err) {
        console.error('Error enviando email:', err)
      }
    }

    actualizarPedido()
  }, [searchParams])

  return (
    <div style={{ textAlign: 'center', maxWidth: '480px' }}>
      <p style={{ fontSize: '64px', marginBottom: '24px' }}>✓</p>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--cream)', fontWeight: '400', marginBottom: '16px' }}>
        ¡Pago confirmado!
      </h1>
      <p style={{ fontSize: '14px', color: 'rgba(247,243,236,0.7)', fontWeight: '300', lineHeight: '1.7', marginBottom: '8px' }}>
        Tu pago fue procesado correctamente.
      </p>
      <p style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '300', marginBottom: '40px' }}>
        Nos comunicaremos por WhatsApp para coordinar la entrega.
      </p>
      <Link href="/menu" style={{ display: 'inline-block', background: 'var(--cream)', color: 'var(--black)', padding: '14px 32px', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', textDecoration: 'none' }}>
        Seguir comprando
      </Link>
    </div>
  )
}

export default function PagoExitosoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Jost, sans-serif', padding: '40px 20px' }}>
      <Suspense fallback={<p style={{ color: 'var(--cream)' }}>Verificando pago...</p>}>
        <PagoExitosoContent />
      </Suspense>
    </div>
  )
}