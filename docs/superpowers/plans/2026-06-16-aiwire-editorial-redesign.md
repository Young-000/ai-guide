# AIWire Editorial Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign ai-guide from a confusing "AI 가이드 app + bolted-on news" into a clean, professional AI news media site (BBC/The Verge aesthetic), making news the primary IA and keeping old guide features accessible but demoted.

**Architecture:** Replace the homepage with an editorial front page (lead story + news grid + category strip + subscribe section). Rebuild `Header` as a minimal media nav with "AI 가이드" dropdown (no gamification). Update news components (`NewsCard`, `NewsListView`, `NewsArticleView`) for editorial styling. Add `SubscribeBox` as a reusable non-functional placeholder. All existing guide routes stay intact.

**Tech Stack:** Next.js 14.2 App Router + TypeScript + Tailwind CSS (no new npm deps). Pretendard via CDN. Jest + RTL for tests. Branch: `feature/redesign` (already created).

**Design tokens (use these Tailwind classes throughout):**
- Text: `text-slate-900` primary, `text-slate-600` muted
- Border: `border-slate-200`
- Accent: `text-blue-600`, `bg-blue-600`
- Font: Pretendard (CDN), `font-family: 'Pretendard', -apple-system, …, sans-serif`
- Max widths: `max-w-5xl` for wide sections, `max-w-2xl` for article body (~70ch)

---

## File Map

### Create
| File | Purpose |
|---|---|
| `src/components/SubscribeBox.tsx` | Non-functional email subscribe placeholder (client component) |
| `src/components/__tests__/SubscribeBox.test.tsx` | Test SubscribeBox render + submit behavior |
| `src/components/home/LeadStory.tsx` | Large featured top article on homepage |
| `src/components/home/NewsGrid.tsx` | 2-3 col grid of up to 8 recent articles |
| `src/components/home/CategoryStrip.tsx` | Horizontal tag links strip using existing `TagChips` |

### Modify
| File | Change |
|---|---|
| `src/app/globals.css` | Add design-system CSS vars, set Pretendard as body font |
| `src/app/layout.tsx` | Add Pretendard CDN `<link>` in `<head>`, remove Geist variable classes from `<body>` |
| `src/components/Header.tsx` | Complete rebuild: AIWire brand, clean nav, "AI 가이드" dropdown, no gamification |
| `src/components/Footer.tsx` | Add "AI 가이드" section links column |
| `src/app/page.tsx` | Rebuild as editorial front page using new home components |
| `src/components/home/LatestNewsSection.tsx` | Delete this file (replaced by LeadStory + NewsGrid) |
| `src/components/news/NewsCard.tsx` | Editorial card styling (slate colors, hover accent) |
| `src/components/news/NewsListView.tsx` | Editorial list styling (max-w-5xl, larger heading) |
| `src/components/news/NewsArticleView.tsx` | Reading view: tags, article body (~70ch), related articles, SubscribeBox |
| `src/app/news/[slug]/page.tsx` | Compute `relatedItems` and pass to `NewsArticleView` |
| `src/app/news/topic/[tag]/page.tsx` | Apply editorial styling consistent with NewsListView |

### Unchanged (keep as-is, routes preserved)
- `src/lib/news.ts`, `src/lib/site.ts`, `src/types/news.ts`
- `src/components/news/TagChips.tsx`, `src/components/news/ArticleJsonLd.tsx`
- All old guide pages: `/situations`, `/tools`, `/compare`, `/glossary`, `/learn`, `/quiz`, `/onboarding`, `/use-cases`, `/my-progress`, `/faq`, `/tips`, `/trends`, `/projects`
- `src/app/about/page.tsx`, `src/app/privacy/page.tsx`, `src/app/contact/page.tsx`
- `src/app/en/news/page.tsx`, `src/app/en/news/[slug]/page.tsx`
- All existing tests (must stay green)

---

## Task 1: Feature Branch + Design System (globals.css + layout.tsx)

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

Branch `feature/redesign` is already created. This task sets the design foundation.

### Key fact: `tailwind.config.ts` has NO `@tailwindcss/typography` plugin — so `prose` classes in `NewsArticleView` silently do nothing. The article body styling must be done with standard Tailwind classes. Do not install the typography plugin (no new deps).

- [ ] **Step 1.1: Update globals.css — add design-system tokens and Pretendard font**

Replace the `:root` block and `body` rule in `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-text: #0F172A;
  --color-muted: #475569;
  --color-border: #E2E8F0;
  --color-accent: #2563EB;
  --color-bg: #ffffff;
  /* Keep legacy vars for existing component compat */
  --background: #ffffff;
  --foreground: #0F172A;
}

body {
  color: var(--color-text);
  background: var(--color-bg);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* Slide / fade animations (kept for onboarding pages) */
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slideInRight { animation: slideInRight 0.3s ease-out; }
.animate-slideInLeft  { animation: slideInLeft 0.3s ease-out; }
.animate-fadeIn       { animation: fadeIn 0.3s ease-out; }

@media (prefers-reduced-motion: reduce) {
  .animate-slideInRight,
  .animate-slideInLeft,
  .animate-fadeIn {
    animation: none;
  }
}
```

- [ ] **Step 1.2: Update layout.tsx — add Pretendard CDN link, clean up Geist variable classes**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { Header, Footer, FeedbackWidget } from '@/components';
import AchievementToast from '@/components/AchievementToast';
import { BASE_URL } from '@/lib/site';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Keep Geist for any legacy references (CSS vars still available)
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'AIWire | AI·LLM 뉴스 미디어',
  description:
    'AI·LLM 분야의 최신 소식을 매일 한국어·영어로 정리하는 뉴스 미디어. AI 도구 가이드, 학습 자료, 비교 분석까지 제공합니다.',
  keywords: [
    'AI 뉴스', 'LLM 뉴스', 'AI 최신 소식', 'AI 가이드', 'AI 입문',
    'ChatGPT 사용법', 'Claude 사용법', 'AI 도구 추천', 'AI 활용법',
    '인공지능 뉴스', 'AI 도구 비교', 'AI 미디어',
  ],
  authors: [{ name: 'AIWire 편집팀' }],
  robots: { index: true, follow: true },
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'AIWire | AI·LLM 뉴스 미디어',
    description: 'AI·LLM 최신 소식을 매일 한국어·영어로 정리합니다. AI 도구 가이드와 학습 자료도 제공합니다.',
    type: 'website',
    url: BASE_URL,
    siteName: 'AIWire',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIWire | AI·LLM 뉴스 미디어',
    description: 'AI·LLM 최신 소식을 매일 한국어·영어로 정리합니다.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard — Korean web standard font via CDN */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />

        {process.env.NODE_ENV === 'production' && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1379707580934572"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}'${
                  process.env.NEXT_PUBLIC_GA_DEBUG === 'true'
                    ? ", { debug_mode: true }"
                    : ''
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          본문으로 건너뛰기
        </a>
        <Header />
        <main id="main-content" className="flex-1 bg-white">
          {children}
        </main>
        <Footer />
        <FeedbackWidget />
        <AchievementToast />
      </body>
    </html>
  );
}
```

- [ ] **Step 1.3: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 1.4: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/globals.css src/app/layout.tsx && git commit -m "style: add Pretendard CDN font, design-system CSS tokens"
```

---

## Task 2: Rebuild Header.tsx

**Files:**
- Modify: `src/components/Header.tsx`

Replace the gamification-heavy guide header with a minimal media nav. No more LevelBadge, StreakCounter, or onboarding CTA. New: AIWire brand, desktop nav with "AI 가이드" dropdown, mobile hamburger menu, EN lang link.

- [ ] **Step 2.1: Write Header.tsx**

Replace `src/components/Header.tsx` entirely:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

const GUIDE_LINKS = [
  { href: '/situations', label: '상황별 가이드' },
  { href: '/tools', label: 'AI 도구 목록' },
  { href: '/compare', label: '도구 비교' },
  { href: '/glossary', label: '용어 사전' },
  { href: '/learn', label: '학습센터' },
  { href: '/quiz', label: 'AI 퀴즈' },
] as const;

export function Header(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200"
      role="banner"
    >
      <nav
        className="max-w-5xl mx-auto px-4 py-3"
        aria-label="메인 네비게이션"
      >
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="font-bold text-xl text-slate-900 tracking-tight hover:text-blue-600 transition-colors"
            aria-label="AIWire 홈으로 이동"
          >
            AIWire
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-6" role="list">
            <li>
              <Link
                href="/"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                홈
              </Link>
            </li>
            <li>
              <Link
                href="/news"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                뉴스
              </Link>
            </li>

            {/* AI 가이드 dropdown */}
            <li className="relative">
              <button
                type="button"
                onClick={() => setGuideOpen((o) => !o)}
                className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                aria-expanded={guideOpen}
                aria-haspopup="menu"
                aria-controls="guide-dropdown-menu"
              >
                AI 가이드
                {/* Chevron down icon */}
                <svg
                  className={`w-4 h-4 transition-transform duration-150 ${guideOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {guideOpen && (
                <ul
                  id="guide-dropdown-menu"
                  role="menu"
                  className="absolute top-full right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50"
                >
                  {GUIDE_LINKS.map((link) => (
                    <li key={link.href} role="menuitem">
                      <Link
                        href={link.href}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        onClick={() => setGuideOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <Link
                href="/about"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                소개
              </Link>
            </li>

            {/* Lang hint */}
            <li>
              <Link
                href="/en/news"
                className="text-xs text-slate-400 hover:text-blue-600 border border-slate-200 rounded px-2 py-1 transition-colors"
                aria-label="Switch to English news"
              >
                EN
              </Link>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {mobileOpen ? (
              /* X icon */
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-slate-200 mt-3">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="block py-2 text-sm text-slate-700 hover:text-blue-600"
                  onClick={() => setMobileOpen(false)}
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="block py-2 text-sm text-slate-700 hover:text-blue-600"
                  onClick={() => setMobileOpen(false)}
                >
                  뉴스
                </Link>
              </li>
              <li>
                <p className="py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  AI 가이드
                </p>
                <ul className="pl-3 space-y-1">
                  {GUIDE_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block py-1.5 text-sm text-slate-600 hover:text-blue-600"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-2 text-sm text-slate-700 hover:text-blue-600"
                  onClick={() => setMobileOpen(false)}
                >
                  소개
                </Link>
              </li>
              <li>
                <Link
                  href="/en/news"
                  className="block py-2 text-sm text-slate-700 hover:text-blue-600"
                  onClick={() => setMobileOpen(false)}
                >
                  English
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
```

- [ ] **Step 2.2: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2.3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/components/Header.tsx && git commit -m "feat: rebuild Header as minimal AIWire media nav, remove gamification"
```

---

## Task 3: SubscribeBox Component + Test

**Files:**
- Create: `src/components/SubscribeBox.tsx`
- Create: `src/components/__tests__/SubscribeBox.test.tsx`

- [ ] **Step 3.1: Write SubscribeBox.tsx**

Create `src/components/SubscribeBox.tsx`:

```tsx
'use client';

import { useState } from 'react';

export default function SubscribeBox(): JSX.Element {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setSubmitted(true);
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

      {submitted ? (
        <p className="mt-6 text-slate-700 font-medium" role="status">
          곧 오픈 예정입니다. 오픈하면 알려드릴게요!
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
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            구독 신청
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 3.2: Write the failing test**

Create `src/components/__tests__/SubscribeBox.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SubscribeBox from '@/components/SubscribeBox';

describe('SubscribeBox', () => {
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

  it('shows success message after form submit', () => {
    render(<SubscribeBox />);
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      '곧 오픈 예정입니다. 오픈하면 알려드릴게요!'
    );
  });

  it('hides the form after submit', () => {
    render(<SubscribeBox />);
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    expect(screen.queryByRole('form', { name: '뉴스레터 구독' })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3.3: Run test — expect it to fail (SubscribeBox doesn't exist yet)**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test -- --testPathPattern="SubscribeBox" 2>&1 | tail -20
```

Expected: FAIL — "Cannot find module '@/components/SubscribeBox'"

- [ ] **Step 3.4: Run tests again — expect all to pass now that SubscribeBox exists**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test -- --testPathPattern="SubscribeBox" 2>&1 | tail -20
```

Expected: PASS — 5 tests passing.

- [ ] **Step 3.5: Run all tests to confirm nothing broke**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test 2>&1 | tail -30
```

Expected: All suites pass.

- [ ] **Step 3.6: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/components/SubscribeBox.tsx src/components/__tests__/SubscribeBox.test.tsx && git commit -m "feat: add SubscribeBox component — coming-soon placeholder with success message"
```

---

## Task 4: New Homepage Components + Rebuild page.tsx

**Files:**
- Create: `src/components/home/LeadStory.tsx`
- Create: `src/components/home/NewsGrid.tsx`
- Create: `src/components/home/CategoryStrip.tsx`
- Modify: `src/app/page.tsx`
- Delete: `src/components/home/LatestNewsSection.tsx` (replaced)

The homepage becomes: Lead Story → Category Strip → News Grid (6-8 items) → Subscribe section.

- [ ] **Step 4.1: Create LeadStory.tsx**

Create `src/components/home/LeadStory.tsx`:

```tsx
import Link from 'next/link';
import type { NewsMeta } from '@/types/news';

type LeadStoryProps = {
  item: NewsMeta;
};

export default function LeadStory({ item }: LeadStoryProps): JSX.Element {
  return (
    <article>
      <Link
        href={`/news/${item.slug}`}
        className="group block"
        aria-label={`기사 읽기: ${item.title}`}
      >
        <time
          dateTime={item.date}
          className="text-xs font-semibold text-blue-600 uppercase tracking-wider"
        >
          {item.date}
        </time>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
          {item.title}
        </h2>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
          {item.summary}
        </p>

        {item.tags.length > 0 && (
          <ul
            className="mt-4 flex flex-wrap gap-2"
            aria-label="기사 태그"
          >
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <span className="mt-6 inline-flex items-center gap-1.5 text-blue-600 font-medium text-sm group-hover:gap-2.5 transition-all">
          자세히 읽기
          {/* Arrow right icon */}
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </Link>
    </article>
  );
}
```

- [ ] **Step 4.2: Create NewsGrid.tsx**

Create `src/components/home/NewsGrid.tsx`:

```tsx
import Link from 'next/link';
import NewsCard from '@/components/news/NewsCard';
import type { NewsMeta } from '@/types/news';

type NewsGridProps = {
  items: readonly NewsMeta[];
};

export default function NewsGrid({ items }: NewsGridProps): JSX.Element | null {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="news-grid-heading">
      <div className="flex items-center justify-between mb-6">
        <h2
          id="news-grid-heading"
          className="text-xl font-bold text-slate-900"
        >
          최신 뉴스
        </h2>
        <Link
          href="/news"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          전체 보기
          {/* Arrow right */}
          <span aria-hidden="true"> →</span>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <NewsCard key={item.slug} lang="ko" item={item} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4.3: Create CategoryStrip.tsx**

Create `src/components/home/CategoryStrip.tsx`:

```tsx
import TagChips from '@/components/news/TagChips';

type CategoryStripProps = {
  tags: string[];
};

export default function CategoryStrip({ tags }: CategoryStripProps): JSX.Element | null {
  if (tags.length === 0) return null;

  return (
    <section
      aria-labelledby="category-strip-heading"
      className="py-5 border-b border-slate-200 bg-slate-50"
    >
      <div className="max-w-5xl mx-auto px-4">
        <h2 id="category-strip-heading" className="sr-only">
          뉴스 카테고리
        </h2>
        <TagChips tags={tags} showAll />
      </div>
    </section>
  );
}
```

- [ ] **Step 4.4: Rebuild page.tsx as editorial front page**

Replace `src/app/page.tsx` entirely:

```tsx
import { getAllNews, getAllTags } from '@/lib/news';
import { BASE_URL } from '@/lib/site';
import LeadStory from '@/components/home/LeadStory';
import NewsGrid from '@/components/home/NewsGrid';
import CategoryStrip from '@/components/home/CategoryStrip';
import SubscribeBox from '@/components/SubscribeBox';

const JSON_LD_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AIWire',
  url: BASE_URL,
  description: 'AI·LLM 최신 소식을 매일 한국어·영어로 정리하는 뉴스 미디어',
  inLanguage: 'ko',
};

export default function Home(): JSX.Element {
  const allNews = getAllNews('ko');
  const lead = allNews[0];
  const gridItems = allNews.slice(1, 9); // up to 8 items in the grid
  const tags = getAllTags('ko');

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_DATA) }}
      />

      {/* Lead story — most recent article, large */}
      {lead && (
        <section
          aria-labelledby="lead-story-label"
          className="bg-white border-b border-slate-200 py-10 md:py-14"
        >
          <div className="max-w-5xl mx-auto px-4">
            <p id="lead-story-label" className="sr-only">
              주요 기사
            </p>
            <LeadStory item={lead} />
          </div>
        </section>
      )}

      {/* Category strip — tags linking to /news/topic/[tag] */}
      <CategoryStrip tags={tags} />

      {/* News grid — next 8 articles */}
      {gridItems.length > 0 && (
        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <NewsGrid items={gridItems} />
          </div>
        </section>
      )}

      {/* Subscribe section */}
      <section
        aria-labelledby="subscribe-section-heading"
        className="py-12 bg-slate-50 border-t border-slate-200"
      >
        <div className="max-w-5xl mx-auto px-4">
          <p id="subscribe-section-heading" className="sr-only">
            뉴스레터 구독
          </p>
          <SubscribeBox />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4.5: Delete LatestNewsSection.tsx (no longer used)**

```bash
rm /Users/Young/Desktop/claude-workspace/teamY/ai-guide/src/components/home/LatestNewsSection.tsx
```

- [ ] **Step 4.6: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4.7: Run all tests**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test 2>&1 | tail -30
```

Expected: All pass.

- [ ] **Step 4.8: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/page.tsx src/components/home/LeadStory.tsx src/components/home/NewsGrid.tsx src/components/home/CategoryStrip.tsx && git rm src/components/home/LatestNewsSection.tsx && git commit -m "feat: rebuild homepage as editorial front page — lead story, grid, category strip, subscribe"
```

---

## Task 5: Update NewsCard.tsx — Editorial Styling

**Files:**
- Modify: `src/components/news/NewsCard.tsx`

Change from a light-bordered card to editorial style using the new slate color palette. Behavior unchanged (keeps `lang`, `item` props, same href logic) so existing tests stay green.

- [ ] **Step 5.1: Update NewsCard.tsx**

Replace `src/components/news/NewsCard.tsx`:

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
    <article className="border border-slate-200 rounded-xl p-5 bg-white hover:border-blue-300 hover:shadow-sm transition-all duration-150">
      <Link href={href} className="group block" aria-label={`기사 읽기: ${item.title}`}>
        <time
          dateTime={item.date}
          className="text-xs font-semibold text-blue-600 uppercase tracking-wider"
        >
          {item.date}
        </time>
        <h2 className="mt-1.5 font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
          {item.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {item.summary}
        </p>
        {item.tags.length > 0 && (
          <ul
            className="mt-3 flex flex-wrap gap-1.5"
            aria-label={lang === 'ko' ? '태그' : 'tags'}
          >
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
              >
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

- [ ] **Step 5.2: Run existing tests — verify no regressions**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test 2>&1 | tail -20
```

Expected: All pass. (The `NewsListView.test.tsx` checks link href, which hasn't changed.)

- [ ] **Step 5.3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/components/news/NewsCard.tsx && git commit -m "style: update NewsCard to editorial slate palette"
```

---

## Task 6: Update NewsListView.tsx — Editorial Styling

**Files:**
- Modify: `src/components/news/NewsListView.tsx`

Increase max-width to `max-w-5xl`, larger heading, consistent slate colors. Text content in COPY stays identical (test asserts on it).

- [ ] **Step 6.1: Update NewsListView.tsx**

Replace `src/components/news/NewsListView.tsx`:

```tsx
import type { ReactNode } from 'react';
import type { NewsLang, NewsMeta } from '@/types/news';
import NewsCard from './NewsCard';

type NewsListViewProps = {
  lang: NewsLang;
  items: readonly NewsMeta[];
  topSlot?: ReactNode;
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

export default function NewsListView({
  lang,
  items,
  topSlot,
}: NewsListViewProps): JSX.Element {
  const copy = COPY[lang];

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{copy.heading}</h1>
      <p className="mt-2 text-slate-600">{copy.subtitle}</p>

      {topSlot && <div className="mt-5">{topSlot}</div>}

      {items.length === 0 ? (
        <p className="mt-10 text-slate-500">{copy.empty}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.slug} lang={lang} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 6.2: Run tests**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test -- --testPathPattern="NewsListView" 2>&1 | tail -20
```

Expected: All 3 tests pass. The heading text `'AI · LLM 뉴스'` and empty message text are unchanged; the link href is still `/news/beta`.

- [ ] **Step 6.3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/components/news/NewsListView.tsx && git commit -m "style: update NewsListView to max-w-5xl, 3-col grid, editorial heading"
```

---

## Task 7: Update NewsArticleView.tsx — Reading View + Tags + Related + SubscribeBox

**Files:**
- Modify: `src/components/news/NewsArticleView.tsx`

Key changes:
1. Accept optional `relatedItems` prop (same-tag articles, 3 max)
2. Show article tags after the headline
3. Style article body (~70ch, line-height 1.7) using standard Tailwind — no `prose` (typography plugin is NOT installed)
4. Add SubscribeBox below the article
5. Add "관련 기사" section at the bottom

- [ ] **Step 7.1: Update NewsArticleView.tsx**

Replace `src/components/news/NewsArticleView.tsx`:

```tsx
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AdUnit from '@/components/AdUnit';
import ArticleJsonLd from './ArticleJsonLd';
import SubscribeBox from '@/components/SubscribeBox';
import NewsCard from './NewsCard';
import { BASE_URL } from '@/lib/site';
import type { NewsArticle, NewsLang, NewsMeta } from '@/types/news';

type NewsArticleViewProps = {
  lang: NewsLang;
  article: NewsArticle;
  relatedItems?: readonly NewsMeta[];
};

const NEWS_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_NEWS_SLOT;

const COPY: Record<NewsLang, { back: string; backHref: string; sources: string; related: string }> = {
  ko: { back: '← 뉴스 목록', backHref: '/news', sources: '출처', related: '관련 기사' },
  en: { back: '← All news', backHref: '/en/news', sources: 'Sources', related: 'Related articles' },
};

export default function NewsArticleView({
  lang,
  article,
  relatedItems = [],
}: NewsArticleViewProps): JSX.Element {
  const copy = COPY[lang];
  const url =
    lang === 'ko'
      ? `${BASE_URL}/news/${article.slug}`
      : `${BASE_URL}/en/news/${article.slug}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <ArticleJsonLd article={article} url={url} />

      {/* Back link */}
      <Link
        href={copy.backHref}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        {/* Arrow left */}
        <svg
          className="w-4 h-4"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {copy.back}
      </Link>

      {/* Article */}
      <article className="mt-6 max-w-2xl">
        <header>
          <time
            dateTime={article.date}
            className="text-xs font-semibold text-blue-600 uppercase tracking-wider"
          >
            {article.date}
          </time>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            {article.title}
          </h1>

          {/* Tags */}
          {article.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label={lang === 'ko' ? '태그' : 'tags'}>
              {article.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/news/topic/${encodeURIComponent(tag)}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </header>

        {/* Article body — custom typography (no @tailwindcss/typography plugin installed) */}
        <div className="mt-8 text-slate-800 text-base leading-7 space-y-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-7 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_pre]:bg-slate-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_hr]:border-slate-200">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
        </div>

        {/* Ad slot */}
        {NEWS_AD_SLOT && (
          <AdUnit slot={NEWS_AD_SLOT} format="auto" className="my-8" dataPage="news" />
        )}

        {/* Sources */}
        {article.sources.length > 0 && (
          <footer className="mt-10 pt-6 border-t border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              {copy.sources}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-sm text-blue-600 hover:text-blue-700 underline break-all transition-colors"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        )}
      </article>

      {/* Related articles */}
      {relatedItems.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="mt-12 pt-8 border-t border-slate-200"
        >
          <h2
            id="related-heading"
            className="text-xl font-bold text-slate-900 mb-5"
          >
            {copy.related}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((item) => (
              <NewsCard key={item.slug} lang={lang} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Subscribe */}
      <section
        aria-labelledby="article-subscribe-heading"
        className="mt-12 py-10 border-t border-slate-200"
      >
        <p id="article-subscribe-heading" className="sr-only">
          뉴스레터 구독
        </p>
        <SubscribeBox />
      </section>
    </div>
  );
}
```

- [ ] **Step 7.2: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 7.3: Run all tests**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test 2>&1 | tail -30
```

Expected: All pass.

- [ ] **Step 7.4: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/components/news/NewsArticleView.tsx && git commit -m "feat: article view — tags, custom body typography, related articles, SubscribeBox"
```

---

## Task 8: Update /news/[slug]/page.tsx — Pass Related Items

**Files:**
- Modify: `src/app/news/[slug]/page.tsx`

Pass up to 3 same-tag articles (excluding current) to `NewsArticleView`.

- [ ] **Step 8.1: Update /news/[slug]/page.tsx**

Replace `src/app/news/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getNewsSlugs, getNewsByTag } from '@/lib/news';
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
    title: `${article.title} | AIWire`,
    description: article.summary,
    alternates: {
      canonical: urlKo,
      languages: (() => {
        const languages: Record<string, string> = { 'ko-KR': urlKo, 'x-default': urlKo };
        if (getNewsBySlug('en', article.slug)) languages['en-US'] = urlEn;
        return languages;
      })(),
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

  const relatedItems =
    article.tags.length > 0
      ? getNewsByTag('ko', article.tags[0])
          .filter((item) => item.slug !== article.slug)
          .slice(0, 3)
      : [];

  return (
    <NewsArticleView lang="ko" article={article} relatedItems={relatedItems} />
  );
}
```

- [ ] **Step 8.2: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 8.3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/news/[slug]/page.tsx && git commit -m "feat: pass relatedItems to article view — same-tag articles, max 3"
```

---

## Task 9: Update /news/topic/[tag]/page.tsx — Editorial Styling

**Files:**
- Modify: `src/app/news/topic/[tag]/page.tsx`

Match the editorial look of NewsListView — slate colors, consistent padding, back link with arrow icon.

- [ ] **Step 9.1: Update TopicPage**

Replace `src/app/news/topic/[tag]/page.tsx`:

```tsx
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
    <section className="max-w-5xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        {/* Arrow left */}
        <svg
          className="w-4 h-4"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        전체 뉴스
      </Link>

      <h1 className="mt-5 text-3xl font-bold text-slate-900">
        카테고리:{' '}
        <span className="text-blue-600">{tag}</span>
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {items.length}건의 기사
      </p>

      {/* All category tags */}
      <div className="mt-5">
        <TagChips tags={allTags} activeTag={tag} showAll />
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-slate-500">해당 태그의 기사가 없습니다.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.slug} lang="ko" item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 9.2: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 9.3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/app/news/topic/\[tag\]/page.tsx && git commit -m "style: update TopicPage to editorial slate layout, max-w-5xl grid"
```

---

## Task 10: Update Footer.tsx — Add AI 가이드 Links

**Files:**
- Modify: `src/components/Footer.tsx`

Add a two-column footer with "AI 가이드" sub-links and the existing site info.

- [ ] **Step 10.1: Update Footer.tsx**

Replace `src/components/Footer.tsx`:

```tsx
import Link from 'next/link';

export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-white" role="contentinfo">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-3 gap-8">
          {/* Brand column */}
          <div>
            <p className="text-base font-bold text-slate-900">AIWire</p>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              AI·LLM 최신 소식을 매일 한국어·영어로 정리합니다.
            </p>
          </div>

          {/* AI 가이드 column */}
          <nav aria-label="AI 가이드 링크">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              AI 가이드
            </p>
            <ul className="space-y-2">
              {[
                { href: '/situations', label: '상황별 가이드' },
                { href: '/tools', label: 'AI 도구 목록' },
                { href: '/compare', label: '도구 비교' },
                { href: '/glossary', label: '용어 사전' },
                { href: '/learn', label: '학습센터' },
                { href: '/quiz', label: 'AI 퀴즈' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Site links column */}
          <nav aria-label="사이트 링크">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              사이트
            </p>
            <ul className="space-y-2">
              {[
                { href: '/news', label: '뉴스' },
                { href: '/en/news', label: 'English' },
                { href: '/about', label: '소개' },
                { href: '/privacy', label: '개인정보처리방침' },
                { href: '/contact', label: '문의' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-400">
          © {new Date().getFullYear()} AIWire. 본 사이트의 일부 콘텐츠는 AI 도구의 보조를 받아
          작성되며 편집자가 검수합니다.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 10.2: Verify TypeScript**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 10.3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git add src/components/Footer.tsx && git commit -m "feat: Footer — 3-column layout with AI 가이드 links, site links"
```

---

## Task 11: Final Verification and Push

**Files:** None created/modified — verification only.

- [ ] **Step 11.1: Full TypeScript check**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npx tsc --noEmit 2>&1
```

Expected output: _(no output = 0 errors)_

- [ ] **Step 11.2: Lint**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm run lint 2>&1 | tail -20
```

Expected: 0 errors (warnings OK).

- [ ] **Step 11.3: All tests**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm test 2>&1 | tail -30
```

Expected: All test suites pass. Check specifically:
- `src/components/news/__tests__/TagChips.test.tsx` — 5 tests
- `src/components/news/__tests__/NewsListView.test.tsx` — 3 tests
- `src/components/__tests__/SubscribeBox.test.tsx` — 5 tests
- `src/lib/__tests__/news.test.ts`, `news-feed.test.ts`, `news-tags.test.ts`, `search.test.ts`

- [ ] **Step 11.4: Production build**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && npm run build 2>&1 | tail -30
```

Expected: Build succeeds with no errors (static pages generated for all routes).

- [ ] **Step 11.5: Push branch**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git push -u origin feature/redesign 2>&1
```

Expected: Branch pushed to origin.

- [ ] **Step 11.6: Confirm branch pushed**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide && git log --oneline -10
```

Record the final commit SHA.

---

## Self-Review: Spec Coverage Check

| Spec Requirement | Covered In |
|---|---|
| Pretendard CDN font, primary sans | Task 1 |
| text-slate-900, slate-600, bg-white, accent blue-600 | Task 1 (globals.css tokens) |
| Inline Lucide-style SVG only, no emoji UI icons | Tasks 2, 7, 9 (all SVG, no emoji) |
| A11y: semantic HTML, focus rings, aria-labels, alt text | All tasks (header/nav/article/section tags, aria-labels) |
| Mobile-first responsive 375/768/1024 | Tasks 2, 4, 5, 6, 10 (sm:/md:/lg: breakpoints) |
| Sticky header: AIWire brand + nav (홈, 뉴스, AI 가이드, 소개) + EN lang hint | Task 2 |
| Lead story (most recent, large) | Task 4 (LeadStory.tsx) |
| Latest grid (6-9 articles) | Task 4 (NewsGrid, slices 1-9) |
| Category strip (tags → /news/topic/[tag]) | Task 4 (CategoryStrip.tsx) |
| Old guide features under "AI 가이드" nav section (not on homepage) | Tasks 2 (dropdown), 10 (footer col) |
| SubscribeBox — non-functional, coming-soon badge, success message | Task 3 |
| SubscribeBox on homepage | Task 4 |
| SubscribeBox on article pages | Task 7 |
| Footer with AI 가이드 links | Task 10 |
| /news list — editorial list with TagChips | Task 6 (unchanged topSlot behavior) |
| /news/[slug] — big headline, date, tags, digest body, 출처 links, 관련 기사 | Tasks 7, 8 |
| /news/topic/[tag] — same style as /news list | Task 9 |
| Don't break existing routes/tests | Verified in each task |
| BASE_URL from @/lib/site (no hardcoded URLs) | All tasks |
| Tailwind only (no new npm deps) | Confirmed — no new deps |
| tsc + lint + test + build all pass | Task 11 |
| git push -u origin feature/redesign (not merged to main) | Task 11 |

**Potential concerns:**
1. `prose` class in the original `NewsArticleView` was silently doing nothing (no typography plugin). The new custom Tailwind arbitrary-property approach (`[&_h2]:...`) works correctly without any plugin.
2. The `guideOpen` dropdown in Header closes on `Link` click but doesn't close on outside click (no `useEffect` + `document.addEventListener`). This is acceptable for a minimal v1 — add in a future iteration.
3. `LatestNewsSection.tsx` is deleted. If any other page imported it, those imports need updating. Verify with `grep -r "LatestNewsSection" src/` before deleting — only `page.tsx` (old) imported it.
