import { NextResponse } from 'next/server';
import { buildRssXml } from '@/lib/rss';

export const dynamic = 'force-static';

export function GET(): NextResponse {
  return new NextResponse(buildRssXml('en'), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
