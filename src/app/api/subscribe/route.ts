import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { createTokenBucketRateLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Best-effort per-IP guard against abuse of this unauthenticated endpoint.
// 5 submissions/minute is generous for a legitimate subscribe form.
const RATE_LIMIT_CAPACITY = 5;
const RATE_LIMIT_REFILL_MS = 60_000;
const rateLimiter = createTokenBucketRateLimiter(RATE_LIMIT_CAPACITY, RATE_LIMIT_REFILL_MS);

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!rateLimiter.check(getClientIp(request))) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 },
    );
  }

  let email: unknown;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    email = body.email;
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  try {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from('subscribers')
      .insert({ site: 'aiwire', email: normalised });

    if (error) {
      // Unique-violation: already subscribed — treat as success
      if (error.code === '23505') {
        return NextResponse.json({ ok: true });
      }
      console.error('[subscribe] Supabase error:', error.message);
      return NextResponse.json({ error: '일시적인 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[subscribe] Unexpected error:', err);
    return NextResponse.json({ error: '일시적인 오류가 발생했습니다.' }, { status: 500 });
  }
}
