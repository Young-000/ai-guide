import type { Metadata } from 'next';
import LearnContent from './learn-content';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI 학습센터 | 51개 가이드와 팁으로 AI 마스터하기 | AI 가이드',
  description:
    '상황별 가이드 19개, 활용 사례 17개, AI 활용 팁 15개를 한곳에서 확인하세요. AI를 처음 배우는 분부터 실무에 활용하는 분까지, 모든 학습 자료를 모았습니다.',
  alternates: {
    canonical: `${BASE_URL}/learn`,
  },
  openGraph: {
    title: 'AI 학습센터 | 51개 가이드와 팁으로 AI 마스터하기 | AI 가이드',
    description:
      '상황별 가이드, 활용 사례, AI 활용 팁을 한곳에서. AI 학습의 모든 것.',
    url: `${BASE_URL}/learn`,
    siteName: 'AI 가이드',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function LearnPage(): React.ReactElement {
  return <LearnContent />;
}
