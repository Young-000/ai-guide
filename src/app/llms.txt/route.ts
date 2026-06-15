import { getAllTags } from '@/lib/news';
import { BASE_URL } from '@/lib/site';
import { buildLlmsTxt } from '@/lib/llms-txt';

export function GET(): Response {
  const tags = getAllTags('ko');
  const body = buildLlmsTxt(tags, BASE_URL);
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}
