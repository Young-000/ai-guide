import { businessInfo } from '@/lib/business-info';
import type { NewsMeta } from '@/types/news';

const DEFAULT_ARTICLE_LIMIT = 50;

function toSingleLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function buildArticleSection(
  articles: readonly NewsMeta[],
  baseUrl: string,
  limit: number,
): string[] {
  const koreanArticles = articles.filter((a) => a.lang === 'ko').slice(0, limit);
  if (koreanArticles.length === 0) return [];

  const lines = koreanArticles.map(
    (a) =>
      `- [${toSingleLine(a.title)}](${baseUrl}/news/${a.slug}) — ${a.date} — ${toSingleLine(a.summary)}`,
  );
  return [
    '## Recent Articles',
    '',
    `Latest Korean articles (canonical URLs). Full bilingual list: ${baseUrl}/llms-full.txt`,
    '',
    ...lines,
    '',
  ];
}

/**
 * Builds the content for /llms.txt — a concise markdown document for LLM crawlers.
 * Pure function: tags, baseUrl and articles are passed explicitly for testability.
 *
 * Follows the llms.txt convention: https://llmstxt.org
 */
export function buildLlmsTxt(
  tags: readonly string[],
  baseUrl: string,
  articles: readonly NewsMeta[] = [],
  articleLimit: number = DEFAULT_ARTICLE_LIMIT,
): string {
  const tagSection =
    tags.length > 0
      ? tags
          .map((tag) => `- [${tag}](${baseUrl}/news/topic/${encodeURIComponent(tag)})`)
          .join('\n')
      : '(no tags yet)';

  return [
    '# AIWire',
    '',
    '> 매일 AI·LLM 뉴스를 한국어·영어로 정리하는 미디어 | Daily AI·LLM news in Korean and English',
    '',
    '## Site Facts',
    '',
    '- Coverage: AI and LLM industry news — product releases, policy, research, funding — plus AI tool guides and comparisons.',
    '- Update cadence: new digests are published several times a day (automated collection, then publication).',
    '- Languages: Korean (ko), English (en)',
    `- Operator: ${businessInfo.bizName} (representative: ${businessInfo.representative}), Korea`,
    `- Contact: ${businessInfo.email}`,
    '- Sourcing: every article is a summary that cites and links its original source(s); drafts are AI-assisted, and AIWire is not the primary source.',
    '',
    'AIWire is a bilingual media covering daily AI and LLM news.',
    '',
    '## Key Sections',
    '',
    `- [뉴스 (Korean News)](${baseUrl}/news) — Daily AI·LLM news in Korean`,
    `- [English News](${baseUrl}/en/news) — Daily AI·LLM news in English`,
    `- [About](${baseUrl}/about) — About AIWire`,
    `- [RSS Feed](${baseUrl}/feed.xml) — Subscribe to content updates`,
    `- [Full article list](${baseUrl}/llms-full.txt) — Recent articles with summaries (ko + en)`,
    '',
    ...buildArticleSection(articles, baseUrl, articleLimit),
    '## Topics',
    '',
    tagSection,
    '',
    '## Notes',
    '',
    '- All articles are summaries linking to the original source(s).',
    '- Korean articles: /news/{slug} · English counterparts: /en/news/{slug}.',
    '',
  ].join('\n');
}

/**
 * Builds the content for /llms-full.txt — recent articles with titles, URLs, and summaries.
 * Pure function: articles, baseUrl, and limit are passed explicitly for testability.
 */
export function buildLlmsFullTxt(
  articles: readonly NewsMeta[],
  baseUrl: string,
  limit: number = 30,
): string {
  const articleLines = articles.slice(0, limit).map((a) => {
    const newsPath = a.lang === 'en' ? 'en/news' : 'news';
    const url = `${baseUrl}/${newsPath}/${a.slug}`;
    return [
      `## ${a.title}`,
      '',
      `- URL: ${url}`,
      `- Date: ${a.date}`,
      `- Summary: ${a.summary}`,
      '',
    ].join('\n');
  });

  return [
    '# AIWire — Recent Articles',
    '',
    '> Latest AI·LLM news summaries from AIWire (aiwire.news)',
    '',
    ...articleLines,
  ].join('\n');
}
