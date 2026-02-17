# UX Review - Cycle 2 (Landing + Onboarding)

> **Reviewer**: PD Agent (Senior Product Designer)
> **Date**: 2026-02-17
> **Scope**: Landing page redesign + Onboarding flow + Result page
> **Verdict**: NEEDS CHANGES (3 P0, 6 P1)

---

## Overall Assessment

The implementation is **structurally solid**. The section-by-section landing flow follows an effective persuasion structure (Hero > Empathy > Process > Social Proof > Search > CTA), and the onboarding wizard provides a clean 4-step flow with proper state management. The Korean copy is natural and empathetic, well-targeted at AI beginners.

**Key strengths**: Semantic HTML is used consistently, the step indicator in onboarding is well-designed with both a progress bar and step circles, the landing page sections alternate backgrounds for visual rhythm, and the responsive grid system is mostly sound.

**Key weaknesses**: The onboarding flow has several critical accessibility gaps (no keyboard trap management in the mobile overlay, missing ARIA live regions for step transitions), the Header lacks an onboarding entry point (violating the spec's "multiple entry points" requirement), and several touch targets are undersized on mobile. The conversion path from landing to onboarding is strong, but the path from result page back into the guide ecosystem has friction.

---

## Score Card

| Category | Score (1-5) | Notes |
|----------|------------|-------|
| Information Architecture | 4 | Logical flow. Landing > Onboarding > Result > Guide path is clear. Header missing onboarding CTA is a gap. |
| Visual Hierarchy | 4 | Hero headline is dominant. Stats count-up is engaging. Result page primary card stands out well. Minor: section titles could use more consistent sizing. |
| Copy & Tone | 4.5 | Excellent Korean copy. Natural, empathetic, avoids jargon. Pain point quotes feel real. Minor grammar issue in personalized reason. |
| Interaction Design | 3 | Card selection feedback is good. Auto-advance with 300ms delay works well. But: no loading states between steps, animation classes reference CSS but could fail silently, back navigation doesn't restore visual selection state immediately. |
| Accessibility | 2.5 | Semantic HTML is good (sections with aria-labelledby, sr-only headings). But: mobile overlay lacks focus trap, step transitions have no ARIA live regions, QuestionCard has no role="radio" semantics, backdrop click handler is a div with no keyboard equivalent. |
| Mobile UX | 3.5 | Responsive grids are correct. But: ReturningUserBanner buttons are too small (text-xs with py-1.5 = ~30px height), some touch targets in search section are undersized, mobile overlay has no swipe-to-dismiss affordance. |
| Conversion Optimization | 4 | Landing > onboarding path is very clear with multiple CTAs. Result page has strong primary CTA. Affiliate disclosure is properly placed. Minor: no urgency/scarcity elements, share URL uses Base64 which looks unfriendly when shared. |

---

## Critical Issues (Must Fix)

### Issue 1: Mobile Search Overlay Lacks Focus Trap and Keyboard Dismiss

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/landing/QuickSearchSection.tsx`, lines 144-166
- **Heuristic violated**: Nielsen H3 (User control and freedom), WCAG 2.1 SC 2.1.2 (No Keyboard Trap)
- **Problem**: The mobile guide panel overlay (`role="dialog" aria-modal="true"`) opens but does not trap focus inside the dialog. Users navigating with keyboard or screen readers can tab behind the overlay. Also, the backdrop dismiss handler is on a `<div onClick>` with no keyboard equivalent -- pressing Escape does nothing.
- **Impact**: Screen reader and keyboard users cannot properly interact with or dismiss the modal. This is a WCAG AA violation.
- **Severity**: P0 -- Accessibility blocker
- **Suggestion**:

```tsx
// Add useEffect for Escape key and focus trap
useEffect(() => {
  if (!selectedSituation) return;

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      handleClosePanel();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  // Trap focus: save previous active element, focus first element in dialog
  const previouslyFocused = document.activeElement as HTMLElement;

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    previouslyFocused?.focus();
  };
}, [selectedSituation, handleClosePanel]);
```

Also change the backdrop div to a `<button>`:

```tsx
// Old:
<div
  className="absolute inset-0 bg-black/50"
  onClick={handleClosePanel}
  aria-label="가이드 패널 닫기"
/>

// New:
<button
  type="button"
  className="absolute inset-0 bg-black/50 cursor-default"
  onClick={handleClosePanel}
  aria-label="가이드 패널 닫기"
  tabIndex={-1}
/>
```

### Issue 2: Onboarding Question Card Has No Accessible Group Semantics

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/onboarding/OnboardingQuestion.tsx` and `QuestionCard.tsx`
- **Heuristic violated**: WCAG 4.1.2 (Name, Role, Value)
- **Problem**: The question card grid is a list of `<button>` elements that function as radio buttons (single selection from a group). However, they have no `role="radiogroup"` on the container or `role="radio"` / `aria-checked` on each card. Screen readers announce them as generic buttons with no indication of selection state or group membership.
- **Impact**: Screen reader users cannot understand the selection pattern or know which option is currently selected. This breaks the fundamental interaction model.
- **Severity**: P0 -- Accessibility blocker
- **Suggestion**:

In `OnboardingQuestion.tsx`, wrap the grid in a radiogroup:

```tsx
// Old:
<div className={`grid gap-3 ${...}`}>

// New:
<div
  role="radiogroup"
  aria-label={title}
  className={`grid gap-3 ${...}`}
>
```

In `QuestionCard.tsx`, add radio semantics:

```tsx
// Old:
<button
  type="button"
  onClick={() => onClick(option.value)}
  className={`...`}
>

// New:
<button
  type="button"
  role="radio"
  aria-checked={isSelected}
  onClick={() => onClick(option.value)}
  className={`...`}
>
```

### Issue 3: Step Transition Has No ARIA Live Announcement

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/onboarding/OnboardingWizard.tsx`
- **Heuristic violated**: Nielsen H1 (Visibility of system status), WCAG 4.1.3 (Status Messages)
- **Problem**: When the user selects an option and auto-advances to the next question (300ms delay), there is no screen reader announcement. The step indicator updates visually, but assistive technology users have no way to know they moved to a new question without the DOM change being announced.
- **Impact**: Screen reader users will be disoriented during the auto-advance and won't know a new question has appeared.
- **Severity**: P0 -- Accessibility blocker
- **Suggestion**: Add an ARIA live region to announce step changes:

```tsx
// In OnboardingWizard.tsx, add alongside StepIndicator:
<div aria-live="polite" className="sr-only">
  {currentQuestion
    ? `${currentStep + 1}/${TOTAL_STEPS} 단계: ${currentQuestion.title}`
    : ''}
</div>
```

---

## Improvements (Should Fix)

### Issue 4: Header Lacks Onboarding Entry Point

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/Header.tsx`
- **Heuristic violated**: Nielsen H7 (Flexibility and efficiency of use)
- **Problem**: The spec defines multiple onboarding entry points including "Header navigation '맞춤 추천'" (onboarding-flow.md section 2.2). The current Header only has "토이 프로젝트" and "전체 도구" links. Users who scroll past the hero CTA or arrive on sub-pages have no persistent way to access the onboarding flow.
- **Impact**: Reduces discovery of the primary conversion funnel. Users on /tools, /situations, or /glossary pages cannot easily start onboarding.
- **Severity**: P1 -- Major conversion path gap
- **Suggestion**: Add a "맞춤 추천" or "AI 찾기" link/button to the Header:

```tsx
// Add between LevelBadge and "토이 프로젝트"
<Link
  href="/onboarding"
  className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full"
  aria-label="나에게 맞는 AI 도구 추천 받기"
>
  맞춤 추천
</Link>
```

Also consider removing "토이 프로젝트" from the header -- the PRD v2.0 says `/projects` page has "사용자 가치 낮음. 네비게이션에서 제거" under deletion targets.

### Issue 5: ReturningUserBanner Touch Targets Too Small

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/onboarding/ReturningUserBanner.tsx`, lines 24-35
- **Heuristic violated**: Fitts's Law, WCAG 2.5.8 (Target Size minimum 44x44px)
- **Problem**: The "이전 결과 보기" and "새로 시작하기" buttons use `text-xs` (12px) and `py-1.5` (6px padding), resulting in approximately 24px height. This is well below the 44px minimum touch target for mobile.
- **Impact**: Users on mobile will have difficulty tapping these buttons accurately, especially the target persona (older users like the 45-year-old business owner).
- **Severity**: P1 -- Mobile usability
- **Suggestion**:

```tsx
// Old:
className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg..."

// New:
className="px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg..."
```

Apply to both buttons. This brings them to approximately 40-44px height.

### Issue 6: PersonaCard Entire Card Should Be Clickable (Not Just CTA Text)

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/landing/PersonaCard.tsx`
- **Heuristic violated**: Fitts's Law (larger targets are easier to hit)
- **Problem**: The persona card shows a hover effect on the entire card (`hover:border-blue-200 hover:shadow-md`) which signals clickability, but only the small "직장인 맞춤 추천 >" text link at the bottom is actually a link. This creates a false affordance -- users will click/tap the card and nothing will happen.
- **Impact**: Frustrating mismatch between visual affordance and actual behavior. Users will need to precisely target the small CTA text link.
- **Severity**: P1 -- Interaction design inconsistency
- **Suggestion**: Wrap the entire card in the Link instead of just the CTA text:

```tsx
// PersonaCard.tsx -- Make the entire card a link
import Link from 'next/link';

export default function PersonaCard({ persona }: PersonaCardProps): JSX.Element {
  return (
    <Link
      href={persona.ctaHref}
      className="block bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all group"
    >
      <span className="text-4xl block mb-3" aria-hidden="true">
        {persona.icon}
      </span>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {persona.label}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        &ldquo;{persona.painPoint}&rdquo;
      </p>
      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1">
        {persona.ctaText}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
```

### Issue 7: Result Page -- "No Result" Fallback Uses `<a>` Instead of `<Link>`

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/app/onboarding/result/page.tsx`, lines 101-113
- **Heuristic violated**: Consistency and standards (Nielsen H4)
- **Problem**: The fallback state when no tool is recommended uses `<a href="/onboarding">` and `<a href="/tools">` instead of Next.js `<Link>`. This causes full page reloads instead of client-side navigation, breaking the SPA feel. The rest of the app correctly uses `<Link>`.
- **Impact**: Jarring full page reload disrupts the flow when user clicks "다시 설문하기" or "전체 도구 보기" in the no-result state.
- **Severity**: P1 -- Consistency issue
- **Suggestion**: Replace `<a>` tags with `<Link>`:

```tsx
import Link from 'next/link';
// ...
<Link href="/onboarding" className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
  다시 설문하기
</Link>
<Link href="/tools" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
  전체 도구 보기
</Link>
```

### Issue 8: Personalized Reason Grammar Issue (Korean Particles)

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/lib/onboardingEngine.ts`, line 154
- **Heuristic violated**: Nielsen H2 (Match between system and real world)
- **Problem**: The personalized reason template uses fixed particles: `${role}이 ${purpose}을 할 때 ${tool.name}이 가장 적합해요.` In Korean, the particles must change based on whether the preceding word ends in a consonant (받침). For example:
  - "직장인**이**" is correct (ends in consonant)
  - "학생**이**" is correct (ends in consonant)
  - "크리에이터**가**" should use "가" (ends in vowel), not "이"
  - "사업가**가**" should use "가" (ends in vowel), not "이"
  - "문서 작성**을**" is correct, but "이메일 작성**을**" -- both happen to be correct since 성 ends in consonant.
  - "Claude**이**" should be "Claude**가**" (foreign words ending in vowel sounds)
- **Impact**: Unnatural Korean text that makes the service feel like a machine translation, undermining the "native Korean" differentiator emphasized in the PRD.
- **Severity**: P1 -- Copy quality for native Korean speakers
- **Suggestion**: Add a Korean particle helper function:

```typescript
// Korean particle helper (을/를, 이/가, 은/는)
function addParticle(word: string, particleType: 'subject' | 'object'): string {
  const lastChar = word.charAt(word.length - 1);
  const lastCharCode = lastChar.charCodeAt(0);

  // Check if last char is Korean (has 받침)
  const hasBatchim = lastCharCode >= 0xAC00 && lastCharCode <= 0xD7A3
    ? (lastCharCode - 0xAC00) % 28 !== 0
    : false; // Non-Korean characters treated as no 받침

  if (particleType === 'subject') {
    return hasBatchim ? `${word}이` : `${word}가`;
  }
  return hasBatchim ? `${word}을` : `${word}를`;
}

// Usage:
return `${addParticle(role, 'subject')} ${addParticle(purpose, 'object')} 할 때 ${addParticle(tool.name, 'subject')} 가장 적합해요.${budgetNote}`;
```

### Issue 9: Onboarding Wizard Footer "건너뛰기" Button on Step 0 Is Redundant with "바로 가이드 보기"

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/onboarding/OnboardingWizard.tsx`, lines 120-146
- **Heuristic violated**: Hick's Law (too many similar choices slow decisions)
- **Problem**: On the first step (currentStep === 0), the left button says "건너뛰기" and the right side has "바로 가이드 보기" -- both navigate to `/situations`. This is the same action presented in two different locations with two different labels, adding cognitive load without benefit. On subsequent steps, the left becomes "이전" (correct) and the right still shows "바로 가이드 보기" (also correct).
- **Impact**: Minor confusion about which to click when both do the same thing. Violates the "one obvious path" principle.
- **Severity**: P1 -- Cognitive load
- **Suggestion**: On step 0, remove the "건너뛰기" on the left or change it to a back-to-home action. Simplest fix:

```tsx
// Instead of showing "건너뛰기" on the left for step 0,
// show a back-to-home link:
{currentStep === 0 ? (
  <Link href="/" className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center gap-1">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    홈으로
  </Link>
) : (
  <button type="button" onClick={handleBack} ...>
    이전
  </button>
)}
```

---

## Nice-to-Haves (Could Fix Later)

### Issue 10: HowItWorks Connector Arrows Are Mispositioned

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/landing/HowItWorksSection.tsx`, lines 57-74
- **Problem**: The connector arrows between steps use `absolute top-8 -right-3` positioning. Because the grid has `gap-8 md:gap-6`, the arrows sit at the very edge of the grid cell and may appear detached from the step they connect. On narrower desktop viewports (around 768px), the arrow can overlap with the adjacent cell content.
- **Severity**: P2 -- Cosmetic
- **Suggestion**: Consider using a flexbox approach with arrow elements between cards rather than absolute positioning. Or increase the right offset: `-right-[18px]` to center the arrow within the gap.

### Issue 11: Stats Section Count-Up Starts at 0 Even Without Animation

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/landing/StatsSection.tsx`
- **Problem**: If `prefers-reduced-motion: reduce` is active, CSS animations are disabled, but the `useCountUp` hook still starts from 0 and animates via JavaScript. Users who prefer reduced motion will still see the JavaScript-driven count-up animation. The CSS media query only disables CSS animations.
- **Severity**: P2 -- Accessibility enhancement
- **Suggestion**: Check `prefers-reduced-motion` in the hook:

```typescript
function useCountUp(target: number, isVisible: boolean, duration: number = 1200): number {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Respect reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setCount(target);
      return;
    }
    // ... rest of animation logic
  }, [isVisible, target, duration]);

  return count;
}
```

### Issue 12: ResultAlternatives Tool Reason Is Truncated with `truncate`

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/onboarding/ResultAlternatives.tsx`, line 32
- **Problem**: The alternative tool's reason text uses `truncate` class which clips text with ellipsis. However, the reason is the most valuable piece of information ("why this tool"). Truncating it defeats the purpose of showing alternatives.
- **Severity**: P2 -- Content visibility
- **Suggestion**: Change `truncate` to `line-clamp-2` to allow 2 lines instead of hard truncation:

```tsx
// Old:
<span className="text-xs text-gray-500 block truncate">

// New:
<span className="text-xs text-gray-500 block line-clamp-2">
```

### Issue 13: QuickSearchSection Desktop Layout Splits 50/50 Regardless of Content

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/components/landing/QuickSearchSection.tsx`, lines 77-83
- **Problem**: When a situation is selected on desktop, the results list and guide panel split 50/50 (`w-1/2`). The guide panel might have more content that needs width, while the result list might only show 2-3 cards. A more flexible split (40/60 or auto) would make better use of space.
- **Severity**: P3 -- Enhancement
- **Suggestion**: Use `w-2/5` for results list and `w-3/5` for guide panel, or use `flex-1` on the guide panel side.

### Issue 14: Result Page shareUrl Memo Has Empty Dependency Array

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/app/onboarding/result/page.tsx`, line 47-49
- **Problem**: `shareUrl` is memoized with an empty dependency array but depends on `window.location.href` which could change after the URL params are set. Since this component loads via client-side navigation, the URL might not be final at the first render.
- **Severity**: P3 -- Edge case bug
- **Suggestion**: Either use a ref that updates after the result is computed, or add `result` to the dependency array to recompute when the result is set.

### Issue 15: Landing Page `page.tsx` Wraps PopularSituationsSection in Extra `<div id="popular-situations">`

- **Location**: `/Users/Young/Desktop/claude-workspace/projects/ai-guide/src/app/page.tsx`, line 49
- **Problem**: The `id="popular-situations"` is on a wrapping `<div>` instead of on the `<section>` inside `PopularSituationsSection`. This creates an unnecessary extra DOM node. The id should ideally be on the section itself for proper scroll targeting and semantic meaning.
- **Severity**: P3 -- Code cleanliness
- **Suggestion**: Pass an `id` prop to `PopularSituationsSection` and place it on the `<section>` element directly.

---

## Strengths

1. **Excellent semantic HTML structure**: Every landing section uses `<section>` with `aria-labelledby` pointing to proper heading elements. The stats section uses `sr-only` for the heading since the visual design doesn't need one. This is thoughtful and correct.

2. **Strong conversion architecture**: The landing page follows a proven persuasion pattern (Hero > Pain > Solution > Social Proof > CTA). Multiple entry points to `/onboarding` (Hero CTA, persona cards, final CTA) ensure high conversion opportunity. The secondary CTA "상황별 가이드 바로 보기" respects users who want to skip onboarding.

3. **Well-designed returning user experience**: The HeroSection checks `isOnboarded` from localStorage and adjusts the headline, sub-copy, and CTA text. This shows attention to the repeat visit scenario, which the PRD emphasizes for retention.

4. **Clean onboarding state management**: The `OnboardingWizard` properly manages state with `useRef` for timeout cleanup, prevents memory leaks with the cleanup in `useEffect`, and uses `useCallback` to avoid unnecessary re-renders. The `onboardingStorage.ts` gracefully handles missing `window`, failing `localStorage`, and version mismatches.

5. **Natural Korean copy throughout**: The copy avoids technical jargon effectively. Pain point quotes like "팀장이 AI 활용하라는데, 뭐부터 시작해야 할지 모르겠어요" feel authentic. The "3가지 질문에 답하면, 당신의 상황에 맞는 AI 도구와 바로 따라할 수 있는 가이드를 드려요" sub-copy clearly communicates the value proposition.

6. **Dynamic data-driven stats**: The StatsSection pulls real numbers from `situations.json` and `tools.json` instead of hardcoding, which means as content grows, the numbers automatically update. The IntersectionObserver-based count-up animation is a nice engagement touch.

7. **Proper animation accessibility**: The `globals.css` includes `@media (prefers-reduced-motion: reduce)` to disable CSS slide animations. This shows awareness of motion sensitivity (though the JS count-up needs the same treatment, noted in Issue 11).

8. **Result page error handling**: The result page has a proper fallback flow: try URL params, then localStorage, then redirect to `/onboarding`. The loading state with spinner and the no-result state with actionable CTAs are well-handled.

9. **Affiliate disclosure compliance**: The `ResultShareBar` includes the legally required affiliate disclosure text at the bottom. The `rel="noopener noreferrer sponsored"` on external links is correct for SEO and legal compliance.

10. **Type safety**: The `OnboardingAnswers`, `OnboardingResult`, and related types are well-defined with narrow union types (`OnboardingRole`, `OnboardingExperience`, `OnboardingBudget`) rather than generic `string`. This prevents invalid states at compile time.

---

## Summary of Required Actions

| Priority | Count | Action |
|----------|-------|--------|
| P0 (Must fix this cycle) | 3 | Focus trap on mobile overlay, ARIA radiogroup semantics on question cards, ARIA live region for step transitions |
| P1 (Should fix this cycle) | 6 | Header onboarding CTA, banner touch targets, full-card clickability on persona cards, Link vs a tags, Korean particle grammar, redundant skip buttons |
| P2 (Next cycle) | 3 | Arrow positioning, reduced-motion for JS animation, truncated reason text |
| P3 (Backlog) | 3 | Layout split ratio, shareUrl memo, extra wrapping div |
