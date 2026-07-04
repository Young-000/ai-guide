import type { Metadata } from 'next';
import TrendsContent from './trends-content';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI 트렌드 & 뉴스 | AIWire',
  description: 'AI 세계에서 무슨 일이 일어나고 있는지, 초보자도 이해할 수 있게 정리했어요.',
  alternates: { canonical: `${BASE_URL}/trends` },
};

export default function TrendsPage(): JSX.Element {
  return <TrendsContent />;
}
