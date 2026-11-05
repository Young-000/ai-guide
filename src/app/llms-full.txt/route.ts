import { getAllNews, getThinArticleSlugs } from '@/lib/news';
import { BASE_URL } from '@/lib/site';
import { buildLlmsFullTxt } from '@/lib/llms-txt';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  // Merge both languages (each already date-desc) into one date-desc list so
  // LLM crawlers see the full bilingual corpus, not just Korean articles.
  // Thin articles are noindex and absent from the sitemap; keep this list on
  // the same footing so AI crawlers are not pointed at pages we hold back.
  const thinSlugs = getThinArticleSlugs();
  const articles = [...getAllNews('ko'), ...getAllNews('en')]
    .filter((n) => !thinSlugs.has(n.slug))
    .sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
  const body = buildLlmsFullTxt(articles, BASE_URL, 30);
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
