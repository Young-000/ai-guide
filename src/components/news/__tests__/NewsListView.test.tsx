import { render, screen } from '@testing-library/react';
import NewsListView from '@/components/news/NewsListView';
import type { NewsMeta } from '@/types/news';

const items: NewsMeta[] = [
  { title: '베타 기사', lang: 'ko', date: '2026-02-01', slug: 'beta', summary: '베타 요약', tags: ['LLM'], sources: [] },
];

describe('NewsListView', () => {
  it('기사 제목과 요약을 렌더한다', () => {
    render(<NewsListView lang="ko" items={items} />);
    expect(screen.getByText('베타 기사')).toBeInTheDocument();
    expect(screen.getByText('베타 요약')).toBeInTheDocument();
  });

  it('ko 카드 링크는 /news/<slug>를 가리킨다', () => {
    render(<NewsListView lang="ko" items={items} />);
    expect(screen.getByRole('link', { name: /베타 기사/ })).toHaveAttribute('href', '/news/beta');
  });

  it('빈 목록이면 empty 메시지를 렌더한다', () => {
    render(<NewsListView lang="en" items={[]} />);
    expect(screen.getByText('No news published yet.')).toBeInTheDocument();
  });
});
