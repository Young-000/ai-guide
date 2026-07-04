import type { Metadata } from 'next';
import MyProgressContent from './my-progress-content';
import { BASE_URL } from '@/lib/site';

// Personal, localStorage-driven dashboard — no unique per-visitor content to
// index, but still crawlable (robots.ts allows '/'). Self-canonical prevents
// Google from folding it into the homepage the way it did before this fix.
export const metadata: Metadata = {
  title: '나의 학습 진행 | AIWire',
  alternates: { canonical: `${BASE_URL}/my-progress` },
};

export default function MyProgressPage(): JSX.Element {
  return <MyProgressContent />;
}
