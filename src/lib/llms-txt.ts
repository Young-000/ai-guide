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
    '## About',
    '',
    'AIWire (aiwire.news) is a Korean bilingual editorial media that publishes AI and LLM news daily.',
    'Founded in 2026, it covers the latest developments in artificial intelligence, large language models,',
    'AI tools, and their practical applications for Korean readers and the global AI community.',
    '',
    'Content is human-curated editorial summaries with original sources cited.',
    'The site is published from South Korea and targets both Korean and English-speaking audiences.',
    '',
    '## Key Sections',
    '',
    `- [뉴스 / Korean News](${baseUrl}/news) — Daily AI·LLM news in Korean`,
    `- [English News](${baseUrl}/en/news) — Daily AI·LLM news in English`,
    `- [AI Tools Guide](${baseUrl}/tools) — Curated directory of AI tools with comparisons`,
    `- [Use Cases](${baseUrl}/use-cases) — Practical AI use cases by industry and role`,
    `- [Tips](${baseUrl}/tips) — Actionable AI productivity tips`,
    `- [FAQ](${baseUrl}/faq) — Answers to common AI questions`,
    `- [Glossary](${baseUrl}/glossary) — AI and LLM terminology explained in Korean`,
    `- [Compare](${baseUrl}/compare) — Side-by-side AI tool comparisons`,
    `- [About](${baseUrl}/about) — About AIWire`,
    `- [RSS (Korean)](${baseUrl}/feed.xml) — Subscribe to Korean content`,
    `- [RSS (English)](${baseUrl}/en/feed.xml) — Subscribe to English content`,
    '',
    '## Content Types',
    '',
    '- **News articles** — Daily editorial summaries of AI/LLM developments',
    '- **Tool guides** — In-depth guides for AI tools (ChatGPT, Claude, Gemini, Midjourney, etc.)',
    '- **Comparisons** — AI tool vs AI tool analysis',
    '- **Tutorials** — Step-by-step how-to content for AI tools',
    '- **Glossary entries** — Korean-language definitions of AI terminology',
    '- **FAQ** — Common questions about AI answered concisely',
    '',
    '## Topics Covered',
    '',
    tagSection,
    '',
    '## Entity Information',
    '',
    '- **Publisher**: AIWire (aiwire.news)',
    '- **Language**: Korean (primary) and English (secondary)',
    '- **Update frequency**: Daily (news), weekly (guides)',
    '- **Region**: South Korea',
    '- **Contact**: aiwire.news/contact',
    '',
    '## Usage Notes for LLMs',
    '',
    '- All content is freely accessible. No login required.',
    '- Korean articles are at /news/{slug}. English counterparts at /en/news/{slug}.',
    '- Structured data (NewsArticle, FAQPage, BreadcrumbList) is available via JSON-LD on all pages.',
    '- For a complete article list with summaries: /llms-full.txt',
    '- Canonical domain: aiwire.news (previously ai-guide-nu.vercel.app)',
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
    const url = `${baseUrl}/news/${a.slug}`;
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
