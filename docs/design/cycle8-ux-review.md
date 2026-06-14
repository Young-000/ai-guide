# UX Review: Cycle 8 - Monetization & SEO Features

**Reviewer:** PD Agent (Senior Product Designer)
**Date:** 2026-02-17
**Scope:** AdSense placement, Affiliate disclosure, Header CTA, Analytics privacy, Outbound links
**Files Reviewed:**
- `src/components/AdUnit.tsx`
- `src/components/AffiliateDisclosure.tsx`
- `src/components/Header.tsx`
- `src/components/OutboundToolLink.tsx`
- `src/app/layout.tsx`
- `src/app/situations/[slug]/situation-detail.tsx`
- `src/app/compare/page.tsx`
- `src/app/tools/[slug]/page.tsx`
- `src/app/onboarding/result/page.tsx`
- `src/app/page.tsx` (landing -- verified ad-free)

---

## 5-Second Test

- **First impression:** Content pages (situations, tools, compare) read as educational guides, not ad-heavy properties. Good.
- **Clarity:** Ad placements do not dominate any viewport. The learning content remains the focal point.
- **CTA visibility:** The Header "AI 추천받기" pill button is immediately noticeable against the white header. Primary page CTAs (tool links, "바로가기") remain the most prominent interactive elements.

---

## What Works Well

| Observation | Design Principle |
|---|---|
| Ads are excluded from the landing page, onboarding flow, and result page. This protects the entire conversion funnel from friction. | **H8: Aesthetic & minimalist design** -- irrelevant elements removed from critical paths |
| `AdUnit` has `minHeight: 100px` on the `<ins>` element, reserving vertical space before the ad loads. This prevents content from jumping. | **CLS prevention** -- respects Core Web Vitals |
| `OutboundToolLink` consistently uses `target="_blank" rel="noopener noreferrer"` and fires analytics on click. Clean, reusable pattern. | **H4: Consistency and standards** -- every outbound link behaves identically |
| GA4 and AdSense scripts use `strategy="afterInteractive"`, so they load after hydration. This protects LCP. | **Performance** -- third-party scripts deferred correctly |
| GA4 is conditionally loaded: no `NEXT_PUBLIC_GA_MEASUREMENT_ID` = no scripts. Zero overhead in local development. | **H7: Flexibility and efficiency** -- dev environment stays clean |
| Affiliate disclosure text is honest, mentions "추천은 사용자 경험을 기반으로 하며, 수수료와 무관합니다." This builds trust. | **Transparency** -- FTC-compliant disclosure |
| The `pushed` ref in `AdUnit` prevents double-pushing to `adsbygoogle`. Correct SPA behavior for React strict mode. | **Error prevention** -- no duplicate ad requests |
| Header CTA changes from "AI 추천받기" (non-onboarded) to "다시 추천받기" (onboarded). Appropriate state-dependent copy. | **H2: Match between system and real world** -- language matches user context |

---

## Issues Found

### Category 1: AdSense Placement UX

| Priority | Heuristic / Principle | Location | Current | Proposed Fix | Rationale |
|---|---|---|---|---|---|
| P1 | CLS / Responsive Design | `AdUnit.tsx` line 37 | `minHeight: '100px'` is a fixed value. On mobile, rectangle ads are typically 250px tall; on desktop, horizontal ads vary from 90px to 280px. A 100px reserve may be insufficient for most formats, causing a secondary layout shift when the actual ad renders taller than 100px. | Use format-aware min-heights: `rectangle` -> `min-h-[250px]`, `horizontal` -> `min-h-[90px]`, `auto` -> `min-h-[250px]`. Apply via a lookup object keyed by the `format` prop. Alternatively, set `minHeight` based on the `format` prop in the inline style. | **Fitts's Law / CLS**: The entire content below the ad shifts when the ad is taller than 100px. This can cause misclicks and fail CLS < 0.1 on pages with rectangle ads. |
| P2 | H8: Aesthetic & minimalist design | `situation-detail.tsx` lines 209-215 | The ad sits between "따라하기" steps (instructional content) and "바로 쓰는 프롬프트" (actionable prompts). These two sections form a natural "learn then do" sequence. An ad between them interrupts the cognitive flow. | Add a subtle visual separator/label above the ad: `<p className="text-xs text-gray-300 text-center mb-2">광고</p>` so the user understands the interruption is external, not part of the guide. Also consider moving the ad **after** the prompts section (before "기대 결과") instead, since prompts are the highest-value content and users who reach them are highly engaged. | **Cognitive continuity**: Breaking a learn-then-act sequence with an ad increases extraneous cognitive load (Sweller). Users may lose momentum. |
| P2 | H8: Aesthetic & minimalist design | `compare/page.tsx` lines 91-97 | The ad between the comparison table and the "결론" recommendation cards is acceptable placement. However, the `className="mb-12"` creates significant vertical space, making the "결론" section feel disconnected from the comparison above it. | Reduce to `className="my-6"` to tighten the visual connection. The ad itself provides enough separation. | **Gestalt: Proximity** -- the conclusion cards should feel like they belong to the comparison, not a separate section. |
| P2 | H8: Aesthetic & minimalist design | `tools/[slug]/page.tsx` lines 127-133 | Ad is between "주요 기능" and "상세 가이드". This placement is reasonable -- it occurs at a natural content break. No significant issue. | None needed for placement. Consider adding `<p className="text-xs text-gray-300 text-center mb-2">광고</p>` for transparency (same as situations). | **Consistency** -- if one page labels ads, all should. |
| P3 | Accessibility | `AdUnit.tsx` | The `<div>` wrapper has no ARIA attributes. Screen readers will encounter an unlabeled container. | Add `role="complementary"` and `aria-label="광고"` to the outer `<div>`. | **WCAG 1.3.1 (Info and Relationships)** -- ad regions should be identifiable by assistive technology. |

### Category 2: Affiliate Disclosure UX

| Priority | Heuristic / Principle | Location | Current | Proposed Fix | Rationale |
|---|---|---|---|---|---|
| P1 | WCAG AA Contrast | `AffiliateDisclosure.tsx` line 3 | `text-gray-400` on a white/gray-50 background. `gray-400` = `#9CA3AF`, which has a contrast ratio of approximately 2.9:1 against white (#FFFFFF) and approximately 2.6:1 against gray-50 (#F9FAFB). WCAG AA requires 4.5:1 for small text (text-xs = 12px). **This fails WCAG AA.** | Change to `text-gray-500` (#6B7280), which provides approximately 4.6:1 contrast against white. This meets AA while remaining visually unobtrusive. | **WCAG 1.4.3 (Contrast Minimum)** -- legal disclosure text must be readable. Low contrast undermines both compliance and trust. |
| P2 | H4: Consistency | Multiple pages | Disclosure is placed at the page bottom on all pages (`/tools/[slug]`, `/compare`, `/situations/[slug]`, `/onboarding/result`). Consistent placement is good. However, on the result page, it appears below `ResultShareBar`, which includes a "불만족" re-do section. The disclosure sits between the share/feedback area and the page footer, which is natural. | No change needed for placement. | -- |
| P3 | Semantic HTML | `AffiliateDisclosure.tsx` | Uses a bare `<p>` tag. For legal/compliance content, wrapping in a `<footer>` or `<aside>` element with `role="contentinfo"` would improve document semantics. | Wrap in `<aside aria-label="제휴 공시">` to clearly demarcate it as supplementary information. | **WCAG 1.3.1** -- structural semantics help screen readers navigate past boilerplate content. |

### Category 3: Header CTA UX

| Priority | Heuristic / Principle | Location | Current | Proposed Fix | Rationale |
|---|---|---|---|---|---|
| P1 | Responsive / Mobile Crowding | `Header.tsx` lines 42-81 | The right side of the header contains up to 4 elements on onboarded state: LevelBadge (with XP bar, approximately 120px wide), "다시 추천받기" text, "토이 프로젝트" link, "전체 도구" link. On screens narrower than 375px (iPhone SE), these will overflow or wrap awkwardly. There is no responsive breakpoint handling. | At minimum, hide "토이 프로젝트" and "전체 도구" links on small screens (`hidden sm:inline`) and move them to a hamburger menu or bottom nav. Alternatively, collapse the LevelBadge to icon-only on mobile (`showXp={false}` on small screens). | **Mobile usability** -- header overflow causes horizontal scroll or text truncation, violating touch target size requirements (44x44px) and creating a cluttered first impression. |
| P1 | Fitts's Law / Touch Targets | `Header.tsx` lines 50-56 | The "AI 추천받기" pill button uses `px-3 py-1.5 text-sm`. This renders as approximately 85x28px. On mobile, the minimum recommended touch target is 44x44px (WCAG 2.5.5 Level AAA) or at minimum 24x24px (Level AA). The 28px height is marginal. | Increase to `px-4 py-2` or add `min-h-[44px]` on mobile. Use `px-3 py-1.5 sm:px-4 sm:py-2` for responsive sizing. | **Fitts's Law** -- a small CTA button increases acquisition time and error rate. This is the primary conversion entry point; it should be easy to tap. |
| P2 | H8: Visual Hierarchy / Competition | `Header.tsx` | The "AI 추천받기" blue pill button (`bg-blue-500 text-white rounded-full`) is visually more prominent than the navigation links ("토이 프로젝트", "전체 도구" in `text-gray-600`). This is correct -- the CTA should stand out. However, when the LevelBadge is also present (onboarded state), the badge's `bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200` competes for attention with the "다시 추천받기" text link, which has no background. The badge draws the eye more than the re-onboarding CTA. | For onboarded users, consider making "다시 추천받기" slightly more visible: `text-blue-500 hover:text-blue-600 font-medium underline-offset-2 hover:underline`. The subtle underline on hover signals interactivity without competing with the badge. | **Gestalt: Similarity** -- interactive elements should share visual cues (underline, hover effect) that distinguish them from decorative elements (badge). |
| P3 | Copy Clarity | `Header.tsx` line 55 | "AI 추천받기" is clear for the target audience (AI beginners). "다시 추천받기" (line 61) clearly communicates the repeat action. Both are good. Minor improvement: the non-onboarded version could be slightly more specific: "나에게 맞는 AI 찾기" to match the hero section's value proposition. | Consider A/B testing "AI 추천받기" vs "나에게 맞는 AI 찾기" in the future. Not a launch blocker. | **H2: Match between system and real world** -- echoing the landing page language creates consistency. |

### Category 4: Analytics Privacy

| Priority | Heuristic / Principle | Location | Current | Proposed Fix | Rationale |
|---|---|---|---|---|---|
| P1 | Privacy / Korean PIPA Compliance | `layout.tsx` lines 68-89 | AdSense script loads unconditionally (no env gating) on every page. GA4 is conditional on `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Neither has a cookie consent mechanism. Under Korea's PIPA (Personal Information Protection Act) and the Telecommunications Business Act, collecting personal information (including cookies/device identifiers) requires prior notice. AdSense and GA4 both set cookies (`_ga`, `_gid`, `_gads`, `__gads`, etc.). While Korean law is less strict than GDPR for analytics cookies, a **privacy notice or consent banner is strongly recommended** for AdSense specifically, as it uses cookies for ad personalization. | (1) Add a lightweight cookie consent banner that appears on first visit. At minimum: "이 사이트는 Google 광고 및 분석 서비스를 위해 쿠키를 사용합니다. [확인]" with a link to a privacy policy. (2) Gate the AdSense script on consent, similar to how GA4 is gated on an env var. (3) Add a `/privacy` page describing what data is collected and how it's used. | **Legal compliance**: While Korea doesn't require GDPR-style opt-in for all cookies, ad-serving cookies that track across sites require disclosure. The absence of any privacy notice creates legal risk. Google AdSense ToS itself recommends a privacy policy page. |
| P2 | AdSense Unconditional Loading | `layout.tsx` line 68-73 | The AdSense script loads on every page, including local development. Unlike GA4, there is no env var gate. This means every `npm run dev` session loads the Google ad network script, slowing local development and potentially sending dev traffic to AdSense. | Gate AdSense loading on a `NEXT_PUBLIC_ADSENSE_ENABLED` env var or at minimum check `process.env.NODE_ENV === 'production'`. Pattern: `{process.env.NODE_ENV === 'production' && <Script ... />}`. | **H7: Flexibility and efficiency** -- dev environment should be fast and free of production-only scripts. Also prevents accidental ad impressions from localhost. |
| P3 | Script Placement | `layout.tsx` lines 67-89 | Scripts are inside `<head>`. Next.js `<Script>` with `strategy="afterInteractive"` handles this correctly regardless of DOM placement (it injects into `<body>` at runtime). However, placing `<Script>` inside `<head>` is semantically confusing for developers reading the code, since `afterInteractive` scripts don't belong in `<head>`. | Move `<Script>` tags into the `<body>` element for code clarity. Functionally equivalent but less confusing. | **Code readability** -- not a user-facing issue, but improves DX. |

### Category 5: Outbound Link UX

| Priority | Heuristic / Principle | Location | Current | Proposed Fix | Rationale |
|---|---|---|---|---|---|
| P1 | H2: Match between system and real world | `OutboundToolLink.tsx` | The component correctly sets `target="_blank"` and `rel="noopener noreferrer"`, but the rendered link has **no visual indicator** that it opens in a new tab. There is no external link icon, no "새 탭에서 열림" text, and no `aria-label` suffix. Users clicking the link may not expect to leave the current site. | (1) Add an external link icon (the SVG arrow already used in `situation-detail.tsx` line 140-142) as a default child or trailing element. (2) Add `aria-label` that appends "(새 창에서 열림)" to the tool name: `aria-label={\`${toolName} (새 창에서 열림)\`}`. | **WCAG 3.2.5 (Change on Request Level AAA) / H2**: Users should be informed before navigation changes context. This is especially important for AI beginners who may not understand tab behavior. |
| P2 | Inconsistency | `situation-detail.tsx` line 132-143 | The primary tool "바로가기" button in the situation detail page uses a raw `<a>` tag with inline `onClick` and manually specified `target="_blank" rel="noopener noreferrer"`, rather than the `<OutboundToolLink>` component. This creates two patterns for the same behavior. | Refactor to use `<OutboundToolLink>` for consistency. The raw `<a>` tag achieves the same result but doesn't benefit from future changes to the centralized component. | **H4: Consistency and standards** -- one pattern for outbound links, not two. If `OutboundToolLink` is later enhanced (e.g., with an external link icon), this raw `<a>` tag won't get the update. |
| P3 | Analytics Robustness | `OutboundToolLink.tsx` line 21-23 | `trackToolClick` fires in `onClick` before the browser navigates. For `target="_blank"`, this is fine because the current page stays open. But if `target="_blank"` is ever removed, the page navigates away before the analytics event reaches GA4. | Consider using `navigator.sendBeacon` in the analytics layer or `transport_type: 'beacon'` in gtag config for reliability. Not urgent since `target="_blank"` is used. | **Defensive design** -- future-proofing the analytics pipeline. |

---

## Scores (1-5 per category)

| Category | Score | Rationale |
|---|---|---|
| **Ad UX** | 3.5 / 5 | Good placement strategy (excluded from conversion paths, placed at content breaks). Loses points for insufficient `minHeight` causing potential CLS, the interruption of the learn-then-act flow on situation pages, and no ad labeling for transparency. |
| **Disclosure UX** | 3 / 5 | Text content is appropriate and FTC-compliant. Placement is consistent across pages. Loses points for **failing WCAG AA contrast** (P1 issue) and lack of semantic HTML wrapper. |
| **Header CTA** | 3 / 5 | Smart use of onboarding state to switch copy. Good visual hierarchy (blue pill stands out). Loses points for mobile overflow risk (P1) and marginal touch target size (P1). Two P1s in the header is concerning. |
| **Privacy** | 2.5 / 5 | GA4 conditional loading is well done. Loses significant points for no cookie consent mechanism (P1 for Korean market), unconditional AdSense loading in dev, and no privacy policy page. |
| **Outbound Links** | 3.5 / 5 | `OutboundToolLink` is a clean, reusable component with correct security attributes. Loses points for no visual external link indicator (P1) and inconsistent usage (one raw `<a>` tag bypasses the component). |

**Overall Score: 3.1 / 5**

---

## Implementation Suggestions

### High Priority (P1 fixes)

**1. AdUnit format-aware min-height (`AdUnit.tsx`):**
```tsx
const minHeightMap: Record<string, string> = {
  rectangle: '250px',
  horizontal: '90px',
  vertical: '600px',
  auto: '250px',
};

// In the <ins> element:
style={{ display: 'block', minHeight: minHeightMap[format] ?? '250px' }}
```

**2. AffiliateDisclosure contrast fix (`AffiliateDisclosure.tsx`):**
```tsx
<p className="text-xs text-gray-500 mt-8 text-center">
```
Change `text-gray-400` to `text-gray-500`. One class change, WCAG AA met.

**3. Header mobile responsive (`Header.tsx`):**
```tsx
<div className="flex items-center gap-2 sm:gap-4">
  {/* LevelBadge: hide XP on mobile */}
  {mounted && progress.isOnboarded && (
    <LevelBadge progress={progress} showXp={false} size="sm" />
  )}

  {/* CTA: slightly larger touch target */}
  {mounted && !progress.isOnboarded ? (
    <Link
      href="/onboarding"
      className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors whitespace-nowrap"
    >
      AI 추천받기
    </Link>
  ) : mounted && progress.isOnboarded ? (
    <Link
      href="/onboarding"
      className="text-sm text-blue-500 hover:text-blue-600 transition-colors font-medium whitespace-nowrap"
    >
      다시 추천받기
    </Link>
  ) : null}

  {/* Nav links: hidden on mobile */}
  <Link href="/projects" className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900">
    토이 프로젝트
  </Link>
  <Link href="/tools" className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900">
    전체 도구
  </Link>
</div>
```

**4. OutboundToolLink external indicator:**
```tsx
return (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
    onClick={handleClick}
    aria-label={`${toolName} (새 창에서 열림)`}
  >
    {children}
    <svg className="inline-block w-3 h-3 ml-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </a>
);
```
Note: The icon should be conditional or opt-out via a `showIcon` prop, since some call sites may already include their own icon.

**5. Cookie consent / privacy notice (`layout.tsx`):**
Minimum viable approach for Korean market:
- Gate AdSense on `process.env.NODE_ENV === 'production'`
- Add a simple banner component that stores consent in localStorage
- Add a `/privacy` page (can be a static markdown page)

### Lower Priority (P2/P3)

- Add `role="complementary" aria-label="광고"` to `AdUnit.tsx` outer div
- Wrap `AffiliateDisclosure` in `<aside aria-label="제휴 공시">`
- Add `<p className="text-xs text-gray-300 text-center mb-2">광고</p>` above each `<AdUnit>`
- Reduce `mb-12` to `my-6` on compare page ad
- Refactor raw `<a>` in `situation-detail.tsx` to use `<OutboundToolLink>`
- Move `<Script>` tags from `<head>` to `<body>` in layout.tsx

---

## Accessibility Notes

1. **FAIL: AffiliateDisclosure contrast** -- `text-gray-400` (#9CA3AF) on white fails WCAG AA 4.5:1 minimum. Fix: use `text-gray-500`.
2. **WARN: AdUnit not labeled** -- ad container has no ARIA role or label. Screen reader users cannot distinguish ad content from page content.
3. **WARN: OutboundToolLink** -- no `aria-label` indicating new window opening. Screen reader users are not warned of context change.
4. **WARN: Header touch targets** -- CTA button height (~28px) is below the 44px recommended minimum for mobile touch targets.
5. **OK: Skip link** -- `layout.tsx` has a proper skip-to-content link. Good.
6. **OK: Header nav** -- uses `<nav>` with `aria-label`. Good.
7. **OK: Header logo** -- has `aria-label="AI 가이드 홈으로 이동"`. Good.

---

## Verdict: NEEDS CHANGES (5 P1 issues)

### P1 Summary

| # | Issue | Component | Effort |
|---|---|---|---|
| 1 | AdUnit `minHeight` insufficient for rectangle ads, will cause CLS | `AdUnit.tsx` | S (5 min) |
| 2 | AffiliateDisclosure fails WCAG AA contrast | `AffiliateDisclosure.tsx` | S (1 min) |
| 3 | Header overflows on mobile (<375px), nav items not responsive | `Header.tsx` | M (20 min) |
| 4 | Header CTA touch target below 44px minimum | `Header.tsx` | S (5 min) |
| 5 | OutboundToolLink has no visual/ARIA indication of external navigation | `OutboundToolLink.tsx` | S (10 min) |

### Deferred (recommended before launch but not blocking this review cycle)

| # | Issue | Component | Effort |
|---|---|---|---|
| 6 | No cookie consent banner or privacy page (Korean PIPA) | New component + page | M (1-2 hrs) |
| 7 | AdSense loads unconditionally in dev environment | `layout.tsx` | S (5 min) |

P1 issues 1-5 should be addressed in this cycle. Issues 6-7 are P1 from a legal/compliance perspective but are separate workstreams that may require PM input on privacy policy content.
