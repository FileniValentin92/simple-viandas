import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
})

export async function POST(request) {
  try {
    const { items, nombre, telefono, direccion, piso, comentarios } = await request.json()

    const preference = new Preference(client)

    const mpItems = items.map(item => ({
      title: String(item.nombre),
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