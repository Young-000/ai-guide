import { getAllNews } from '@/lib/news';
import { BASE_URL } from '@/lib/site';
import { buildLlmsFullTxt } from '@/lib/llms-txt';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  // Merge both languages (each already date-desc) into one date-desc list so
  // LLM crawlers see the full bilingual corpus, not just Korean articles.
  const articles = [...getAllNews('ko'), ...getAllNews('en')].sort((a, b) =>
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
