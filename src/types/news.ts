export type NewsLang = 'ko' | 'en';

export type NewsSource = {
  title: string;
  url: string;
};

export type NewsFrontmatter = {
  title: string;
  lang: NewsLang;
  date: string; // YYYY-MM-DD
  slug: string; // 양언어 공유 (hreflang 페어링 키)
  summary: string;
  tags: string[];
  sources: NewsSource[];
  image?: string; // 대표 이미지 절대/상대 URL (선택). 없으면 사이트 기본 OG로 폴백.
  dateModified?: string; // YYYY-MM-DD (선택). 없으면 date 사용.
};

// 목록 아이템 = 본문 없는 frontmatter
export type NewsMeta = NewsFrontmatter;

// 상세 = frontmatter + 마크다운 본문
export type NewsArticle = NewsFrontmatter & {
  body: string;
};
