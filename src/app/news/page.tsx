import type { Metadata } from 'next';
import { getAllNews } from '@/lib/news';
import NewsListView from '@/components/news/NewsListView';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI · LLM 뉴스 | AI 가이드',
  description: '매일 업데이트되는 AI·LLM 최신 소식을 한국어로 핵심만 정리했습니다.',
  alternates: {
    canonical: `${BASE_URL}/news`,
    languages: {
      'ko-KR': `${BASE_URL}/news`,
      'en-US': `${BASE_URL}/en/news`,
      'x-default': `${BASE_URL}/news`,
    },
  },
  openGraph: {
    locale: 'ko_KR',
  },
};

export default function NewsPage(): JSX.Element {
  const items = getAllNews('ko');
  return <NewsListView lang="ko" items={items} />;
}
