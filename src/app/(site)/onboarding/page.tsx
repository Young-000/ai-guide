import type { Metadata } from 'next';
import OnboardingContent from './onboarding-content';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '나에게 맞는 AI 찾기 | AIWire',
  description: '4가지 질문에 답하면 딱 맞는 AI를 추천해드려요.',
  alternates: { canonical: `${BASE_URL}/onboarding` },
};

export default function OnboardingPage(): JSX.Element {
  return <OnboardingContent />;
}
