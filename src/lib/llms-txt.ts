import type { NewsMeta } from '@/types/news';

/**
 * Builds the content for /llms.txt — a concise markdown document for LLM crawlers.
 * Pure function: tags and baseUrl are passed explicitly for testability.
 *
 * Follows the llms.txt convention: https://llmstxt.org
 */
export function buildLlmsTxt(tags: readonly string[], baseUrl: string): string {
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
    'AIWire is a bilingual editorial media covering daily AI and LLM news.',
    'Content consists of human-curated editorial summaries with original sources cited.',
    '',
    '## Key Sections',
    '',
    `- [뉴스 (Korean News)](${baseUrl}/news) — Daily AI·LLM news in Korean`,
    `- [English News](${baseUrl}/en/news) — Daily AI·LLM news in English`,
    `- [About](${baseUrl}/about) — About AIWire`,
    `- [RSS Feed](${baseUrl}/feed.xml) — Subscribe to content updates`,
    '',
    '## Topics',
    '',
    tagSection,
    '',
    '## Notes',
    '',
    '- All articles are editorial summaries linking to the original source(s).',
    '- Korean articles: /news/{slug} · English counterparts: /en/news/{slug}.',
    '- New content published daily.',
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
