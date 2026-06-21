import { getNewsSlugs } from '@/lib/news';
import { renderArticleOgImage, ogAlt, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-card';

// 영어 기사 동적 OG. nodejs 런타임(기본) — getNewsBySlug가 node:fs를 사용하므로 edge 불가.
// 파일 컨벤션이 이 라우트의 og:image / twitter:image를 자동 주입.

export const alt = ogAlt('en');
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getNewsSlugs('en').map((slug) => ({ slug }));
}

export default function Image({ params }: { params: Params }): Promise<Response> {
  return renderArticleOgImage('en', params.slug);
}
