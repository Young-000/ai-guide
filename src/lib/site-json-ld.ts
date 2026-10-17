import { businessInfo } from '@/lib/business-info';

type JsonLdNode = Record<string, unknown> & { '@type': string };

type SiteJsonLd = {
  '@context': 'https://schema.org';
  '@graph': JsonLdNode[];
};

/**
 * Site-wide JSON-LD: Organization + WebSite, linked by @id so answer engines
 * resolve one publisher entity. Pure function — baseUrl is passed for testability.
 * No SearchAction: the site has no dedicated search endpoint.
 */
export function buildSiteJsonLd(baseUrl: string): SiteJsonLd {
  const organizationId = `${baseUrl}/#organization`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: businessInfo.serviceName,
        legalName: businessInfo.bizName,
        url: baseUrl,
        logo: `${baseUrl}/opengraph-image`,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: businessInfo.email,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        name: businessInfo.serviceName,
        url: baseUrl,
        description: 'AI·LLM 최신 소식과 상황별 AI 활용 가이드를 제공하는 미디어',
        inLanguage: ['ko', 'en'],
        publisher: { '@id': organizationId },
      },
    ],
  };
}
