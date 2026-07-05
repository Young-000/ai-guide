import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';
import { BASE_URL } from '@/lib/site';
import { getTagsWithCount, MIN_TAG_ARTICLE_COUNT_FOR_INDEX } from '@/lib/news';
import sitemap from '../sitemap';

// Regression guard: every internal (same-site) link rendered in the Footer
// must have a corresponding entry in the sitemap. This is how /terms went
// missing — it was live and linked, but never added to sitemap.ts.
describe('sitemap — Footer static route coverage', () => {
  it('includes every internal Footer link as a sitemap URL', () => {
    render(<Footer />);
    const internalHrefs = Array.from(
      new Set(
        screen
          .getAllByRole('link')
          .map((link) => link.getAttribute('href'))
          .filter((href): href is string => !!href && href.startsWith('/')),
      ),
    );

    const sitemapUrls = new Set(sitemap().map((entry) => entry.url));

    for (const href of internalHrefs) {
      expect(sitemapUrls.has(`${BASE_URL}${href}`)).toBe(true);
    }
  });

  it('includes /terms specifically', () => {
    const sitemapUrls = sitemap().map((entry) => entry.url);
    expect(sitemapUrls).toContain(`${BASE_URL}/terms`);
  });
});

describe('sitemap — thin tag exclusion', () => {
  it('excludes /news/topic/[tag] pages for tags below MIN_TAG_ARTICLE_COUNT_FOR_INDEX', () => {
    const tagCounts = getTagsWithCount('ko');
    const thinTag = tagCounts.find((t) => t.count < MIN_TAG_ARTICLE_COUNT_FOR_INDEX);
    expect(thinTag).toBeDefined();

    const sitemapUrls = new Set(sitemap().map((entry) => entry.url));
    expect(sitemapUrls.has(`${BASE_URL}/news/topic/${encodeURIComponent(thinTag!.tag)}`)).toBe(
      false,
    );
  });

  it('still includes /news/topic/[tag] pages for well-populated tags', () => {
    const tagCounts = getTagsWithCount('ko');
    const richTag = tagCounts.find((t) => t.count >= MIN_TAG_ARTICLE_COUNT_FOR_INDEX);
    expect(richTag).toBeDefined();

    const sitemapUrls = new Set(sitemap().map((entry) => entry.url));
    expect(sitemapUrls.has(`${BASE_URL}/news/topic/${encodeURIComponent(richTag!.tag)}`)).toBe(
      true,
    );
  });
});
