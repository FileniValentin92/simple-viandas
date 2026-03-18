import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { items } = await request.json()

    for (const item of items) {
      const nombre = item.nombre
      const cantidad = item.cantidad

      const { data: stockActual, error: errorLectura } = await supabase
        .from('stock')
        .select('cantidad, vendidos_total')
        .eq('nombre', nombre)
        .single()

      if (errorLectura || !stockActual) continue

      const nuevaCantidad = Math.max(0, stockActual.cantidad - cantidad)
      const nuevosVendidos = (stockActual.vendidos_total || 0) + cantidad

      await supabase
        .from('stock')
        .update({
          cantidad: nuevaCantidad,
          vendidos_total: nuevosVendidos,
          updated_at: new Date().toISOString(),
        })
        .eq('nombre', nombre)
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Error descontando stock:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}