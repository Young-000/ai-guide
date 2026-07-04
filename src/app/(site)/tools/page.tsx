import type { Metadata } from 'next';
import ToolsContent from './tools-content';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '모든 AI 도구 | AIWire',
  description: '카테고리별로 정리된 AI 도구 목록에서 나에게 맞는 도구를 찾아보세요.',
  alternates: { canonical: `${BASE_URL}/tools` },
};

export default function ToolsPage(): JSX.Element {
  return <ToolsContent />;
}
