const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://simpleviandas.com.ar'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/confirmar', '/pago-exitoso', '/pago-fallido', '/reset-password'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
