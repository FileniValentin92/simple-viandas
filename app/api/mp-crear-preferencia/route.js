import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { items, nombre, telefono, direccion, piso, comentarios } = body

    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      return Response.json({ error: 'Items inválidos' }, { status: 400 })
    }

    // Validar que cada item tenga los campos requeridos
    for (const item of items) {
      if (!item.nombre || typeof item.nombre !== 'string') {
        return Response.json({ error: 'Item sin nombre válido' }, { status: 400 })
      }
      if (!item.cantidad || Number(item.cantidad) <= 0) {
        return Response.json({ error: 'Cantidad inválida' }, { status: 400 })
      }
      if (!item.precioNum || Number(item.precioNum) <= 0) {
        return Response.json({ error: 'Precio inválido' }, { status: 400 })
      }
    }

    const preference = new Preference(client)

    const mpItems = items.map(item => ({
      title: String(item.nombre).slice(0, 200),
      quantity: Number(item.cantidad),
      unit_price: parseFloat(item.precioNum),
      currency_id: 'ARS',
    }))

    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: nombre || '',
          phone: { number: telefono || '' },
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/pago-exitoso`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/pago-fallido`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pago-pendiente`,
        },
        auto_return: 'approved',
        statement_descriptor: 'SIMPLE Viandas',
      },
    })

    return Response.json({ init_point: result.init_point })

  } catch (error) {
    console.error('MP error:', error)
    return Response.json({ error: 'Error al crear preferencia de pago', detalle: error?.message }, { status: 500 })
  }
}