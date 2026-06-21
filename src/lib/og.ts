import { BASE_URL } from '@/lib/site';

// 동적 OG 카드(opengraph-image)에서 공유하는 순수 헬퍼.
// 라우트 핸들러는 JSX만, 문자열 가공/우선순위 판단은 여기서 테스트 가능하게 분리.

const DEFAULT_MAX_TITLE_LENGTH = 70;

/**
 * OG 카드용 제목 말줄임. 공백을 정리한 뒤 max 길이를 넘으면 말줄임표(…)를 붙인다.
 */
export function truncateTitle(title: string, max: number = DEFAULT_MAX_TITLE_LENGTH): string {
  const normalized = title.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

/**
 * frontmatter image를 OG 카드에서 쓸 절대 URL로 변환. 값이 없으면 null(→ 브랜드 카드 폴백).
 * ArticleJsonLd의 image 해석과 동일한 규칙(절대 URL 우선, 상대는 BASE_URL 접두).
 */
export function resolveFrontmatterImage(image: string | undefined): string | null {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
}
