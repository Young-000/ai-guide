import { render, screen } from '@testing-library/react';
import NewsArticleView from '@/components/news/NewsArticleView';
import type { NewsArticle } from '@/types/news';

jest.mock('@/components/AdUnit', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/AdFitUnit', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/CoupangBanner', () => ({ __esModule: true, default: () => null }));
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => undefined }));

const article: NewsArticle = {
  title: '테스트 기사',
  lang: 'ko',
  date: '2026-10-01',
  slug: 'test-article',
  summary: '요약',
  tags: ['LLM'],
  sources: [],
  body: '본문입니다.',
};

describe('NewsArticleView — 구독 진입점', () => {
  it('기사 하단에 뉴스레터 구독 폼을 렌더한다', () => {
    render(<NewsArticleView lang="ko" article={article} />);
    expect(screen.getByRole('form', { name: '뉴스레터 구독' })).toBeInTheDocument();
  });

  it('구독 폼은 기사 본문보다 뒤에 놓인다', () => {
    render(<NewsArticleView lang="ko" article={article} />);
    const body = screen.getByText('본문입니다.');
    const form = screen.getByRole('form', { name: '뉴스레터 구독' });
    expect(body.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
