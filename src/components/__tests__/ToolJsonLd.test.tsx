import { render } from '@testing-library/react';
import ToolJsonLd from '../ToolJsonLd';
import { BASE_URL } from '@/lib/site';
import type { Tool } from '@/types';

function extractJsonLd(container: Element): Record<string, unknown>[] {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
    (el) => JSON.parse(el.textContent ?? '') as Record<string, unknown>
  );
}

const TOOL: Tool = {
  slug: 'chatgpt',
  name: 'ChatGPT',
  tagline: '가장 널리 쓰이는 AI 챗봇',
  description: 'OpenAI에서 만든 대화형 AI입니다.',
  category: 'chatbot',
  pricing: {
    free: true,
    plans: [
      { name: 'Free', price: 0 },
      { name: 'Plus', price: 20 },
      { name: 'Enterprise', price: '문의' },
    ],
  },
  features: ['자연스러운 대화', '코드 작성'],
  bestFor: ['AI 처음 시작하는 분'],
  url: 'https://chat.openai.com',
  alternatives: ['claude'],
};

describe('ToolJsonLd', () => {
  it('renders exactly two script tags (SoftwareApplication + BreadcrumbList)', () => {
    const { container } = render(<ToolJsonLd tool={TOOL} />);
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
  });

  it('describes the tool as a SoftwareApplication with a self-referencing url', () => {
    const { container } = render(<ToolJsonLd tool={TOOL} />);
    const [app] = extractJsonLd(container);
    expect(app['@type']).toBe('SoftwareApplication');
    expect(app.name).toBe('ChatGPT');
    expect(app.description).toBe(TOOL.description);
    expect(app.url).toBe(`${BASE_URL}/tools/chatgpt`);
    expect(app.applicationCategory).toBe('BusinessApplication');
    expect(app.operatingSystem).toBe('Web');
  });

  it('maps numeric plans to Offers in USD and drops non-numeric prices', () => {
    const { container } = render(<ToolJsonLd tool={TOOL} />);
    const [app] = extractJsonLd(container);
    const offers = app.offers as Record<string, unknown>[];
    expect(offers).toHaveLength(2);
    expect(offers[0]).toMatchObject({
      '@type': 'Offer',
      name: 'Free',
      price: 0,
      priceCurrency: 'USD',
    });
    expect(offers[1]).toMatchObject({ name: 'Plus', price: 20 });
  });

  it('omits the offers key entirely when no plan has a numeric price', () => {
    const tool: Tool = {
      ...TOOL,
      pricing: { free: false, plans: [{ name: 'Enterprise', price: '문의' }] },
    };
    const { container } = render(<ToolJsonLd tool={tool} />);
    const [app] = extractJsonLd(container);
    expect(app).not.toHaveProperty('offers');
  });

  it('builds a three-level breadcrumb: 홈 > AI 도구 > 도구명', () => {
    const { container } = render(<ToolJsonLd tool={TOOL} />);
    const [, breadcrumb] = extractJsonLd(container);
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'AI 도구', item: `${BASE_URL}/tools` },
      { '@type': 'ListItem', position: 3, name: 'ChatGPT', item: `${BASE_URL}/tools/chatgpt` },
    ]);
  });

  it('escapes tag-like characters so a tool field cannot break out of the script tag', () => {
    const tool: Tool = { ...TOOL, description: 'breaks </script> out' };
    const { container } = render(<ToolJsonLd tool={tool} />);
    const raw = container.querySelector('script[type="application/ld+json"]')?.innerHTML ?? '';
    expect(raw).not.toContain('</script>');
    const [app] = extractJsonLd(container);
    expect(app.description).toBe('breaks </script> out');
  });
});
