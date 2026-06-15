import { render, screen } from '@testing-library/react';
import TagChips from '@/components/news/TagChips';

const TAGS = ['LLM', 'OpenAI', '모델'];

describe('TagChips', () => {
  it('renders a link for each tag', () => {
    render(<TagChips tags={TAGS} />);
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('each link points to /news/topic/<encoded-tag>', () => {
    render(<TagChips tags={TAGS} />);
    const llmLink = screen.getByRole('link', { name: 'LLM' });
    expect(llmLink).toHaveAttribute('href', '/news/topic/LLM');
  });

  it('renders the "All" link to /news when showAll is true', () => {
    render(<TagChips tags={TAGS} showAll />);
    expect(screen.getByRole('link', { name: '전체' })).toHaveAttribute('href', '/news');
  });

  it('highlights the active tag with different styling', () => {
    render(<TagChips tags={TAGS} activeTag="LLM" />);
    const activeLink = screen.getByRole('link', { name: 'LLM' });
    expect(activeLink.className).toMatch(/text-white/);
  });

  it('renders nothing when tags array is empty', () => {
    const { container } = render(<TagChips tags={[]} />);
    expect(container.querySelector('ul')).toBeEmptyDOMElement();
  });
});
