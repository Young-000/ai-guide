# Monetization

## JTBD

When I've built a useful AI onboarding platform that generates traffic, I want to monetize outbound tool links, display non-intrusive ads, and track user engagement, so I can generate revenue while maintaining a great user experience.

## Problem

- **Who:** Site owner (developer/operator) seeking sustainable revenue from AI Guide traffic
- **Pain:** The platform currently generates zero revenue. Every outbound click to an AI tool (ChatGPT, Claude, Gemini, etc.) is an untracked, unmonetized event. There is no analytics infrastructure to measure conversion funnels or user behavior. (Frequency: every session; Severity: high -- no revenue at all)
- **Current workaround:** None. No tracking, no affiliate parameters, no ads, no analytics.
- **Success metric:**
  - All outbound tool links carry UTM parameters for attribution
  - AdSense displays on eligible pages without hurting conversion paths
  - GA4 tracks all key user events (onboarding, tool clicks, guide steps, shares)
  - Zero regression on Core Web Vitals (LCP < 2.5s, CLS < 0.1)

---

## Solution

### Overview

Three independent but complementary systems are added in a single cycle:

1. **Affiliate link infrastructure** -- a centralized `buildToolUrl` utility appends UTM parameters to every outbound tool link. All existing call sites (`getToolLink`, compare page CTAs, tool detail page, situation detail page) route through this utility. This prepares the link infrastructure for future affiliate program sign-ups without requiring any code changes.

2. **Google AdSense integration** -- the AdSense script is loaded once in the root layout via Next.js `<Script>`. A reusable `<AdUnit>` component renders ad slots. Ads are placed on guide pages (between steps), the comparison page (below comparison table), and tool detail pages (between sections). Ads are explicitly excluded from the landing page, onboarding flow, and result page to protect conversion paths.

3. **GA4 event tracking** -- gtag.js is loaded in the root layout. A thin `analytics.ts` helper provides typed event functions. Events fire at key user journey points: onboarding start/complete, tool outbound clicks, guide step completions, and shares.

### User Flow

No direct user-facing flow change. This is infrastructure work that operates transparently:

```
User visits page
  -> GA4 page_view fires automatically
  -> Ads render in designated slots (guide, compare, tool detail pages)

User clicks "ChatGPT 시작하기" on any page
  -> buildToolUrl appends UTM params to outbound URL
  -> GA4 tool_click event fires with { tool_name, source_page }
  -> User lands on tool's official site with ?utm_source=ai-guide&utm_medium=referral&utm_campaign=chatgpt

User completes onboarding
  -> GA4 onboarding_complete fires with { persona_type }
  -> Result page renders WITHOUT ads (conversion path protection)
```

### Scope (MoSCoW)

**Must:**
- `buildToolUrl(tool, sourcePage)` utility that appends UTM params to tool.url
- Replace all raw `tool.url` / `getToolLink(tool)` references with `buildToolUrl`
- GA4 gtag.js loaded in root layout via `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var
- `analytics.ts` with typed event functions for all 6 key events
- AdSense script loaded in root layout with publisher ID `ca-pub-1379707580934572`
- `<AdUnit>` component with configurable slot/format
- `ads.txt` in `public/` directory
- Ad placements on: `/situations/[slug]` (between steps), `/compare` (below table), `/tools/[slug]` (between sections)
- NO ads on: `/` (landing), `/onboarding`, `/onboarding/result`
- Affiliate disclosure text on pages with outbound tool links

**Should:**
- `data-page` attribute on `<AdUnit>` for debugging which slots perform
- GA4 debug mode toggle via `NEXT_PUBLIC_GA_DEBUG` env var
- `useTrackPageView` hook for SPA route changes
- Click tracking includes tool pricing tier (free/paid) as event parameter

**Could:**
- A/B test different ad positions using feature flags
- AdSense auto-ads as fallback if manual placements underperform
- Revenue dashboard page (Phase 2+)

**Won't (this cycle):**
- Actual affiliate program sign-ups (OpenAI, Anthropic, etc.) -- external process
- Server-side click logging to Supabase (Phase 3)
- Ad blocker detection or fallback
- Premium/paid content or paywall

---

## Detailed Design

### Component 1: Affiliate Link Infrastructure

#### 1.1 `buildToolUrl` utility

**File:** `src/lib/affiliateLinks.ts`

```typescript
type UtmParams = {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
};

/**
 * Append UTM parameters to a tool's official URL.
 * If the URL already has query params, appends with &.
 * Returns the original URL unchanged if it's empty/invalid.
 */
export function buildToolUrl(
  baseUrl: string,
  toolSlug: string,
  sourcePage: string,
): string {
  if (!baseUrl) return '';

  const utm: UtmParams = {
    source: 'ai-guide',
    medium: 'referral',
    campaign: toolSlug,
    content: sourcePage,
  };

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', utm.source);
    url.searchParams.set('utm_medium', utm.medium);
    url.searchParams.set('utm_campaign', utm.campaign);
    if (utm.content) {
      url.searchParams.set('utm_content', utm.content);
    }
    return url.toString();
  } catch {
    // If URL parsing fails, return original
    return baseUrl;
  }
}
```

#### 1.2 Call site migration

Every location that renders an outbound tool link must call `buildToolUrl` instead of using `tool.url` directly:

| File | Current | After |
|------|---------|-------|
| `src/lib/onboardingEngine.ts` (`getToolLink`) | `return tool.url` | `return buildToolUrl(tool.url, tool.slug, 'onboarding-result')` |
| `src/app/tools/[slug]/page.tsx` (2 CTA buttons) | `href={tool.url}` | `href={buildToolUrl(tool.url, tool.slug, 'tool-detail')}` |
| `src/app/compare/page.tsx` (3 CTA links) | `href="https://chat.openai.com"` etc. | `href={buildToolUrl(chatgpt.url, 'chatgpt', 'compare')}` etc. |
| `src/app/situations/[slug]/page.tsx` (primary tool link) | `href={primaryToolInfo.url}` | `href={buildToolUrl(primaryToolInfo.url, primaryTool.slug, 'situation-detail')}` |

> **Note:** `getToolLink` in `onboardingEngine.ts` remains the public API for components in `onboarding/`. It internally delegates to `buildToolUrl`. This avoids changing imports in `ResultPrimaryCard` and `ResultAlternatives`.

#### 1.3 Affiliate disclosure

Add a small disclosure component `<AffiliateDisclosure />` that renders:

```
이 페이지의 일부 링크는 제휴 링크일 수 있으며, 이를 통해 구매 시 소정의 수수료를 받을 수 있습니다. 추천은 사용자 경험을 기반으로 하며, 수수료와 무관합니다.
```

Placed at the bottom of:
- `/tools/[slug]` page
- `/compare` page
- `/onboarding/result` page
- `/situations/[slug]` page (below "추천 AI 도구" section)

Styling: `text-xs text-gray-400 mt-8 text-center` -- unobtrusive but visible.

---

### Component 2: Google AdSense Integration

#### 2.1 AdSense script loading

**File:** `src/app/layout.tsx`

Add to `<head>` via Next.js `<Script>`:

```typescript
import Script from 'next/script';

// Inside <html> <head> or <body>:
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1379707580934572"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

`strategy="afterInteractive"` ensures the ad script loads after hydration, minimizing impact on LCP.

#### 2.2 `ads.txt`

**File:** `public/ads.txt`

```
google.com, pub-1379707580934572, DIRECT, f08c47fec0942fa0
```

#### 2.3 `<AdUnit>` component

**File:** `src/components/AdUnit.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  dataPage?: string; // for debugging which page the ad is on
}

export default function AdUnit({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  dataPage,
}: AdUnitProps): JSX.Element | null {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded or blocked
    }
  }, []);

  return (
    <div className={className} data-page={dataPage}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1379707580934572"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
```

> **Note:** The `slot` prop is the AdSense ad unit ID, created in the AdSense dashboard. For the initial setup, create 3 ad units:
> - `guide-between-steps` (rectangle, for situation detail pages)
> - `compare-below-table` (horizontal, for compare page)
> - `tool-detail-between-sections` (rectangle, for tool detail pages)

#### 2.4 Ad placement map

| Page | Location | Ad Format | Slot Name |
|------|----------|-----------|-----------|
| `/situations/[slug]` | Between "따라하기" and "바로 쓰는 프롬프트" sections | Rectangle / auto | `guide-between-steps` |
| `/compare` | Below comparison table, above "결론" section | Horizontal / auto | `compare-below-table` |
| `/tools/[slug]` | Between "주요 기능" and "상세 가이드" sections | Rectangle / auto | `tool-detail-between-sections` |

#### 2.5 Pages explicitly excluded from ads

| Page | Reason |
|------|--------|
| `/` (landing) | Conversion path -- user should focus on onboarding CTA |
| `/onboarding` | Conversion path -- user is mid-survey, ads would increase bounce |
| `/onboarding/result` | Conversion path -- user just got their result, ads would distract from tool CTA |
| `/situations` (list) | Clean browsing experience; ads are on detail pages instead |
| `/tools` (list) | Same reasoning as situations list |

---

### Component 3: GA4 Event Tracking

#### 3.1 GA4 script loading

**File:** `src/app/layout.tsx`

```typescript
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Inside <html>:
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
        gtag('config', '${GA_ID}'${process.env.NEXT_PUBLIC_GA_DEBUG === 'true' ? ", { debug_mode: true }" : ''});
      `}
    </Script>
  </>
)}
```

Conditionally loaded: if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is not set (e.g., local dev), no GA4 code runs. Zero overhead in development.

#### 3.2 `analytics.ts` typed event helper

**File:** `src/lib/analytics.ts`

```typescript
type GtagEvent = {
  action: string;
  params?: Record<string, string | number | boolean>;
};

function sendEvent({ action, params }: GtagEvent): void {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', action, params);
}

// --- Onboarding events ---

export function trackOnboardingStart(): void {
  sendEvent({ action: 'onboarding_start' });
}

export function trackOnboardingComplete(personaType: string): void {
  sendEvent({
    action: 'onboarding_complete',
    params: { persona_type: personaType },
  });
}

// --- Tool click events ---

export function trackToolClick(toolName: string, sourcePage: string): void {
  sendEvent({
    action: 'tool_click',
    params: {
      tool_name: toolName,
      source_page: sourcePage,
    },
  });
}

// --- Guide events ---

export function trackGuideStepComplete(
  situationSlug: string,
  stepNumber: number,
): void {
  sendEvent({
    action: 'guide_step_complete',
    params: {
      situation_slug: situationSlug,
      step: stepNumber,
    },
  });
}

// --- Share events ---

export function trackShare(contentType: string, itemId: string): void {
  sendEvent({
    action: 'share',
    params: {
      content_type: contentType,
      item_id: itemId,
    },
  });
}

// --- Prompt copy events ---

export function trackPromptCopy(
  situationSlug: string,
  promptIndex: number,
): void {
  sendEvent({
    action: 'prompt_copy',
    params: {
      situation_slug: situationSlug,
      prompt_index: promptIndex,
    },
  });
}
```

#### 3.3 Event integration points

| Event | Where it fires | File to modify |
|-------|----------------|----------------|
| `onboarding_start` | User clicks "시작하기" on onboarding page | `src/components/onboarding/OnboardingWizard.tsx` (on first question render or explicit start action) |
| `onboarding_complete` | Result page loads successfully with a recommendation | `src/app/onboarding/result/page.tsx` (inside useEffect when result is set) |
| `tool_click` | User clicks any outbound tool link | All outbound `<a>` tags with tool URLs. Add `onClick={() => trackToolClick(tool.name, 'page-name')}` |
| `guide_step_complete` | User progresses through a step in the situation guide | `src/app/situations/[slug]/page.tsx` (if step-tracking UI is added; otherwise fire on page scroll or section visibility) |
| `share` | User clicks share button | `src/components/ShareButton.tsx` |
| `prompt_copy` | User clicks "복사" button on a prompt | `src/app/situations/[slug]/page.tsx` (inside `copyToClipboard` callback) |

#### 3.4 Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Yes (production) | `undefined` | GA4 Measurement ID (e.g., `G-XXXXXXXXXX`) |
| `NEXT_PUBLIC_GA_DEBUG` | No | `false` | Enable GA4 debug mode for DebugView in GA4 console |

Add to `.env.example`:

```
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GA_DEBUG=false
```

---

## Acceptance Criteria

### Affiliate Links

- [ ] **AC-1:** Given a tool detail page (`/tools/chatgpt`), when a user clicks the "ChatGPT 시작하기" button, then the outbound URL contains `?utm_source=ai-guide&utm_medium=referral&utm_campaign=chatgpt&utm_content=tool-detail`
- [ ] **AC-2:** Given the compare page, when a user clicks any of the 3 tool CTA buttons (ChatGPT, Claude, Gemini), then each outbound URL contains `utm_campaign={tool-slug}` and `utm_content=compare`
- [ ] **AC-3:** Given a situation detail page, when a user clicks the primary tool's "바로가기" button, then the URL contains correct UTM params with `utm_content=situation-detail`
- [ ] **AC-4:** Given the onboarding result page, when a user clicks the primary tool's "시작하기" button, then the URL contains UTM params with `utm_content=onboarding-result`
- [ ] **AC-5:** Given a tool URL that already has query parameters (e.g., `https://example.com?ref=abc`), when `buildToolUrl` is called, then UTM params are appended correctly without breaking existing params
- [ ] **AC-6:** Given any page that shows outbound tool links, then an affiliate disclosure statement is visible at the bottom of the page

### AdSense

- [ ] **AC-7:** Given the production build, when the page loads, then the AdSense script is present in the HTML with `ca-pub-1379707580934572` and `strategy="afterInteractive"`
- [ ] **AC-8:** Given `/public/ads.txt`, when accessed via `https://ai-guide-nu.vercel.app/ads.txt`, then it returns `google.com, pub-1379707580934572, DIRECT, f08c47fec0942fa0`
- [ ] **AC-9:** Given the situation detail page (`/situations/[slug]`), when the page renders, then an `<AdUnit>` appears between the "따라하기" steps section and the "바로 쓰는 프롬프트" section
- [ ] **AC-10:** Given the compare page, when the page renders, then an `<AdUnit>` appears between the comparison table and the "결론" recommendation cards
- [ ] **AC-11:** Given the tool detail page (`/tools/[slug]`), when the page renders, then an `<AdUnit>` appears between the "주요 기능" section and the "상세 가이드" section
- [ ] **AC-12:** Given the landing page (`/`), onboarding page (`/onboarding`), or result page (`/onboarding/result`), when the page renders, then NO `<AdUnit>` components are present
- [ ] **AC-13:** Given a page with an `<AdUnit>`, when Lighthouse is run, then CLS remains < 0.1 (the ad slot has a reserved min-height to prevent layout shift)

### GA4

- [ ] **AC-14:** Given `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, when any page loads, then gtag.js is loaded and `gtag('config', ...)` is called with the correct measurement ID
- [ ] **AC-15:** Given `NEXT_PUBLIC_GA_MEASUREMENT_ID` is NOT set (local dev), when any page loads, then no GA4 scripts are injected into the DOM
- [ ] **AC-16:** Given the onboarding page, when a user starts the survey (first question renders), then a `onboarding_start` event fires in GA4
- [ ] **AC-17:** Given the result page, when a recommendation is successfully displayed, then a `onboarding_complete` event fires with `persona_type` parameter
- [ ] **AC-18:** Given any outbound tool link, when a user clicks it, then a `tool_click` event fires with `tool_name` and `source_page` parameters
- [ ] **AC-19:** Given a situation detail page, when a user clicks the "복사" button on a prompt, then a `prompt_copy` event fires with `situation_slug` and `prompt_index`
- [ ] **AC-20:** Given the share button, when a user clicks it, then a `share` event fires with `content_type` and `item_id`
- [ ] **AC-21:** Given a production deployment, when checking GA4 Realtime report, then `page_view` events are received for each navigation

### Build & Performance

- [ ] **AC-22:** Given all changes, when `npm run build` is executed, then the build succeeds with zero errors
- [ ] **AC-23:** Given all changes, when `npm run lint` is executed, then no new lint errors are introduced
- [ ] **AC-24:** Given the production build, when Lighthouse is run on the landing page, then Performance score remains >= 90

---

## Task Breakdown

| # | Task | Complexity | Dependencies | Description |
|---|------|-----------|--------------|-------------|
| 1 | Create `src/lib/affiliateLinks.ts` with `buildToolUrl` | S | none | Pure utility function. Append UTM params to a URL using the `URL` API. |
| 2 | Write unit tests for `buildToolUrl` | S | 1 | Test: normal URL, URL with existing params, empty URL, invalid URL, all UTM param values. |
| 3 | Migrate `getToolLink` in `onboardingEngine.ts` to use `buildToolUrl` | S | 1 | Import `buildToolUrl`, call it with `'onboarding-result'` as source page. |
| 4 | Migrate tool detail page (`/tools/[slug]`) outbound links | S | 1 | Replace both `href={tool.url}` with `buildToolUrl(tool.url, tool.slug, 'tool-detail')`. Add `onClick` for GA4 tracking. |
| 5 | Migrate compare page (`/compare`) outbound links | S | 1 | Replace 3 hardcoded URLs with `buildToolUrl`. Add `onClick` for GA4 tracking. |
| 6 | Migrate situation detail page (`/situations/[slug]`) outbound link | S | 1 | Replace `primaryToolInfo.url` with `buildToolUrl`. Add `onClick` for GA4 tracking. |
| 7 | Create `<AffiliateDisclosure>` component | S | none | Small text component. Render on tool detail, compare, result, and situation detail pages. |
| 8 | Create `src/lib/analytics.ts` with typed GA4 event functions | S | none | Pure utility. Typed wrapper around `gtag('event', ...)`. |
| 9 | Add GA4 script to `src/app/layout.tsx` | S | none | Conditional `<Script>` tags for gtag.js, gated on `NEXT_PUBLIC_GA_MEASUREMENT_ID`. |
| 10 | Integrate `trackOnboardingStart` in onboarding wizard | S | 8 | Fire event when user sees first question. |
| 11 | Integrate `trackOnboardingComplete` in result page | S | 8 | Fire event in `useEffect` when result loads. |
| 12 | Integrate `trackToolClick` on all outbound tool links | S | 8, 3-6 | Add `onClick` handlers to all outbound `<a>` tags. |
| 13 | Integrate `trackPromptCopy` in situation detail page | S | 8 | Fire event inside existing `copyToClipboard` callback. |
| 14 | Integrate `trackShare` in ShareButton component | S | 8 | Fire event when share action triggers. |
| 15 | Add AdSense script to `src/app/layout.tsx` | S | none | `<Script>` tag with `afterInteractive` strategy. |
| 16 | Create `public/ads.txt` | S | none | Single-line file with Google AdSense verification. |
| 17 | Create `<AdUnit>` component | M | 15 | Reusable ad slot component with configurable slot/format. Include min-height to prevent CLS. |
| 18 | Place `<AdUnit>` on situation detail page | S | 17 | Between "따라하기" and "바로 쓰는 프롬프트" sections. |
| 19 | Place `<AdUnit>` on compare page | S | 17 | Between comparison table and "결론" section. |
| 20 | Place `<AdUnit>` on tool detail page | S | 17 | Between "주요 기능" and "상세 가이드" sections. |
| 21 | Add `.env.example` entries | S | none | Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_GA_DEBUG`. |
| 22 | Verify no ads on protected pages (landing, onboarding, result) | S | 17-20 | Manual verification + consider a lint-level check. |
| 23 | Run `npm run build && npm run lint` and fix any issues | S | all | Final validation. |

**Estimated total effort:** ~4 hours of focused development (all tasks are S or M complexity).

---

## Open Questions

1. **AdSense ad unit slot IDs:** These must be created in the Google AdSense dashboard before the `<AdUnit>` component can be fully functional. The developer should use placeholder slot IDs (e.g., `"1234567890"`) during development and replace them after AdSense unit creation. Should we store slot IDs in environment variables or hardcode them?

2. **GA4 Measurement ID:** The actual `G-XXXXXXXXXX` value needs to be created in the GA4 dashboard. Is this already done, or should the developer set up the GA4 property?

3. **Affiliate disclosure legal requirements:** The current Korean-language disclosure text covers basic FTC-style requirements. Should legal counsel review it before launch?

4. **Ad density on mobile:** AdSense has policies about ad density on mobile. With the current plan (1 ad per guide/tool/compare page), we are well within limits. Should we add more slots later based on traffic data?

5. **Compare page hardcoded URLs:** The compare page currently hardcodes `https://chat.openai.com`, `https://claude.ai`, and `https://gemini.google.com` instead of reading from `tools.json`. Should Task 5 also refactor these to read from the tools data, or just wrap the existing hardcoded URLs with `buildToolUrl`?

---

## Out of Scope

- **Actual affiliate program enrollment** -- signing up for OpenAI, Anthropic, Google, Notion, Grammarly affiliate programs is an external business process. This spec only prepares the link infrastructure so that when affiliate URLs are obtained, they can be swapped into `tools.json` `url` fields (or a new `affiliateUrl` field) without code changes.
- **Server-side click tracking** -- Phase 3 (Supabase `affiliate_clicks` table). For now, GA4 `tool_click` events provide sufficient tracking.
- **A/B testing ad placements** -- Phase 2 optimization. Initial placements are based on best practices.
- **Premium content / paywall** -- Phase 3 per PRD roadmap.
- **Ad blocker detection** -- Low priority. Not worth the UX friction at current traffic levels.
- **Google AdSense auto-ads** -- Manual placements first to maintain UX control. Auto-ads can be enabled later if manual CTR is low.

---

## Appendix: Current Outbound Link Inventory

All locations in the codebase where users can click to leave ai-guide:

| File | Element | Current URL Source | Count |
|------|---------|--------------------|-------|
| `src/app/tools/[slug]/page.tsx` | "시작하기" button (top) | `tool.url` | 1 |
| `src/app/tools/[slug]/page.tsx` | "시작하기" button (bottom) | `tool.url` | 1 |
| `src/app/compare/page.tsx` | "ChatGPT 시작하기" link | hardcoded URL | 1 |
| `src/app/compare/page.tsx` | "Claude 시작하기" link | hardcoded URL | 1 |
| `src/app/compare/page.tsx` | "Gemini 시작하기" link | hardcoded URL | 1 |
| `src/app/situations/[slug]/page.tsx` | Primary tool "바로가기" button | `primaryToolInfo.url` | 1 |
| `src/components/onboarding/ResultPrimaryCard.tsx` | "시작하기" button | `getToolLink(tool)` | 1 |
| `src/components/onboarding/ResultAlternatives.tsx` | Alt tool links | `getToolLink(alt.tool)` | variable |
| **Total unique call sites** | | | **8+** |

All of these must be routed through `buildToolUrl` and have `trackToolClick` onClick handlers.
