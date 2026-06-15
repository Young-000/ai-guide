# AdFit Readiness — Legal Pages + Category Nav + Media Home

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade aiwire.news into a browsable AI news media site that passes Kakao AdFit ad review by adding required legal pages, tag-based category browsing, a media-style homepage, and cleaning up stale URL references.

**Architecture:** Static pages for legal content; `getAllTags`/`getNewsByTag` added to `src/lib/news.ts` to power a new `/news/topic/[tag]` SSG route; `LatestNewsSection` React Server Component prepended to the home page; Header/Footer updated with media-style nav and legal links; all hardcoded `ai-guide-nu.vercel.app` references replaced with the `BASE_URL` constant from `src/lib/site.ts`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, gray-matter, Jest + React Testing Library.

---

## File Map

### New files
| File | Responsibility |
|---|---|
| `src/app/about/page.tsx` | /about — 사이트 소개 + 편집 원칙 (AdFit required) |
| `src/app/privacy/page.tsx` | /privacy — 개인정보처리방침 (AdFit required) |
| `src/app/contact/page.tsx` | /contact — 문의 안내 (AdFit required) |
| `src/app/news/topic/[tag]/page.tsx` | /news/topic/[tag] — SSG tag-filtered news list |
| `src/components/news/TagChips.tsx` | Tag navigation chip list (shared by /news and /news/topic/[tag]) |
| `src/components/home/LatestNewsSection.tsx` | RSC: latest 6 ko news headlines for homepage |
| `src/components/news/__tests__/TagChips.test.tsx` | Unit/render tests for TagChips |
| `src/lib/__tests__/news-tags.test.ts` | Tests for `getAllTags` and `getNewsByTag` |

### Modified files
| File | Change |
|---|---|
| `src/lib/news.ts` | Add `getAllTags(lang, root?)` and `getNewsByTag(lang, tag, root?)` |
| `src/app/news/page.tsx` | Import TagChips, show tag chips above article list |
| `src/components/news/NewsListView.tsx` | Accept optional `topSlot?: React.ReactNode` prop for tag chips |
| `src/app/page.tsx` | Prepend `<LatestNewsSection />` above existing landing sections |
| `src/components/Footer.tsx` | Add About/Privacy/Contact links + copyright + AI notice |
| `src/components/Header.tsx` | Add About link to desktop nav |
| `src/app/sitemap.ts` | Add /about, /privacy, /contact, /news/topic/[tag] entries |
| `src/app/robots.ts` | Fix hardcoded URL → `${BASE_URL}/sitemap.xml` |
| `src/app/layout.tsx` | Fix canonical + OG URLs to use `BASE_URL` |
| `src/app/page.tsx` (JSON-LD) | Fix hardcoded URL in JSON-LD to use `BASE_URL` |
| 10 other pages | Replace `const BASE_URL = 'https://ai-guide-nu.vercel.app'` with import from `@/lib/site` |

---

## Task 1: Create feature branch (handle uncommitted changes)

**Files:** git only

- [ ] **Step 1: Commit the pending uncommitted work before branching**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add src/app/page.tsx src/app/globals.css CLAUDE.md .github/workflows/ci.yml
git add src/components/landing/
git commit -m "refactor: landing page sections + globals.css cleanup"
```

Expected output: `[main <sha>] refactor: landing page sections + globals.css cleanup`

- [ ] **Step 2: Create feature branch**

```bash
git checkout -b feature/adfit-readiness
```

Expected output: `Switched to a new branch 'feature/adfit-readiness'`

---

## Task 2: Fix all hardcoded `ai-guide-nu.vercel.app` URL references

**Files:**
- Modify: `src/app/robots.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/learn/page.tsx`
- Modify: `src/app/faq/page.tsx`
- Modify: `src/app/tips/page.tsx`
- Modify: `src/app/tips/[slug]/page.tsx`
- Modify: `src/app/use-cases/page.tsx`
- Modify: `src/app/use-cases/[slug]/page.tsx`
- Modify: `src/app/situations/[slug]/page.tsx`
- Modify: `src/app/tools/[slug]/page.tsx`

- [ ] **Step 1: Fix `robots.ts`**

Replace the entire file content:

```typescript
// src/app/robots.ts
import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Fix `layout.tsx` canonical + OG URLs**

In `src/app/layout.tsx`, add `import { BASE_URL } from '@/lib/site';` after the existing imports, then replace the three hardcoded URL strings:

Old:
```typescript
    canonical: 'https://ai-guide-nu.vercel.app',
```
New:
```typescript
    canonical: BASE_URL,
```

Old (in openGraph):
```typescript
    url: 'https://ai-guide-nu.vercel.app',
```
New:
```typescript
    url: BASE_URL,
```

- [ ] **Step 3: Fix `page.tsx` JSON-LD**

In `src/app/page.tsx`, add `import { BASE_URL } from '@/lib/site';` and replace:

Old:
```typescript
  url: 'https://ai-guide-nu.vercel.app',
```
New:
```typescript
  url: BASE_URL,
```

- [ ] **Step 4: Fix the 8 pages that declare a local `BASE_URL` constant**

For each of these 8 files, remove the local declaration and add the import:

Files: `src/app/learn/page.tsx`, `src/app/faq/page.tsx`, `src/app/tips/page.tsx`, `src/app/tips/[slug]/page.tsx`, `src/app/use-cases/page.tsx`, `src/app/use-cases/[slug]/page.tsx`, `src/app/situations/[slug]/page.tsx`, `src/app/tools/[slug]/page.tsx`

In each file:
- Remove: `const BASE_URL = 'https://ai-guide-nu.vercel.app';`
- Add: `import { BASE_URL } from '@/lib/site';`

- [ ] **Step 5: Verify no old URL remains**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
grep -r "ai-guide-nu.vercel.app" src/ --include="*.ts" --include="*.tsx"
```

Expected output: (empty — no matches)

- [ ] **Step 6: Run TypeScript check and commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "fix: replace all hardcoded ai-guide-nu URLs with BASE_URL constant"
```

---

## Task 3: Add `getAllTags` and `getNewsByTag` to `src/lib/news.ts`

**Files:**
- Modify: `src/lib/news.ts`
- Create: `src/lib/__tests__/news-tags.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `src/lib/__tests__/news-tags.test.ts`:

```typescript
import path from 'node:path';
import { getAllTags, getNewsByTag } from '@/lib/news';

const FIXTURES = path.join(__dirname, 'fixtures', 'news');

describe('getAllTags', () => {
  it('returns sorted unique tags from all ko articles', () => {
    // ko fixtures: alpha=['LLM'], beta=['OpenAI','LLM'], gamma=['LLM']
    // unique sorted: ['LLM', 'OpenAI']
    expect(getAllTags('ko', FIXTURES)).toEqual(['LLM', 'OpenAI']);
  });

  it('returns empty array when no articles exist', () => {
    expect(getAllTags('ko', path.join(FIXTURES, '__missing__'))).toEqual([]);
  });

  it('returns tags only for the requested lang', () => {
    // en fixture only has alpha with tag 'LLM'
    expect(getAllTags('en', FIXTURES)).toEqual(['LLM']);
  });
});

describe('getNewsByTag', () => {
  it('returns only articles that include the tag', () => {
    const items = getNewsByTag('ko', 'OpenAI', FIXTURES);
    expect(items).toHaveLength(1);
    expect(items[0]?.slug).toBe('beta');
  });

  it('returns all articles when multiple have the same tag', () => {
    const items = getNewsByTag('ko', 'LLM', FIXTURES);
    // alpha, beta, gamma all have LLM — sorted by date desc: gamma, beta, alpha
    expect(items.map((i) => i.slug)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('returns empty array for a tag that does not exist', () => {
    expect(getNewsByTag('ko', 'nope', FIXTURES)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npx jest src/lib/__tests__/news-tags.test.ts --no-coverage 2>&1 | tail -10
```

Expected: FAIL — `getAllTags is not a function` (or similar export error)

- [ ] **Step 3: Add `getAllTags` and `getNewsByTag` to `src/lib/news.ts`**

Append the following at the end of `src/lib/news.ts` (after the existing `getNewsSlugs` function):

```typescript
/**
 * Returns a sorted list of unique tags across all articles in the given lang.
 */
export function getAllTags(lang: NewsLang, root: string = CONTENT_ROOT): string[] {
  const tagSet = new Set<string>();
  for (const article of getAllNews(lang, root)) {
    for (const tag of article.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort();
}

/**
 * Returns articles (date-desc) that include the given tag.
 */
export function getNewsByTag(lang: NewsLang, tag: string, root: string = CONTENT_ROOT): NewsMeta[] {
  return getAllNews(lang, root).filter((a) => a.tags.includes(tag));
}
```

- [ ] **Step 4: Also update the import in `news.ts` — `NewsMeta` is already exported, no change needed.**

Verify the imports at the top of `news.ts`:
```typescript
import type { NewsArticle, NewsFrontmatter, NewsLang, NewsMeta } from '@/types/news';
```
`NewsMeta` is already imported — no change needed.

- [ ] **Step 5: Run tests — confirm they pass**

```bash
npx jest src/lib/__tests__/news-tags.test.ts --no-coverage 2>&1 | tail -10
```

Expected: PASS (3 describe blocks, 6 tests)

- [ ] **Step 6: Run full test suite to confirm no regressions**

```bash
npx jest --no-coverage 2>&1 | tail -15
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/news.ts src/lib/__tests__/news-tags.test.ts
git commit -m "feat: getAllTags + getNewsByTag utility functions with tests"
```

---

## Task 4: Create `TagChips` component + test

**Files:**
- Create: `src/components/news/TagChips.tsx`
- Create: `src/components/news/__tests__/TagChips.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/news/__tests__/TagChips.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import TagChips from '@/components/news/TagChips';

const TAGS = ['LLM', 'OpenAI', '모델'];

describe('TagChips', () => {
  it('renders a link for each tag', () => {
    render(<TagChips tags={TAGS} />);
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('each link points to /news/topic/<encoded-tag>', () => {
    render(<TagChips tags={TAGS} />);
    const llmLink = screen.getByRole('link', { name: 'LLM' });
    expect(llmLink).toHaveAttribute('href', '/news/topic/LLM');
  });

  it('renders the "All" link to /news when showAll is true', () => {
    render(<TagChips tags={TAGS} showAll />);
    expect(screen.getByRole('link', { name: '전체' })).toHaveAttribute('href', '/news');
  });

  it('highlights the active tag with different styling', () => {
    render(<TagChips tags={TAGS} activeTag="LLM" />);
    const activeLi = screen.getByRole('link', { name: 'LLM' });
    // active tag has text-white class
    expect(activeLi.className).toMatch(/text-white/);
  });

  it('renders nothing when tags array is empty', () => {
    const { container } = render(<TagChips tags={[]} />);
    expect(container.querySelector('ul')).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
npx jest src/components/news/__tests__/TagChips.test.tsx --no-coverage 2>&1 | tail -5
```

Expected: FAIL — module not found

- [ ] **Step 3: Create `src/components/news/TagChips.tsx`**

```typescript
import Link from 'next/link';

type TagChipsProps = {
  tags: string[];
  activeTag?: string;
  showAll?: boolean;
};

export default function TagChips({ tags, activeTag, showAll = false }: TagChipsProps): JSX.Element {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="뉴스 카테고리 태그">
      {showAll && (
        <li>
          <Link
            href="/news"
            className={`inline-block text-sm px-3 py-1.5 rounded-full border transition-colors ${
              !activeTag
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            전체
          </Link>
        </li>
      )}
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/news/topic/${encodeURIComponent(tag)}`}
            className={`inline-block text-sm px-3 py-1.5 rounded-full border transition-colors ${
              activeTag === tag
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
npx jest src/components/news/__tests__/TagChips.test.tsx --no-coverage 2>&1 | tail -5
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/news/TagChips.tsx src/components/news/__tests__/TagChips.test.tsx
git commit -m "feat: TagChips component for tag-based news navigation"
```

---

## Task 5: Legal pages — About

**Files:**
- Create: `src/app/about/page.tsx`

- [ ] **Step 1: Create `src/app/about/page.tsx`**

```typescript
import type { Metadata } from 'next';
import Link from 'next/link';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '소개 | AIWire',
  description:
    'AIWire는 AI·LLM 분야의 최신 소식을 매일 한국어와 영어로 정리하는 미디어입니다. 출처를 명시하고 핵심만 요약·해설합니다.',
  alternates: { canonical: `${BASE_URL}/about` },
};

export default function AboutPage(): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">AIWire 소개</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">우리가 하는 일</h2>
        <p className="text-gray-700 leading-relaxed">
          AIWire는 AI·LLM(대형 언어 모델) 분야의 최신 동향을 매일 <strong>한국어와 영어</strong>로
          정리해 전달하는 뉴스 미디어입니다. 학술 논문 발표부터 주요 AI 기업의 제품 업데이트, 정책 동향,
          연구 결과까지 — 핵심만 추려 빠르게 읽을 수 있도록 요약·해설합니다.
        </p>
        <p className="mt-4 text-gray-700 leading-relaxed">
          인터넷에 넘쳐나는 AI 관련 정보 중 실제로 중요한 내용을 선별해, 바쁜 독자도
          하루 5분 안에 AI 업계 핵심 흐름을 파악할 수 있도록 하는 것이 우리의 목표입니다.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">편집 원칙</h2>
        <ul className="space-y-4 text-gray-700">
          <li className="flex gap-3">
            <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
            <div>
              <strong className="text-gray-900">출처 명시</strong>
              <p className="mt-1 text-sm">
                모든 기사에는 원문 출처 링크를 첨부합니다. 독자가 직접 원문을 확인할 수 있도록
                출처 기관과 URL을 함께 표기합니다.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
            <div>
              <strong className="text-gray-900">재작성·요약 (복제 금지)</strong>
              <p className="mt-1 text-sm">
                원문을 그대로 복사하지 않습니다. 각 기사는 편집팀이 직접 읽고 핵심 내용을
                재작성·요약합니다. 인용이 필요한 경우 명확히 표시합니다.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
            <div>
              <strong className="text-gray-900">AI 보조 작성 고지</strong>
              <p className="mt-1 text-sm">
                일부 기사는 AI 도구를 활용해 초안을 작성하며, 편집자가 사실 확인 및 최종 검수를
                거쳐 게재합니다. AI 생성 콘텐츠임을 별도 표시하지 않더라도 모든 기사는
                편집자의 검토를 통과한 것입니다.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">4</span>
            <div>
              <strong className="text-gray-900">사실 확인</strong>
              <p className="mt-1 text-sm">
                명백한 오류나 오해를 유발하는 내용이 포함된 경우 정정 기사를 게재하거나
                기존 기사를 수정합니다. 수정 내역은 기사 하단에 명시합니다.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">운영 방침</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
          <li>특정 기업이나 제품의 광고성 기사를 정론 기사처럼 제공하지 않습니다.</li>
          <li>독자의 개인정보는 최소한으로 수집하며, 제3자에게 무단 제공하지 않습니다.</li>
          <li>사이트에는 Google AdSense 및 Kakao AdFit 광고가 표시될 수 있습니다.</li>
          <li>외부 링크는 새 탭에서 열리며, 당사는 외부 사이트의 내용에 책임을 지지 않습니다.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">문의</h2>
        <p className="text-gray-700">
          기사 오류 신고, 협업 제안, 저작권 관련 문의는{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            문의 페이지
          </Link>
          를 이용해 주세요.
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page builds**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: /about page — site identity + editorial principles (AdFit required)"
```

---

## Task 6: Legal pages — Privacy Policy

**Files:**
- Create: `src/app/privacy/page.tsx`

- [ ] **Step 1: Create `src/app/privacy/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '개인정보처리방침 | AIWire',
  description: 'AIWire 개인정보처리방침입니다.',
  alternates: { canonical: `${BASE_URL}/privacy` },
};

export default function PrivacyPage(): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-gray-500">최종 수정일: 2026년 6월 16일</p>

      <p className="mt-6 text-gray-700 leading-relaxed">
        AIWire(이하 &quot;사이트&quot;)는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수합니다.
        본 방침은 사이트가 수집하는 정보, 이용 목적, 제3자 제공 여부 등을 안내합니다.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">1. 수집하는 개인정보 항목 및 수집 방법</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          본 사이트는 회원가입 없이 이용할 수 있으며, 이용자가 직접 입력하는 개인정보를 수집하지 않습니다.
          다만, 아래와 같이 자동 수집되는 정보가 있습니다.
        </p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>서버 접속 로그: IP 주소, 접속 일시, 브라우저 정보, 방문 페이지</li>
          <li>쿠키 및 유사 기술: 광고 및 서비스 개선 목적</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">2. 개인정보의 수집 및 이용 목적</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>서비스 운영 및 품질 개선</li>
          <li>통계 분석을 통한 콘텐츠 개선</li>
          <li>광고 게재 (Google AdSense, Kakao AdFit)</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">3. 쿠키(Cookie) 사용</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 사이트는 이용 편의 향상과 광고 제공을 위해 쿠키를 사용합니다.
          쿠키는 브라우저에 저장되는 소량의 데이터로, 브라우저 설정에서 거부하거나 삭제할 수 있습니다.
          단, 쿠키를 거부하면 일부 서비스 이용이 제한될 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">4. 제3자 광고 쿠키</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          본 사이트는 아래 제3자 광고 서비스를 이용하며, 각 서비스는 고유한 쿠키를 설정합니다.
          이 쿠키는 해당 회사의 개인정보처리방침에 따라 관리됩니다.
        </p>
        <ul className="space-y-3 text-sm text-gray-700">
          <li>
            <strong>Google AdSense</strong> — 맞춤형 광고 제공 목적으로 Google LLC가 쿠키를 사용합니다.
            이용자는{' '}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google 광고 설정
            </a>
            에서 맞춤 광고를 거부할 수 있습니다.
          </li>
          <li>
            <strong>Kakao AdFit</strong> — 관련성 높은 광고를 제공하기 위해 Kakao Corp.가 쿠키를 사용합니다.
            자세한 내용은{' '}
            <a
              href="https://policy.kakao.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              카카오 개인정보처리방침
            </a>
            을 참고하세요.
          </li>
          <li>
            <strong>Google Analytics 4</strong> — 사이트 이용 통계 분석 목적으로 Google LLC가 데이터를 수집합니다.
            Google의 데이터 처리에 대한 자세한 내용은{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google 개인정보처리방침
            </a>
            을 참고하세요.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">5. 개인정보의 보유 및 이용 기간</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          자동 수집 서버 로그는 최대 6개월간 보관 후 삭제합니다. 법령에 특별한 규정이 있는 경우
          해당 기간 동안 보관합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">6. 개인정보의 제3자 제공</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 사이트는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
          단, 제4조의 제3자 광고 쿠키 서비스는 각 회사의 약관에 따라 데이터를 처리합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">7. 이용자의 권리</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          이용자는 언제든지 수집된 개인정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.
          관련 문의는 아래 연락처로 보내주세요.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">8. 개인정보 보호책임자</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>담당: AIWire 운영팀</li>
          <li>이메일: <a href="mailto:wkddudwoek@gmail.com" className="text-blue-600 hover:underline">wkddudwoek@gmail.com</a></li>
        </ul>
        <p className="mt-3 text-sm text-gray-700">
          개인정보 관련 불만이 있으실 경우 개인정보보호위원회(국번 없이 182) 또는
          한국인터넷진흥원 개인정보침해 신고센터(국번 없이 118)에 신고하실 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">9. 방침의 변경</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          본 방침의 내용이 변경될 경우, 변경 사항을 사이트 내 공지사항 또는 이 페이지를 통해 안내합니다.
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/privacy/page.tsx
git commit -m "feat: /privacy page — Korean privacy policy with AdFit/AdSense/GA4 cookie disclosure"
```

---

## Task 7: Legal pages — Contact

**Files:**
- Create: `src/app/contact/page.tsx`

- [ ] **Step 1: Create `src/app/contact/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '문의 | AIWire',
  description: 'AIWire에 기사 오류 신고, 협업 제안, 저작권 문의를 보내주세요.',
  alternates: { canonical: `${BASE_URL}/contact` },
};

export default function ContactPage(): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">문의</h1>

      <p className="mt-6 text-gray-700 leading-relaxed">
        AIWire에 대한 의견이나 문의 사항은 아래 이메일로 보내주세요.
        영업일 기준 2~3일 이내에 답변 드리겠습니다.
      </p>

      <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-4">문의 이메일</h2>
        <a
          href="mailto:wkddudwoek@gmail.com"
          className="text-blue-600 text-lg font-medium hover:underline"
        >
          wkddudwoek@gmail.com
        </a>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">문의 유형</h2>
        <ul className="space-y-3 text-gray-700 text-sm">
          <li className="flex gap-3">
            <span className="font-medium text-gray-900 w-28 flex-shrink-0">기사 오류 신고</span>
            <span>기사 내용 중 사실 오류나 오해를 유발하는 표현이 있으면 알려주세요. 검토 후 정정하겠습니다.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-medium text-gray-900 w-28 flex-shrink-0">저작권 문의</span>
            <span>콘텐츠 저작권 관련 문의를 보내주시면 즉시 검토합니다.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-medium text-gray-900 w-28 flex-shrink-0">협업·제휴</span>
            <span>콘텐츠 협업, 뉴스레터 파트너십 등 제안을 환영합니다.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-medium text-gray-900 w-28 flex-shrink-0">광고 문의</span>
            <span>광고 게재 및 스폰서십 관련 문의도 같은 이메일로 보내주세요.</span>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">개인정보 문의</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          개인정보 열람·정정·삭제·처리 정지 요청은 동일한 이메일로 보내주세요.
          자세한 내용은{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            개인정보처리방침
          </a>
          을 참고하세요.
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | tail -5
git add src/app/contact/page.tsx
git commit -m "feat: /contact page — email contact + inquiry types (AdFit required)"
```

---

## Task 8: Tag-based category route `/news/topic/[tag]`

**Files:**
- Create: `src/app/news/topic/[tag]/page.tsx`

- [ ] **Step 1: Create `src/app/news/topic/[tag]/page.tsx`**

```typescript
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllTags, getNewsByTag } from '@/lib/news';
import TagChips from '@/components/news/TagChips';
import NewsCard from '@/components/news/NewsCard';
import { BASE_URL } from '@/lib/site';

type Params = { tag: string };

export function generateStaticParams(): Params[] {
  return getAllTags('ko').map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `${tag} 뉴스 | AIWire`,
    description: `AI·LLM 관련 '${tag}' 태그 기사 목록입니다.`,
    alternates: { canonical: `${BASE_URL}/news/topic/${encodeURIComponent(tag)}` },
  };
}

export default function TopicPage({ params }: { params: Params }): JSX.Element {
  const tag = decodeURIComponent(params.tag);
  const allTags = getAllTags('ko');

  if (!allTags.includes(tag)) notFound();

  const items = getNewsByTag('ko', tag);

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/news" className="text-sm text-blue-500 hover:text-blue-600">
        ← 전체 뉴스
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        태그:{' '}
        <span className="text-blue-600">{tag}</span>
      </h1>
      <p className="mt-1 text-sm text-gray-500">{items.length}건의 기사</p>

      <div className="mt-4">
        <TagChips tags={allTags} activeTag={tag} showAll />
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-gray-500">해당 태그의 기사가 없습니다.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <NewsCard key={item.slug} lang="ko" item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/news/topic/
git commit -m "feat: /news/topic/[tag] SSG category route with tag chip navigation"
```

---

## Task 9: Add TagChips to `/news` list page

**Files:**
- Modify: `src/components/news/NewsListView.tsx`
- Modify: `src/app/news/page.tsx`

- [ ] **Step 1: Add `topSlot` prop to `NewsListView`**

Current `NewsListView` signature:
```typescript
type NewsListViewProps = {
  lang: NewsLang;
  items: readonly NewsMeta[];
};
```

Update to:
```typescript
type NewsListViewProps = {
  lang: NewsLang;
  items: readonly NewsMeta[];
  topSlot?: React.ReactNode;
};
```

And in the JSX, add after the subtitle `<p>` and before the `{items.length === 0 ?...}` check:

```typescript
      {topSlot && <div className="mt-4">{topSlot}</div>}
```

Full updated component:

```typescript
import type { NewsLang, NewsMeta } from '@/types/news';
import NewsCard from './NewsCard';

type NewsListViewProps = {
  lang: NewsLang;
  items: readonly NewsMeta[];
  topSlot?: React.ReactNode;
};

const COPY: Record<NewsLang, { heading: string; subtitle: string; empty: string }> = {
  ko: {
    heading: 'AI · LLM 뉴스',
    subtitle: '매일 업데이트되는 AI·LLM 최신 소식을 핵심만 정리했습니다.',
    empty: '아직 게시된 뉴스가 없습니다.',
  },
  en: {
    heading: 'AI & LLM News',
    subtitle: 'Daily-updated, distilled coverage of the latest in AI and LLMs.',
    empty: 'No news published yet.',
  },
};

export default function NewsListView({ lang, items, topSlot }: NewsListViewProps): JSX.Element {
  const copy = COPY[lang];
  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">{copy.heading}</h1>
      <p className="mt-2 text-gray-600">{copy.subtitle}</p>
      {topSlot && <div className="mt-4">{topSlot}</div>}
      {items.length === 0 ? (
        <p className="mt-8 text-gray-500">{copy.empty}</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <NewsCard key={item.slug} lang={lang} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Update `src/app/news/page.tsx` to pass TagChips as `topSlot`**

```typescript
import type { Metadata } from 'next';
import { getAllNews, getAllTags } from '@/lib/news';
import NewsListView from '@/components/news/NewsListView';
import TagChips from '@/components/news/TagChips';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI · LLM 뉴스 | AIWire',
  description: '매일 업데이트되는 AI·LLM 최신 소식을 한국어로 핵심만 정리했습니다.',
  alternates: {
    canonical: `${BASE_URL}/news`,
    languages: {
      'ko-KR': `${BASE_URL}/news`,
      'en-US': `${BASE_URL}/en/news`,
      'x-default': `${BASE_URL}/news`,
    },
  },
  openGraph: { locale: 'ko_KR' },
};

export default function NewsPage(): JSX.Element {
  const items = getAllNews('ko');
  const tags = getAllTags('ko');
  return (
    <NewsListView
      lang="ko"
      items={items}
      topSlot={<TagChips tags={tags} />}
    />
  );
}
```

- [ ] **Step 3: Verify existing NewsListView tests still pass**

```bash
npx jest src/components/news/__tests__/NewsListView.test.tsx --no-coverage 2>&1 | tail -5
```

Expected: PASS (3 tests — `topSlot` is optional so existing tests are unaffected)

- [ ] **Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | tail -5
git add src/components/news/NewsListView.tsx src/app/news/page.tsx
git commit -m "feat: add tag chip navigation to /news list page"
```

---

## Task 10: `LatestNewsSection` RSC + homepage prepend

**Files:**
- Create: `src/components/home/LatestNewsSection.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create `src/components/home/LatestNewsSection.tsx`**

This is a React Server Component (no `'use client'`) — it reads the filesystem at request/build time.

```typescript
import Link from 'next/link';
import { getAllNews, getAllTags } from '@/lib/news';
import TagChips from '@/components/news/TagChips';

export default function LatestNewsSection(): JSX.Element {
  const items = getAllNews('ko').slice(0, 6);
  const tags = getAllTags('ko');

  return (
    <section
      aria-labelledby="latest-news-heading"
      className="bg-white border-b border-gray-100 py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="latest-news-heading"
            className="text-lg font-bold text-gray-900"
          >
            최신 AI 뉴스
          </h2>
          <Link
            href="/news"
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            전체 보기 →
          </Link>
        </div>

        {tags.length > 0 && (
          <div className="mb-4">
            <TagChips tags={tags} />
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-gray-400">아직 게시된 뉴스가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.slug} className="py-3">
                <Link
                  href={`/news/${item.slug}`}
                  className="group flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                      {item.summary}
                    </p>
                  </div>
                  <time
                    dateTime={item.date}
                    className="flex-shrink-0 text-xs text-gray-400 mt-0.5"
                  >
                    {item.date}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update `src/app/page.tsx` to prepend `LatestNewsSection`**

Current `page.tsx` imports and exports:
```typescript
import {
  HeroSection,
  PainPointsSection,
  HowItWorksSection,
  PopularSituationsSection,
  StatsSection,
  QuickSearchSection,
  FinalCtaSection,
} from '@/components/landing';
```

Add import at top:
```typescript
import LatestNewsSection from '@/components/home/LatestNewsSection';
import { BASE_URL } from '@/lib/site';
```

Replace the JSON-LD `url` value:
```typescript
  url: BASE_URL,
```

Add `<LatestNewsSection />` as the first child of the wrapper div:
```typescript
export default function Home(): JSX.Element {
  return (
    <div>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(JSON_LD_DATA),
        }}
      />

      {/* Latest AI news feed — media-style above the fold */}
      <LatestNewsSection />

      {/* Section 1: Hero - Value proposition + CTA */}
      <HeroSection />

      {/* Section 2: Pain Points - Persona empathy cards */}
      <PainPointsSection />

      {/* Section 3: How It Works - 3-step process */}
      <HowItWorksSection />

      {/* Section 4: Popular Situations */}
      <div id="popular-situations">
        <PopularSituationsSection />
      </div>

      {/* Section 5: Stats */}
      <StatsSection />

      {/* Section 6: Quick Search */}
      <QuickSearchSection />

      {/* Section 7: Final CTA */}
      <FinalCtaSection />
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/home/ src/app/page.tsx
git commit -m "feat: latest news feed section on homepage (media-style above the fold)"
```

---

## Task 11: Update Header + Footer

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Update `Footer` with legal links + notice**

Replace the entire `Footer` function in `src/components/Footer.tsx`:

```typescript
export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white" role="contentinfo">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Site brand */}
        <p className="text-sm font-semibold text-gray-900">AIWire</p>
        <p className="mt-1 text-xs text-gray-500">
          AI·LLM 최신 소식을 매일 한국어·영어로 정리합니다.
        </p>

        {/* Legal nav */}
        <nav
          aria-label="페이지 링크"
          className="mt-4 flex flex-wrap gap-x-4 gap-y-2"
        >
          <a href="/about" className="text-xs text-gray-500 hover:text-gray-700">소개</a>
          <a href="/privacy" className="text-xs text-gray-500 hover:text-gray-700">개인정보처리방침</a>
          <a href="/contact" className="text-xs text-gray-500 hover:text-gray-700">문의</a>
          <a href="/news" className="text-xs text-gray-500 hover:text-gray-700">뉴스</a>
          <a href="/tools" className="text-xs text-gray-500 hover:text-gray-700">도구</a>
        </nav>

        {/* Copyright + AI notice */}
        <p className="mt-4 text-xs text-gray-400">
          © {new Date().getFullYear()} AIWire. 본 사이트의 일부 콘텐츠는 AI 도구의 보조를 받아 작성되며 편집자가 검수합니다.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Add About link to Header desktop nav**

In `src/components/Header.tsx`, find the nav links section and add an About link alongside the existing links. Insert before the closing `</div>` of the nav links group:

```typescript
            <Link
              href="/about"
              className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900"
              aria-label="사이트 소개"
            >
              소개
            </Link>
```

Place it after the existing `뉴스` link and before `전체 도구`.

- [ ] **Step 3: TypeScript check + test**

```bash
npx tsc --noEmit 2>&1 | tail -5
npx jest --no-coverage 2>&1 | tail -10
```

Expected: tsc clean, all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx src/components/Header.tsx
git commit -m "feat: footer with About/Privacy/Contact links + copyright + AI notice; header About link"
```

---

## Task 12: Sitemap and robots updates

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/robots.ts` (already fixed in Task 2 — verify only)

- [ ] **Step 1: Update `src/app/sitemap.ts`**

Add imports at the top of the sitemap:
```typescript
import { getAllTags } from '@/lib/news';
```

Add the new static routes to `staticRoutes` array (insert after the existing news list routes or at end of static list):
```typescript
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'yearly' as const, priority: 0.4 },
```

Add a new `topicRoutes` array (after `newsEn` const):
```typescript
  const topicRoutes: MetadataRoute.Sitemap = getAllTags('ko').map((tag) => ({
    url: `${BASE_URL}/news/topic/${encodeURIComponent(tag)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
```

Include `topicRoutes` in the final return:
```typescript
  return [
    ...staticRoutes,
    ...situationRoutes,
    ...toolRoutes,
    ...useCaseRoutes,
    ...tipRoutes,
    ...newsListRoutes,
    ...newsKo,
    ...newsEn,
    ...topicRoutes,
  ];
```

- [ ] **Step 2: Confirm robots.ts is already fixed (from Task 2)**

```bash
grep "BASE_URL" /Users/Young/Desktop/claude-workspace/teamY/ai-guide/src/app/robots.ts
```

Expected: output contains `${BASE_URL}/sitemap.xml`

- [ ] **Step 3: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | tail -5
git add src/app/sitemap.ts
git commit -m "feat: sitemap — add /about, /privacy, /contact, /news/topic/[tag] entries"
```

---

## Task 13: Final verification + push

- [ ] **Step 1: Run full TypeScript check**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 2: Run ESLint**

```bash
npm run lint
```

Expected: no errors (warnings allowed)

- [ ] **Step 3: Run all tests**

```bash
npm test -- --no-coverage
```

Expected: all tests pass. Key tests that must pass:
- `news.test.ts` (8 tests)
- `news-tags.test.ts` (6 tests) ← new
- `news-feed.test.ts` (existing)
- `search.test.ts` (existing)
- `NewsListView.test.tsx` (3 tests)
- `TagChips.test.tsx` (5 tests) ← new

- [ ] **Step 4: Run build**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds with no errors. Check that `/about`, `/privacy`, `/contact`, and `/news/topic/*` appear in the prerender output.

Sample expected lines in build output:
```
○ /about
○ /contact
○ /privacy
● /news/topic/[tag]
  /news/topic/LLM
  /news/topic/...
```

- [ ] **Step 5: Push branch**

```bash
git push -u origin feature/adfit-readiness
```

Expected: branch pushed, PR ready for review.

- [ ] **Step 6: Report build output**

After build succeeds, run:
```bash
npm run build 2>&1 | grep -E "/(about|privacy|contact|news/topic)"
```

And show the output to confirm new routes are prerendered.

---

## Self-Review Checklist

### Spec Coverage
| Requirement | Task(s) |
|---|---|
| `/about` legal page (실제 문구) | Task 5 |
| `/privacy` legal page (쿠키·AdFit·AdSense 고지) | Task 6 |
| `/contact` legal page | Task 7 |
| `/news/topic/[tag]` SSG category route | Task 8 |
| Tag chips on `/news` page | Task 9 |
| Homepage latest news + tag chips | Task 10 |
| Footer legal links + copyright + AI notice | Task 11 |
| Header `/about` link | Task 11 |
| Sitemap `/about`, `/privacy`, `/contact`, tag routes | Task 12 |
| robots.ts URL fix | Task 2 |
| All `ai-guide-nu.vercel.app` URLs replaced | Task 2 |
| Tests for `getAllTags`/`getNewsByTag` | Task 3 |
| Tests for `TagChips` | Task 4 |
| `tsc + lint + test + build` all pass | Task 13 |
| Feature branch, no merge to main | Task 1 |

### No placeholder scan
- All legal page content is real Korean text, not placeholder
- No "TBD" or "TODO" in any code block
- All code blocks are complete implementations

### Type consistency
- `getAllTags(lang: NewsLang, root?: string): string[]` — used identically in Task 3, Task 8, Task 9, Task 10, Task 12
- `getNewsByTag(lang: NewsLang, tag: string, root?: string): NewsMeta[]` — used identically in Task 3 and Task 8
- `TagChips` props: `{ tags: string[]; activeTag?: string; showAll?: boolean }` — consistent in Task 4, Task 8, Task 9, Task 10
- `NewsListView` new prop `topSlot?: React.ReactNode` — added in Task 9, used in Task 9 only
