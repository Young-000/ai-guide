import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/site';

// GEO: Explicitly allow known LLM/AI crawlers so content is included in generative answers.
// The wildcard rule already covers them, but explicit entries are a strong GEO signal.
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'Claude-Web',
  'Anthropic-ai',
  'PerplexityBot',
  'YouBot',
  'cohere-ai',
  'Googlebot-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
