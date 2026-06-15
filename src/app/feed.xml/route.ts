import { NextResponse } from 'next/server';
import { buildRssXml } from '@/lib/rss';

// Content is read from static markdown files — bake at build time.
export const dynamic = 'force-static';

export function GET(): NextResponse {
  return new NextResponse(buildRssXml('ko'), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
