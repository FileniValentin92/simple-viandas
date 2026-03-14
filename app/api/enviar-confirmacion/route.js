import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { nombre, email, items, total, direccion, telefono } = await request.json()

    if (!email) {
      return Response.json({ error: 'Email requerido' }, { status: 400 })
    }

    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ede8; font-family: 'Helvetica Neue', sans-serif; font-size: 14px; color: #2d2d2d;">
          ${item.emoji || ''} ${item.nombre} <span style="color: #999;">×${item.cantidad}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ede8; font-family: 'Helvetica Neue', sans-serif; font-size: 14px; color: #2d2d2d; text-align: right;">
          $${(item.precioNum * item.cantidad).toLocaleString('es-AR')}
        </td>
      </tr>
    `).join('')

    const { data, error } = await resend.emails.send({
      from: 'SIMPLE <onboarding@resend.dev>',
      to: email,
      subject: '✅ Tu pedido en SIMPLE fue recibido',
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="margin: 0; padding: 0; background-color: #faf9f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf9f6; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #1a1a1a; padding: 36px 40px; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c8a96e; font-weight: 300;">Viandas al vacío</p>
                        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; color: #f7f3ec; font-weight: 400; letter-spacing: 6px; text-transform: uppercase;">SIMPLE</h1>
                      </td>
                    </tr>

                    <!-- Título confirmación -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 40px 40px 24px 40px; border-bottom: 1px solid #f0ede8;">
                        <p style="margin: 0 0 8px 0; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #c8a96e; font-weight: 300;">Pedido recibido</p>
                        <h2 style="margin: 0 0 12px 0; font-family: Georgia, serif; font-size: 26px; color: #2d2d2d; font-weight: 400;">¡Gracias, ${nombre}!</h2>
                        <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">Tu pedido fue recibido correctamente. Nos vamos a estar comunicando por <strong>WhatsApp</strong> para coordinar la entrega.</p>
                      </td>
                    </tr>

                    <!-- Detalle del pedido -->
                    <tr>
                      <td style="background-color: #ffffff; padding: 24px 40px;">
                        <p style="margin: 0 0 16px 0; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #999; font-weight: 300;">Tu pedido</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          ${itemsHTML}
                          <tr>
                            <td style="padding: 16px 0 0 0; font-family: Georgia, serif; font-size: 20px; color: #2d2d2d; font-weight: 400;">Total</td>
                            <td style="padding: 16px 0 0 0; font-family: Georgia, serif; font-size: 24px; color: #2d2d2d; font-weight: 400; text-align: right;">$${total.toLocaleString('es-AR')}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Datos de entrega -->
                    <tr>
                      <td style="background-color: #f7f3ec; padding: 24px 40px; border-top: 1px solid #f0ede8;">
                        <p style="margin: 0 0 12px 0; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #999; font-weight: 300;">Datos de entrega</p>
                        <p style="margin: 0 0 6px 0; font-size: 14px; color: #2d2d2d;">${direccion}</p>
                        <p style="margin: 0; font-size: 14px; color: #666;">📱 ${telefono}</p>
                      </td>
                    </tr>

                    <!-- Mensaje WhatsApp -->
                    <tr>
                      <td style="background-color: #1a1a1a; padding: 28px 40px; text-align: center;">
                        <p style="margin: 0; font-size: 13px; color: rgba(247,243,236,0.7); line-height: 1.6;">
                          Te contactaremos por WhatsApp al <strong style="color: #f7f3ec;">${telefono}</strong> para coordinar día y horario de entrega.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; text-align: center;">
                        <p style="margin: 0; font-size: 11px; color: #bbb; font-weight: 300; letter-spacing: 1px;">SIMPLE · Viandas al vacío · La Plata</p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return Response.json({ error }, { status: 500 })
    }

    return Response.json({ success: true, id: data?.id })

  } catch (err) {
    console.error('Error enviando email:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}