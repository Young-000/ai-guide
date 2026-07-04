import type { Metadata } from 'next';
import OnboardingResultContent from './result-content';
import { BASE_URL } from '@/lib/site';

// Query-param-driven result view (?r=<encoded answers>) — same leak as the
// other client pages: no own metadata meant it inherited the homepage
// canonical from the root layout.
export const metadata: Metadata = {
  title: '나의 AI 추천 결과 | AIWire',
  alternates: { canonical: `${BASE_URL}/onboarding/result` },
};

export default function OnboardingResultPage(): JSX.Element {
  return <OnboardingResultContent />;
}
