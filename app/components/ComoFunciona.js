export default function ComoFunciona() {
    const pasos = [
      { num: '1', titulo: 'Poné agua a hervir', desc: 'Sin horno, sin aceite, sin utensilios. Solo una olla con agua.' },
      { num: '2', titulo: 'Sumergí la bolsa', desc: 'Sin abrir, 10 minutos. Nada se ensucia, nada se pierde.' },
      { num: '3', titulo: 'Abrí y servís', desc: 'Comida casera de verdad, caliente y lista, como recién hecha.' },
    ]
  
    return (
      <section style={{ background: 'var(--cream)', padding: '72px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: '300', marginBottom: '12px' }}>
          Simple de verdad
        </p>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--black)', fontWeight: '400', marginBottom: '48px' }}>
          Listo en 3 pasos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '820px', margin: '0 auto' }} className="como-funciona-grid">
          {pasos.map(paso => (
            <div key={paso.num} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', padding: '40px 28px' }}>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '64px', color: 'var(--gold)', opacity: 0.3, lineHeight: '1', marginBottom: '20px' }}>
                {paso.num}
              </p>
              <p style={{ fontSize: '15px', color: 'var(--black)', fontWeight: '500', fontFamily: 'Jost, sans-serif', marginBottom: '10px' }}>
                {paso.titulo}
              </p>
              <p style={{ fontSize: '13px', color: '#888', fontFamily: 'Jost, sans-serif', fontWeight: '300', lineHeight: '1.6' }}>
                {paso.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    )
  }