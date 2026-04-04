import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function DELETE(request) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('x-admin-token')
    if (!authHeader || authHeader !== process.env.ADMIN_SECRET) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return Response.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor' },
        { status: 500 }
      )
    }

    const { id } = await request.json()

    if (!id) {
      return Response.json({ error: 'Falta id del pedido' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('pedidos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[admin/borrar-pedido] Delete error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[admin/borrar-pedido] Fatal error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
