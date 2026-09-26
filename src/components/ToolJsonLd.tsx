import { BASE_URL } from '@/lib/site';
import { safeJson } from '@/lib/json-ld';
import type { Tool } from '@/types';

type ToolJsonLdProps = {
  tool: Tool;
};

type Offer = {
  '@type': 'Offer';
  name: string;
  price: number;
  priceCurrency: 'USD';
};

/**
 * 도구 상세의 구조화 데이터: SoftwareApplication(가격 Offer 포함) + BreadcrumbList.
 *
 * 문의/별도협의처럼 금액이 문자열인 플랜은 Offer에서 제외한다 — schema.org `price`는
 * 수치여야 하고, 값을 지어내면 리치 결과에서 잘못된 가격이 노출된다.
 */
export default function ToolJsonLd({ tool }: ToolJsonLdProps): JSX.Element {
  const url = `${BASE_URL}/tools/${tool.slug}`;

  const offers: Offer[] = tool.pricing.plans
    .filter((plan): plan is typeof plan & { price: number } => typeof plan.price === 'number')
    .map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      price: plan.price,
      priceCurrency: 'USD',
    }));

  const applicationData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    ...(offers.length > 0 ? { offers } : {}),
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'AI 도구', item: `${BASE_URL}/tools` },
      { '@type': 'ListItem', position: 3, name: tool.name, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(applicationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbData) }}
      />
    </>
  );
}
