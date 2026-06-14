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
};

// 목록 아이템 = 본문 없는 frontmatter
export type NewsMeta = NewsFrontmatter;

// 상세 = frontmatter + 마크다운 본문
export type NewsArticle = NewsFrontmatter & {
  body: string;
};
