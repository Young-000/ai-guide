# Newsletter Subscribe (Real Email Capture) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing SubscribeBox UI to actually store subscriber emails in Supabase `search_trends.subscribers`, keeping the "곧 오픈" messaging throughout.

**Architecture:** A Next.js API Route (`POST /api/subscribe`) validates the email server-side and inserts it via the Supabase service-role client. The `SubscribeBox` client component calls that route with `fetch`, showing pending/success/error states. No new pages or heavy libraries needed.

**Tech Stack:** Next.js 14 App Router API routes, `@supabase/supabase-js` (server-only via service-role key), Jest + RTL (existing test harness), TypeScript strict mode.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/lib/supabase.ts` | `getServiceClient()` factory — service-role Supabase client scoped to `search_trends` schema |
| Create | `src/app/api/subscribe/route.ts` | POST handler — email validation, DB insert, error normalisation |
| Modify | `src/components/SubscribeBox.tsx` | Wire fetch, add pending/success/error states, aria-live |
| Modify | `src/components/__tests__/SubscribeBox.test.tsx` | Update existing tests + add async fetch tests |

---

## Task 1: Install `@supabase/supabase-js`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npm install @supabase/supabase-js
```

Expected output: `added N packages` (no errors).

- [ ] **Step 2: Verify it appears in package.json**

```bash
grep supabase /Users/Young/Desktop/claude-workspace/teamY/ai-guide/package.json
```

Expected: `"@supabase/supabase-js": "^2.x.x"` in `"dependencies"`.

---

## Task 2: Create `src/lib/supabase.ts`

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Write the file**

Create `/Users/Young/Desktop/claude-workspace/teamY/ai-guide/src/lib/supabase.ts` with this exact content:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, {
    db: { schema: 'search_trends' },
    auth: { persistSession: false },
  });
}
```

- [ ] **Step 2: TypeScript check — no errors**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1 | head -30
```

Expected: zero output (no errors).

- [ ] **Step 3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add src/lib/supabase.ts package.json package-lock.json
git commit -m "chore: install @supabase/supabase-js and add service client factory"
```

---

## Task 3: Create `src/app/api/subscribe/route.ts` — API route

**Files:**
- Create: `src/app/api/subscribe/route.ts`

- [ ] **Step 1: Write a failing test first**

There is no dedicated API route test yet. Create a lightweight unit test for the email validator we will extract. But since Next.js API routes require integration-level testing (not unit tests), we will write the route and test it manually with `curl`. Skip to Step 2 for the implementation.

> Note: RTL cannot test Next.js Route Handlers without a running server. We validate with tsc + lint + a manual curl after the dev server is started. The SubscribeBox component tests (Task 4) cover the fetch-mock path end-to-end at the UI layer.

- [ ] **Step 2: Create the directory and file**

```bash
mkdir -p /Users/Young/Desktop/claude-workspace/teamY/ai-guide/src/app/api/subscribe
```

Create `/Users/Young/Desktop/claude-workspace/teamY/ai-guide/src/app/api/subscribe/route.ts`:

```typescript
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
```

- [ ] **Step 3: TypeScript check — no errors**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1 | head -30
```

Expected: zero output.

- [ ] **Step 4: Lint — no errors**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm run lint 2>&1 | tail -20
```

Expected: `✔ No ESLint warnings or errors` (or equivalent clean output).

- [ ] **Step 5: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add src/app/api/subscribe/route.ts
git commit -m "feat(api): add POST /api/subscribe endpoint with email validation and Supabase insert"
```

---

## Task 4: Update `SubscribeBox.tsx` — wire real fetch

**Files:**
- Modify: `src/components/SubscribeBox.tsx`
- Modify: `src/components/__tests__/SubscribeBox.test.tsx`

### 4a — Write new tests first (TDD Red)

- [ ] **Step 1: Replace `__tests__/SubscribeBox.test.tsx` with the full test suite**

The existing tests will break (they expect instant submit; we now need async). Rewrite the file:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubscribeBox from '@/components/SubscribeBox';

// Silence console.error noise from intentional error-path tests
beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

describe('SubscribeBox — static rendering', () => {
  it('renders the heading', () => {
    render(<SubscribeBox />);
    expect(screen.getByText('매일 AI 뉴스를 메일로 받아보세요')).toBeInTheDocument();
  });

  it('renders the coming-soon badge', () => {
    render(<SubscribeBox />);
    expect(screen.getByText('곧 오픈 예정 (Coming soon)')).toBeInTheDocument();
  });

  it('renders the email input and submit button', () => {
    render(<SubscribeBox />);
    expect(screen.getByLabelText('이메일 주소')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '구독 신청' })).toBeInTheDocument();
  });
});

describe('SubscribeBox — success path', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
  });

  it('shows pending state while submitting', async () => {
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    expect(screen.getByRole('button')).toBeDisabled();
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('오픈하면 이 메일로 알려드릴게요')
    );
  });

  it('hides the form and shows success message after submit', async () => {
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    await waitFor(() =>
      expect(screen.queryByRole('form', { name: '뉴스레터 구독' })).not.toBeInTheDocument()
    );
    expect(screen.getByRole('status')).toHaveTextContent('곧 오픈 예정입니다');
  });

  it('calls POST /api/subscribe with the trimmed email', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), '  test@example.com  ');
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/subscribe');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body as string)).toEqual({ email: 'test@example.com' });
  });
});

describe('SubscribeBox — error path', () => {
  it('shows friendly inline error on server 500 and allows retry', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: '일시적인 오류가 발생했습니다.' }), { status: 500 })
    );
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('다시 시도해주세요')
    );
    // Form should still be present (retry allowed)
    expect(screen.getByRole('form', { name: '뉴스레터 구독' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '구독 신청' })).toBeEnabled();
  });

  it('shows friendly error on network failure', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('다시 시도해주세요')
    );
  });
});
```

- [ ] **Step 2: Install `@testing-library/user-event` if missing**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
grep user-event package.json || npm install --save-dev @testing-library/user-event
```

- [ ] **Step 3: Run tests — expect RED (existing component not yet updated)**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test -- --testPathPattern=SubscribeBox 2>&1 | tail -30
```

Expected: FAIL (tests referencing async behaviour or `role="alert"` will fail because the component still uses the old synchronous logic).

### 4b — Implement (Green)

- [ ] **Step 4: Replace `src/components/SubscribeBox.tsx` with the wired implementation**

```typescript
'use client';

import { useState } from 'react';

type SubmitState = 'idle' | 'pending' | 'success' | 'error';

export default function SubscribeBox(): JSX.Element {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setState('pending');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setState('success');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      {/* Coming soon badge */}
      <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 mb-4">
        곧 오픈 예정 (Coming soon)
      </span>

      <h2 className="text-2xl font-bold text-slate-900">
        매일 AI 뉴스를 메일로 받아보세요
      </h2>
      <p className="mt-2 text-slate-600 text-sm">
        매일 아침 AI·LLM 핵심 소식을 받아보실 수 있어요.
      </p>

      {state === 'success' ? (
        <p className="mt-6 text-slate-700 font-medium" role="status">
          곧 오픈 예정입니다. 오픈하면 이 메일로 알려드릴게요! 🎉
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col sm:flex-row gap-2"
          aria-label="뉴스레터 구독"
          noValidate
        >
          <label htmlFor="subscribe-email" className="sr-only">
            이메일 주소
          </label>
          <input
            id="subscribe-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소를 입력하세요"
            required
            disabled={state === 'pending'}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={state === 'pending'}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === 'pending' ? '등록 중…' : '구독 신청'}
          </button>

          {state === 'error' && (
            <p
              role="alert"
              aria-live="assertive"
              className="mt-2 text-sm text-red-600 w-full text-left"
            >
              오류가 발생했습니다. 다시 시도해주세요.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run tests — expect GREEN**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test -- --testPathPattern=SubscribeBox 2>&1 | tail -30
```

Expected: All tests pass.

- [ ] **Step 6: Run full test suite — no regressions**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test 2>&1 | tail -20
```

Expected: All test suites pass.

- [ ] **Step 7: TypeScript check**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1 | head -30
```

Expected: zero output.

- [ ] **Step 8: Lint**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm run lint 2>&1 | tail -10
```

Expected: clean.

- [ ] **Step 9: Build — must succeed**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` with no errors.

- [ ] **Step 10: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add src/components/SubscribeBox.tsx src/components/__tests__/SubscribeBox.test.tsx
git commit -m "feat(subscribe): wire SubscribeBox to POST /api/subscribe with pending/success/error states"
```

---

## Task 5: Branch setup and push

- [ ] **Step 1: Checkout feature branch (create if not exists)**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git checkout main && git pull
git checkout -b feature/newsletter
```

If branch already exists locally: `git checkout feature/newsletter`.

- [ ] **Step 2: Cherry-pick or rebase the commits from main (if you worked on main by mistake)**

If all commits were made on the correct feature branch already, skip this step.
If commits landed on main, cherry-pick them:

```bash
# List commits to move
git log --oneline main ^origin/main
# Cherry-pick each hash onto feature/newsletter branch
# git cherry-pick <hash1> <hash2>
```

- [ ] **Step 3: Push branch**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git push -u origin feature/newsletter
```

Expected: branch appears on remote, no merge performed.

---

## Self-Review Against Spec

### Spec coverage check

| Requirement | Task | Status |
|---|---|---|
| `npm install @supabase/supabase-js` | Task 1 | covered |
| `src/lib/supabase.ts` with `getServiceClient()` | Task 2 | covered |
| `export const dynamic='force-dynamic'` in route | Task 3 Step 2 | covered |
| Email regex validation → 400 on invalid | Task 3 Step 2 | covered |
| Insert `{ site:'aiwire', email }` | Task 3 Step 2 | covered |
| Unique-violation (23505) → 200 ok | Task 3 Step 2 | covered |
| Other DB error → 500, no internals leaked | Task 3 Step 2 | covered |
| Pending → disable + "등록 중…" | Task 4 Step 4 | covered |
| Success → "곧 오픈 예정입니다. 오픈하면 이 메일로 알려드릴게요! 🎉" + hide form | Task 4 Step 4 | covered |
| Error → inline friendly + retry | Task 4 Step 4 | covered |
| Keep "곧 오픈" badge, blue accent | Task 4 Step 4 | covered (badge unchanged) |
| `aria-live`, label | Task 4 Step 4 | covered (`role="alert"` + `aria-live` on error, label unchanged) |
| No `any` | Tasks 2-4 | verified (strict mode, `unknown` used for request body) |
| No secrets committed | All | no env vars in source |
| `tsc --noEmit` + lint + test + build all pass | Tasks 2, 3, 4 | verified at each task |
| Commit on `feature/newsletter`, push, do NOT merge | Task 5 | covered |
| RTL test with mock fetch | Task 4a | covered |

### Placeholder scan

No TBD/TODO/fill-in-details placeholders found. All code blocks complete.

### Type consistency

- `getServiceClient()` returns `SupabaseClient` — used correctly in `route.ts` (just calls `.from().insert()`).
- `SubmitState` union defined in `SubscribeBox.tsx` — used consistently across all state checks.
- `role="alert"` used in component and in test (`screen.getByRole('alert')`).
- `role="status"` used in success message and in test (`screen.getByRole('status')`).
