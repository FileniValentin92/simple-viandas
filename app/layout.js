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
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230E0E0C'/%3E%3Ccircle cx='5' cy='6' r='1.8' stroke='%23B89A5E' stroke-width='0.8' fill='none'/%3E%3Cline x1='5' y1='7.8' x2='5' y2='14' stroke='%23B89A5E' stroke-width='0.8' stroke-linecap='round'/%3E%3Cpath d='M8 10 C12 15 20 15 24 10' stroke='%23B89A5E' stroke-width='1' fill='none' stroke-linecap='round'/%3E%3Cline x1='27' y1='4' x2='27' y2='14' stroke='%23B89A5E' stroke-width='0.8' stroke-linecap='round'/%3E%3Cline x1='25.5' y1='4' x2='25.5' y2='7.5' stroke='%23B89A5E' stroke-width='0.8' stroke-linecap='round'/%3E%3Cline x1='28.5' y1='4' x2='28.5' y2='7.5' stroke='%23B89A5E' stroke-width='0.8' stroke-linecap='round'/%3E%3Cpath d='M25.5 7.5 C25.8 10 28.2 10 28.5 7.5' stroke='%23B89A5E' stroke-width='0.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"
        />
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