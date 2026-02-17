import type { MetadataRoute } from 'next';
import situationsData from '@/data/situations.json';
import toolsData from '@/data/tools.json';

const BASE_URL = 'https://ai-guide-nu.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/onboarding`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/situations`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tools`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/compare`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/glossary`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/quiz`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/trends`, changeFrequency: 'weekly', priority: 0.6 },
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

  return [...staticRoutes, ...situationRoutes, ...toolRoutes];
}
