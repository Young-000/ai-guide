import type { Metadata } from 'next';
import GlossaryContent from './glossary-content';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI 용어 사전 | AIWire',
  description: 'AI 세상에서 자주 나오는 용어들을 쉽게 설명해드려요.',
  alternates: { canonical: `${BASE_URL}/glossary` },
};

export default function GlossaryPage(): JSX.Element {
  return <GlossaryContent />;
}
