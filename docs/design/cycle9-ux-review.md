# Cycle 9 UX Review: Use Case Library + Progress Tracking

> **Reviewer:** PD Agent (Senior Product Designer)
> **Date:** 2026-02-17
> **Components Reviewed:** Use Case List, Use Case Detail, My Progress Page, AchievementToast, StreakCounter, AchievementBadge, Header
> **Spec References:** `docs/specs/use-case-library.md`, `docs/specs/progress-tracking.md`

---

## 1. Use Case List (`src/app/use-cases/use-case-list.tsx`)

### 5-Second Test
- **First impression:** Page title "AI 활용 사례" stands out immediately -- good. The subtitle is clear and communicates value.
- **Clarity:** Immediately understandable as a browsable collection of use cases.
- **CTA visibility:** No single primary CTA on the list page, which is correct -- the cards themselves are the targets.

### What Works Well

1. **Filter UX is well-structured.** Two filter groups (profession, category) are clearly labeled ("직업별", "상황별") with `aria-label` on each section. The chip pattern is standard and learnable. (Nielsen H6: Recognition rather than recall)
2. **Card hierarchy is strong.** Top row (profession tag + difficulty badge), persona, title, result highlight, tool -- the information scans top-to-bottom naturally. The green result highlight box creates a strong visual focal point. (Gestalt: Figure-Ground)
3. **Empty state is properly handled.** The "해당 조건의 사례가 없습니다" message + "필터 초기화" button meets spec AC-9. The magnifying glass icon provides visual context. (Nielsen H9: Error recovery)
4. **Bottom CTA section.** The gradient card with dual CTAs (상황별 가이드 보기, AI 추천 테스트) provides a good exit strategy for users who want to take action after browsing.
5. **Responsive grid.** `grid md:grid-cols-2 lg:grid-cols-3` covers the 1-2-3 column breakpoints specified in the spec.

### Issues Found

| # | Priority | Heuristic/Principle | Location | Current | Proposed Fix | Rationale |
|---|----------|-------------------|----------|---------|-------------|-----------|
| 1 | P1 | Nielsen H1: Visibility of system status | Filter chips | No indicator showing how many results match the active filter | Add a count badge next to the filter section title, e.g., "17개 사례" that updates reactively. Add `aria-live="polite"` on a result count `<p>` above the grid so screen readers announce changes. | Users need feedback that their filter action took effect, especially when the list scrolls out of view. Hick's Law: seeing counts helps decide which filter to pick. |
| 2 | P1 | Nielsen H3: User control & freedom | Filter chips | When both profession AND category filters are active, there is no single "clear all" visible near the chips -- only the "필터 초기화" in the empty state. | Add a small "초기화" text button next to the section header when any filter is not "all". For example: `직업별 (마케터) [X]`. | If the user applies two filters and gets a small result set, they must click "전체" on each row separately. A combined clear reduces friction. (2 clicks -> 1 click, Fitts's Law) |
| 3 | P2 | Gestalt: Proximity | Filter sections | Gap between profession filter section (`mb-4`) and category filter section (`mb-12`) creates visual imbalance. The profession section is tight (4px bottom), but category has a large 48px gap below before the grid. | Change profession section to `mb-6` and category section to `mb-8`. This creates more balanced breathing room: label -> chips (tight), chips -> next label (medium), last chips -> grid (larger). | The asymmetric spacing weakens the visual grouping between the two filter rows. They should feel like a single "filter panel" unit. |
| 4 | P2 | Cognitive Load / Hick's Law | Profession filter chips | 8 chips (All + 7 professions) is fine on desktop but may cause 2-row wrapping on mobile, making the filters feel heavy relative to the content. | On small screens, consider collapsing the less-common filters behind a "더보기" toggle, or use a horizontal scroll container (`overflow-x-auto flex flex-nowrap`) with a subtle scroll hint gradient. | Miller's Law: 8 options approach the 7+/-2 threshold. On mobile where screen real estate is limited, two rows of chips push the first content card below the fold. |
| 5 | P2 | Fitts's Law | Use case card | The "자세히 보기 →" text at card bottom is small and positioned at the edge. The entire card is clickable (good) but the visual affordance is subtle. | Add a slightly more prominent hover state: the entire card border could shift to `border-blue-300` on hover, and the arrow animation is good. Consider adding `cursor-pointer` explicitly if not inherited from `<Link>`. | Since the whole card is a link, the hover affordance matters more than the text CTA. The current `hover:shadow-lg hover:border-blue-200` is decent but could be slightly more pronounced. |
| 6 | P3 | Accessibility | Filter chips | Filter chips use visual color only (dark bg = selected) to indicate state. No `aria-pressed` or `aria-current` attribute. | Add `aria-pressed={selectedProfession === filter.id}` to each button. This communicates selection state to screen readers. | WCAG 4.1.2: Interactive elements must communicate their state programmatically. |
| 7 | P3 | Nielsen H4: Consistency | Card difficulty badge | `difficultyLabels` is duplicated between `use-case-list.tsx` (line 32) and `[slug]/page.tsx` (line 47). | Extract to a shared constant in `src/lib/constants.ts` or a shared component `<DifficultyBadge difficulty={...} />`. | Maintaining two copies invites drift. Consistency is easier when the source of truth is singular. |

---

## 2. Use Case Detail (`src/app/use-cases/[slug]/page.tsx`)

### 5-Second Test
- **First impression:** The back link, metadata tags (profession + difficulty), bold title, and persona create a strong header. The Challenge/Solution/Result sections are immediately visible through their color-coded backgrounds.
- **Clarity:** Story structure is immediately recognizable.
- **CTA visibility:** The "나도 해보기" gradient CTA is bold and impossible to miss -- excellent prominence.

### What Works Well

1. **Challenge -> Solution -> Result flow is excellent.** The red/blue/green color coding with icon badges (!, AI, checkmark) creates a visually clear narrative arc. This is textbook Gestalt Continuity -- the eye follows the story downward. (Peak-End Rule: the green Result section with the bold `resultHighlight` ends on a high note)
2. **"나도 해보기" CTA is perfectly placed.** Positioned right after the Result section (the emotional peak), it capitalizes on the moment of inspiration. The gradient blue/indigo block is visually dominant and actionable. (Fitts's Law: large target area, full-width)
3. **Tool links are well-integrated.** The "MAIN" badge on primary tool + clean secondary tool chips inside the Solution section feel organic, not bolted on. The links to `/tools/[slug]` satisfy spec AC-11.
4. **JSON-LD and SEO metadata are properly implemented.** `generateMetadata` with OG tags, canonical URL, and structured data satisfy spec AC-14.
5. **Related use cases logic is sound.** Same profession first, then same category -- matches spec AC-13 priority.
6. **Back navigation.** The "활용 사례 목록으로" back link with a chevron icon gives the user a clear escape route. (Nielsen H3: User control and freedom)

### Issues Found

| # | Priority | Heuristic/Principle | Location | Current | Proposed Fix | Rationale |
|---|----------|-------------------|----------|---------|-------------|-----------|
| 8 | P1 | Nielsen H8: Aesthetic & minimalist design | Section headings | "Challenge", "Solution", "Result" are English-only section headings. The entire site is in Korean; the target audience (AI beginners, personas 1-4) may not intuitively parse English section labels. | Add Korean subtitles: "Challenge -- 겪고 있던 문제", "Solution -- AI로 해결한 방법", "Result -- 달성한 성과". Or simply use Korean headings with English as a subtle label. | Nielsen H2: Match between system and real world. The user's language is Korean. English labels create an unnecessary cognitive translation step for the non-technical audience. |
| 9 | P1 | Reading experience | Result section | The `resultHighlight` is displayed at `text-2xl font-bold text-green-700` inside the same green background box as the full `result` text. The highlight competes with the body text below it. | Give `resultHighlight` its own visual container (e.g., a slightly darker green card or a large callout with a divider), then follow with the narrative `result` text in normal weight. This creates two distinct layers: the "wow number" and the "full story". | The highlight is the most shareable, scannable piece of data. It deserves stronger visual separation from the narrative paragraph. Currently both sit in the same `bg-green-50` box and the hierarchy is muddy. |
| 10 | P2 | Cognitive load | Tags section | Tags are displayed as plain gray chips (`#tag`) with no interactivity. They sit between the CTA and related use cases, adding visual noise without function. | Either make tags clickable (link to `/use-cases?tag=...` filtered view) or move them below related use cases so they don't interrupt the action flow. If non-interactive, reduce visual weight: inline text like "태그: 보고서, 마케팅, 시간절약" instead of chip UI. | Non-interactive elements styled as chips create a false affordance (Gestalt: Similarity -- they look like filter chips but do nothing). This adds extraneous cognitive load. |
| 11 | P2 | Nielsen H4: Consistency | Related use cases grid | The grid uses `md:grid-cols-3` which on small screens becomes a single column with 3 stacked cards, potentially pushing the bottom CTA very far down. | Add a "더 많은 사례 보기" link at the end, or cap related cards at 2 on mobile with the third hidden behind a toggle. Alternatively, use a horizontal scroll on mobile for compactness. | The page is already long (header + 3 story sections + CTA + tags + 3 related cards + bottom CTA). On mobile, this could be 6+ scroll-lengths. Reducing the related section's footprint on mobile respects the user's scroll fatigue. |
| 12 | P3 | Accessibility | Back link SVG | The back chevron SVG has no `aria-hidden="true"` attribute. Screen readers may try to announce it. | Add `aria-hidden="true"` to the SVG and ensure the link text "활용 사례 목록으로" is sufficient for assistive technology. | Decorative icons should be hidden from the accessibility tree. |
| 13 | P3 | SEO | JSON-LD | The `buildJsonLd` function creates a minimal Article schema without `datePublished`, `dateModified`, or `image`. | Add `datePublished` (could be a static date from the JSON data or a project-wide constant) and consider adding a `mainEntityOfPage` field pointing to the canonical URL. | Richer structured data improves search snippet quality. Not blocking, but a missed SEO opportunity. |

---

## 3. Cross-linking: Situation Detail (`src/app/situations/[slug]/situation-detail.tsx`)

### What Works Well

1. **Related use cases section is properly implemented.** Lines 266-295 filter `useCasesData.useCases` by matching `uc.situation === situation.slug`, capped at 2 cards. This satisfies the "Should" requirement from the use-case-library spec.
2. **Card design is consistent** with the use case card pattern elsewhere (profession label, title, resultHighlight).
3. **Placement is logical.** The related use cases appear after the "기대 결과" section, which is the natural point where a user thinks "who else has done this?"

### Issues Found

| # | Priority | Heuristic/Principle | Location | Current | Proposed Fix | Rationale |
|---|----------|-------------------|----------|---------|-------------|-----------|
| 14 | P2 | Nielsen H1: Visibility | Related use cases section heading | The heading "이 상황의 활용 사례" appears only when matching cases exist. When none exist, nothing renders -- no indication that use cases exist elsewhere. | When no matching use cases exist for this situation, show a softer CTA: "다른 상황의 활용 사례도 확인해보세요" linking to `/use-cases`. This increases discoverability of the use case library. | Users who land on a situation page via search may never discover the use case library exists. An always-visible cross-link improves navigation. |
| 15 | P3 | Gestalt: Proximity | Related use cases vs related situations | The "이 상황의 활용 사례" section (line 274) and "비슷한 상황 더 보기" section (line 298) are both recommendation blocks placed back-to-back. They can visually blend into each other. | Add a subtle divider (`<hr className="border-gray-100 my-8" />`) or increase spacing between them. Alternatively, group them under a single "더 알아보기" umbrella section with two sub-groups. | Two similar-looking card grids without clear separation create visual confusion. The user might not realize they serve different purposes (use cases vs. other situations). |

---

## 4. My Progress Page (`src/app/my-progress/page.tsx`)

### 5-Second Test
- **First impression:** The hero card with level + XP bar is the clear focal point. The gradient blue treatment signals "this is about you." The stats grid below provides a quick quantitative snapshot.
- **Clarity:** The page purpose is obvious -- "this is my learning dashboard."
- **CTA visibility:** Recommendations section provides clear next-action items.

### What Works Well

1. **ProgressHero is well-designed.** The level icon, title, description, and XP progress bar create a satisfying status display. The `role="progressbar"` with `aria-valuenow/min/max` and descriptive `aria-label` is accessibility-correct. (Nielsen H1: Visibility of system status)
2. **StatsGrid provides the right metrics.** Completed guides, completed steps, tools tried, and streak -- these four numbers map to the core gamification axes. The 2x2 grid on mobile / 4-col on desktop is responsive. (Gestalt: Common Region -- each stat in its own card)
3. **SmartRecommendations is actionable.** Each card links to a situation, shows difficulty, time estimate, and a reason string. The "all complete" state is properly handled with a congratulatory message (AC-15).
4. **Empty state is encouraging, not discouraging.** The seedling icon, warm copy ("아직 학습 기록이 없어요"), and dual CTAs ("첫 가이드 시작하기" + "맞춤 추천받기") guide without guilt. (Peak-End Rule: the empty state is the first impression for new users -- it must be motivating)
5. **Skeleton loading state is implemented.** `ProgressSkeleton` with `animate-pulse` placeholders prevents layout shift during hydration. This is especially important since the page depends on `localStorage`. (Nielsen H1)
6. **CompletionTimeline** with dates, icons, and links back to situations creates a nice "journal" feel.

### Issues Found

| # | Priority | Heuristic/Principle | Location | Current | Proposed Fix | Rationale |
|---|----------|-------------------|----------|---------|-------------|-----------|
| 16 | P1 | Nielsen H1: Visibility of system status | ProgressHero | The "다음 레벨까지 X XP" text shows remaining XP but does not show what the next level is. The user only sees their current level title. | Add a subtle hint: "다음: Lv.{n+1} {nextLevelTitle}" below the progress bar, or show it on hover/tooltip. Knowing "I'm 50 XP from becoming an 'AI 실험가'" is more motivating than "I need 50 more XP." | Gamification theory (Self-Determination Theory, competence): goal clarity increases motivation. An abstract "50 XP to go" is less compelling than a named milestone. |
| 17 | P1 | Page length / information density | Full page | The page stacks 5 sections vertically: Hero, Stats, Recommendations, Achievements, Timeline. For a user with moderate activity (5 completed, 3 achievements), this is a very long scroll on mobile. | Consider collapsing the Timeline section by default with a "모두 보기" toggle (show latest 3 by default). Or consolidate Stats + Achievements into a tabbed view. The goal is to keep the most actionable content (Recommendations) above the fold. | Cognitive Load: too many sections compete for attention. The Recommendations section is the highest-value for retention (it tells you what to do next), but it sits third in the page, potentially below the fold on mobile after Hero + Stats. |
| 18 | P2 | Gestalt: Similarity | StatsGrid | The "연속 학습" stat renders its value as either `🔥3일` (string with emoji) or `-` (dash). The other 3 stats render as plain numbers. This inconsistency in value formatting breaks the visual rhythm. | Standardize: show the number only (e.g., "3") as the large value, and incorporate the fire emoji in the icon or label instead: icon = "🔥", value = "3일", label = "연속 학습". Or when streak is 0, show "0일" instead of "-". | Consistency principle: all four stat cards should follow the same pattern (icon, large number, label). A dash reads as "not applicable" rather than "zero," which undermines the streak's motivational purpose. |
| 19 | P2 | Fitts's Law | Recommendations section | When recommendations render, the "시작하기" action is implicit (the entire card is a link), but there is no visible button-like CTA within the card. Users must discover that the card is clickable. | Add a small "시작하기 >" text-button at the bottom-right of each recommendation card, consistent with how the use case cards have "자세히 보기 →". | The recommendation cards display reason + time but lack a clear action affordance. While the entire card is tappable, an explicit CTA text increases click-through confidence, especially for less tech-savvy users. |
| 20 | P2 | Accessibility | AchievementsGrid | Achievement badges use `title` attribute for tooltip on hover. This is not accessible to keyboard users or touch-only users. | Replace `title` with a custom tooltip component or use `aria-describedby` linking to a visually hidden `<span>` that contains the condition text. Alternatively, show the condition text visibly for locked achievements (which is already done -- `achievement.condition` is shown). The `title` can be removed for locked badges since the text is visible. | `title` attributes are unreliable for accessibility: not announced consistently by screen readers, invisible on touch devices. Since locked badges already show the condition text visually, the `title` on locked badges is redundant. For earned badges, the date is shown visually. Remove `title` dependency. |
| 21 | P2 | Nielsen H8: Minimalist design | StatsGrid icons | The stats section uses emoji icons ("📋", "✅", "🛠️", "📅") which may render differently across devices/OS. On some Android devices, these can appear as outlined/colorless glyphs. | Consider using consistent SVG icons or Tailwind-based icon components instead of emoji. If emoji must be used, test rendering on target devices (especially older Android WebView for toss-in-app). | Emoji rendering inconsistency breaks visual polish. Platform-consistent SVG icons are more reliable for a production app. |
| 22 | P3 | Cognitive load | EmptyState | The empty state shows when `!hasActivity && !progress.isOnboarded`. A user who completed onboarding but no guides sees the normal page with all zeros, which could feel discouraging. | Add an intermediate state for "onboarded but no completions": show the recommendations section prominently with a warm message like "추천 가이드를 시작해볼까요? 첫 가이드를 완료하면 경험치를 받아요!" above the zero-state stats. | The onboarded user already invested effort. Showing a dashboard of all zeros is a negative peak moment. A "get started" nudge is more welcoming than raw zeros. |
| 23 | P3 | Consistency | `DEFAULT_PROGRESS` duplication | `DEFAULT_PROGRESS` is defined identically in both `my-progress/page.tsx` (line 16) and `Header.tsx` (line 10). | Export from `levelSystem.ts` (where it likely already exists) and import in both places. | Two copies will drift over time when fields are added. Single source of truth. |

---

## 5. AchievementToast (`src/components/AchievementToast.tsx`)

### What Works Well

1. **Queue mechanism is correct.** Multiple achievements are queued and shown sequentially (line 17: `queueRef.current.shift()`). This prevents overlapping toasts.
2. **`role="alert"` and `aria-live="polite"`** correctly announce the achievement to screen readers.
3. **Animation timing is appropriate.** 300ms fade-out + 3000ms display creates a smooth, non-jarring experience.
4. **Positioning is centered bottom** (`fixed bottom-6 left-1/2 -translate-x-1/2`), which is standard toast placement that avoids interfering with navigation.

### Issues Found

| # | Priority | Heuristic/Principle | Location | Current | Proposed Fix | Rationale |
|---|----------|-------------------|----------|---------|-------------|-----------|
| 24 | P1 | Nielsen H3: User control | Toast dismissal | The toast auto-dismisses after 3 seconds but cannot be manually dismissed by the user. There is no close button or swipe-to-dismiss. | Add a small close button (X) at the right edge of the toast, or allow click-to-dismiss. For keyboard users, add `tabIndex={0}` and handle `Escape` key to dismiss. | 3 seconds may not be enough for slow readers (especially Korean text with XP info). Users should be able to dismiss early if they saw it, or keep it visible longer if needed. Not blocking launch since the toast is positive feedback, but it's an accessibility gap. |
| 25 | P2 | Accessibility | Toast focus management | When the toast appears, it doesn't receive focus. Keyboard users may not be aware of it. | Since this is a non-critical notification (positive reinforcement, not an error), `aria-live="polite"` is the correct approach and focus should NOT be moved. Current implementation is correct. However, ensure the toast is rendered in a portal at the document root to avoid z-index stacking issues with modals or sticky headers. | No change needed for focus. The portal concern is minor since the app doesn't currently use modals. |
| 26 | P3 | Visual design | Toast color | The toast uses a white background with gray border. For a "celebration" moment, this feels muted. | Consider a subtle gradient background (e.g., `bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200`) to make the achievement moment feel special. The current white treatment makes it look like a generic system notification rather than a reward. | Peak-End Rule: achievement moments are peak moments. They should feel visually distinct and celebratory to reinforce the reward loop. |

---

## 6. StreakCounter (`src/components/StreakCounter.tsx`)

### What Works Well

1. **Conditional rendering is correct.** `streak <= 0` returns null -- the counter only appears when there's an active streak. (AC-12)
2. **Excellent `aria-label`.** `${streak}일 연속 학습 중. 내 학습 현황 보기` communicates both the stat and the action.
3. **Clickable as a link to `/my-progress`.** This is a smart shortcut that increases discoverability of the progress page.
4. **Visual design is compact and warm.** Orange fire emoji + bold number on a light orange pill is visually appropriate and small enough for the header.

### Issues Found

| # | Priority | Heuristic/Principle | Location | Current | Proposed Fix | Rationale |
|---|----------|-------------------|----------|---------|-------------|-----------|
| 27 | P2 | Gamification psychology | Motivation vs. pressure | The streak only shows when active. When a user misses a day and loses their streak, there's no acknowledgment or recovery path. The counter simply vanishes. | After a streak breaks (was > 0, now reset to 1 or 0), consider showing a brief one-time message on the progress page: "스트릭이 끊겼어요. 오늘 다시 시작해볼까요?" This reframes the break as a restart, not a failure. | Streak mechanics can be demotivating when broken (loss aversion). The abrupt disappearance of the counter can feel punishing. A "restart" nudge converts a negative moment into a re-engagement opportunity. (This is a "Should" level suggestion, not blocking.) |
| 28 | P3 | Visual consistency | Size | The counter height is determined by `py-1` (8px vertical padding) + text-sm line height. In the Header alongside the LevelBadge (which has `py-1` + multi-line content), the vertical alignment may appear slightly off. | Ensure both StreakCounter and LevelBadge share the same height. Add `h-8` or a consistent `py-1.5` to both to guarantee visual alignment. | Gestalt: Continuity -- elements on the same row should share the same baseline and height. |

---

## 7. Header (`src/components/Header.tsx`)

### 5-Second Test
- **First impression:** Logo left, actions right -- standard layout. The streak and level badge are visible for onboarded users.
- **Clarity:** Navigation is minimal and purposeful.
- **CTA visibility:** "AI 추천받기" blue button is the obvious CTA for new users.

### What Works Well

1. **Conditional rendering based on onboarding state.** New users see "AI 추천받기" CTA, returning users see streak + level badge + "다시 추천받기" + "활용 사례" + "전체 도구". This progressive disclosure is well-executed. (Nielsen H7: Flexibility and efficiency)
2. **Sticky header with backdrop blur.** `sticky top-0 z-50 bg-white/90 backdrop-blur-md` is a modern, polished pattern that keeps navigation accessible during scroll.
3. **`role="banner"` and `aria-label="메인 네비게이션"` on the `<nav>`.** Correct semantic structure.
4. **Hydration-safe rendering.** The `mounted` state guard prevents SSR/client mismatch for localStorage-dependent content.

### Issues Found

| # | Priority | Heuristic/Principle | Location | Current | Proposed Fix | Rationale |
|---|----------|-------------------|----------|---------|-------------|-----------|
| 29 | P0 | Mobile overflow risk | Header right section | For an onboarded user, the right side contains: StreakCounter + LevelBadge (with XP bar) + "다시 추천받기" text + "활용 사례" text + "전체 도구" text. On a 320px-375px screen, this WILL overflow horizontally. | **Immediate fix:** Hide "다시 추천받기" and "활용 사례" on mobile (already partially done with `hidden sm:inline` for "다시 추천받기" and "활용 사례"). **Verify:** LevelBadge with `showXp size="sm"` still renders XP text + progress bar which adds ~100px+ width. Consider hiding the XP bar on mobile: `showXp={false}` on small screens, or introduce a `showXp` media query variant. **Long-term:** Introduce a mobile hamburger menu or bottom navigation for links. | On a 375px iPhone screen, the logo takes ~100px, leaving ~275px for the right side. StreakCounter (~50px) + LevelBadge with XP (~140px) + "전체 도구" text (~60px) = ~250px. This is tight and will break with slightly longer level titles or higher XP numbers. This is a launch-blocking layout overflow. |
| 30 | P1 | Nielsen H8: Minimalist design | Header elements | The header contains 5-6 interactive elements for onboarded users: logo, streak, level badge, "다시 추천받기", "활용 사례", "전체 도구". This is information-dense for a header. | Reduce to essentials: Logo, StreakCounter (mobile: icon only), LevelBadge (mobile: icon only, no XP), one nav link. Move secondary navigation to a "더보기" dropdown or a bottom tab bar. | Hick's Law: more options = slower decisions. The header is the user's constant navigation anchor -- it should be scannable in under 2 seconds. 6 elements exceeds that threshold, especially on mobile. |
| 31 | P2 | Accessibility | "전체 도구" link | This link does not have `hidden sm:inline` like the others, meaning it's always visible. But "활용 사례" is hidden on mobile (`hidden sm:inline`). This creates an inconsistency in mobile navigation: users can reach "전체 도구" but not "활용 사례" from the mobile header. | Either hide "전체 도구" on mobile too (and provide both via another discovery path like a menu), or show both on mobile. The asymmetry creates confusion: users on mobile who want "활용 사례" have no header path. | Navigation must be consistent and predictable. Showing one link but hiding another of equal importance breaks the user's mental model. |
| 32 | P2 | Visual hierarchy | LevelBadge in header | The LevelBadge with gradient background, border, icon, title, AND XP bar is visually heavy for a header element. It competes with the logo for attention. | Use a simplified header variant: just the icon + "Lv.3" text, no gradient, no XP bar. The full LevelBadge is appropriate on the progress page hero, not the header. | The header should feel lightweight. A complex multi-line badge with gradient and progress bar adds visual weight that makes the header feel cluttered. (Gestalt: Figure-Ground -- the header should be ground, not figure) |

---

## 8. Accessibility Audit

### Semantic HTML

| Component | Status | Notes |
|-----------|--------|-------|
| Use Case List | Good | `<header>`, `<section>` with `aria-label`, `<button>` for filters |
| Use Case Detail | Good | `<header>`, `<section>` for each story block, `<Link>` for navigation |
| My Progress Page | Mostly good | `role="progressbar"` on XP bar with full ARIA attributes. Sections lack `aria-label`. |
| AchievementToast | Good | `role="alert"`, `aria-live="polite"` |
| StreakCounter | Good | Excellent `aria-label` on the link |
| Header | Good | `role="banner"`, `aria-label` on nav, descriptive link labels |
| AchievementBadge | Needs fix | Relies on `title` attribute (see issue #20) |

### ARIA Labels

| Issue | Location | Fix |
|-------|----------|-----|
| Filter chips lack `aria-pressed` | `use-case-list.tsx` line 81, 102 | Add `aria-pressed={selectedProfession === filter.id}` |
| Achievement condition not accessible on locked badges | `AchievementBadge.tsx` | Already visible as text -- acceptable. Remove redundant `title`. |
| Progress sections missing `aria-label` | `my-progress/page.tsx` | Add `aria-label` to each `<section>`: "레벨 정보", "학습 통계", "추천 가이드", "업적", "완료 기록" |

### Color Contrast

| Element | Foreground | Background | Estimated Ratio | WCAG AA Pass? |
|---------|-----------|------------|-----------------|---------------|
| Difficulty "쉬움" badge | `text-green-700` (#15803d) | `bg-green-100` (#dcfce7) | ~5.2:1 | Yes |
| Difficulty "보통" badge | `text-yellow-700` (#a16207) | `bg-yellow-100` (#fef9c3) | ~4.8:1 | Borderline -- verify with tool |
| Difficulty "어려움" badge | `text-red-700` (#b91c1c) | `bg-red-100` (#fee2e2) | ~5.0:1 | Yes |
| Result highlight | `text-green-800` (#166534) | `bg-green-50` (#f0fdf4) | ~7.5:1 | Yes |
| Locked achievement text | `text-gray-400` (#9ca3af) | `bg-gray-50` (#f9fafb) | ~2.5:1 | **NO -- Fails WCAG AA** |
| Streak counter text | `text-orange-600` (#ea580c) | `bg-orange-50` (#fff7ed) | ~4.6:1 | Borderline |
| Recommendation reason | `text-blue-500` (#3b82f6) | `bg-white` (#fff) | ~4.6:1 | Borderline |

**Critical finding:** Locked achievement badge text (`text-gray-400` on `bg-gray-50`) at ~2.5:1 contrast ratio fails WCAG AA minimum of 4.5:1 for normal text and 3:1 for large text. This needs correction.

### Keyboard Navigation

| Component | Tab navigable? | Focus visible? | Notes |
|-----------|---------------|----------------|-------|
| Filter chips (buttons) | Yes | Default browser outline | Consider adding explicit `focus-visible:ring-2 focus-visible:ring-blue-500` |
| Use case cards (links) | Yes | Default | The `hover:shadow-lg` should have a matching `focus-visible:shadow-lg` |
| AchievementToast | Not focusable | N/A | Acceptable -- it's a passive notification with `aria-live` |
| Timeline items (links) | Yes | Default | OK |
| Header links | Yes | Default | OK |

---

## Scoring

| Component | Score (1-5) | Rationale |
|-----------|-------------|-----------|
| **Use Case Cards** | 4 | Strong hierarchy, good hover states, responsive grid. Loses a point for missing filter count feedback and `aria-pressed`. |
| **Use Case Detail** | 4.5 | Excellent story structure, perfect CTA placement, solid SEO. Minor issues with English headings and tag interactivity. |
| **Progress Page** | 4 | Good information architecture, well-handled empty/complete states, proper loading skeleton. Loses a point for page length on mobile and the zero-state gap for onboarded users. |
| **Achievements** | 3.5 | Functional badge design with earned/locked states. Loses points for contrast failure on locked badges, `title` attribute reliance, and muted toast visual. |
| **Header Integration** | 3 | Correct conditional logic and sticky behavior. **Loses points for P0 mobile overflow risk**, visual heaviness of LevelBadge, and asymmetric nav link visibility. |
| **Accessibility** | 3.5 | Good foundation (`aria-label`, `role`, semantic HTML). Key gaps: filter `aria-pressed`, locked badge contrast ratio failure, missing `focus-visible` styles, `title` dependency. |

---

## Summary

### P0 Issues (Must fix this cycle): 1

| # | Issue | Component |
|---|-------|-----------|
| 29 | Mobile header overflow with streak + LevelBadge + nav links on 320-375px screens | Header |

### P1 Issues (Should fix before launch): 5

| # | Issue | Component |
|---|-------|-----------|
| 1 | No result count feedback when filters are applied | Use Case List |
| 2 | No combined "clear all filters" control when multiple filters active | Use Case List |
| 8 | English-only section headings for Korean audience | Use Case Detail |
| 16 | Next level name/title not shown on progress bar | My Progress |
| 24 | Toast cannot be manually dismissed (keyboard/tap) | AchievementToast |

### P2 Issues (Fix if time allows): 12

Issues #3, #4, #5, #9, #10, #11, #14, #15, #17, #18, #19, #20, #21, #27, #28, #31, #32

### P3 Issues (Backlog): 6

Issues #6, #7, #12, #13, #22, #23, #25, #26

---

## Verdict: **NEEDS CHANGES** (1 P0, 5 P1)

The P0 header overflow on mobile must be resolved before launch. The five P1 issues represent meaningful usability gaps that should be addressed in this cycle. The overall quality of both features is high -- the story structure, gamification UX, and component architecture are well-executed. After fixing the P0 and P1 items, both features will be ready for production.

### Priority Fix Order

1. **Header mobile overflow** (P0 #29) -- test on 320px/375px widths, simplify LevelBadge for mobile
2. **Filter result count + clear all** (P1 #1, #2) -- small state additions
3. **Korean section headings** (P1 #8) -- copy change only
4. **Next level preview** (P1 #16) -- small data addition
5. **Toast dismiss** (P1 #24) -- add close button + Escape key handler
6. **Locked badge contrast** (Accessibility) -- change `text-gray-400` to `text-gray-500` on `bg-gray-50`
