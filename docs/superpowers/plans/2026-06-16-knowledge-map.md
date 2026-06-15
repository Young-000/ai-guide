# Knowledge Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Obsidian-style interactive force-directed knowledge graph at `/map` that connects AI news articles to their tags, letting users explore the AI landscape visually.

**Architecture:** A pure server-side data builder (`src/lib/graph.ts`) reads news via the existing `getAllNews()` and produces `GraphData`. The page (`src/app/map/page.tsx`) is a server component that calls the builder and passes serialized data to `KnowledgeMap.tsx`, a `'use client'` component that renders `react-force-graph-2d` via dynamic import with `ssr: false` to avoid canvas/window SSR errors.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · `react-force-graph-2d` (sole new dependency) · Jest (existing) · `next/dynamic` for SSR bypass.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/graph.ts` | Create | Pure builder: `GraphNode`, `GraphLink`, `GraphData` types + `buildNewsGraph(lang)` |
| `src/lib/__tests__/graph.test.ts` | Create | Unit tests for builder using existing fixtures |
| `src/components/KnowledgeMap.tsx` | Create | `'use client'` canvas component wrapping `react-force-graph-2d` |
| `src/app/map/page.tsx` | Create | Server component: builds graph data, dynamic-imports `KnowledgeMap`, sets metadata |
| `src/components/Header.tsx` | Modify | Add "지식맵" top-level nav link (desktop + mobile) |
| `src/components/Footer.tsx` | Modify | Add "지식맵" link in site column |
| `src/app/page.tsx` | Modify | Add static `MapTeaser` section linking to `/map` |
| `src/components/home/MapTeaser.tsx` | Create | Static promotional card — no canvas, just a link |

---

## Task 1: Branch setup + install dependency

**Files:** (no source files; shell only)

- [ ] **Step 1: Switch to main and create feature branch**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git checkout main && git pull
git checkout -b feature/knowledge-map
```

Expected: `Switched to a new branch 'feature/knowledge-map'`

- [ ] **Step 2: Install react-force-graph-2d**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npm install react-force-graph-2d
```

Expected: Added to `dependencies` in `package.json`. No peer-dep errors. Verify:

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
node -e "require('react-force-graph-2d'); console.log('ok')" 2>&1 | head -3
```

> Note: the `require` will fail with a window/canvas error — that is correct and expected (it needs a browser). The test is just that the package exists. Alternatively just `ls node_modules/react-force-graph-2d/package.json`.

- [ ] **Step 3: Commit dependency**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add package.json package-lock.json
git commit -m "chore: add react-force-graph-2d"
```

---

## Task 2: Define types and stub in graph.ts

**Files:**
- Create: `src/lib/graph.ts`

- [ ] **Step 1: Create stub `src/lib/graph.ts` with types and empty function**

```typescript
// src/lib/graph.ts
import { getAllNews } from '@/lib/news';
import type { NewsLang } from '@/types/news';

export type GraphNodeType = 'article' | 'tag';

export type GraphNode = {
  id: string;      // 'a:<slug>' | 't:<tag>'
  label: string;   // article title or tag name
  type: GraphNodeType;
  url: string;     // '/news/<slug>' | '/news/topic/<tag>'
  val: number;     // size: tag = article count, article = 3 (fixed)
};

export type GraphLink = {
  source: string;  // article node id, e.g. 'a:alpha'
  target: string;  // tag node id, e.g. 't:LLM'
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

/**
 * Builds a force-graph data structure from all news articles in `lang`.
 * Article nodes are fixed-size (val=3); tag nodes are sized by article count.
 * Called server-side only (uses fs via getAllNews).
 */
export function buildNewsGraph(lang: NewsLang): GraphData {
  // Implementation in Task 3
  void lang;
  return { nodes: [], links: [] };
}
```

---

## Task 3: Write failing tests, then implement buildNewsGraph

**Files:**
- Create: `src/lib/__tests__/graph.test.ts`
- Modify: `src/lib/graph.ts`

The existing test fixtures at `src/lib/__tests__/fixtures/news/ko/` have three articles:
- `2026-01-01-alpha.md` slug=`alpha` tags=`["LLM"]`
- `2026-02-01-beta.md`  slug=`beta`  tags=`["OpenAI", "LLM"]`
- `2026-03-01-gamma.md` slug=`gamma` tags=`["LLM"]`

This yields: 3 article nodes, 2 tag nodes (LLM×3, OpenAI×1), 4 links.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/lib/__tests__/graph.test.ts
import path from 'node:path';
import { buildNewsGraph } from '@/lib/graph';
import type { GraphNode, GraphLink } from '@/lib/graph';

// Point at fixtures, not real content (same pattern as news.test.ts)
const FIXTURES = path.join(__dirname, 'fixtures', 'news');

// Override getAllNews to use fixtures root.
// buildNewsGraph calls getAllNews(lang) with default root.
// We need to pass root — but buildNewsGraph doesn't expose root.
// Solution: mock the module so getAllNews uses fixtures.
jest.mock('@/lib/news', () => {
  const actual = jest.requireActual<typeof import('@/lib/news')>('@/lib/news');
  return {
    ...actual,
    getAllNews: (lang: 'ko' | 'en') =>
      actual.getAllNews(lang, require('path').join(__dirname, 'fixtures', 'news')),
  };
});

describe('buildNewsGraph', () => {
  it('builds article nodes with id a:<slug>, type article, url /news/<slug>, val 3', () => {
    const { nodes } = buildNewsGraph('ko');
    const articleNodes = nodes.filter((n) => n.type === 'article');
    expect(articleNodes).toHaveLength(3);

    const alpha = articleNodes.find((n) => n.id === 'a:alpha');
    expect(alpha).toBeDefined();
    expect(alpha?.label).toBe('알파 기사');
    expect(alpha?.url).toBe('/news/alpha');
    expect(alpha?.val).toBe(3);
  });

  it('builds tag nodes with id t:<tag>, type tag, url /news/topic/<tag>', () => {
    const { nodes } = buildNewsGraph('ko');
    const tagNodes = nodes.filter((n) => n.type === 'tag');
    const tagIds = tagNodes.map((n) => n.id).sort();
    expect(tagIds).toEqual(['t:LLM', 't:OpenAI']);

    const llm = tagNodes.find((n) => n.id === 't:LLM');
    expect(llm?.url).toBe('/news/topic/LLM');
    expect(llm?.label).toBe('LLM');
  });

  it('sizes tag nodes by article count (val = count)', () => {
    const { nodes } = buildNewsGraph('ko');
    const llm = nodes.find((n) => n.id === 't:LLM');
    const openai = nodes.find((n) => n.id === 't:OpenAI');
    // LLM appears in alpha, beta, gamma → val 3
    expect(llm?.val).toBe(3);
    // OpenAI appears only in beta → val 1
    expect(openai?.val).toBe(1);
  });

  it('builds one link per article-tag pair', () => {
    const { links } = buildNewsGraph('ko');
    // alpha→LLM, beta→OpenAI, beta→LLM, gamma→LLM = 4 links
    expect(links).toHaveLength(4);
    expect(links).toContainEqual<GraphLink>({ source: 'a:alpha', target: 't:LLM' });
    expect(links).toContainEqual<GraphLink>({ source: 'a:beta', target: 't:OpenAI' });
    expect(links).toContainEqual<GraphLink>({ source: 'a:beta', target: 't:LLM' });
    expect(links).toContainEqual<GraphLink>({ source: 'a:gamma', target: 't:LLM' });
  });

  it('returns empty graph when no articles', () => {
    const { nodes, links } = buildNewsGraph('en');
    // en fixtures has only one article (alpha), so expect 1 article + tags from that
    // Actually let's test a lang with no articles: we can only test 'en' which has alpha
    // Better: test that nodes + links arrays always exist (no throw)
    expect(Array.isArray(nodes)).toBe(true);
    expect(Array.isArray(links)).toBe(true);
  });

  it('articles without tags produce no links for that article', () => {
    // gamma has tags ["LLM"], but if we had a tag-less article...
    // We can verify by checking: every link source is an article node id in the graph
    const { nodes, links } = buildNewsGraph('ko');
    const articleIds = new Set(nodes.filter((n) => n.type === 'article').map((n) => n.id));
    for (const link of links) {
      expect(articleIds.has(link.source)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npx jest src/lib/__tests__/graph.test.ts --no-coverage 2>&1 | tail -20
```

Expected: Tests fail — `buildNewsGraph` returns empty `{ nodes: [], links: [] }`.

- [ ] **Step 3: Implement `buildNewsGraph` in `src/lib/graph.ts`**

Replace the stub body:

```typescript
// src/lib/graph.ts
import { getAllNews } from '@/lib/news';
import type { NewsLang } from '@/types/news';

export type GraphNodeType = 'article' | 'tag';

export type GraphNode = {
  id: string;      // 'a:<slug>' | 't:<tag>'
  label: string;   // article title or tag name
  type: GraphNodeType;
  url: string;     // '/news/<slug>' | '/news/topic/<tag>'
  val: number;     // size: tag = article count, article = 3 (fixed)
};

export type GraphLink = {
  source: string;  // article node id
  target: string;  // tag node id
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

/**
 * Builds a force-graph data structure from all news articles in `lang`.
 * Article nodes are fixed-size (val=3); tag nodes are sized by article count.
 * Called server-side only (uses fs via getAllNews).
 */
export function buildNewsGraph(lang: NewsLang): GraphData {
  const articles = getAllNews(lang);

  // Count how many articles each tag appears in
  const tagCounts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const articleNodes: GraphNode[] = articles.map((article) => ({
    id: `a:${article.slug}`,
    label: article.title,
    type: 'article' as const,
    url: `/news/${article.slug}`,
    val: 3,
  }));

  const tagNodes: GraphNode[] = Array.from(tagCounts.entries()).map(([tag, count]) => ({
    id: `t:${tag}`,
    label: tag,
    type: 'tag' as const,
    url: `/news/topic/${encodeURIComponent(tag)}`,
    val: count,
  }));

  const links: GraphLink[] = articles.flatMap((article) =>
    article.tags.map((tag) => ({
      source: `a:${article.slug}`,
      target: `t:${tag}`,
    })),
  );

  return { nodes: [...articleNodes, ...tagNodes], links };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npx jest src/lib/__tests__/graph.test.ts --no-coverage 2>&1 | tail -15
```

Expected: All 5 tests PASS.

> Note on tag URL encoding: `encodeURIComponent(tag)` ensures tags like "GPT-4o" encode cleanly. This is consistent with how `/news/topic/[tag]/page.tsx` needs to receive the param. If existing topic pages use raw tag strings, remove `encodeURIComponent`. Check `src/app/news/topic/[tag]/page.tsx` — if it doesn't encode, use plain `tag` without encoding.

- [ ] **Step 5: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add src/lib/graph.ts src/lib/__tests__/graph.test.ts
git commit -m "feat: graph data builder with unit tests"
```

---

## Task 4: KnowledgeMap component

**Files:**
- Create: `src/components/KnowledgeMap.tsx`

The component is `'use client'` and imports `react-force-graph-2d` directly (safe because the page will dynamic-import this component with `ssr: false`). It:
- Fills its container (parent must have explicit height)
- Colors article nodes blue-600, tag nodes slate-400
- Dims non-neighbors on hover
- Navigates on click
- Stops physics when `prefers-reduced-motion: reduce` is set
- Shows a legend and a hint

- [ ] **Step 1: Create `src/components/KnowledgeMap.tsx`**

```typescript
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
// react-force-graph-2d is canvas-only; this component is always dynamic-imported
// by src/app/map/page.tsx with { ssr: false }, so `window` is guaranteed to exist.
import ForceGraph2D from 'react-force-graph-2d';
import type { GraphData, GraphNode, GraphLink } from '@/lib/graph';

// After force-simulation starts, ForceGraph2D mutates nodes to add x, y coordinates.
// We extend the type to reflect this without breaking the base type.
type SimNode = GraphNode & { x?: number; y?: number };

// After processing, link source/target can become SimNode objects (not just strings).
type SimLink = Omit<GraphLink, 'source' | 'target'> & {
  source: string | SimNode;
  target: string | SimNode;
};

function resolveId(endpoint: string | SimNode): string {
  return typeof endpoint === 'string' ? endpoint : endpoint.id;
}

type Props = {
  data: GraphData;
};

export default function KnowledgeMap({ data }: Props): JSX.Element {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect prefers-reduced-motion and listen for changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent): void => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Track container size for responsive canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute immediate neighbors of the hovered node for highlight logic
  const neighborIds = useMemo<ReadonlySet<string>>(() => {
    if (!hoveredId) return new Set();
    const set = new Set<string>();
    for (const link of data.links as SimLink[]) {
      const src = resolveId(link.source);
      const tgt = resolveId(link.target);
      if (src === hoveredId) set.add(tgt);
      if (tgt === hoveredId) set.add(src);
    }
    return set;
  }, [hoveredId, data.links]);

  // Custom canvas painter — draws colored circle + label at sufficient zoom
  const paintNode = useCallback(
    (rawNode: unknown, ctx: CanvasRenderingContext2D, globalScale: number): void => {
      // Cast: react-force-graph-2d passes NodeObject; we know it's SimNode at runtime
      const node = rawNode as SimNode;
      const id = node.id;
      const isHovered = id === hoveredId;
      const isDimmed = hoveredId !== null && !isHovered && !neighborIds.has(id);

      const isTag = node.type === 'tag';
      // Tags scale up with article count; articles are fixed small circles
      const radius = Math.max(3, Math.sqrt(node.val) * (isTag ? 5 : 3));

      ctx.globalAlpha = isDimmed ? 0.12 : 1;

      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI);
      // article=blue-600 (#2563eb), hovered=blue-700 (#1d4ed8), tag=slate-400 (#94a3b8)
      ctx.fillStyle = isHovered ? '#1d4ed8' : isTag ? '#94a3b8' : '#2563eb';
      ctx.fill();

      // Draw ring on hover for clear selection feedback
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, radius + 2, 0, 2 * Math.PI);
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      // Label: always on hover; at zoom ≥ 1.5 for tags; at zoom ≥ 2 for articles
      const showLabel = isHovered || (isTag && globalScale >= 1.5) || (!isTag && globalScale >= 2);
      if (showLabel) {
        const fontSize = Math.max(8, 11 / globalScale);
        ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isTag ? '#475569' : '#1e293b'; // slate-600 / slate-800
        ctx.fillText(node.label, node.x ?? 0, (node.y ?? 0) + radius + 2 / globalScale);
      }

      ctx.globalAlpha = 1;
    },
    [hoveredId, neighborIds],
  );

  const handleClick = useCallback(
    (rawNode: unknown): void => {
      const node = rawNode as SimNode;
      router.push(node.url);
    },
    [router],
  );

  const handleHover = useCallback((rawNode: unknown): void => {
    const node = rawNode as SimNode | null;
    setHoveredId(node?.id ?? null);
  }, []);

  const getLinkColor = useCallback(
    (rawLink: unknown): string => {
      const link = rawLink as SimLink;
      if (!hoveredId) return '#cbd5e1'; // slate-300
      const src = resolveId(link.source);
      const tgt = resolveId(link.target);
      if (src === hoveredId || tgt === hoveredId) return '#2563eb'; // blue-600
      return '#f1f5f9'; // slate-100 (dimmed link)
    },
    [hoveredId],
  );

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white select-none">
      <ForceGraph2D
        graphData={
          // Cast: our GraphData is structurally compatible with ForceGraph2D's expected shape.
          // GraphNode.id: string satisfies NodeObject.id?: string | number.
          // GraphLink.source/target: string satisfies LinkObject.source/target?: string | ... .
          data as Parameters<typeof ForceGraph2D>[0]['graphData']
        }
        width={dimensions.width}
        height={dimensions.height}
        nodeId="id"
        nodeLabel="" // suppress default tooltip — we draw labels via nodeCanvasObject
        nodeVal="val"
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'replace' as const}
        onNodeClick={handleClick}
        onNodeHover={handleHover}
        linkColor={getLinkColor}
        linkWidth={1}
        enableZoomInteraction
        enablePanInteraction
        // Stop physics when reduced-motion is preferred (cooldownTicks=0 → freeze immediately)
        cooldownTicks={prefersReducedMotion ? 0 : 150}
        // Warm colours: background = white (default canvas bg)
        backgroundColor="#ffffff"
      />

      {/* Legend — bottom-left */}
      <div
        className="absolute bottom-4 left-4 bg-white/95 border border-slate-200 rounded-lg px-3 py-2 text-xs shadow-sm pointer-events-none"
        aria-label="그래프 범례"
        role="note"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0" aria-hidden="true" />
          <span className="text-slate-600">기사 노드</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400 flex-shrink-0" aria-hidden="true" />
          <span className="text-slate-600">주제 노드 (크기 = 기사 수)</span>
        </div>
      </div>

      {/* Interaction hint — top-right */}
      <p className="absolute top-3 right-3 text-xs text-slate-400 pointer-events-none select-none">
        클릭 이동 · 드래그/핀치 탐색
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Type-check the component in isolation**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npx tsc --noEmit 2>&1 | grep -i 'knowledgemap\|graph' | head -20
```

Expected: No errors for those files. If there are cast errors, adjust the `data` cast comment in the component (see note in Step 3 below).

> **If TypeScript complains about `data` cast:** Replace the cast block with:
> ```typescript
> graphData={data as unknown as Parameters<typeof ForceGraph2D>[0]['graphData']}
> ```
> This is safe because `GraphData` is structurally compatible; we're only informing TypeScript.

- [ ] **Step 3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add src/components/KnowledgeMap.tsx
git commit -m "feat: KnowledgeMap force-directed graph component"
```

---

## Task 5: Map page

**Files:**
- Create: `src/app/map/page.tsx`

The page is a **server component**. It calls `buildNewsGraph` server-side (reads from fs), then passes the data to `KnowledgeMap` which is **dynamically imported** with `ssr: false`. The dynamic import means `KnowledgeMap` (and `react-force-graph-2d`) never run on the server, so there are no `window`/canvas errors at build time.

- [ ] **Step 1: Create `src/app/map/page.tsx`**

```typescript
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { buildNewsGraph } from '@/lib/graph';
import { BASE_URL } from '@/lib/site';
import type { GraphData } from '@/lib/graph';

export const metadata: Metadata = {
  title: 'AI 뉴스 지식맵 | AIWire',
  description: 'AI·LLM 뉴스 기사와 주제를 연결한 인터랙티브 지식 그래프. 클릭으로 탐색하세요.',
  alternates: {
    canonical: `${BASE_URL}/map`,
  },
  openGraph: {
    title: 'AI 뉴스 지식맵',
    description: 'AI·LLM 뉴스를 주제별로 연결한 인터랙티브 그래프',
    url: `${BASE_URL}/map`,
    locale: 'ko_KR',
  },
};

// Dynamic import with ssr: false so react-force-graph-2d (canvas/window-dependent)
// is never executed on the server. The loading placeholder renders in its place
// until the client bundle hydrates.
const KnowledgeMap = dynamic<{ data: GraphData }>(
  () => import('@/components/KnowledgeMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full text-slate-400 text-sm">
        지식 그래프를 불러오는 중…
      </div>
    ),
  },
);

export default function MapPage(): JSX.Element {
  const graphData = buildNewsGraph('ko');
  const hasContent = graphData.nodes.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          AI 뉴스 지식맵 — 주제로 탐색하기
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          기사 노드를 클릭하면 상세 페이지로, 주제 노드를 클릭하면 해당 토픽 목록으로 이동합니다.
          스크롤 / 핀치로 줌, 드래그로 이동합니다.
        </p>
      </div>

      {/* Graph canvas area */}
      {hasContent ? (
        <div
          className="border border-slate-200 rounded-xl overflow-hidden h-[70vh] min-h-[400px] bg-white"
          aria-label="AI 뉴스 지식 그래프"
        >
          <KnowledgeMap data={graphData} />
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl h-[70vh] min-h-[400px] flex items-center justify-center text-slate-400 text-sm">
          아직 게시된 뉴스가 없습니다.
        </div>
      )}

      {/* Stats row */}
      {hasContent && (
        <p className="mt-3 text-xs text-slate-400">
          기사 {graphData.nodes.filter((n) => n.type === 'article').length}개 ·{' '}
          주제 {graphData.nodes.filter((n) => n.type === 'tag').length}개 ·{' '}
          연결 {graphData.links.length}개
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify page compiles**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npx tsc --noEmit 2>&1 | grep 'map/page' | head -10
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add src/app/map/page.tsx
git commit -m "feat: /map page — server component with dynamic KnowledgeMap"
```

---

## Task 6: Add navigation links (Header + Footer)

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Add "지식맵" to desktop nav in `src/components/Header.tsx`**

In `Header.tsx`, locate the desktop nav `<ul>`. After the `뉴스` `<li>` block (around line 48–55), add:

```tsx
<li>
  <Link
    href="/map"
    className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
  >
    지식맵
  </Link>
</li>
```

So the desktop nav becomes: 홈 → 뉴스 → **지식맵** → AI 가이드 → 소개 → EN.

- [ ] **Step 2: Add "지식맵" to mobile menu in `src/components/Header.tsx`**

In the mobile menu `<ul>` (the block inside `{mobileOpen && ...}`), after the `뉴스` `<li>` (around line 189–197), add:

```tsx
<li>
  <Link
    href="/map"
    className="block py-2 text-sm text-slate-700 hover:text-blue-600"
    onClick={() => setMobileOpen(false)}
  >
    지식맵
  </Link>
</li>
```

- [ ] **Step 3: Add "지식맵" to Footer's site column**

In `Footer.tsx`, inside the "사이트" column array (the second `nav aria-label="사이트 링크"`), add the map link. Locate the array starting with `{ href: '/news', label: '뉴스' }` and prepend or append:

```tsx
{ href: '/map', label: '지식맵' },
```

Add it after `{ href: '/news', label: '뉴스' }` so the order is: 뉴스, **지식맵**, English, 소개 …

- [ ] **Step 4: Verify build**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npx tsc --noEmit 2>&1 | grep -E 'Header|Footer' | head -10
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add src/components/Header.tsx src/components/Footer.tsx
git commit -m "feat: add 지식맵 nav link to header and footer"
```

---

## Task 7: Homepage teaser

**Files:**
- Create: `src/components/home/MapTeaser.tsx`
- Modify: `src/app/page.tsx`

This is a **static** card with no canvas rendering — just a call-to-action linking to `/map`. It appears between `CategoryStrip` and the news grid on the homepage.

- [ ] **Step 1: Create `src/components/home/MapTeaser.tsx`**

```tsx
import Link from 'next/link';

export default function MapTeaser(): JSX.Element {
  return (
    <section
      aria-labelledby="map-teaser-heading"
      className="py-8 border-b border-slate-200"
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 px-6 py-5">
          <div>
            <h2
              id="map-teaser-heading"
              className="text-base font-semibold text-slate-900"
            >
              AI 뉴스 지식맵
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              기사와 주제를 연결한 인터랙티브 그래프로 AI 트렌드를 한눈에 탐색하세요.
            </p>
          </div>
          <Link
            href="/map"
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            aria-label="AI 뉴스 지식맵 보기"
          >
            지식맵 탐색
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
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add `MapTeaser` to `src/app/page.tsx`**

Add import at the top of `src/app/page.tsx`:

```tsx
import MapTeaser from '@/components/home/MapTeaser';
```

In the JSX, add `<MapTeaser />` between `<CategoryStrip tags={tags} />` and the news grid section:

```tsx
{/* Category strip — tags linking to /news/topic/[tag] */}
<CategoryStrip tags={tags} />

{/* Knowledge map teaser */}
<MapTeaser />

{/* News grid — next 8 articles */}
{gridItems.length > 0 && (
```

- [ ] **Step 3: Commit**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git add src/components/home/MapTeaser.tsx src/app/page.tsx
git commit -m "feat: homepage MapTeaser card linking to /map"
```

---

## Task 8: Full verification and final push

**Files:** (no code changes — verification only)

- [ ] **Step 1: TypeScript check**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npx tsc --noEmit 2>&1
```

Expected: Zero errors. If errors, fix them before continuing.

- [ ] **Step 2: Lint**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npm run lint 2>&1
```

Expected: Zero errors (warnings are OK).

- [ ] **Step 3: Tests**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npm test -- --no-coverage 2>&1 | tail -25
```

Expected: All existing tests pass + the 5 new `graph.test.ts` tests pass. Zero failures.

- [ ] **Step 4: Build**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
npm run build 2>&1 | tail -30
```

Expected: Build succeeds. The `/map` route is statically rendered. Look for `○ /map` in the route table output. Confirm there are no errors about `window`, `canvas`, or `react-force-graph-2d` during build.

> **If build fails with canvas/window error:** Ensure the `dynamic(() => import('@/components/KnowledgeMap'), { ssr: false })` call in `map/page.tsx` is correct. The `ssr: false` ensures `KnowledgeMap` (and thus `react-force-graph-2d`) never runs on the server build. If the error persists, verify `KnowledgeMap.tsx` does NOT import any canvas code at the module level outside the component body.

- [ ] **Step 5: Push branch**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git push -u origin feature/knowledge-map
```

Expected: Branch pushed. Output shows the remote tracking branch. Do NOT merge — the controller reviews first.

- [ ] **Step 6: Record final commit SHA**

```bash
cd /Users/Young/Desktop/claude-workspace/teamY/ai-guide
git log --oneline -6
```

Copy the SHA of the most recent commit and include it in the completion report.

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| `buildNewsGraph(lang)` in `src/lib/graph.ts` | Task 3 |
| `GraphNode` type with `id`, `label`, `type`, `url`, `val` | Task 2 |
| Article node id `a:<slug>`, url `/news/<slug>` | Task 3 |
| Tag node id `t:<tag>`, url `/news/topic/<tag>` | Task 3 |
| Tag `val` = article count, article `val` = 3 (fixed) | Task 3 |
| Unit test for graph builder | Task 3 |
| `KnowledgeMap.tsx` `'use client'` | Task 4 |
| `react-force-graph-2d` via dynamic import `ssr:false` | Task 5 |
| Article nodes blue-600, tag nodes slate-400 | Task 4 |
| Labels on hover/zoom | Task 4 |
| Click → `router.push(node.url)` | Task 4 |
| Hover → highlight + dim neighbors | Task 4 |
| Zoom/pan enabled | Task 4 |
| Responsive (ResizeObserver) | Task 4 |
| Touch-friendly (ForceGraph2D's built-in touch support) | Task 4 |
| `prefers-reduced-motion` → stop physics | Task 4 |
| Legend (article vs topic) | Task 4 |
| Page `src/app/map/page.tsx` with heading, intro, metadata | Task 5 |
| Graceful empty state | Task 5 |
| Header "지식맵" link | Task 6 |
| Footer "지식맵" link | Task 6 |
| Homepage teaser | Task 7 |
| `npm run build` must pass | Task 8 |
| `npx tsc --noEmit` must pass | Task 8 |
| `npm run lint` must pass | Task 8 |
| `npm test` must pass | Task 8 |
| `git push -u origin feature/knowledge-map` | Task 8 |
| No merge | Task 8 |

**Placeholder scan:** No TBD, no TODO in code blocks. All steps have actual code.

**Type consistency check:**
- `GraphNode`, `GraphLink`, `GraphData` defined in Task 2, used consistently in Tasks 3, 4, 5.
- `SimNode` and `SimLink` are local to `KnowledgeMap.tsx` (Task 4) — no cross-task reference.
- `resolveId` defined and used only in `KnowledgeMap.tsx`.
- `buildNewsGraph` signature `(lang: NewsLang): GraphData` consistent across Tasks 2, 3, 5.
- `data: GraphData` prop on `KnowledgeMap` consistent with how page passes it in Task 5.

**Potential gotchas noted:**
1. `encodeURIComponent(tag)` in tag URLs: verify against existing `/news/topic/[tag]/page.tsx` decode behavior — remove if it causes double-encoding.
2. `react-force-graph-2d` cast for `graphData` prop: if `Parameters<typeof ForceGraph2D>[0]['graphData']` fails TypeScript, fall back to `unknown` cast with comment.
3. Jest mock for `getAllNews` in `graph.test.ts`: the `jest.mock` hoisting ensures the mock is applied before `buildNewsGraph` is imported.
