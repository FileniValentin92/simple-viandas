import Navbar from './components/Navbar'
import Hero from './components/Hero'
import BannerPromo from './components/BannerPromo'
import MenuDestacado from './components/MenuDestacado'
import ArmaTuPack from './components/ArmaTuPack'
import PromocionesHome from './components/PromocionesHome'
import FAQ from './components/FAQ'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <BannerPromo />
      <MenuDestacado />
      <ArmaTuPack />
      <PromocionesHome />
      <FAQ />
      <Footer />
    </main>
  )
}
