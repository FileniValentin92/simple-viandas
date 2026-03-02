import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Packs from './components/Packs'
import MenuDestacado from './components/MenuDestacado'
import Resenas from './components/Resenas'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Packs />
      <MenuDestacado />
      <Resenas />
      <Footer />
    </main>
  )
}