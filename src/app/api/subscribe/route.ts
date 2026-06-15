import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
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
