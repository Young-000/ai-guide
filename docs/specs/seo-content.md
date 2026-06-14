# SEO Content Strategy (SEO 콘텐츠 전략)

## JTBD

When I search for practical AI usage tips on Google/Naver (e.g. "ChatGPT 보고서 작성법", "AI로 영어 이메일 쓰는 법"), I want to find clear, actionable how-to content, so I can learn AI skills quickly and discover the AI Guide platform as my go-to resource.

## Problem

- **Who:** Korean internet users searching for AI usage tips (non-expert, ages 25-45, office workers/students/freelancers). They search in Korean with specific task-oriented queries.
- **Pain:** The site currently has 19 situation guides, 17 use cases, and 21 tool pages — all well-structured but not optimized for long-tail keyword search traffic. There is no blog/tip content, no FAQ page for common questions, and no content hub that aggregates all learning resources. Organic search discovery is limited to situation/tool page titles. (Frequency: every potential visitor; Severity: high — massive missed organic traffic)
- **Current workaround:** Users who happen to land on the site can browse situations and tools, but most AI-curious searchers never find the site because there are no pages targeting the specific long-tail queries they type.
- **Success metric:**
  - 15 new indexable tip pages targeting long-tail keywords
  - 1 FAQ page with FAQPage structured data (Google rich results)
  - 1 content hub (/learn) aggregating all learning resources
  - sitemap.xml updated with all new routes
  - Every new page has unique meta title, description, canonical URL, and JSON-LD
  - Cross-links between tips, situations, tools, and use cases

---

## Solution

### Overview

Three new content systems to multiply indexable pages and capture long-tail search traffic:

1. **AI Tips (/tips)** — Blog-style short articles (300-500 words each) targeting specific long-tail keywords. Each tip is a practical, actionable how-to piece that connects to existing situation guides and tools. All content lives in a JSON data file and is statically generated.

2. **FAQ (/faq)** — Structured FAQ page answering common AI questions. Uses FAQPage JSON-LD schema for Google rich results (FAQ snippets appear directly in search). Grouped by category for easy browsing.

3. **Content Hub (/learn)** — Single aggregation page that links to all learning resources: situation guides (19), use cases (17), and tips (15). Acts as an internal linking hub that distributes page authority across the site. Filterable by category and content type.

### Why This Approach

- **JSON-based, no CMS** — Consistent with existing architecture (situations.json, use-cases.json, tools.json). Zero infrastructure change.
- **Static generation** — All pages are SSG via `generateStaticParams`. Fast, free hosting on Vercel.
- **Cross-linking** — Tips reference situations and tools, situations reference tips. This creates a content mesh that strengthens overall SEO authority.
- **Korean long-tail keywords** — Korean AI search queries are specific and underserved (e.g. "ChatGPT로 엑셀 함수 만드는 법" has low competition). Each tip targets one such query.

### User Flow

1. User searches "ChatGPT 보고서 작성법" on Google
2. Google shows AI Guide tip page in results (with rich snippet if FAQ)
3. User reads the tip → sees "관련 가이드" link → clicks to situation guide
4. User discovers more tips via content hub (/learn) → browses situations → starts onboarding

---

## Scope (MoSCoW)

### Must

- `src/data/tips.json` — 15 tip articles with title, slug, content (paragraph array), excerpt, category, tags, relatedTools, relatedSituations, publishedDate
- `src/app/tips/page.tsx` — Tip listing page with category filter, SEO metadata
- `src/app/tips/[slug]/page.tsx` — Tip detail page with Article JSON-LD, generateStaticParams, generateMetadata, canonical URL
- `src/data/faq.json` — 20+ FAQ items grouped by category (general, tools, pricing, getting-started)
- `src/app/faq/page.tsx` — FAQ page with FAQPage JSON-LD, generateMetadata, accordion UI
- `src/app/learn/page.tsx` — Content hub listing situations + use cases + tips with type/category filter
- `src/app/sitemap.ts` updated with /tips, /tips/[slug], /faq, /learn routes
- Cross-links: tip detail → related situations, tip detail → related tools
- Types added to `src/types/index.ts` for Tip and FAQ data structures

### Should

- Cross-links from situation detail pages → related tips
- Cross-links from tool detail pages → related tips
- Breadcrumb navigation on tip detail pages
- "이전 팁 / 다음 팁" navigation on tip detail page
- Category pill filters on tip listing (reuse pattern from use-cases)

### Could

- Reading time estimate per tip
- "공유하기" button on tip detail
- BreadcrumbList JSON-LD on tip detail pages
- Tag-based related tips section on tip detail page

### Won't (this cycle)

- Markdown/MDX support for tip content (JSON paragraphs are sufficient)
- RSS feed for tips
- Search within tips (site-wide search is a separate backlog item)
- Automated content generation
- Naver Search Advisor submission (manual step, not code)
- Open Graph image generation per tip

---

## Detailed Design

### 1. Data Schema: tips.json

**File:** `src/data/tips.json`

```typescript
// Type definition (add to src/types/index.ts)
type TipCategory = 'productivity' | 'writing' | 'coding' | 'learning' | 'creative' | 'business';

interface Tip {
  slug: string;            // URL-friendly, keyword-based (e.g. "chatgpt-report-writing")
  title: string;           // SEO title (e.g. "ChatGPT로 업무 보고서 작성하는 3가지 방법")
  excerpt: string;         // 1-2 sentence summary for listing page + meta description
  category: TipCategory;
  tags: string[];          // e.g. ["ChatGPT", "보고서", "업무효율"]
  content: TipContent[];   // Array of content blocks
  relatedTools: string[];  // Tool slugs (e.g. ["chatgpt", "claude"])
  relatedSituations: string[];  // Situation slugs (e.g. ["pdf-summary"])
  relatedTips: string[];   // Other tip slugs for cross-linking
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  publishedDate: string;   // ISO date string
}

type TipContent =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'tip-box'; text: string }       // Highlighted tip/callout
  | { type: 'prompt-example'; title: string; content: string };  // Copyable prompt
```

**JSON structure:**
```json
{
  "categories": [
    { "id": "productivity", "name": "업무 효율화", "icon": "⚡", "description": "일상 업무를 AI로 빠르게" },
    { "id": "writing", "name": "글쓰기", "icon": "✍️", "description": "이메일, 보고서, 블로그 작성" },
    { "id": "coding", "name": "개발", "icon": "💻", "description": "코딩과 디버깅 팁" },
    { "id": "learning", "name": "학습", "icon": "📚", "description": "공부와 자기계발" },
    { "id": "creative", "name": "크리에이티브", "icon": "🎨", "description": "디자인과 콘텐츠 제작" },
    { "id": "business", "name": "비즈니스", "icon": "💼", "description": "사업과 마케팅" }
  ],
  "tips": [ ... ]
}
```

### 2. Initial 15 Tips (Keyword Targets)

Each tip targets a specific Korean long-tail search query. Slugs are keyword-optimized:

| # | Slug | Title (SEO) | Target Keyword | Category |
|---|------|-------------|----------------|----------|
| 1 | `chatgpt-report-writing` | ChatGPT로 업무 보고서 작성하는 3가지 방법 | chatgpt 보고서 작성 | productivity |
| 2 | `ai-english-email` | AI로 영어 비즈니스 이메일 쓰는 법 (초보도 가능) | AI 영어 이메일 | writing |
| 3 | `claude-pdf-summary` | Claude로 PDF 100페이지 10분 만에 요약하는 법 | claude pdf 요약 | productivity |
| 4 | `chatgpt-excel-formula` | ChatGPT에게 엑셀 함수 만들어달라고 하는 법 | chatgpt 엑셀 함수 | productivity |
| 5 | `ai-presentation-tips` | AI로 발표 자료 만드는 5단계 가이드 | AI 발표자료 만들기 | business |
| 6 | `ai-blog-writing-guide` | AI로 블로그 글 30분 만에 쓰는 완전 가이드 | AI 블로그 글쓰기 | writing |
| 7 | `chatgpt-code-debug` | ChatGPT로 코드 에러 찾는 법 (개발자 필수 팁) | chatgpt 코드 에러 | coding |
| 8 | `ai-resume-writing` | AI로 합격하는 이력서 쓰는 법 | AI 이력서 작성 | business |
| 9 | `midjourney-thumbnail` | Midjourney로 유튜브 썸네일 만드는 법 | midjourney 썸네일 | creative |
| 10 | `ai-meeting-notes` | AI로 회의록 자동 정리하는 3가지 방법 | AI 회의록 정리 | productivity |
| 11 | `perplexity-research` | Perplexity로 리서치 시간 절반 줄이는 법 | perplexity 사용법 | learning |
| 12 | `ai-sns-content` | AI로 인스타/블로그 콘텐츠 대량 생산하는 법 | AI SNS 콘텐츠 | creative |
| 13 | `chatgpt-prompt-basics` | ChatGPT 프롬프트 잘 쓰는 법 (초보 가이드) | chatgpt 프롬프트 | learning |
| 14 | `ai-translation-tips` | AI 번역, 구글 번역보다 자연스럽게 하는 법 | AI 번역 | writing |
| 15 | `ai-brainstorming` | AI로 아이디어 30개 5분 만에 뽑는 법 | AI 브레인스토밍 | business |

Each tip cross-references the corresponding situation guide (relatedSituations) and tools (relatedTools) from existing data.

### 3. Data Schema: faq.json

**File:** `src/data/faq.json`

```json
{
  "categories": [
    { "id": "general", "name": "AI 기본", "icon": "💡" },
    { "id": "tools", "name": "AI 도구", "icon": "🔧" },
    { "id": "pricing", "name": "요금/결제", "icon": "💰" },
    { "id": "getting-started", "name": "시작하기", "icon": "🚀" },
    { "id": "safety", "name": "보안/개인정보", "icon": "🔒" }
  ],
  "questions": [
    {
      "id": "what-is-ai",
      "category": "general",
      "question": "AI가 정확히 뭔가요? 쉽게 설명해주세요.",
      "answer": "AI(인공지능)는 컴퓨터가 사람처럼 생각하고 판단하는 기술입니다. ...",
      "relatedTips": [],
      "relatedSituations": []
    }
  ]
}
```

```typescript
// Type definition (add to src/types/index.ts)
interface FaqCategory {
  id: string;
  name: string;
  icon: string;
}

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  relatedTips?: string[];
  relatedSituations?: string[];
}
```

**FAQ content targets:** ~25 questions across 5 categories. Focus on queries people actually search:
- "ChatGPT 무료인가요?" / "Claude vs ChatGPT 뭐가 나아요?" / "AI가 내 정보 저장하나요?"
- These appear as FAQ rich snippets in Google search results.

### 4. Page Components

#### /tips (Listing Page)

- Server component with generateMetadata
- Category filter pills (reuse pattern from /use-cases)
- Tip cards: title, excerpt, category badge, difficulty badge, tool icons
- Meta title: "AI 활용 팁 | 실전에서 바로 쓰는 AI 사용법 | AI 가이드"

#### /tips/[slug] (Detail Page)

- Server component with generateStaticParams + generateMetadata
- Content renderer: maps TipContent[] to JSX (paragraph, heading, list, tip-box, prompt-example)
- Prompt-example block: styled code block with copy button (reuse existing PromptCopy pattern from situation guides)
- Sidebar/bottom section: "관련 가이드" → links to relatedSituations, "추천 도구" → links to relatedTools
- "이전 팁 / 다음 팁" navigation at bottom
- Article JSON-LD structured data
- Canonical URL: `https://ai-guide-nu.vercel.app/tips/{slug}`

#### /faq (FAQ Page)

- Server component with generateMetadata
- Category tab navigation
- Accordion UI for questions (click to expand/collapse)
- FAQPage JSON-LD: all questions embedded in structured data (Google FAQ rich results)
- Links to related tips and situations within answers
- Meta title: "자주 묻는 질문 (FAQ) | AI 가이드"

#### /learn (Content Hub)

- Server component with generateMetadata
- Three content sections: 상황별 가이드 (19), 활용 사례 (17), AI 활용 팁 (15)
- Content type filter (가이드 / 사례 / 팁 / 전체)
- Category filter (업무 / 학습 / 개발 / 디자인 / 콘텐츠 / 리서치)
- Each card links to its respective detail page
- Meta title: "AI 학습센터 | 51개 가이드와 팁으로 AI 마스터하기 | AI 가이드"
- Acts as the main internal linking hub for SEO authority distribution

### 5. JSON-LD Structured Data

**Tip detail page — Article schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "ChatGPT로 업무 보고서 작성하는 3가지 방법",
  "description": "...",
  "author": { "@type": "Organization", "name": "AI 가이드" },
  "publisher": { "@type": "Organization", "name": "AI 가이드" },
  "datePublished": "2026-02-17",
  "url": "https://ai-guide-nu.vercel.app/tips/chatgpt-report-writing",
  "inLanguage": "ko"
}
```

**FAQ page — FAQPage schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "ChatGPT 무료인가요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "네, ChatGPT 기본 버전은 무료입니다. ..."
      }
    }
  ]
}
```

### 6. Cross-Linking Strategy

| From | To | How |
|------|----|-----|
| Tip detail | Related situations | "관련 가이드" section with cards linking to /situations/[slug] |
| Tip detail | Related tools | "추천 도구" section with tool badges linking to /tools/[slug] |
| Tip detail | Related tips | "함께 읽으면 좋은 팁" section at bottom |
| Situation detail | Related tips | New "관련 팁" section (below existing related situations) |
| Tool detail | Related tips | New "활용 팁" section |
| FAQ answers | Relevant tips/situations | Inline links within answer text |
| Learn hub | All content | Cards linking to all situations, use cases, and tips |
| Tip listing | Learn hub | "전체 학습 자료 보기" link |

### 7. Sitemap Update

Add to `src/app/sitemap.ts`:

```typescript
import tipsData from '@/data/tips.json';

// In staticRoutes:
{ url: `${BASE_URL}/tips`, changeFrequency: 'weekly', priority: 0.8 },
{ url: `${BASE_URL}/faq`, changeFrequency: 'monthly', priority: 0.7 },
{ url: `${BASE_URL}/learn`, changeFrequency: 'weekly', priority: 0.8 },

// Dynamic tip routes:
const tipRoutes = tipsData.tips.map((t) => ({
  url: `${BASE_URL}/tips/${t.slug}`,
  changeFrequency: 'monthly' as const,
  priority: 0.7,
}));
```

---

## Acceptance Criteria

### Tips System

- [ ] **AC-1:** Given `/tips`, when the page loads, then all 15 tips are displayed as cards with title, excerpt, category badge, and difficulty badge
- [ ] **AC-2:** Given `/tips`, when clicking a category filter pill, then only tips of that category are shown and the active pill is visually highlighted
- [ ] **AC-3:** Given `/tips/chatgpt-report-writing`, when viewing the page, then the full tip content renders with paragraphs, headings, lists, tip-boxes, and prompt-examples
- [ ] **AC-4:** Given a prompt-example block in a tip, when clicking the copy button, then the prompt text is copied to clipboard and a "복사됨" confirmation appears
- [ ] **AC-5:** Given `/tips/chatgpt-report-writing`, when viewing page source, then `<title>` contains "ChatGPT로 업무 보고서 작성하는 3가지 방법" and `<meta name="description">` contains the tip excerpt
- [ ] **AC-6:** Given `/tips/chatgpt-report-writing`, when viewing page source, then Article JSON-LD script tag is present with headline, datePublished, and url
- [ ] **AC-7:** Given `/tips/chatgpt-report-writing`, when viewing the page, then "관련 가이드" section shows linked situation cards and "추천 도구" section shows linked tool badges
- [ ] **AC-8:** Given `/tips/[slug]`, when the page renders, then "이전 팁 / 다음 팁" navigation links are present at the bottom

### FAQ Page

- [ ] **AC-9:** Given `/faq`, when the page loads, then all FAQ questions are displayed grouped by category with accordion expand/collapse
- [ ] **AC-10:** Given `/faq`, when clicking a question, then the answer expands with smooth animation; clicking again collapses it
- [ ] **AC-11:** Given `/faq`, when clicking a category tab, then only questions of that category are shown
- [ ] **AC-12:** Given `/faq`, when viewing page source, then FAQPage JSON-LD contains all questions and answers

### Content Hub

- [ ] **AC-13:** Given `/learn`, when the page loads, then all three content types are displayed: 상황별 가이드 (19), 활용 사례 (17), AI 활용 팁 (15)
- [ ] **AC-14:** Given `/learn`, when selecting content type filter "팁", then only tip items are shown
- [ ] **AC-15:** Given `/learn`, when selecting category filter "업무", then only items in the work/productivity category are shown

### Cross-Linking

- [ ] **AC-16:** Given `/situations/pdf-summary`, when viewing the page, then a "관련 팁" section appears with links to related tips (e.g. "Claude로 PDF 100페이지 10분 만에 요약하는 법")
- [ ] **AC-17:** Given a tip detail page with relatedTools, when clicking a tool badge, then the user navigates to `/tools/[slug]`

### SEO / Sitemap

- [ ] **AC-18:** Given the production build, when accessing `/sitemap.xml`, then it contains entries for `/tips`, `/faq`, `/learn`, and all `/tips/[slug]` routes
- [ ] **AC-19:** Given any tip detail page, when checking the HTML, then a canonical URL is present matching the page URL

### Build Quality

- [ ] **AC-20:** `npm run build` succeeds with zero errors and generates static pages for all new routes
- [ ] **AC-21:** `npm run lint` passes with no new warnings
- [ ] **AC-22:** All new pages render correctly on mobile viewport (375px width)

---

## Task Breakdown

| # | Task | Complexity | Dependencies | Description |
|---|------|-----------|--------------|-------------|
| 1 | Add Tip and FAQ types to `src/types/index.ts` | S | none | TipCategory, Tip, TipContent, FaqCategory, FaqItem types |
| 2 | Create `src/data/tips.json` with 15 tips | L | 1 | Full content for 15 keyword-targeted tips, each 300-500 words, with relatedTools and relatedSituations mapped to existing slugs |
| 3 | Create `src/data/faq.json` with 25 FAQ items | M | 1 | 25 questions across 5 categories with answers and related links |
| 4 | Create `src/app/tips/page.tsx` — listing page | M | 1, 2 | Server component with generateMetadata, category filter (client component), tip cards |
| 5 | Create `src/app/tips/[slug]/page.tsx` — detail page | M | 1, 2 | Server component with generateStaticParams, generateMetadata, content renderer, Article JSON-LD, related links, prev/next navigation |
| 6 | Create tip content renderer component | M | 1 | Component that maps TipContent[] → JSX (paragraph, heading, list, tip-box, prompt-example with copy) |
| 7 | Create `src/app/faq/page.tsx` — FAQ page | M | 1, 3 | Server component with generateMetadata, FAQPage JSON-LD, category tabs, accordion UI |
| 8 | Create `src/app/learn/page.tsx` — content hub | M | 1 | Server component aggregating situations.json, use-cases.json, tips.json with dual filters |
| 9 | Add cross-links: situation detail → related tips | S | 2 | Modify `/situations/[slug]` to show "관련 팁" section by matching tip.relatedSituations |
| 10 | Add cross-links: tool detail → related tips | S | 2 | Modify `/tools/[slug]` to show "활용 팁" section by matching tip.relatedTools |
| 11 | Update `src/app/sitemap.ts` with new routes | S | 2 | Add /tips, /faq, /learn static routes + /tips/[slug] dynamic routes |
| 12 | Verify build + lint | S | 4-11 | Run `npm run build`, `npm run lint`, check generated page count |

**Estimated total effort:** ~4-5 hours of dev work

---

## Open Questions

1. **Tip content length:** 300-500 words per tip is recommended for SEO (Google prefers substantial content). Should we aim for the higher end? — **Decision: start at 300-400 words, expand later based on search performance.**
2. **FAQ answer length:** Short answers rank better in FAQ rich snippets (Google truncates at ~300 chars). Keep answers concise? — **Decision: Yes, 2-3 sentences per answer. Link to tips for deeper content.**
3. **Navigation:** Should /tips and /faq appear in the main Header navigation? — **Decision: Add /learn to Header nav as "학습센터". /tips and /faq are accessible from /learn and footer.**

## Out of Scope

- **Markdown/MDX rendering** — The TipContent[] array with typed blocks is simpler, more predictable, and sufficient for the content format needed. No build-time MDX processing.
- **CMS or admin panel** — Content is managed by editing JSON files directly. This is adequate for 15-30 tips.
- **RSS feed** — Low priority; can be added later if content volume grows.
- **Naver Search Advisor** — Manual registration step, not a code task. Document in PROGRESS.md as a post-deploy action.
- **Multi-language support** — All content is Korean-only for now. The target audience searches in Korean.
- **Content analytics per tip** — GA4 page tracking already covers this via the existing setup. No custom events needed this cycle.
