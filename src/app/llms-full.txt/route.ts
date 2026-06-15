import { getAllNews } from '@/lib/news';
import { BASE_URL } from '@/lib/site';
import { buildLlmsFullTxt } from '@/lib/llms-txt';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  const articles = getAllNews('ko');
  const body = buildLlmsFullTxt(articles, BASE_URL, 30);
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
