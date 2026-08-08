'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
// react-force-graph-2d is canvas-only; this component is always dynamic-imported
// by src/app/map/page.tsx with { ssr: false }, so `window` is guaranteed to exist.
import ForceGraph2D from 'react-force-graph-2d';
import type { ForceGraphMethods } from 'react-force-graph-2d';
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

type LabelBox = { left: number; right: number; top: number; bottom: number };

function overlaps(a: LabelBox, b: LabelBox): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export default function KnowledgeMap({ data }: Props): JSX.Element {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  // Imperative handle exposed by ForceGraph2D; we only use zoomToFit.
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
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
      // Tags scale up with article count; articles are fixed small circles.
      // Articles are drawn smaller than tags so the topic structure reads first —
      // there are ~400 of them and only ~220 tags.
      const radius = isTag ? Math.max(4, Math.sqrt(node.val) * 5) : 2.5;

      // Articles sit behind the topics they connect: visible, but not competing.
      ctx.globalAlpha = isDimmed ? 0.1 : isTag || isHovered ? 1 : 0.45;

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

  /**
   * Draws every label after all nodes and links are painted.
   *
   * Labels used to be drawn inside the node painter, which meant any node painted later
   * covered the label of an earlier one — big topics showed up truncated ("Anth" for
   * Anthropic). Drawing them in one pass at the end puts all text above all circles.
   *
   * Visibility scales with what a node carries: major topics name themselves at any zoom,
   * smaller ones appear as you zoom in. Colliding labels are skipped, and since nodes are
   * ordered biggest-first (see buildNewsGraph), the more important label keeps the spot.
   */
  const paintLabels = useCallback(
    (ctx: CanvasRenderingContext2D, globalScale: number): void => {
      const drawn: LabelBox[] = [];

      for (const rawNode of data.nodes as SimNode[]) {
        const isTag = rawNode.type === 'tag';
        const isHovered = rawNode.id === hoveredId;
        const isDimmed = hoveredId !== null && !isHovered && !neighborIds.has(rawNode.id);

        const show =
          isHovered ||
          (isTag &&
            (rawNode.val >= 10 ||
              (rawNode.val >= 4 && globalScale >= 1.2) ||
              globalScale >= 2)) ||
          (!isTag && globalScale >= 2.5);
        if (!show) continue;

        // Major topics get a larger, bolder label — the size difference is the hierarchy.
        const isMajor = isTag && rawNode.val >= 10;
        const basePx = isMajor ? 15 : isTag ? 13 : 11;
        const fontSize = Math.max(basePx * 0.75, basePx / globalScale);
        ctx.font = `${isMajor ? '600 ' : ''}${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const radius = isTag ? Math.max(4, Math.sqrt(rawNode.val) * 5) : 2.5;
        const labelX = rawNode.x ?? 0;
        const labelY = (rawNode.y ?? 0) + radius + 3 / globalScale;
        const halfWidth = ctx.measureText(rawNode.label).width / 2;
        const box: LabelBox = {
          left: labelX - halfWidth,
          right: labelX + halfWidth,
          top: labelY,
          bottom: labelY + fontSize,
        };

        // Hovered node always wins — the reader asked for that one specifically.
        if (!isHovered && drawn.some((other) => overlaps(box, other))) continue;
        drawn.push(box);

        ctx.globalAlpha = isDimmed ? 0.15 : 1;

        // White halo so labels stay readable over edges and circles.
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3 / globalScale;
        ctx.lineJoin = 'round';
        ctx.strokeText(rawNode.label, labelX, labelY);

        ctx.fillStyle = isTag ? '#334155' : '#1e293b'; // slate-700 / slate-800
        ctx.fillText(rawNode.label, labelX, labelY);
        ctx.globalAlpha = 1;
      }
    },
    [data.nodes, hoveredId, neighborIds],
  );

  const fitted = useRef(false);
  const handleEngineStop = useCallback((): void => {
    // Only on the first settle — refitting on every stop would fight the reader's zoom.
    if (fitted.current) return;
    fitted.current = true;
    // Fit to the well-connected topics only. Fitting to *every* node lets a handful of
    // far-flung outliers dictate the zoom and shrinks the real cluster to a smudge.
    graphRef.current?.zoomToFit(400, 60, (rawNode) => {
      const node = rawNode as unknown as SimNode;
      return node.type === 'tag' && node.val >= 4;
    });
  }, []);

  const getLinkColor = useCallback(
    (rawLink: unknown): string => {
      const link = rawLink as SimLink;
      if (!hoveredId) return '#e2e8f0'; // slate-200 — edges recede so labels read first
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
        ref={graphRef}
        onNodeClick={handleClick}
        onNodeHover={handleHover}
        // Labels are painted last, above every circle and edge.
        onRenderFramePost={paintLabels}
        // Fit the whole graph to the viewport once physics settles, so the first view
        // fills the canvas instead of sitting as a small cluster in the middle.
        onEngineStop={handleEngineStop}
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
