import { ImageResponse } from 'next/og';
import { getNewsBySlug } from '@/lib/news';
import { truncateTitle, resolveFrontmatterImage } from '@/lib/og';
import { loadPretendard } from '@/app/_og/font';
import type { NewsLang } from '@/types/news';

// 기사 상세용 동적 OG 카드. 라우트(opengraph-image.tsx)에서 공유.
// 1200x630, 블루 브랜드 톤. 한글 글리프를 위해 Pretendard 번들 로드.
// 런타임은 라우트에서 nodejs(기본) — getNewsBySlug가 node:fs를 쓰므로 edge 불가.

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

export function ogAlt(lang: NewsLang): string {
  return lang === 'ko' ? 'AIWire — AI·LLM 뉴스 미리보기' : 'AIWire — AI·LLM news preview';
}

function formatDate(date: string, lang: NewsLang): string {
  // date = 'YYYY-MM-DD'. ko는 'YYYY.MM.DD', en은 'Mon DD, YYYY'.
  const [year, month, day] = date.split('-');
  if (lang === 'ko') return `${year}.${month}.${day}`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = Number(month) - 1;
  const monthLabel = months[monthIndex] ?? month;
  return `${monthLabel} ${Number(day)}, ${year}`;
}

export async function renderArticleOgImage(lang: NewsLang, slug: string): Promise<ImageResponse> {
  const article = getNewsBySlug(lang, slug);

  // frontmatter image 우선 — ArticleJsonLd의 image 해석과 동일(절대 URL or BASE_URL 접두).
  const frontmatterImage = resolveFrontmatterImage(article?.image);
  if (frontmatterImage) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frontmatterImage}
            alt=""
            width={OG_SIZE.width}
            height={OG_SIZE.height}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ),
      { ...OG_SIZE },
    );
  }

  // 폴백: 제목 기반 브랜드 카드.
  const fontData = await loadPretendard();
  const title = article ? truncateTitle(article.title) : 'AIWire';
  const category = article?.tags?.[0];
  const dateLabel = article ? formatDate(article.date, lang) : '';
  const tagline =
    lang === 'ko' ? 'AI·LLM 뉴스 · 매일 업데이트' : 'AI·LLM News · Updated daily';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
          color: '#ffffff',
          fontFamily: 'Pretendard',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>
            AIWire
          </div>
          {category && (
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                padding: '8px 20px',
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              {category}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 30,
            opacity: 0.85,
          }}
        >
          <div style={{ display: 'flex' }}>{tagline}</div>
          {dateLabel && <div style={{ display: 'flex' }}>{dateLabel}</div>}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: 'Pretendard', data: fontData, weight: 700, style: 'normal' }] },
  );
}
