'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
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
      void track('map_node_click', { type: node.type });
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
          data as unknown as Parameters<typeof ForceGraph2D>[0]['graphData']
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
