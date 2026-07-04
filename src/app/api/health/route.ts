import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// vercel.json rewrites /health -> /api/health for uptime checks.
export function GET(): NextResponse {
  return NextResponse.json({ status: 'ok' });
}
