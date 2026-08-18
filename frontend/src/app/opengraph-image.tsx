import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'QuranPilot — Read, Listen & Understand the Quran';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Default social preview image for pages that do not define their own. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, #0b3d2e 0%, #145c43 45%, #1a6b4f 100%)',
          padding: '64px 72px',
          color: '#f7f7f7',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            opacity: 0.85,
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 600,
          }}
        >
          QuranPilot
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 700,
              maxWidth: 900,
            }}
          >
            Read, Listen &amp; Understand the Quran
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              opacity: 0.9,
              maxWidth: 820,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Arabic text · translation · verse-by-verse audio
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            opacity: 0.75,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          quranpilot.com
        </div>
      </div>
    ),
    { ...size }
  );
}
