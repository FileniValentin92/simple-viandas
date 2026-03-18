import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || 'semana'

    const ahora = new Date()
    let desde

    if (periodo === 'hoy') {
      desde = new Date(ahora)
      desde.setHours(0, 0, 0, 0)
    } else if (periodo === 'semana') {
      desde = new Date(ahora)
      desde.setDate(ahora.getDate() - 7)
    } else if (periodo === 'mes') {
      desde = new Date(ahora)
      desde.setDate(1)
      desde.setHours(0, 0, 0, 0)
    }

    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('items, total, created_at')
      .gte('created_at', desde.toISOString())
      .neq('estado', 'cancelado')

    if (error) throw error

    // Totales generales
    let totalViandas = 0
    let totalRecaudado = 0
    const ventasPorPlato = {}

    pedidos.forEach(pedido => {
      totalRecaudado += pedido.total || 0
      if (Array.isArray(pedido.items)) {
        pedido.items.forEach(item => {
          const nombre = item.nombre || ''
          const cantidad = item.cantidad || 1
          totalViandas += cantidad
          if (!ventasPorPlato[nombre]) ventasPorPlato[nombre] = 0
          ventasPorPlato[nombre] += cantidad
        })
      }
    })

    // Ordenar por más vendido
    const ranking = Object.entries(ventasPorPlato)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)

    return Response.json({
      totalViandas,
      totalPedidos: pedidos.length,
      totalRecaudado,
      ranking,
    })

  } catch (err) {
    console.error('Error en reportes:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}