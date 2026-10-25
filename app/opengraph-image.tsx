import { ImageResponse } from 'next/og';
import { siteConfig } from '../lib/config/site';

export const alt = 'OwlPrep — বিসিএস ও ব্যাংক প্রস্তুতি (Grow With Owl)';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundImage: 'linear-gradient(to bottom right, #041410, #0f172a)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              borderRadius: '9999px',
              padding: '8px 20px',
              fontSize: '18px',
              fontWeight: 800,
              color: '#6ee7b7',
              letterSpacing: '0.05em',
              marginBottom: '24px',
            }}
          >
            🦉 {siteConfig.parentBrand.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: '76px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#34d399',
              marginBottom: '20px',
            }}
          >
            {siteConfig.tagline}
          </div>
          <div
            style={{
              fontSize: '20px',
              color: '#cbd5e1',
              maxWidth: '850px',
              lineHeight: 1.5,
            }}
          >
            Scientific Spaced Repetition (SM-2), 1-Minute Micro-Capsules &amp; 24/7 AI Exam Mentor for BCS &amp; Bank Job Aspirants.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <div style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 600 }}>
            Architect: Joy Chandra Uday • Co-Founder, G2G Digital
          </div>
          <div style={{ fontSize: '20px', color: '#fbbf24', fontWeight: 800 }}>
            {siteConfig.links.domain}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
