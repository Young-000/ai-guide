import type { Metadata } from 'next';
import SituationsContent from './situations-content';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '이런 상황엔 이 AI | AIWire',
  description: '상황을 선택하면 가장 적합한 AI 도구와 사용법을 알려드려요.',
  alternates: { canonical: `${BASE_URL}/situations` },
};

export default function SituationsPage(): JSX.Element {
  return <SituationsContent />;
}
