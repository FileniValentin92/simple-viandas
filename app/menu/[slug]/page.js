'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useCart } from '../../components/CartContext'

const platos = [
  { emoji: '🍖', nombre: 'Milanesa napolitana', descripcion: 'Con puré rústico de papa', descripcionLarga: 'Milanesa de ternera rebozada, napada con salsa de tomate casera, jamón y queso derretido. Acompañada de un cremoso puré rústico de papa con manteca y leche.', categoria: 'carne', tiempo: '10 min', precio: '$8.900', puntos: '+45 pts', kcal: '520', proteinas: '38g', carbos: '42g', grasas: '18g' },
  { emoji: '🥩', nombre: 'Carne al verdeo', descripcion: 'Con papas al natural', descripcionLarga: 'Tiernos trozos de carne vacuna salteados con cebolla de verdeo, crema y vino blanco. Servida con papas al natural con aceite de oliva y perejil.', categoria: 'carne', tiempo: '10 min', precio: '$9.200', puntos: '+46 pts', kcal: '480', proteinas: '42g', carbos: '28g', grasas: '22g' },
  { emoji: '🫕', nombre: 'Tuco de carne', descripcion: 'Bolognesa casera', descripcionLarga: 'Salsa bolognesa tradicional hecha con carne picada de ternera, tomates perita, zanahoria, apio y vino tinto. Cocinada a fuego lento por horas para concentrar todos los sabores.', categoria: 'carne', tiempo: '10 min', precio: '$8.200', puntos: '+41 pts', kcal: '440', proteinas: '32g', carbos: '38g', grasas: '16g' },
  { emoji: '🍗', nombre: 'Pollo al limón', descripcion: 'Con papas al olivo', descripcionLarga: 'Pechuga de pollo marinada en jugo de limón, ajo y hierbas frescas. Cocida a la perfección y acompañada de papas doradas con aceite de oliva y romero.', categoria: 'pollo', tiempo: '10 min', precio: '$8.500', puntos: '+43 pts', kcal: '390', proteinas: '44g', carbos: '32g', grasas: '12g' },
  { emoji: '🍗', nombre: 'Pollo al verdeo', descripcion: 'Con arroz blanco', descripcionLarga: 'Pollo en salsa cremosa de cebolla de verdeo con un toque de crema y vino blanco. Acompañado de arroz blanco largo fino cocido al punto.', categoria: 'pollo', tiempo: '10 min', precio: '$8.300', puntos: '+42 pts', kcal: '410', proteinas: '40g', carbos: '45g', grasas: '14g' },
  { emoji: '🍗', nombre: 'Suprema a la maryland', descripcion: 'Con puré y banana', descripcionLarga: 'Clásico argentino: suprema de pollo frita con un acompañamiento dulce y salado de puré de papas y banana dorada en manteca. Una combinación que nunca falla.', categoria: 'pollo', tiempo: '10 min', precio: '$8.600', puntos: '+43 pts', kcal: '460', proteinas: '38g', carbos: '52g', grasas: '16g' },
  { emoji: '🥦', nombre: 'Tarta de verdura', descripcion: 'Espinaca y ricota', descripcionLarga: 'Tarta casera con masa de manteca, relleno de espinaca salteada con ajo, ricota fresca y nuez moscada. Horneada hasta dorar. Sin conservantes ni aditivos.', categoria: 'vegetariano', tiempo: '10 min', precio: '$7.800', puntos: '+39 pts', kcal: '340', proteinas: '18g', carbos: '36g', grasas: '14g' },
  { emoji: '🍳', nombre: 'Tortilla de papas', descripcion: 'Con ensalada verde', descripcionLarga: 'Tortilla española tradicional con papas y cebolla, cocida lentamente en aceite de oliva. Servida con una ensalada verde fresca de lechuga, rúcula y aderezo de limón.', categoria: 'vegetariano', tiempo: '10 min', precio: '$7.500', puntos: '+38 pts', kcal: '310', proteinas: '14g', carbos: '30g', grasas: '16g' },
  { emoji: '🫘', nombre: 'Guiso de lentejas', descripcion: 'Con verduras de estación', descripcionLarga: 'Guiso casero de lentejas con zanahoria, papa, chorizo colorado y condimentos tradicionales. Cocinado a fuego lento con verduras de temporada para un plato reconfortante.', categoria: 'vegetariano', tiempo: '10 min', precio: '$7.900', puntos: '+40 pts', kcal: '360', proteinas: '22g', carbos: '50g', grasas: '8g' },
  { emoji: '🍝', nombre: 'Ñoquis con salsa rosa', descripcion: 'Salsa casera cremosa', descripcionLarga: 'Ñoquis de papa artesanales con una salsa rosa hecha con tomates naturales, crema de leche y un toque de albahaca fresca. Receta casera sin ingredientes industriales.', categoria: 'pasta', tiempo: '10 min', precio: '$8.100', puntos: '+41 pts', kcal: '420', proteinas: '16g', carbos: '62g', grasas: '14g' },
  { emoji: '🍝', nombre: 'Fideos con tuco', descripcion: 'Salsa de tomate casera', descripcionLarga: 'Pasta larga con salsa de tomate casera cocinada con cebolla, ajo, zanahoria y hierbas frescas. Una receta simple y honesta que respeta el sabor de los buenos ingredientes.', categoria: 'pasta', tiempo: '10 min', precio: '$7.900', puntos: '+40 pts', kcal: '400', proteinas: '14g', carbos: '68g', grasas: '10g' },
  { emoji: '🍝', nombre: 'Lasagna de carne', descripcion: 'Con bechamel casera', descripcionLarga: 'Lasagna tradicional con capas de pasta fresca, carne bolognesa, bechamel casera y queso gratinado. Horneada en porciones individuales para conservar toda su textura al recalentar.', categoria: 'pasta', tiempo: '10 min', precio: '$9.100', puntos: '+46 pts', kcal: '510', proteinas: '34g', carbos: '48g', grasas: '20g' },
  { emoji: '🐟', nombre: 'Merluza al vapor', descripcion: 'Con puré de calabaza', descripcionLarga: 'Filete de merluza fresca cocida al vapor con limón y hierbas. Acompañada de un suave puré de calabaza con aceite de oliva y pimienta blanca. Liviano y nutritivo.', categoria: 'pescado', tiempo: '10 min', precio: '$9.500', puntos: '+48 pts', kcal: '320', proteinas: '36g', carbos: '24g', grasas: '8g' },
  { emoji: '🐟', nombre: 'Salmon con limón', descripcion: 'Con arroz yamaní', descripcionLarga: 'Salmón rosado marinado en limón, mostaza y eneldo. Cocido a baja temperatura para preservar sus ácidos grasos omega-3. Servido con arroz yamaní integral.', categoria: 'pescado', tiempo: '10 min', precio: '$10.200', puntos: '+51 pts', kcal: '420', proteinas: '40g', carbos: '38g', grasas: '16g' },
  { emoji: '🥘', nombre: 'Cazuela de mariscos', descripcion: 'Con papas y verduras', descripcionLarga: 'Cazuela con mejillones, calamares y langostinos en caldo de mar con tomate, pimiento y papas. Cocinada con azafrán y vino blanco para un plato de sabor intenso y auténtico.', categoria: 'pescado', tiempo: '10 min', precio: '$10.500', puntos: '+53 pts', kcal: '380', proteinas: '38g', carbos: '30g', grasas: '12g' },
]

function nombreASlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function DetallePlato() {
  const params = useParams()
  const { agregarItem, items } = useCart()

  const plato = platos.find(p => nombreASlug(p.nombre) === params.slug)

  const cantidad = items.find(i => i.nombre === plato?.nombre)?.cantidad || 0

  if (!plato) {
    return (
      <main>
        <Navbar />
        <div style={{
          background: 'var(--white)',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px' }}>Plato no encontrado</p>
          <Link href="/menu" style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--black)' }}>
            ← Volver al menú
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Navbar />

      {/* Breadcrumb */}
      <div style={{
        background: 'var(--cream)',
        padding: '16px 64px',
        borderBottom: '1px solid var(--cream-deep)',
      }}>
        <Link href="/menu" style={{
          fontSize: '9px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--black)',
          textDecoration: 'none',
          opacity: 0.5,
          fontWeight: '300',
        }}>
          ← Volver al menú
        </Link>
      </div>

      {/* Contenido principal */}
      <section style={{
        background: 'var(--white)',
        padding: '64px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '80px',
        alignItems: 'start',
      }}>

        {/* Imagen / Emoji */}
        <div style={{
          background: 'var(--cream)',
          aspectRatio: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '140px',
          position: 'relative',
        }}>
          {plato.emoji}
          {/* Tag categoría */}
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            background: 'var(--black)',
            color: 'var(--cream)',
            padding: '6px 16px',
            fontSize: '8px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'Jost, sans-serif',
            fontWeight: '300',
          }}>
            {plato.categoria}
          </div>
        </div>

        {/* Info */}
        <div style={{ paddingTop: '16px' }}>
          {/* Subtítulo */}
          <p style={{
            fontSize: '9px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            fontWeight: '300',
            marginBottom: '12px',
          }}>
            {plato.descripcion}
          </p>

          {/* Nombre */}
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '48px',
            color: 'var(--black)',
            fontWeight: '400',
            lineHeight: '1.1',
            marginBottom: '24px',
          }}>
            {plato.nombre}
          </h1>

          {/* Descripción larga */}
          <p style={{
            fontSize: '14px',
            color: '#666',
            fontWeight: '300',
            lineHeight: '1.8',
            marginBottom: '32px',
          }}>
            {plato.descripcionLarga}
          </p>

          {/* Tags */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}>
            {[`⏱ ${plato.tiempo}`, '❄️ Freezer hasta 3 meses', '🔥 Listo en microondas', plato.puntos].map(tag => (
              <span key={tag} style={{
                fontSize: '9px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'var(--olive-mid)',
                background: 'var(--cream)',
                padding: '6px 14px',
                fontWeight: '300',
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Info nutricional */}
          <div style={{
            borderTop: '1px solid var(--cream-deep)',
            borderBottom: '1px solid var(--cream-deep)',
            padding: '24px 0',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}>
            {[
              { label: 'Calorías', valor: plato.kcal, unidad: 'kcal' },
              { label: 'Proteínas', valor: plato.proteinas, unidad: '' },
              { label: 'Carbos', valor: plato.carbos, unidad: '' },
              { label: 'Grasas', valor: plato.grasas, unidad: '' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '24px',
                  color: 'var(--black)',
                  fontWeight: '400',
                  marginBottom: '4px',
                }}>
                  {item.valor}<span style={{ fontSize: '12px' }}>{item.unidad}</span>
                </p>
                <p style={{
                  fontSize: '8px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#999',
                  fontWeight: '300',
                }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Precio + botón */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '40px',
              color: 'var(--black)',
            }}>
              {plato.precio}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => agregarItem(plato)}
                style={{
                  background: cantidad > 0 ? 'var(--olive)' : 'var(--black)',
                  color: 'var(--cream)',
                  border: 'none',
                  padding: '16px 40px',
                  fontSize: '10px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: '300',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                {cantidad > 0 ? `Agregar otro (${cantidad} en carrito)` : 'Agregar al carrito'}
              </button>
              {cantidad > 0 && (
                <p style={{
                  fontSize: '9px',
                  color: 'var(--olive)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontWeight: '300',
                }}>
                  ✓ {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'} en tu pedido
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}