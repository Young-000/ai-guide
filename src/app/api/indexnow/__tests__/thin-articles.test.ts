/**
 * @jest-environment node
 */
import { GET } from '../route';
import { getAllNews, getThinArticleSlugs } from '@/lib/news';

const submitUrlsMock = jest.fn(async (urls: string[]) => ({
  ok: true,
  submitted: urls.length,
  status: 200,
}));

jest.mock('@/lib/indexnow', () => ({
  submitUrls: (urls: string[]): unknown => submitUrlsMock(urls),
}));

const thinSlug = Array.from(getThinArticleSlugs())[0];
const solidSlug = getAllNews('ko').find((n) => !getThinArticleSlugs().has(n.slug))?.slug;

async function submittedUrls(): Promise<string[]> {
  delete process.env.CRON_SECRET;
  await GET(new Request('http://localhost/api/indexnow', {
    headers: { 'x-forwarded-for': '10.2.0.1' },
  }));
  return submitUrlsMock.mock.calls[0][0];
}

beforeEach(() => submitUrlsMock.mockClear());

describe('GET /api/indexnow — 색인에서 뺀 기사', () => {
  it('has a thin and a solid article in the real content (test precondition)', () => {
    expect(thinSlug).toBeDefined();
    expect(solidSlug).toBeDefined();
  });

  it('does not submit thin article URLs (ko or en) — sitemap and noindex exclude them', async () => {
    const urls = await submittedUrls();
    expect(urls).not.toContain(`https://aiwire.news/news/${thinSlug}`);
    expect(urls).not.toContain(`https://aiwire.news/en/news/${thinSlug}`);
  });

  it('still submits solid articles', async () => {
    const urls = await submittedUrls();
    expect(urls).toContain(`https://aiwire.news/news/${solidSlug}`);
  });
});
