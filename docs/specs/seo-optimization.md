# SEO Optimization

## JTBD

When my AI onboarding platform is live, I want it to be discoverable by search engines and have clear navigation entry points, so that organic traffic grows and users can easily access the onboarding flow from anywhere on the site.

## Problem

- **Who:** Potential users searching for AI-related guidance via Google/Naver
- **Pain:** The site has no sitemap.xml, no robots.txt, and dynamic pages lack unique meta tags. The Header has no "맞춤 추천" entry point — users can only start onboarding from the landing page hero section. (Frequency: every new visitor; Severity: high — invisible to search engines)
- **Current workaround:** Only direct URL access or landing page CTA
- **Success metric:**
  - sitemap.xml lists all public pages
  - robots.txt allows all crawlers
  - Every dynamic page has unique title + description
  - Header shows "맞춤 추천" CTA for non-onboarded users

---

## Solution

### Overview

Four independent improvements:

1. **sitemap.xml** — Next.js App Router `sitemap.ts` convention. Auto-generates sitemap with all static + dynamic routes
2. **robots.txt** — Next.js App Router `robots.ts` convention. Allows all crawlers, references sitemap
3. **Dynamic Meta Tags** — `generateMetadata` for `/situations/[slug]` and `/tools/[slug]` with unique title/description/OG
4. **Header "맞춤 추천" CTA** — Prominent navigation entry point to `/onboarding` in Header component

### Scope (MoSCoW)

**Must:**
- `src/app/sitemap.ts` with all routes (static + dynamic from JSON data)
- `src/app/robots.ts` with standard configuration
- `generateMetadata` in `/situations/[slug]/page.tsx` with situation-specific title/description
- `generateMetadata` in `/tools/[slug]/page.tsx` with tool-specific title/description
- Header "AI 추천받기" CTA button linking to `/onboarding`
- Canonical URLs on all pages

**Should:**
- `generateMetadata` in `/compare/page.tsx`, `/glossary/page.tsx`, `/quiz/page.tsx`
- BreadcrumbList structured data for navigation hierarchy
- "다시 추천받기" variant for onboarded users in Header

**Could:**
- FAQ structured data on landing page
- HowTo structured data on situation guide pages

**Won't (this cycle):**
- Blog/content pages for SEO (Phase 3)
- Open Graph images generation
- Naver Search Advisor submission

---

## Detailed Design

### Component 1: sitemap.xml

**File:** `src/app/sitemap.ts`

```typescript
import type { MetadataRoute } from 'next';
import situationsData from '@/data/situations.json';
import toolsData from '@/data/tools.json';

const BASE_URL = 'https://ai-guide-nu.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/onboarding`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/situations`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tools`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/compare`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/glossary`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/quiz`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/trends`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/projects`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const situationRoutes = situationsData.situations.map((s) => ({
    url: `${BASE_URL}/situations/${s.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const toolRoutes = toolsData.tools.map((t) => ({
    url: `${BASE_URL}/tools/${t.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...situationRoutes, ...toolRoutes];
}
```

### Component 2: robots.txt

**File:** `src/app/robots.ts`

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://ai-guide-nu.vercel.app/sitemap.xml',
  };
}
```

### Component 3: Dynamic Meta Tags

**`/situations/[slug]/page.tsx`:**
```typescript
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const situation = findSituation(params.slug);
  if (!situation) return { title: 'AI 가이드' };
  return {
    title: `${situation.title} | AI 가이드`,
    description: situation.description,
    alternates: { canonical: `https://ai-guide-nu.vercel.app/situations/${params.slug}` },
    openGraph: {
      title: `${situation.title} | AI 가이드`,
      description: situation.description,
      url: `https://ai-guide-nu.vercel.app/situations/${params.slug}`,
    },
  };
}
```

**`/tools/[slug]/page.tsx`:**
```typescript
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = findTool(params.slug);
  if (!tool) return { title: 'AI 가이드' };
  return {
    title: `${tool.name} 사용법 & 가이드 | AI 가이드`,
    description: tool.description,
    alternates: { canonical: `https://ai-guide-nu.vercel.app/tools/${params.slug}` },
    openGraph: {
      title: `${tool.name} 사용법 & 가이드 | AI 가이드`,
      description: tool.description,
      url: `https://ai-guide-nu.vercel.app/tools/${params.slug}`,
    },
  };
}
```

### Component 4: Header "맞춤 추천" CTA

**File:** `src/components/Header.tsx`

Add between the level badge and navigation links:

```tsx
{/* 맞춤 추천 CTA */}
{mounted && !progress.isOnboarded ? (
  <Link
    href="/onboarding"
    className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors"
  >
    AI 추천받기
  </Link>
) : mounted && progress.isOnboarded ? (
  <Link
    href="/onboarding"
    className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
  >
    다시 추천받기
  </Link>
) : null}
```

---

## Acceptance Criteria

### sitemap.xml
- [ ] **AC-1:** Given the production build, when accessing `/sitemap.xml`, then it returns valid XML with all static routes (/, /onboarding, /situations, /tools, /compare, /glossary, /quiz, /trends, /projects)
- [ ] **AC-2:** Given situations.json with N situations, when accessing `/sitemap.xml`, then it contains N `/situations/{slug}` entries
- [ ] **AC-3:** Given tools.json with M tools, when accessing `/sitemap.xml`, then it contains M `/tools/{slug}` entries

### robots.txt
- [ ] **AC-4:** Given the production build, when accessing `/robots.txt`, then it returns `User-agent: *\nAllow: /` and a Sitemap reference

### Dynamic Meta Tags
- [ ] **AC-5:** Given `/situations/email-writing`, when viewing page source, then `<title>` contains the situation title and `<meta name="description">` contains the situation description
- [ ] **AC-6:** Given `/tools/chatgpt`, when viewing page source, then `<title>` contains "ChatGPT" and OG tags are present
- [ ] **AC-7:** Given any dynamic page, when checking the HTML, then a canonical URL is present matching the page URL

### Header CTA
- [ ] **AC-8:** Given a non-onboarded user, when viewing any page, then the Header shows "AI 추천받기" pill button linking to `/onboarding`
- [ ] **AC-9:** Given an onboarded user, when viewing any page, then the Header shows "다시 추천받기" text link
- [ ] **AC-10:** Given the Header CTA, when clicking it, then the user navigates to `/onboarding`

### Build
- [ ] **AC-11:** `npm run build` succeeds with zero errors
- [ ] **AC-12:** `npm run lint` passes with no new warnings

---

## Task Breakdown

| # | Task | Complexity | Dependencies |
|---|------|-----------|--------------|
| 1 | Create `src/app/sitemap.ts` | S | none |
| 2 | Create `src/app/robots.ts` | S | none |
| 3 | Add `generateMetadata` to `/situations/[slug]/page.tsx` | S | none |
| 4 | Add `generateMetadata` to `/tools/[slug]/page.tsx` | S | none |
| 5 | Add Header "AI 추천받기" CTA | S | none |
| 6 | Add canonical URLs to layout metadata | S | none |
| 7 | Verify build passes | S | 1-6 |
