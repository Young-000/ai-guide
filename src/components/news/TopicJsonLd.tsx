import { BASE_URL } from '@/lib/site';
import { safeJson } from '@/lib/json-ld';

type TopicJsonLdProps = {
  tag: string;
  url: string;
};

/** 토픽(태그) 랜딩의 BreadcrumbList 구조화 데이터: 홈 > 뉴스 > {tag} */
export default function TopicJsonLd({ tag, url }: TopicJsonLdProps): JSX.Element {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: '뉴스', item: `${BASE_URL}/news` },
      { '@type': 'ListItem', position: 3, name: tag, item: url },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbData) }}
    />
  );
}
