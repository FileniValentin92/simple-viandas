import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function PATCH(request) {
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

    const body = await request.json()
    const { id, cambios, sumarPuntos } = body

    if (!id || !cambios || Object.keys(cambios).length === 0) {
      return Response.json({ error: 'Faltan id o cambios' }, { status: 400 })
    }

    // Only allow updating estado and pago_estado
    const camposPermitidos = ['estado', 'pago_estado']
    const cambiosSeguros = {}
    for (const key of camposPermitidos) {
      if (cambios[key] !== undefined) {
        cambiosSeguros[key] = String(cambios[key]).slice(0, 50)
      }
    }

    if (Object.keys(cambiosSeguros).length === 0) {
      return Response.json({ error: 'No hay campos válidos para actualizar' }, { status: 400 })
    }

    // Update the order using the service-role client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .update(cambiosSeguros)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[admin/actualizar-pedido] Update error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // If requested, add points to user profile
    if (sumarPuntos && sumarPuntos.userId && sumarPuntos.puntos > 0) {
      const { data: perfil } = await supabaseAdmin
        .from('perfiles')
        .select('puntos')
        .eq('id', sumarPuntos.userId)
        .single()

      if (perfil) {
        const nuevosPuntos = (perfil.puntos ?? 0) + sumarPuntos.puntos
        await supabaseAdmin
          .from('perfiles')
          .update({ puntos: nuevosPuntos })
          .eq('id', sumarPuntos.userId)
      }
    }

    return Response.json({ success: true, pedido: data })
  } catch (err) {
    console.error('[admin/actualizar-pedido] Fatal error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
