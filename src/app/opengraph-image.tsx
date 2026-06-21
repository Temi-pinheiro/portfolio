import { ImageResponse } from 'next/og';

export const alt = 'Temitope Pinheiro — Fullstack Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '96px',
          background: '#010101',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 34, color: '#808080', letterSpacing: 4 }}>
          TEMITOPE PINHEIRO
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            marginTop: 28,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Fullstack Developer building for SaaS companies.
        </div>
        <div style={{ fontSize: 30, marginTop: 40, color: '#2C1DFF' }}>
          temipinheiro.com
        </div>
      </div>
    ),
    { ...size }
  );
}
