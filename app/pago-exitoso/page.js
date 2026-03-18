'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

function PagoExitosoContent() {
  const searchParams = useSearchParams()
  const [procesado, setProcesado] = useState(false)
  const procesando = useRef(false)

  useEffect(() => {
    const actualizarPedido = async () => {
      if (procesando.current) return
      procesando.current = true

      const paymentId = searchParams.get('payment_id')
      const status = searchParams.get('status')

      if (status !== 'approved' || !paymentId) return

      // Leer datos guardados antes de redirigir a MP
      const datosStr = sessionStorage.getItem('pedidoMP')
      if (!datosStr) return

      const datos = JSON.parse(datosStr)

      // 1. Actualizar el pedido existente con el payment_id y marcar como pagado
      const { error: errorUpdate } = await supabase
        .from('pedidos')
        .update({
          pago_estado: 'pagado',
          mp_payment_id: paymentId,
        })
        .eq('id', datos.pedidoId)

      if (errorUpdate) {
        console.error('Error actualizando pedido:', errorUpdate)
        return
      }

      // 2. Sumar puntos al perfil si hay usuario logueado
      if (datos.user_id && datos.puntosGanados > 0) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('puntos')
          .eq('id', datos.user_id)
          .single()

        if (perfil) {
          await supabase
            .from('perfiles')
            .update({ puntos: (perfil.puntos ?? 0) + datos.puntosGanados })
            .eq('id', datos.user_id)
        }
      }

      // 3. Enviar email de confirmación
      if (datos.emailUsuario) {
        try {
          await fetch('/api/enviar-confirmacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: datos.nombre,
              email: datos.emailUsuario,
              items: datos.items,
              total: datos.total,
              direccion: datos.direccion,
              telefono: datos.telefono,
            }),
          })
        } catch (err) {
          console.error('Error enviando email:', err)
        }
      }

      sessionStorage.removeItem('pedidoMP')
      setProcesado(true)
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