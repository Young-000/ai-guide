import { ImageResponse } from 'next/og';

// Brand OG card, generated at the edge with system fonts (no external font deps).
export const runtime = 'edge';

export const alt = 'AIWire — AI·LLM 뉴스와 활용 가이드';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', opacity: 0.9 }}>
          AIWire
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}
        >
          AI·LLM 뉴스와 활용 가이드
        </div>
        <div style={{ display: 'flex', marginTop: 32, fontSize: 34, opacity: 0.85 }}>
          매일 업데이트되는 AI 최신 소식 · 한국어 / English
        </div>
      </div>
    ),
    { ...size },
  );
}
