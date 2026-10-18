import { buildSiteJsonLd } from '@/lib/site-json-ld';

const BASE = 'https://example.com';

describe('buildSiteJsonLd', () => {
  const graph = buildSiteJsonLd(BASE)['@graph'];
  const organization = graph.find((node) => node['@type'] === 'Organization');
  const webSite = graph.find((node) => node['@type'] === 'WebSite');

  it('describes Organization and WebSite in one graph', () => {
    expect(organization).toBeDefined();
    expect(webSite).toBeDefined();
  });

  it('gives the Organization a legal name, logo and contact point', () => {
    expect(organization).toMatchObject({
      name: 'AIWire',
      legalName: '팀와이(TeamY)',
      url: BASE,
      logo: `${BASE}/opengraph-image`,
    });
    expect(organization?.contactPoint).toMatchObject({ '@type': 'ContactPoint' });
  });

  it('links WebSite to the Organization as publisher by @id', () => {
    expect(webSite?.publisher).toEqual({ '@id': organization?.['@id'] });
    expect(webSite?.inLanguage).toEqual(['ko', 'en']);
    expect(webSite?.description).toEqual(expect.any(String));
  });
});
