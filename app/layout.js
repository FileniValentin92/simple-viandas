import "./globals.css"
import { CartProvider } from './components/CartContext'
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
      </head>
      <body>
        <CartProvider>
          {children}
          <CarritoDrawer />
        </CartProvider>
      </body>
    </html>
  )
}