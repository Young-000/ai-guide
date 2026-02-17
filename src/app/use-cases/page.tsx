import type { Metadata } from 'next';
import UseCaseList from './use-case-list';

const BASE_URL = 'https://ai-guide-nu.vercel.app';

export const metadata: Metadata = {
  title: 'AI 활용 사례 | AI Guide',
  description:
    '마케터, 개발자, 디자이너, 학생, 직장인 등 다양한 직업군의 실제 AI 활용 사례를 확인하세요. 나와 비슷한 상황에서 AI를 어떻게 활용했는지 배울 수 있습니다.',
  alternates: {
    canonical: `${BASE_URL}/use-cases`,
  },
  openGraph: {
    title: 'AI 활용 사례 | AI Guide',
    description:
      '마케터, 개발자, 디자이너, 학생, 직장인 등 다양한 직업군의 실제 AI 활용 사례를 확인하세요.',
    url: `${BASE_URL}/use-cases`,
    siteName: 'AI 가이드',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function UseCasesPage(): React.ReactElement {
  return <UseCaseList />;
}
