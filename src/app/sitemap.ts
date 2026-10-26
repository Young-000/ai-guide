import type { MetadataRoute } from 'next';
import situationsData from '@/data/situations.json';
import toolsData from '@/data/tools.json';
import useCasesData from '@/data/use-cases.json';
import tipsData from '@/data/tips.json';
import { getAllNews, getArchiveMonths, getTagsWithCount, getThinArticleSlugs, MIN_TAG_ARTICLE_COUNT_FOR_INDEX } from '@/lib/news';
import { SECTION_IDS } from '@/lib/news-sections';
import { BASE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/news`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/news/topics`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/onboarding`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/situations`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tools`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/use-cases`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tips`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/learn`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/faq`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/compare`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/glossary`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/quiz`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/trends`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/projects`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/map`, changeFrequency: 'weekly', priority: 0.5 },
  ];

  const situationRoutes: MetadataRoute.Sitemap = situationsData.situations.map((s) => ({
    url: `${BASE_URL}/situations/${s.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const toolRoutes: MetadataRoute.Sitemap = toolsData.tools.map((t) => ({
    url: `${BASE_URL}/tools/${t.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const useCaseRoutes: MetadataRoute.Sitemap = useCasesData.useCases.map((uc) => ({
    url: `${BASE_URL}/use-cases/${uc.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const tipRoutes: MetadataRoute.Sitemap = tipsData.tips.map((t) => ({
    url: `${BASE_URL}/tips/${t.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const newsListRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/en/news`, changeFrequency: 'daily', priority: 0.8 },
  ];

  // 본문이 제목만 봤다고 말하는 기사는 페이지에서 noindex 이므로 사이트맵에서도 뺀다.
  const thinSlugs = getThinArticleSlugs();
  const newsKo: MetadataRoute.Sitemap = getAllNews('ko')
    .filter((n) => !thinSlugs.has(n.slug))
    .map((n) => ({
    url: `${BASE_URL}/news/${n.slug}`,
    lastModified: n.date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const newsEn: MetadataRoute.Sitemap = getAllNews('en')
    .filter((n) => !thinSlugs.has(n.slug))
    .map((n) => ({
    url: `${BASE_URL}/en/news/${n.slug}`,
    lastModified: n.date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Thin tags (fewer than MIN_TAG_ARTICLE_COUNT_FOR_INDEX articles) are
  // noindex on the page itself (see topic/[tag]/page.tsx) — keep them out of
  // the sitemap too, since a sitemap entry implicitly asks to be indexed.
  // Computed from a single getTagsWithCount() pass rather than calling
  // isThinTag() per tag, which would re-scan every article per tag.
  const topicRoutes: MetadataRoute.Sitemap = getTagsWithCount('ko')
    .filter((t) => t.count >= MIN_TAG_ARTICLE_COUNT_FOR_INDEX)
    .map((t) => ({
      url: `${BASE_URL}/news/topic/${encodeURIComponent(t.tag)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  const sectionRoutes: MetadataRoute.Sitemap = SECTION_IDS.flatMap((id) => [
    {
      url: `${BASE_URL}/news/section/${id}`,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/news/section/${id}`,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
  ]);

  const archiveIndexRoute: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/news/archive`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  const archiveRoutes: MetadataRoute.Sitemap = getArchiveMonths('ko').map(({ year, month }) => ({
    url: `${BASE_URL}/news/archive/${year}/${month}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes,
    ...situationRoutes,
    ...toolRoutes,
    ...useCaseRoutes,
    ...tipRoutes,
    ...newsListRoutes,
    ...newsKo,
    ...newsEn,
    ...topicRoutes,
    ...sectionRoutes,
    ...archiveIndexRoute,
    ...archiveRoutes,
  ];

  // 같은 slug 를 쓴 기사 파일이 여럿이면 URL 이 겹친다 — 첫 항목만 남긴다.
  const seen = new Set<string>();
  return entries.filter((entry) => !seen.has(entry.url) && !!seen.add(entry.url));
}
