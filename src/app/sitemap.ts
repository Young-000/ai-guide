import type { MetadataRoute } from 'next';
import situationsData from '@/data/situations.json';
import toolsData from '@/data/tools.json';
import useCasesData from '@/data/use-cases.json';
import tipsData from '@/data/tips.json';
import { getAllNews, getAllTags } from '@/lib/news';
import { BASE_URL } from '@/lib/site';

// Build date is the best lastModified signal for static pages that don't have a CMS timestamp.
const BUILD_DATE = new Date().toISOString();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/news`, lastModified: BUILD_DATE, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/news/topics`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/onboarding`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/situations`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/use-cases`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tips`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/learn`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/faq`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/compare`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/glossary`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/quiz`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/trends`, lastModified: BUILD_DATE, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/projects`, changeFrequency: 'monthly', priority: 0.4 },
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

  const newsKo: MetadataRoute.Sitemap = getAllNews('ko').map((n) => ({
    url: `${BASE_URL}/news/${n.slug}`,
    lastModified: n.date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const newsEn: MetadataRoute.Sitemap = getAllNews('en').map((n) => ({
    url: `${BASE_URL}/en/news/${n.slug}`,
    lastModified: n.date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const topicRoutes: MetadataRoute.Sitemap = getAllTags('ko').map((tag) => ({
    url: `${BASE_URL}/news/topic/${encodeURIComponent(tag)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...situationRoutes,
    ...toolRoutes,
    ...useCaseRoutes,
    ...tipRoutes,
    ...newsListRoutes,
    ...newsKo,
    ...newsEn,
    ...topicRoutes,
  ];
}
