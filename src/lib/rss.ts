import { getAllNews } from '@/lib/news';
import { BASE_URL } from '@/lib/site';
import type { NewsLang } from '@/types/news';

const FEED_LIMIT = 20;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// YYYY-MM-DD → RFC 822 (date-only strings parse as UTC midnight in ECMAScript).
function toRfc822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

export function buildRssXml(lang: NewsLang): string {
  const articles = getAllNews(lang).slice(0, FEED_LIMIT);
  const channelTitle =
    lang === 'ko' ? 'AIWire | AI·LLM 뉴스 미디어' : 'AIWire | AI·LLM News';
  const channelDescription =
    lang === 'ko'
      ? 'AI·LLM 최신 소식을 매일 한국어로 정리합니다.'
      : 'Daily AI·LLM news in English.';
  const newsBase = lang === 'ko' ? `${BASE_URL}/news` : `${BASE_URL}/en/news`;
  const lastBuildDate = articles[0] ? toRfc822(articles[0].date) : new Date().toUTCString();

  const items = articles
    .map((a) => {
      const itemUrl = escapeXml(`${newsBase}/${a.slug}`);
      return [
        '\n  <item>',
        `    <title><![CDATA[${a.title}]]></title>`,
        `    <link>${itemUrl}</link>`,
        `    <description><![CDATA[${a.summary}]]></description>`,
        `    <pubDate>${toRfc822(a.date)}</pubDate>`,
        `    <guid isPermaLink="true">${itemUrl}</guid>`,
        '  </item>',
      ].join('\n');
    })
    .join('');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${escapeXml(channelTitle)}</title>`,
    `    <link>${BASE_URL}</link>`,
    `    <description>${escapeXml(channelDescription)}</description>`,
    `    <language>${lang}</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `${items}`,
    '  </channel>',
    '</rss>',
  ].join('\n');
}
