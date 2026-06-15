import type { Metadata } from 'next';
import TipList from './tip-list';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI 활용 팁 | 실전에서 바로 쓰는 AI 사용법 | AI 가이드',
  description:
    'ChatGPT, Claude, Midjourney 등 AI 도구를 실전에서 활용하는 방법을 알려드립니다. 보고서 작성, 이메일, 코딩, 디자인 등 상황별 AI 활용 팁을 확인하세요.',
  alternates: {
    canonical: `${BASE_URL}/tips`,
  },
  openGraph: {
    title: 'AI 활용 팁 | 실전에서 바로 쓰는 AI 사용법 | AI 가이드',
    description:
      'ChatGPT, Claude, Midjourney 등 AI 도구를 실전에서 활용하는 방법을 알려드립니다.',
    url: `${BASE_URL}/tips`,
    siteName: 'AI 가이드',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function TipsPage(): React.ReactElement {
  return <TipList />;
}
