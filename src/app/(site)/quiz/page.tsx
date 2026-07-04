import type { Metadata } from 'next';
import QuizContent from './quiz-content';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI 추천 테스트 | AIWire',
  description: '몇 가지 질문에 답하면 나에게 딱 맞는 AI 도구를 추천해드려요.',
  alternates: { canonical: `${BASE_URL}/quiz` },
};

export default function QuizPage(): JSX.Element {
  return <QuizContent />;
}
