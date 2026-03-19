import "./globals.css"
import { CartProvider } from './components/CartContext'
import { AuthProvider } from './components/AuthContext'
import CarritoDrawer from './components/CarritoDrawer'

export const metadata = {
  title: "SIMPLE — Viandas al vacío",
  description: "Comida real, lista en 10 minutos",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Jost:wght@200;300;400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230E0E0C'/><circle cx='7' cy='10' r='2' stroke='%23B89A5E' stroke-width='0.9' fill='none'/><line x1='7' y1='12' x2='7' y2='22' stroke='%23B89A5E' stroke-width='0.9' stroke-linecap='round'/><path d='M10 16 C13 21 19 21 22 16' stroke='%23B89A5E' stroke-width='1' fill='none' stroke-linecap='round'/><line x1='25' y1='8' x2='25' y2='22' stroke='%23B89A5E' stroke-width='0.9' stroke-linecap='round'/><line x1='23' y1='8' x2='23' y2='12' stroke='%23B89A5E' stroke-width='0.9' stroke-linecap='round'/><line x1='27' y1='8' x2='27' y2='12' stroke='%23B89A5E' stroke-width='0.9' stroke-linecap='round'/><path d='M23 12 C23.3 14.5 26.7 14.5 27 12' stroke='%23B89A5E' stroke-width='0.9' fill='none' stroke-linecap='round'/></svg>" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <CarritoDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}