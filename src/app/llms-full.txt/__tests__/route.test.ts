/**
 * @jest-environment node
 */
import { GET } from '../route';
import { getThinArticleSlugs } from '@/lib/news';

describe('GET /llms-full.txt', () => {
  it('includes at least one English article under /en/news/', async () => {
    const res = GET();
    const body = await res.text();
    expect(body).toMatch(/https:\/\/aiwire\.news\/en\/news\/\S+/);
  });

  it('still includes Korean articles under /news/ (not /en/news/)', async () => {
    const res = GET();
    const body = await res.text();
    expect(body).toMatch(/https:\/\/aiwire\.news\/news\/\S+/);
  });
});

describe('GET /llms-full.txt — 색인에서 뺀 기사', () => {
  it('omits thin articles that sitemap and noindex exclude', async () => {
    const thinSlug = Array.from(getThinArticleSlugs())[0];
    const body = await GET().text();
    expect(thinSlug).toBeDefined();
    expect(body).not.toContain(`/news/${thinSlug}`);
  });
});
