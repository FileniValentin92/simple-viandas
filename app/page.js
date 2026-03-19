import Navbar from './components/Navbar'
import Hero from './components/Hero'
import BannerPromo from './components/BannerPromo'
import MasAhorras from './components/MasAhorras'
import ArmaTuPack from './components/ArmaTuPack'
import ComoFunciona from './components/ComoFunciona'
import MenuDestacado from './components/MenuDestacado'
import Resenas from './components/Resenas'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <BannerPromo />
      <MasAhorras />
      <ArmaTuPack />
      <ComoFunciona />
      <MenuDestacado />
      <Resenas />
      <Footer />
    </main>
  )
}