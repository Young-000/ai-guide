# LLM 뉴스 블로그 — Phase 1 (사이트/콘텐츠 레이어) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `ai-guide`에 마크다운 기반 양언어(ko/en) 뉴스 섹션(`/news`, `/en/news`)을 추가하여, 수동으로 작성한 기사가 SSG로 렌더링되고 SEO/hreflang/JSON-LD/광고 슬롯까지 갖춘 상태를 만든다.

**Architecture:** 기사 = `src/content/news/<lang>/*.md` (gray-matter frontmatter + 마크다운 본문). 빌드 타임 로더(`src/lib/news.ts`)가 파일을 읽어 App Router 정적 페이지로 렌더. ko는 `/news` 루트, en은 `/en/news`. 기존 사이트(루트 ko 페이지들)는 건드리지 않고 뉴스 섹션만 추가.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, gray-matter, react-markdown + remark-gfm, Jest + RTL. 광고 = 기존 `AdUnit`(AdSense) 재사용.

**Scope (Phase 1):** 콘텐츠 자동 생성/수집/스케줄은 **범위 외**(Phase 2·3). 여기서는 사람이 직접 둔 seed 마크다운으로 렌더 파이프라인을 완성·검증한다.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `src/lib/site.ts` (생성) | `BASE_URL` 상수 단일 출처 |
| `src/types/news.ts` (생성) | 뉴스 도메인 타입 (`NewsLang`, `NewsFrontmatter`, `NewsArticle`, `NewsSource`) |
| `src/lib/news.ts` (생성) | 빌드 타임 콘텐츠 로더 (`getAllNews`/`getNewsBySlug`/`getNewsSlugs`) + frontmatter 검증 |
| `src/lib/__tests__/news.test.ts` (생성) | 로더 단위 테스트 |
| `src/lib/__tests__/fixtures/news/{ko,en}/*.md` (생성) | 테스트용 고정 기사 |
| `src/components/news/NewsCard.tsx` (생성) | 목록 카드 (제목/요약/날짜/태그) |
| `src/components/news/NewsListView.tsx` (생성) | 기사 목록 뷰 (lang별) |
| `src/components/news/ArticleJsonLd.tsx` (생성) | `Article` JSON-LD `<script>` |
| `src/components/news/NewsArticleView.tsx` (생성) | 기사 상세 뷰 (마크다운 + 출처 + 광고 + JSON-LD) |
| `src/components/news/__tests__/NewsListView.test.tsx` (생성) | 목록 렌더 테스트 |
| `src/app/news/page.tsx` (생성) | ko 목록 라우트 |
| `src/app/news/[slug]/page.tsx` (생성) | ko 상세 라우트 |
| `src/app/en/news/page.tsx` (생성) | en 목록 라우트 |
| `src/app/en/news/[slug]/page.tsx` (생성) | en 상세 라우트 |
| `src/content/news/{ko,en}/2026-06-15-welcome-llm-news.md` (생성) | seed 기사 1쌍 |
| `src/app/sitemap.ts` (수정) | 뉴스 라우트(양언어) 추가 |
| `src/components/Header.tsx` (수정) | "뉴스" 네비 링크 추가 |
| `package.json` (수정) | `gray-matter`, `react-markdown`, `remark-gfm` 추가 |
| `.env.example` (수정) | `NEXT_PUBLIC_ADSENSE_NEWS_SLOT` 문서화 |

**URL ↔ 파일 규칙:** URL slug = frontmatter `slug`(양언어 공유, hreflang 페어링 키). 파일명은 `YYYY-MM-DD-<slug>.md`(가독성용, URL과 무관). 로더는 frontmatter `slug`로 조회한다.

---

## Task 1: 의존성 + BASE_URL 상수 + seed 콘텐츠

**Files:**
- Modify: `package.json`
- Create: `src/lib/site.ts`
- Create: `src/content/news/ko/2026-06-15-welcome-llm-news.md`
- Create: `src/content/news/en/2026-06-15-welcome-llm-news.md`
- Modify: `.env.example`

- [ ] **Step 1: 의존성 설치**

Run:
```bash
npm install gray-matter@^4 react-markdown@^9 remark-gfm@^4
```
Expected: `package.json` `dependencies`에 3개 추가, 에러 없이 설치 완료.

- [ ] **Step 2: BASE_URL 상수 생성**

Create `src/lib/site.ts`:
```typescript
// 사이트 전역 상수 단일 출처. sitemap/뉴스 라우트가 공유.
export const BASE_URL = 'https://ai-guide-nu.vercel.app';
```

- [ ] **Step 3: seed 기사 (ko) 생성**

Create `src/content/news/ko/2026-06-15-welcome-llm-news.md`:
```markdown
---
title: "AI·LLM 뉴스 코너를 시작합니다"
lang: ko
date: "2026-06-15"
slug: welcome-llm-news
summary: "AI 가이드가 매일 업데이트되는 LLM 최신 소식 코너를 엽니다. 한국어와 영어로 핵심만 정리합니다."
tags: ["공지", "LLM", "AI 뉴스"]
sources:
  - title: "AI 가이드"
    url: "https://ai-guide-nu.vercel.app"
---

## 새로운 뉴스 코너

AI 가이드에 **LLM·AI 최신 소식**을 정리하는 뉴스 코너가 추가되었습니다.

- 매일 핵심 소식을 한국어로 요약합니다.
- 원문 출처를 함께 제공합니다.
- 같은 글을 영어로도 발행합니다.

앞으로 이 코너에서 빠르게 업데이트되는 AI 동향을 만나보세요.
```

- [ ] **Step 4: seed 기사 (en) 생성**

Create `src/content/news/en/2026-06-15-welcome-llm-news.md`:
```markdown
---
title: "Introducing Our AI & LLM News Section"
lang: en
date: "2026-06-15"
slug: welcome-llm-news
summary: "AI Guide is launching a daily-updated section that distills the latest LLM news in both Korean and English."
tags: ["Announcement", "LLM", "AI News"]
sources:
  - title: "AI Guide"
    url: "https://ai-guide-nu.vercel.app"
---

## A New News Section

AI Guide now has a **news section** that summarizes the latest LLM and AI developments.

- We summarize key stories every day.
- We always link to the original sources.
- Every article is published in English as well as Korean.

Stay on top of fast-moving AI trends here.
```

- [ ] **Step 5: .env.example 문서화**

Append to `.env.example`:
```bash
# AdSense 뉴스 기사용 광고 슬롯 ID (선택). 없으면 광고 미렌더.
NEXT_PUBLIC_ADSENSE_NEWS_SLOT=
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/site.ts src/content/news .env.example
git commit -m "chore: news deps + seed bilingual articles + BASE_URL const"
```

---

## Task 2: 뉴스 도메인 타입

**Files:**
- Create: `src/types/news.ts`

- [ ] **Step 1: 타입 정의 작성**

Create `src/types/news.ts`:
```typescript
export type NewsLang = 'ko' | 'en';

export type NewsSource = {
  title: string;
  url: string;
};

export type NewsFrontmatter = {
  title: string;
  lang: NewsLang;
  date: string; // YYYY-MM-DD
  slug: string; // 양언어 공유 (hreflang 페어링 키)
  summary: string;
  tags: string[];
  sources: NewsSource[];
};

// 목록 아이템 = 본문 없는 frontmatter
export type NewsMeta = NewsFrontmatter;

// 상세 = frontmatter + 마크다운 본문
export type NewsArticle = NewsFrontmatter & {
  body: string;
};
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (PASS).

- [ ] **Step 3: Commit**

```bash
git add src/types/news.ts
git commit -m "feat: news domain types"
```

---

## Task 3: 콘텐츠 로더 (TDD)

**Files:**
- Create: `src/lib/__tests__/fixtures/news/ko/2026-01-01-alpha.md`
- Create: `src/lib/__tests__/fixtures/news/ko/2026-02-01-beta.md`
- Create: `src/lib/__tests__/fixtures/news/en/2026-01-01-alpha.md`
- Create: `src/lib/__tests__/news.test.ts`
- Create: `src/lib/news.ts`

- [ ] **Step 1: 테스트 픽스처 생성**

Create `src/lib/__tests__/fixtures/news/ko/2026-01-01-alpha.md`:
```markdown
---
title: "알파 기사"
lang: ko
date: "2026-01-01"
slug: alpha
summary: "알파 요약"
tags: ["LLM"]
sources:
  - title: "출처 A"
    url: "https://example.com/a"
---
알파 본문입니다.
```

Create `src/lib/__tests__/fixtures/news/ko/2026-02-01-beta.md`:
```markdown
---
title: "베타 기사"
lang: ko
date: "2026-02-01"
slug: beta
summary: "베타 요약"
tags: ["OpenAI", "LLM"]
sources:
  - title: "출처 B"
    url: "https://example.com/b"
---
베타 본문입니다.
```

Create `src/lib/__tests__/fixtures/news/en/2026-01-01-alpha.md`:
```markdown
---
title: "Alpha Article"
lang: en
date: "2026-01-01"
slug: alpha
summary: "Alpha summary"
tags: ["LLM"]
sources:
  - title: "Source A"
    url: "https://example.com/a"
---
Alpha body.
```

- [ ] **Step 2: 실패 테스트 작성**

Create `src/lib/__tests__/news.test.ts`:
```typescript
import path from 'node:path';
import { getAllNews, getNewsBySlug, getNewsSlugs } from '@/lib/news';

const FIXTURES = path.join(__dirname, 'fixtures', 'news');

describe('news loader', () => {
  it('getAllNews는 날짜 내림차순으로 정렬해 반환한다', () => {
    const items = getAllNews('ko', FIXTURES);
    expect(items.map((i) => i.slug)).toEqual(['beta', 'alpha']);
  });

  it('getAllNews는 frontmatter를 파싱한다', () => {
    const items = getAllNews('ko', FIXTURES);
    const beta = items[0];
    expect(beta.title).toBe('베타 기사');
    expect(beta.tags).toEqual(['OpenAI', 'LLM']);
    expect(beta.sources[0]).toEqual({ title: '출처 B', url: 'https://example.com/b' });
  });

  it('getNewsBySlug는 본문 포함 기사를 반환한다', () => {
    const article = getNewsBySlug('ko', 'alpha', FIXTURES);
    expect(article).not.toBeNull();
    expect(article?.title).toBe('알파 기사');
    expect(article?.body.trim()).toBe('알파 본문입니다.');
  });

  it('getNewsBySlug는 없는 slug면 null을 반환한다', () => {
    expect(getNewsBySlug('ko', 'nope', FIXTURES)).toBeNull();
  });

  it('getNewsSlugs는 해당 언어의 frontmatter slug 목록을 반환한다', () => {
    expect(getNewsSlugs('ko', FIXTURES).sort()).toEqual(['alpha', 'beta']);
    expect(getNewsSlugs('en', FIXTURES)).toEqual(['alpha']);
  });

  it('없는 언어 디렉토리는 빈 배열을 반환한다 (throw 안 함)', () => {
    expect(getAllNews('en', path.join(FIXTURES, '__missing__'))).toEqual([]);
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npm test -- news.test.ts`
Expected: FAIL — `Cannot find module '@/lib/news'`.

- [ ] **Step 4: 로더 구현**

Create `src/lib/news.ts`:
```typescript
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { NewsArticle, NewsFrontmatter, NewsLang, NewsMeta } from '@/types/news';

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content', 'news');

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`news frontmatter: '${field}' must be a string`);
  }
  return value;
}

// YAML이 date를 Date 객체로 파싱할 수 있어 둘 다 허용.
function asDateString(value: unknown, field: string): string {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  throw new Error(`news frontmatter: '${field}' must be a date`);
}

function toFrontmatter(data: Record<string, unknown>): NewsFrontmatter {
  const lang = asString(data.lang, 'lang');
  if (lang !== 'ko' && lang !== 'en') {
    throw new Error(`news frontmatter: invalid lang '${lang}'`);
  }
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === 'string')
    : [];
  const sources = Array.isArray(data.sources)
    ? data.sources.map((s) => {
        const o = (s ?? {}) as Record<string, unknown>;
        return { title: asString(o.title, 'sources[].title'), url: asString(o.url, 'sources[].url') };
      })
    : [];
  return {
    title: asString(data.title, 'title'),
    lang,
    date: asDateString(data.date, 'date'),
    slug: asString(data.slug, 'slug'),
    summary: asString(data.summary, 'summary'),
    tags,
    sources,
  };
}

function listMarkdownFiles(lang: NewsLang, root: string): string[] {
  const dir = path.join(root, lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
}

export function getAllNews(lang: NewsLang, root: string = CONTENT_ROOT): NewsMeta[] {
  const dir = path.join(root, lang);
  return listMarkdownFiles(lang, root)
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      return toFrontmatter(matter(raw).data as Record<string, unknown>);
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getNewsBySlug(lang: NewsLang, slug: string, root: string = CONTENT_ROOT): NewsArticle | null {
  const dir = path.join(root, lang);
  for (const file of listMarkdownFiles(lang, root)) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const parsed = matter(raw);
    const fm = toFrontmatter(parsed.data as Record<string, unknown>);
    if (fm.slug === slug) {
      return { ...fm, body: parsed.content };
    }
  }
  return null;
}

export function getNewsSlugs(lang: NewsLang, root: string = CONTENT_ROOT): string[] {
  return getAllNews(lang, root).map((item) => item.slug);
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm test -- news.test.ts`
Expected: PASS (6 passing).

- [ ] **Step 6: Commit**

```bash
git add src/lib/news.ts src/lib/__tests__/news.test.ts src/lib/__tests__/fixtures
git commit -m "feat: news markdown content loader with frontmatter validation"
```

---

## Task 4: 목록 컴포넌트 (NewsCard + NewsListView)

**Files:**
- Create: `src/components/news/NewsCard.tsx`
- Create: `src/components/news/NewsListView.tsx`
- Create: `src/components/news/__tests__/NewsListView.test.tsx`

- [ ] **Step 1: NewsCard 작성**

Create `src/components/news/NewsCard.tsx`:
```tsx
import Link from 'next/link';
import type { NewsLang, NewsMeta } from '@/types/news';

type NewsCardProps = {
  lang: NewsLang;
  item: NewsMeta;
};

export default function NewsCard({ lang, item }: NewsCardProps): JSX.Element {
  const href = lang === 'ko' ? `/news/${item.slug}` : `/en/news/${item.slug}`;
  return (
    <article className="border border-gray-100 rounded-xl p-5 bg-white hover:border-gray-300 transition-colors">
      <Link href={href} className="block">
        <time dateTime={item.date} className="text-xs text-gray-500">
          {item.date}
        </time>
        <h2 className="mt-1 font-bold text-gray-900 text-lg leading-snug">{item.title}</h2>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.summary}</p>
        {item.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="태그">
            {item.tags.map((tag) => (
              <li key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </Link>
    </article>
  );
}
```

- [ ] **Step 2: NewsListView 작성**

Create `src/components/news/NewsListView.tsx`:
```tsx
import type { NewsLang, NewsMeta } from '@/types/news';
import NewsCard from './NewsCard';

type NewsListViewProps = {
  lang: NewsLang;
  items: readonly NewsMeta[];
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

export default function NewsListView({ lang, items }: NewsListViewProps): JSX.Element {
  const copy = COPY[lang];
  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">{copy.heading}</h1>
      <p className="mt-2 text-gray-600">{copy.subtitle}</p>
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

- [ ] **Step 3: 렌더 테스트 작성**

Create `src/components/news/__tests__/NewsListView.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import NewsListView from '@/components/news/NewsListView';
import type { NewsMeta } from '@/types/news';

const items: NewsMeta[] = [
  { title: '베타 기사', lang: 'ko', date: '2026-02-01', slug: 'beta', summary: '베타 요약', tags: ['LLM'], sources: [] },
];

describe('NewsListView', () => {
  it('기사 제목과 요약을 렌더한다', () => {
    render(<NewsListView lang="ko" items={items} />);
    expect(screen.getByText('베타 기사')).toBeInTheDocument();
    expect(screen.getByText('베타 요약')).toBeInTheDocument();
  });

  it('ko 카드 링크는 /news/<slug>를 가리킨다', () => {
    render(<NewsListView lang="ko" items={items} />);
    expect(screen.getByRole('link', { name: /베타 기사/ })).toHaveAttribute('href', '/news/beta');
  });

  it('빈 목록이면 empty 메시지를 렌더한다', () => {
    render(<NewsListView lang="en" items={[]} />);
    expect(screen.getByText('No news published yet.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- NewsListView.test.tsx`
Expected: PASS (3 passing).

- [ ] **Step 5: Commit**

```bash
git add src/components/news/NewsCard.tsx src/components/news/NewsListView.tsx src/components/news/__tests__/NewsListView.test.tsx
git commit -m "feat: news list components"
```

---

## Task 5: 상세 컴포넌트 (ArticleJsonLd + NewsArticleView)

**Files:**
- Create: `src/components/news/ArticleJsonLd.tsx`
- Create: `src/components/news/NewsArticleView.tsx`

- [ ] **Step 1: ArticleJsonLd 작성**

Create `src/components/news/ArticleJsonLd.tsx`:
```tsx
import type { NewsArticle } from '@/types/news';

type ArticleJsonLdProps = {
  article: NewsArticle;
  url: string;
};

export default function ArticleJsonLd({ article, url }: ArticleJsonLdProps): JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    inLanguage: article.lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'AI Guide' },
    publisher: { '@type': 'Organization', name: 'AI Guide' },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 2: NewsArticleView 작성**

Create `src/components/news/NewsArticleView.tsx`:
```tsx
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AdUnit from '@/components/AdUnit';
import ArticleJsonLd from './ArticleJsonLd';
import { BASE_URL } from '@/lib/site';
import type { NewsArticle, NewsLang } from '@/types/news';

type NewsArticleViewProps = {
  lang: NewsLang;
  article: NewsArticle;
};

const NEWS_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_NEWS_SLOT;

const COPY: Record<NewsLang, { back: string; backHref: string; sources: string }> = {
  ko: { back: '← 뉴스 목록', backHref: '/news', sources: '출처' },
  en: { back: '← All news', backHref: '/en/news', sources: 'Sources' },
};

export default function NewsArticleView({ lang, article }: NewsArticleViewProps): JSX.Element {
  const copy = COPY[lang];
  const url = lang === 'ko' ? `${BASE_URL}/news/${article.slug}` : `${BASE_URL}/en/news/${article.slug}`;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <ArticleJsonLd article={article} url={url} />

      <Link href={copy.backHref} className="text-sm text-blue-500 hover:text-blue-600">
        {copy.back}
      </Link>

      <header className="mt-4">
        <time dateTime={article.date} className="text-sm text-gray-500">
          {article.date}
        </time>
        <h1 className="mt-1 text-3xl font-bold text-gray-900 leading-tight">{article.title}</h1>
      </header>

      <div className="prose prose-gray max-w-none mt-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
      </div>

      {NEWS_AD_SLOT && (
        <AdUnit slot={NEWS_AD_SLOT} format="auto" className="my-8" dataPage="news" />
      )}

      {article.sources.length > 0 && (
        <footer className="mt-10 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700">{copy.sources}</h2>
          <ul className="mt-2 space-y-1">
            {article.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-sm text-blue-500 hover:text-blue-600 break-all"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (PASS). `prose` 클래스는 Tailwind typography 미설치 시 스타일만 무시되고 빌드는 통과(클래스명일 뿐).

- [ ] **Step 4: Commit**

```bash
git add src/components/news/ArticleJsonLd.tsx src/components/news/NewsArticleView.tsx
git commit -m "feat: news article view with markdown, JSON-LD, sources, ad slot"
```

---

## Task 6: 한국어 라우트 (`/news`, `/news/[slug]`)

**Files:**
- Create: `src/app/news/page.tsx`
- Create: `src/app/news/[slug]/page.tsx`

- [ ] **Step 1: ko 목록 라우트 작성**

Create `src/app/news/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { getAllNews } from '@/lib/news';
import NewsListView from '@/components/news/NewsListView';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI · LLM 뉴스 | AI 가이드',
  description: '매일 업데이트되는 AI·LLM 최신 소식을 한국어로 핵심만 정리했습니다.',
  alternates: {
    canonical: `${BASE_URL}/news`,
    languages: {
      'ko-KR': `${BASE_URL}/news`,
      'en-US': `${BASE_URL}/en/news`,
      'x-default': `${BASE_URL}/news`,
    },
  },
};

export default function NewsPage(): JSX.Element {
  const items = getAllNews('ko');
  return <NewsListView lang="ko" items={items} />;
}
```

- [ ] **Step 2: ko 상세 라우트 작성**

Create `src/app/news/[slug]/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getNewsSlugs } from '@/lib/news';
import NewsArticleView from '@/components/news/NewsArticleView';
import { BASE_URL } from '@/lib/site';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getNewsSlugs('ko').map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const article = getNewsBySlug('ko', params.slug);
  if (!article) return {};
  const urlKo = `${BASE_URL}/news/${article.slug}`;
  const urlEn = `${BASE_URL}/en/news/${article.slug}`;
  return {
    title: `${article.title} | AI 가이드`,
    description: article.summary,
    alternates: {
      canonical: urlKo,
      languages: { 'ko-KR': urlKo, 'en-US': urlEn, 'x-default': urlKo },
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      url: urlKo,
      locale: 'ko_KR',
    },
  };
}

export default function NewsArticlePage({ params }: { params: Params }): JSX.Element {
  const article = getNewsBySlug('ko', params.slug);
  if (!article) notFound();
  return <NewsArticleView lang="ko" article={article} />;
}
```

- [ ] **Step 3: 빌드로 정적 생성 확인**

Run: `npm run build`
Expected: 빌드 성공. 출력에 `/news` 와 `/news/welcome-llm-news` (또는 `/news/[slug]` SSG) 가 prerender 목록에 보임.

- [ ] **Step 4: Commit**

```bash
git add src/app/news
git commit -m "feat: Korean news routes (list + detail, SSG, hreflang, JSON-LD)"
```

---

## Task 7: 영어 라우트 (`/en/news`, `/en/news/[slug]`)

**Files:**
- Create: `src/app/en/news/page.tsx`
- Create: `src/app/en/news/[slug]/page.tsx`

- [ ] **Step 1: en 목록 라우트 작성**

Create `src/app/en/news/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { getAllNews } from '@/lib/news';
import NewsListView from '@/components/news/NewsListView';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI & LLM News | AI Guide',
  description: 'Daily-updated, distilled coverage of the latest in AI and LLMs.',
  alternates: {
    canonical: `${BASE_URL}/en/news`,
    languages: {
      'ko-KR': `${BASE_URL}/news`,
      'en-US': `${BASE_URL}/en/news`,
      'x-default': `${BASE_URL}/news`,
    },
  },
};

export default function EnNewsPage(): JSX.Element {
  const items = getAllNews('en');
  return <NewsListView lang="en" items={items} />;
}
```

- [ ] **Step 2: en 상세 라우트 작성**

Create `src/app/en/news/[slug]/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getNewsSlugs } from '@/lib/news';
import NewsArticleView from '@/components/news/NewsArticleView';
import { BASE_URL } from '@/lib/site';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getNewsSlugs('en').map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const article = getNewsBySlug('en', params.slug);
  if (!article) return {};
  const urlKo = `${BASE_URL}/news/${article.slug}`;
  const urlEn = `${BASE_URL}/en/news/${article.slug}`;
  return {
    title: `${article.title} | AI Guide`,
    description: article.summary,
    alternates: {
      canonical: urlEn,
      languages: { 'ko-KR': urlKo, 'en-US': urlEn, 'x-default': urlKo },
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      url: urlEn,
      locale: 'en_US',
    },
  };
}

export default function EnNewsArticlePage({ params }: { params: Params }): JSX.Element {
  const article = getNewsBySlug('en', params.slug);
  if (!article) notFound();
  return <NewsArticleView lang="en" article={article} />;
}
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공. `/en/news`, `/en/news/welcome-llm-news` prerender.

- [ ] **Step 4: Commit**

```bash
git add src/app/en
git commit -m "feat: English news routes (list + detail, SSG, hreflang, JSON-LD)"
```

---

## Task 8: sitemap + 네비게이션 + 최종 검증

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: sitemap에 뉴스 라우트 추가**

In `src/app/sitemap.ts`, add imports at top (after existing imports):
```typescript
import { getAllNews } from '@/lib/news';
```

Replace the `staticRoutes` array's closing and the final `return` to include news. Specifically, after the `tipRoutes` block and before `return`, add:
```typescript
  const newsListRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/news`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/en/news`, changeFrequency: 'daily', priority: 0.8 },
  ];

  const newsKo: MetadataRoute.Sitemap = getAllNews('ko').map((n) => ({
    url: `${BASE_URL}/news/${n.slug}`,
    lastModified: n.date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const newsEn: MetadataRoute.Sitemap = getAllNews('en').map((n) => ({
    url: `${BASE_URL}/en/news/${n.slug}`,
    lastModified: n.date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
```

Then change the final return from:
```typescript
  return [...staticRoutes, ...situationRoutes, ...toolRoutes, ...useCaseRoutes, ...tipRoutes];
```
to:
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
  ];
```

- [ ] **Step 2: Header에 "뉴스" 링크 추가**

In `src/components/Header.tsx`, add this `<Link>` immediately before the existing `전체 도구` link (the `<Link href="/tools" ...>` block):
```tsx
            <Link
              href="/news"
              className="text-sm text-gray-600 hover:text-gray-900"
              aria-label="AI·LLM 뉴스 보기"
            >
              뉴스
            </Link>
```

- [ ] **Step 3: 전체 검증 게이트**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: 4개 모두 PASS. 빌드 출력에 `/news`, `/news/[slug]`, `/en/news`, `/en/news/[slug]` prerender 확인.

- [ ] **Step 4: 로컬 수동 확인 (선택, 사용자 가능 시)**

Run: `npm run dev` 후 브라우저에서 `http://localhost:3000/news`, `http://localhost:3000/news/welcome-llm-news`, `http://localhost:3000/en/news/welcome-llm-news` 접속.
Expected: 목록·상세 렌더, 헤더 "뉴스" 링크 동작, 상세에 출처 링크 노출. (개발 모드는 광고 미렌더 = 정상)

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/components/Header.tsx
git commit -m "feat: news in sitemap + header nav link"
```

---

## 알려진 한계 (Phase 1)
- 루트 `layout.tsx`가 `<html lang="ko">` 고정 → `/en/*` 페이지의 `html lang`도 ko로 남음. SEO는 hreflang/`og:locale`/JSON-LD `inLanguage`로 보완. 완전 분리는 i18n 리팩터(후속) 사안.
- 광고는 `NEXT_PUBLIC_ADSENSE_NEWS_SLOT` 설정 + production 빌드에서만 렌더. 슬롯 ID 발급은 AdSense 대시보드 작업(후속).
- `prose` 스타일링은 `@tailwindcss/typography` 미설치 시 무시됨. 가독성 강화가 필요하면 후속에 플러그인 추가(빌드에는 영향 없음).

## 다음 플랜 (별도 작성 예정)
- **Phase 2**: 수집·중복제거·발행 스크립트 (`scripts/fetch-feeds.mjs`, `scripts/publish.mjs`) + Claude 양언어 재작성 연결. `getNewsBySlug`/`getAllNews`로 중복 판정, `src/content/news/<lang>/`에 기록.
- **Phase 3**: `/schedule` 5h 클라우드 루틴 + 에버그린 백로그(idle 방지) + 창당 발행 상한.
```
