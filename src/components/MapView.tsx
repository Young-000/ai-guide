'use client';

import dynamic from 'next/dynamic';
import type { GraphData } from '@/lib/graph';

// react-force-graph-2d touches `window` at module load → must NOT run during SSR.
// ssr:false dynamic import is only allowed inside a Client Component, hence this wrapper.
const KnowledgeMap = dynamic(() => import('@/components/KnowledgeMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
      지식맵을 불러오는 중…
    </div>
  ),
});

type Props = {
  data: GraphData;
};

export default function MapView({ data }: Props): JSX.Element {
  return <KnowledgeMap data={data} />;
}
