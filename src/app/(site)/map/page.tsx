import type { Metadata } from 'next';
import { buildNewsGraph } from '@/lib/graph';
import MapView from '@/components/MapView';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI 뉴스 지식맵 | AIWire',
  description: '매일의 AI·LLM 뉴스를 주제(태그)로 연결한 지식 그래프. 노드를 클릭해 기사와 주제를 탐색하세요.',
  alternates: { canonical: `${BASE_URL}/map` },
};

export default function MapPage(): JSX.Element {
  const data = buildNewsGraph('ko');

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">AI 뉴스 지식맵</h1>
        <p className="mt-2 text-slate-600">
          AI·LLM 뉴스를 주제로 연결한 그래프입니다. 파란 점은 기사, 회색 점은 주제(태그)예요. 점을 클릭하면 해당 기사·주제로 이동합니다.
        </p>
      </header>

      {data.nodes.length === 0 ? (
        <p className="text-slate-500">아직 연결할 기사가 충분하지 않습니다. 곧 채워집니다.</p>
      ) : (
        <div className="h-[72vh] min-h-[420px] rounded-2xl border border-slate-200 overflow-hidden bg-white">
          <MapView data={data} />
        </div>
      )}
    </section>
  );
}
