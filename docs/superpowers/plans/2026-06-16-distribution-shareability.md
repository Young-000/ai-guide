# Distribution & Shareability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add RSS 2.0 feeds, polished OG/Twitter meta, and per-article ShareRow buttons to the `ai-guide` (aiwire.news) Next.js project.

**Architecture:** (1) RSS route handlers baked at build time via `getAllNews`; (2) Root layout gains `metadataBase` + RSS discovery via `alternates.types`; (3) Article pages add full Twitter card + `siteName`; (4) A new `ShareRow` client component renders X/Threads/copy-link buttons with Amplitude tracking; (5) A `buildShareText` pure util is shared between ShareRow and any future feature.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Jest (jsdom) · `@amplitude/analytics-browser` (already installed)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/share-text.ts` | Create | Pure helper: build share caption from title + summary + url |
| `src/lib/__tests__/share-text.test.ts` | Create | Unit tests for `buildShareText` |
| `src/app/feed.xml/route.ts` | Create | RSS 2.0 route handler for Korean news (top 20) |
| `src/app/en/feed.xml/route.ts` | Create | RSS 2.0 route handler for English news (top 20) |
| `src/app/layout.tsx` | Modify | Add `metadataBase: new URL(BASE_URL)` + RSS discovery in `alternates.types` |
| `src/app/news/[slug]/page.tsx` | Modify | Add `siteName: 'AIWire'` + `twitter` card to article metadata |
| `src/app/en/news/[slug]/page.tsx` | Modify | Same for English article pages |
| `src/components/news/ShareRow.tsx` | Create | Client component: X, Threads, copy-link icon buttons |
| `src/components/news/NewsArticleView.tsx` | Modify | Render `<ShareRow>` after article `<header>` |

---

## Task 1: Branch setup

- [ ] **Step 1.1: Checkout and create branch**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git checkout main && git pull && git checkout -b feature/distribution
```

Expected: prompt shows `Switched to a new branch 'feature/distribution'`

---

## Task 2: Share-text helper (TDD)

**Files:**
- Create: `src/lib/share-text.ts`
- Create: `src/lib/__tests__/share-text.test.ts`

- [ ] **Step 2.1: Write the failing test**

`src/lib/__tests__/share-text.test.ts`:
```typescript
import { buildShareText } from '@/lib/share-text';

describe('buildShareText', () => {
  it('joins title, summary, and url with newlines', () => {
    const result = buildShareText('AI News Title', 'A brief summary.', 'https://aiwire.news/news/ai-news');
    expect(result).toBe('AI News Title\n\nA brief summary.\n\nhttps://aiwire.news/news/ai-news');
  });

  it('trims whitespace from each part', () => {
    const result = buildShareText('  Title  ', '  Summary  ', '  https://example.com  ');
    expect(result).toBe('Title\n\nSummary\n\nhttps://example.com');
  });

  it('handles empty summary', () => {
    const result = buildShareText('Title', '', 'https://example.com');
    expect(result).toBe('Title\n\n\n\nhttps://example.com');
  });
});
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx jest src/lib/__tests__/share-text.test.ts --no-coverage 2>&1 | tail -20
```

Expected: FAIL with `Cannot find module '@/lib/share-text'`

- [ ] **Step 2.3: Implement the helper**

`src/lib/share-text.ts`:
```typescript
/**
 * Builds a share caption from an article's key fields.
 * Pure function — no side effects, safe to call anywhere.
 */
export function buildShareText(title: string, summary: string, url: string): string {
  return `${title.trim()}\n\n${summary.trim()}\n\n${url.trim()}`;
}
```

- [ ] **Step 2.4: Run test to verify it passes**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx jest src/lib/__tests__/share-text.test.ts --no-coverage 2>&1 | tail -10
```

Expected: PASS (3 tests)

- [ ] **Step 2.5: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/lib/share-text.ts src/lib/__tests__/share-text.test.ts && git commit -m "feat(share): add buildShareText pure helper with tests"
```

---

## Task 3: RSS 2.0 feed — Korean

**Files:**
- Create: `src/app/feed.xml/route.ts`

- [ ] **Step 3.1: Create the Korean RSS route handler**

`src/app/feed.xml/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getAllNews } from '@/lib/news';
import { BASE_URL } from '@/lib/site';

// Static generation: content is baked from markdown files at build time.
export const dynamic = 'force-static';

const FEED_LIMIT = 20;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateStr: string): string {
  // YYYY-MM-DD parsed as UTC midnight → toUTCString() produces valid RFC 822.
  return new Date(dateStr).toUTCString();
}

function buildRssXml(lang: 'ko' | 'en'): string {
  const articles = getAllNews(lang).slice(0, FEED_LIMIT);
  const channelTitle =
    lang === 'ko' ? 'AIWire | AI·LLM 뉴스 미디어' : 'AIWire | AI·LLM News';
  const channelDescription =
    lang === 'ko'
      ? 'AI·LLM 최신 소식을 매일 한국어로 정리합니다.'
      : 'Daily AI·LLM news in English.';
  const newsBase = lang === 'ko' ? `${BASE_URL}/news` : `${BASE_URL}/en/news`;
  const lastBuildDate = articles[0] ? toRfc822(articles[0].date) : new Date().toUTCString();

  const items = articles
    .map(
      (a) =>
        `\n  <item>\n    <title><![CDATA[${a.title}]]></title>\n    <link>${escapeXml(`${newsBase}/${a.slug}`)}</link>\n    <description><![CDATA[${a.summary}]]></description>\n    <pubDate>${toRfc822(a.date)}</pubDate>\n    <guid isPermaLink="true">${escapeXml(`${newsBase}/${a.slug}`)}</guid>\n  </item>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>${lang === 'ko' ? 'ko' : 'en'}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>${items}
  </channel>
</rss>`;
}

export function GET(): NextResponse {
  const xml = buildRssXml('ko');
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

- [ ] **Step 3.2: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/feed.xml/route.ts && git commit -m "feat(rss): add Korean RSS 2.0 feed at /feed.xml"
```

---

## Task 4: RSS 2.0 feed — English

**Files:**
- Create: `src/app/en/feed.xml/route.ts`

- [ ] **Step 4.1: Create the English RSS route handler**

`src/app/en/feed.xml/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { buildRssXml } from '@/app/feed.xml/route';

export const dynamic = 'force-static';

export function GET(): NextResponse {
  const xml = buildRssXml('en');
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

> **Note:** This imports `buildRssXml` which must be exported from `src/app/feed.xml/route.ts`. Add `export` to the function declaration in Task 3.

- [ ] **Step 4.2: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/en/feed.xml/route.ts && git commit -m "feat(rss): add English RSS 2.0 feed at /en/feed.xml"
```

---

## Task 5: Layout meta polish — metadataBase + RSS discovery

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 5.1: Add `metadataBase` and RSS discovery link**

In `src/app/layout.tsx`, change the `metadata` export:

Old `alternates` block:
```typescript
alternates: { canonical: BASE_URL },
```

New (adds `metadataBase` at top level and RSS type in `alternates`):
```typescript
metadataBase: new URL(BASE_URL),
alternates: {
  canonical: BASE_URL,
  types: {
    'application/rss+xml': `${BASE_URL}/feed.xml`,
  },
},
```

- [ ] **Step 5.2: Verify TypeScript accepts the change**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors

- [ ] **Step 5.3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/layout.tsx && git commit -m "feat(meta): add metadataBase and RSS discovery link to root layout"
```

---

## Task 6: Article page OG/Twitter polish

**Files:**
- Modify: `src/app/news/[slug]/page.tsx`
- Modify: `src/app/en/news/[slug]/page.tsx`

- [ ] **Step 6.1: Patch Korean article page metadata**

In `src/app/news/[slug]/page.tsx`, update `generateMetadata` return value.

Old `openGraph` block:
```typescript
openGraph: {
  title: article.title,
  description: article.summary,
  type: 'article',
  url: urlKo,
  locale: 'ko_KR',
},
```

New (adds `siteName` + `twitter` card):
```typescript
openGraph: {
  title: article.title,
  description: article.summary,
  type: 'article',
  url: urlKo,
  siteName: 'AIWire',
  locale: 'ko_KR',
},
twitter: {
  card: 'summary_large_image',
  title: article.title,
  description: article.summary,
},
```

- [ ] **Step 6.2: Patch English article page metadata**

In `src/app/en/news/[slug]/page.tsx`, apply the same change to the `generateMetadata` return:

Old `openGraph` block:
```typescript
openGraph: {
  title: article.title,
  description: article.summary,
  type: 'article',
  url: urlEn,
  locale: 'en_US',
},
```

New:
```typescript
openGraph: {
  title: article.title,
  description: article.summary,
  type: 'article',
  url: urlEn,
  siteName: 'AIWire',
  locale: 'en_US',
},
twitter: {
  card: 'summary_large_image',
  title: article.title,
  description: article.summary,
},
```

- [ ] **Step 6.3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/news/[slug]/page.tsx src/app/en/news/[slug]/page.tsx && git commit -m "feat(meta): add siteName + Twitter card to article page metadata"
```

---

## Task 7: ShareRow component

**Files:**
- Create: `src/components/news/ShareRow.tsx`

- [ ] **Step 7.1: Create the ShareRow client component**

`src/components/news/ShareRow.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { buildShareText } from '@/lib/share-text';
import type { NewsLang } from '@/types/news';

type ShareRowProps = {
  title: string;
  summary: string;
  url: string;
  lang: NewsLang;
};

const ARIA: Record<NewsLang, { x: string; threads: string; copy: string; copied: string; row: string }> = {
  ko: { x: 'X에서 공유', threads: 'Threads에서 공유', copy: '링크 복사', copied: '복사됨!', row: '공유하기' },
  en: { x: 'Share on X', threads: 'Share on Threads', copy: 'Copy link', copied: 'Copied!', row: 'Share this article' },
};

const BTN_CLASS =
  'inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600';

export default function ShareRow({ title, summary, url, lang }: ShareRowProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const labels = ARIA[lang];
  const shareText = buildShareText(title, summary, url);
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} ${url}`)}`;
  const threadsHref = `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`;

  function handleExternalClick(platform: string): void {
    void track('share_click', { platform, url });
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard API unavailable — silent fail
    }
    void track('share_click', { platform: 'copy', url });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-100"
      aria-label={labels.row}
    >
      {/* X / Twitter */}
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.x}
        className={BTN_CLASS}
        onClick={() => handleExternalClick('x')}
      >
        {/* Official X logo path */}
        <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.836L2.25 2.25h6.979l4.261 5.641L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      </a>

      {/* Threads */}
      <a
        href={threadsHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.threads}
        className={BTN_CLASS}
        onClick={() => handleExternalClick('threads')}
      >
        {/* Threads "@" style icon — swap with official Threads SVG path if desired */}
        <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
      </a>

      {/* Copy link */}
      <button
        type="button"
        aria-label={copied ? labels.copied : labels.copy}
        className={BTN_CLASS}
        onClick={() => void handleCopy()}
      >
        {copied ? (
          // Checkmark (success)
          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          // Chain-link icon
          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 7.2: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/components/news/ShareRow.tsx && git commit -m "feat(share): add ShareRow component with X, Threads, copy-link buttons"
```

---

## Task 8: Wire ShareRow into NewsArticleView

**Files:**
- Modify: `src/components/news/NewsArticleView.tsx`

- [ ] **Step 8.1: Import ShareRow and render it after the article header**

In `src/components/news/NewsArticleView.tsx`:

Add import at the top (after existing imports):
```typescript
import ShareRow from './ShareRow';
```

Add `<ShareRow>` after the closing `</header>` tag inside `<article>` (before the article body div):
```typescript
<ShareRow
  title={article.title}
  summary={article.summary}
  url={url}
  lang={lang}
/>
```

The exact insertion point is after line `</header>` and before the article body `<div className={[...].join(' ')}>` block.

- [ ] **Step 8.2: Run all checks**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm run lint 2>&1 | tail -20
```

Expected: no errors (or only pre-existing warnings)

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx jest --no-coverage 2>&1 | tail -20
```

Expected: all tests pass

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm run build 2>&1 | tail -30
```

Expected: build succeeds, `/feed.xml` and `/en/feed.xml` appear in output routes

- [ ] **Step 8.3: Fix any failures before committing**

If TypeScript errors appear, fix them before proceeding.

- [ ] **Step 8.4: Commit and push**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/components/news/NewsArticleView.tsx && git commit -m "feat(share): wire ShareRow into NewsArticleView"
git push -u origin feature/distribution
```

---

## Post-implementation notes

| Item | Status | Notes |
|------|--------|-------|
| RSS `/feed.xml` | Built | Korean top-20, valid RSS 2.0, baked at build time |
| RSS `/en/feed.xml` | Built | English top-20, reuses `buildRssXml` |
| RSS discovery `<link>` | Built | Via `metadata.alternates.types` in root layout |
| `metadataBase` | Built | Resolves relative OG URLs |
| Article OG `siteName` | Built | Added to both ko/en article pages |
| Article Twitter card | Built | `summary_large_image` with per-article title/desc |
| `ShareRow` component | Built | X + Threads + copy-link, accessible, Amplitude tracking |
| `buildShareText` helper | Built | Pure function, unit-tested |
| **True auto-posting** | NOT built | Requires X API tokens, Threads API — noting only, no tokens committed |
| KakaoTalk share button | Skipped | Requires Kakao JS SDK — deferred per spec |
| OG image | Skipped | No image asset to reference; text meta is complete |
