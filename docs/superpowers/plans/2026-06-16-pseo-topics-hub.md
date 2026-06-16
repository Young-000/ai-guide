# pSEO Topics Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a crawlable `/news/topics` hub + cross-linking between topic pages + sitemap entry to improve programmatic SEO on aiwire.news.

**Architecture:** Pure server components (no client JS). Hub reads `getAllTags('ko')` + new `getTagsWithCount` helper. Header/Footer and `/news` page get lightweight links to the hub. Topic pages get "다른 주제" cross-links. Sitemap gains one static entry.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Jest

---

### Task 1: Add `getTagsWithCount` helper + unit test

**Files:**
- Modify: `src/lib/news.ts`
- Create: `src/lib/__tests__/news-tag-count.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/__tests__/news-tag-count.test.ts
import path from 'node:path';
import { getTagsWithCount } from '@/lib/news';

const FIXTURES = path.join(__dirname, 'fixtures', 'news');

describe('getTagsWithCount', () => {
  it('returns tags sorted by count descending', () => {
    // ko fixtures: alpha=['LLM'], beta=['OpenAI','LLM'], gamma=['LLM']
    // LLM appears 3 times, OpenAI 1 time => LLM first
    const result = getTagsWithCount('ko', FIXTURES);
    expect(result[0]).toEqual({ tag: 'LLM', count: 3 });
    expect(result[1]).toEqual({ tag: 'OpenAI', count: 1 });
  });

  it('breaks count ties alphabetically', () => {
    // both have count 1; alphabetical: OpenAI after LLM but here only 1 tie check
    const result = getTagsWithCount('ko', FIXTURES);
    expect(result.map((r) => r.tag)).toEqual(['LLM', 'OpenAI']);
  });

  it('returns empty array when no articles exist', () => {
    expect(getTagsWithCount('ko', path.join(FIXTURES, '__missing__'))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test -- --testPathPattern="news-tag-count" 2>&1 | tail -20
```

Expected: FAIL — `getTagsWithCount` is not exported from `@/lib/news`.

- [ ] **Step 3: Add `getTagsWithCount` to `src/lib/news.ts`**

Append after `getNewsByTag`:

```ts
/**
 * Returns all tags with article counts, sorted by count desc then alphabetically.
 */
export function getTagsWithCount(
  lang: NewsLang,
  root: string = CONTENT_ROOT,
): { tag: string; count: number }[] {
  const countMap = new Map<string, number>();
  for (const article of getAllNews(lang, root)) {
    for (const tag of article.tags) {
      countMap.set(tag, (countMap.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(countMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test -- --testPathPattern="news-tag-count" 2>&1 | tail -20
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/lib/news.ts src/lib/__tests__/news-tag-count.test.ts && git commit -m "feat(news): add getTagsWithCount helper + unit tests"
```

---

### Task 2: Create Topics Hub page

**Files:**
- Create: `src/app/news/topics/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/app/news/topics/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTagsWithCount } from '@/lib/news';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '주제별 AI 뉴스 | AIWire',
  description: 'AI·LLM 뉴스를 주제별로 탐색하세요. 모든 카테고리와 태그 목록입니다.',
  alternates: { canonical: `${BASE_URL}/news/topics` },
};

export default function TopicsPage(): JSX.Element {
  const tags = getTagsWithCount('ko');

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        전체 뉴스
      </Link>

      <h1 className="mt-5 text-3xl font-bold text-slate-900">주제별 뉴스</h1>
      <p className="mt-2 text-slate-600">
        {tags.length}개 주제의 AI·LLM 뉴스를 탐색하세요.
      </p>

      {tags.length === 0 ? (
        <p className="mt-10 text-slate-500">등록된 주제가 없습니다.</p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="전체 뉴스 주제">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href={`/news/topic/${encodeURIComponent(tag)}`}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-sm transition-all duration-150 group"
              >
                <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                  {tag}
                </span>
                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {count}건
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/news/topics/page.tsx && git commit -m "feat(pseo): add /news/topics hub page with tag counts"
```

---

### Task 3: Link to topics hub from Header + Footer

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Add "주제" link to Header desktop nav (after 뉴스 `<li>`)**

In `Header.tsx`, find the `<li>` containing `href="/news"` and insert after it:

```tsx
<li>
  <Link
    href="/news/topics"
    className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
  >
    주제
  </Link>
</li>
```

Also add it to the mobile menu (after the 뉴스 `<li>` in the mobile panel):

```tsx
<li>
  <Link
    href="/news/topics"
    className="block py-2 text-sm text-slate-700 hover:text-blue-600"
    onClick={() => setMobileOpen(false)}
  >
    주제
  </Link>
</li>
```

- [ ] **Step 2: Add "주제별 뉴스" link to Footer site column**

In `Footer.tsx`, add `{ href: '/news/topics', label: '주제별 뉴스' }` to the site-links array (after `뉴스`):

```tsx
{ href: '/news', label: '뉴스' },
{ href: '/news/topics', label: '주제별 뉴스' },
{ href: '/en/news', label: 'English' },
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/components/Header.tsx src/components/Footer.tsx && git commit -m "feat(pseo): add 주제 nav link in Header and Footer"
```

---

### Task 4: Link to topics hub from /news page

**Files:**
- Modify: `src/app/news/page.tsx`

- [ ] **Step 1: Update topSlot to include "전체 주제 보기 →" link**

Replace the current `topSlot`:

```tsx
// Before:
topSlot={<TagChips tags={tags} />}

// After:
topSlot={
  <div className="space-y-3">
    <TagChips tags={tags} />
    <Link
      href="/news/topics"
      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
    >
      전체 주제 보기
      <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  </div>
}
```

Also add `import Link from 'next/link';` at the top (after the existing imports).

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/news/page.tsx && git commit -m "feat(pseo): link to topics hub from /news page"
```

---

### Task 5: Add "다른 주제" cross-links to topic pages

**Files:**
- Modify: `src/app/news/topic/[tag]/page.tsx`

- [ ] **Step 1: Add sibling tag section at the bottom of the page**

After the articles grid (end of the JSX), before closing `</section>`, add:

```tsx
{/* Cross-links: 다른 주제 */}
{(() => {
  const siblingTags = allTags.filter((t) => t !== tag).slice(0, 6);
  if (siblingTags.length === 0) return null;
  return (
    <div className="mt-12 pt-8 border-t border-slate-200">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        다른 주제
      </h2>
      <ul className="flex flex-wrap gap-2">
        {siblingTags.map((sibling) => (
          <li key={sibling}>
            <Link
              href={`/news/topic/${encodeURIComponent(sibling)}`}
              className="inline-block text-sm px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {sibling}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/news/topics"
        className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        전체 주제 보기
        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
})()}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/news/topic/[tag]/page.tsx && git commit -m "feat(pseo): add 다른 주제 cross-links on topic pages"
```

---

### Task 6: Add /news/topics to sitemap

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add hub entry to staticRoutes**

After `{ url: \`${BASE_URL}/news\`, ... }`, add:

```ts
{ url: `${BASE_URL}/news/topics`, changeFrequency: 'weekly', priority: 0.8 },
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/sitemap.ts && git commit -m "feat(pseo): add /news/topics to sitemap"
```

---

### Task 7: Full verification gate

- [ ] **Run all checks**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit && npm run lint && npm test && npm run build 2>&1 | tail -40
```

Expected:
- tsc: no output (zero errors)
- lint: no errors (warnings OK)
- test: all suites PASS
- build: `Route (app) /news/topics` appears in the build output with `○` (static)

- [ ] **Push branch**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git push -u origin feature/pseo
```
