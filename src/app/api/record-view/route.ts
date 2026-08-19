import { NextRequest, NextResponse } from 'next/server';
import { recordView } from '@/lib/page-views';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let path: unknown;
  try {
    const body = await request.json();
    path = body?.path;
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  if (!path || typeof path !== 'string') {
    return NextResponse.json({ error: 'path is required' }, { status: 400 });
  }

  // Fire-and-forget — errors are logged inside recordView
  await recordView(path);
  return NextResponse.json({ ok: true });
}
