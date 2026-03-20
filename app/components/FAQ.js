'use client'
import { useState } from 'react'

const faqs = [
  {
    pregunta: '¿Cómo se calientan las viandas?',
    respuesta: 'Ponés agua a hervir, sumergís la bolsa sin abrir por 10 minutos. Sin horno, sin microondas, sin ensuciar nada. Solo una olla.',
  },
  {
    pregunta: '¿Cuánto duran en el freezer?',
    respuesta: 'Hasta 6 meses en el freezer. Una vez descongeladas, se consumen dentro de las 72 horas en heladera.',
  },
  {
    pregunta: '¿Tienen conservantes o aditivos?',
    respuesta: 'No. Las viandas se conservan gracias al envasado al vacío, sin necesidad de ningún conservante ni aditivo.',
  },
  {
    pregunta: '¿A qué zonas entregan?',
    respuesta: 'Entregamos en CABA y GBA de lunes a sábados de 16hs a 20hs. Consultanos por WhatsApp para confirmar tu zona.',
  },
  {
    pregunta: '¿Cómo funciona el sistema de puntos?',
    respuesta: 'Acumulás puntos con cada compra. Cada $200 pesos = 1 punto. Con 300 puntos obtenés 1 vianda gratis a elección.',
  },
]

export default function FAQ() {
  const [abierto, setAbierto] = useState(null)

  return (
    <section style={{ background: 'var(--black)', padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px)' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '14px' }}>
          Preguntas frecuentes
        </p>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--cream)', fontWeight: '400' }}>
          Todo lo que necesitás saber
        </h2>
      </div>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{
              borderTop: '1px solid rgba(247,243,236,0.1)',
              ...(i === faqs.length - 1 ? { borderBottom: '1px solid rgba(247,243,236,0.1)' } : {}),
            }}
          >
            <button
              onClick={() => setAbierto(abierto === i ? null : i)}
              style={{
                width: '100%',
                padding: '24px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--cream)', fontWeight: '400', fontFamily: 'Jost, sans-serif', paddingRight: '16px' }}>
                {faq.pregunta}
              </span>
              <span style={{
                fontSize: '22px',
                color: 'var(--gold)',
                fontWeight: '300',
                flexShrink: 0,
                transition: 'transform 0.25s ease',
                display: 'inline-block',
                transform: abierto === i ? 'rotate(45deg)' : 'none',
              }}>
                +
              </span>
            </button>
            {abierto === i && (
              <p style={{ padding: '0 40px 24px 0', fontSize: '14px', color: 'rgba(247,243,236,0.55)', fontFamily: 'Jost, sans-serif', fontWeight: '300', lineHeight: '1.7' }}>
                {faq.respuesta}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
