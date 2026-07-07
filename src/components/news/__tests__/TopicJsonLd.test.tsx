import { render } from '@testing-library/react';
import TopicJsonLd from '../TopicJsonLd';
import { BASE_URL } from '@/lib/site';

function extractJsonLd(container: Element): unknown[] {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map((el) =>
    JSON.parse(el.textContent ?? '')
  );
}

describe('TopicJsonLd', () => {
  const tag = 'AI Agents';
  const url = `${BASE_URL}/news/topic/${encodeURIComponent(tag)}`;

  it('renders exactly one script tag', () => {
    const { container } = render(<TopicJsonLd tag={tag} url={url} />);
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
  });

  it('outputs a BreadcrumbList schema', () => {
    const { container } = render(<TopicJsonLd tag={tag} url={url} />);
    const [crumb] = extractJsonLd(container);
    expect((crumb as Record<string, unknown>)['@type']).toBe('BreadcrumbList');
  });

  it('has 3 breadcrumb items: Home, News, topic label', () => {
    const { container } = render(<TopicJsonLd tag={tag} url={url} />);
    const [crumb] = extractJsonLd(container) as Array<{ itemListElement: unknown[] }>;
    expect(crumb.itemListElement).toHaveLength(3);
  });

  it('position 1 links to site root', () => {
    const { container } = render(<TopicJsonLd tag={tag} url={url} />);
    const [crumb] = extractJsonLd(container) as Array<{
      itemListElement: Array<{ position: number; item: string; name: string }>;
    }>;
    expect(crumb.itemListElement[0]).toMatchObject({ position: 1, item: BASE_URL });
  });

  it('position 2 links to /news', () => {
    const { container } = render(<TopicJsonLd tag={tag} url={url} />);
    const [crumb] = extractJsonLd(container) as Array<{
      itemListElement: Array<{ position: number; item: string }>;
    }>;
    expect(crumb.itemListElement[1]).toMatchObject({
      position: 2,
      item: `${BASE_URL}/news`,
    });
  });

  it('position 3 uses the tag as name and the canonical URL as item', () => {
    const { container } = render(<TopicJsonLd tag={tag} url={url} />);
    const [crumb] = extractJsonLd(container) as Array<{
      itemListElement: Array<{ position: number; name: string; item: string }>;
    }>;
    expect(crumb.itemListElement[2]).toMatchObject({ position: 3, name: tag, item: url });
  });

  it('does not contain raw "<" or ">" that could break script injection', () => {
    const dangerous = '</script><script>alert(1)';
    const { container } = render(
      <TopicJsonLd tag={dangerous} url={`${BASE_URL}/news/topic/x`} />
    );
    const raw = container.querySelector('script')!.textContent ?? '';
    expect(raw).not.toContain('<');
    expect(raw).not.toContain('>');
  });
});
