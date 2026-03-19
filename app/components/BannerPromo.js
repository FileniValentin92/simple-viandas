export default function BannerPromo() {
    return (
      <div style={{ background: 'var(--gold)', padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--black)', fontWeight: '500', fontFamily: 'Jost, sans-serif' }}>
          🎁 &nbsp;PRIMERA COMPRA: $500 OFF con el código SIMPLE500
        </p>
        <span style={{ fontSize: '10px', color: 'rgba(14,14,12,0.6)', letterSpacing: '1px', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
          Ver condiciones →
        </span>
      </div>
    )
  }