import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { NewsArticle, NewsFrontmatter, NewsLang, NewsMeta } from '@/types/news';

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content', 'news');

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`news frontmatter: '${field}' must be a string`);
  }
  return value;
}

// YAML이 date를 Date 객체로 파싱할 수 있어 둘 다 허용.
function asDateString(value: unknown, field: string): string {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  throw new Error(`news frontmatter: '${field}' must be a date`);
}

function toFrontmatter(data: Record<string, unknown>): NewsFrontmatter {
  const lang = asString(data.lang, 'lang');
  if (lang !== 'ko' && lang !== 'en') {
    throw new Error(`news frontmatter: invalid lang '${lang}'`);
  }
  // tags는 선택값 — 배열이 아니거나 비-문자열 항목은 의도적으로 버린다.
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === 'string')
    : [];
  const sources = Array.isArray(data.sources)
    ? data.sources.map((s) => {
        const o = (s ?? {}) as Record<string, unknown>;
        return { title: asString(o.title, 'sources[].title'), url: asString(o.url, 'sources[].url') };
      })
    : [];
  return {
    title: asString(data.title, 'title'),
    lang,
    date: asDateString(data.date, 'date'),
    slug: asString(data.slug, 'slug'),
    summary: asString(data.summary, 'summary'),
    tags,
    sources,
  };
}

function listMarkdownFiles(lang: NewsLang, root: string): string[] {
  const dir = path.join(root, lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
}

export function getAllNews(lang: NewsLang, root: string = CONTENT_ROOT): NewsMeta[] {
  const dir = path.join(root, lang);
  return listMarkdownFiles(lang, root)
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      return toFrontmatter(matter(raw).data as Record<string, unknown>);
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getNewsBySlug(lang: NewsLang, slug: string, root: string = CONTENT_ROOT): NewsArticle | null {
  const dir = path.join(root, lang);
  for (const file of listMarkdownFiles(lang, root)) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const parsed = matter(raw);
    const fm = toFrontmatter(parsed.data as Record<string, unknown>);
    if (fm.slug === slug) {
      return { ...fm, body: parsed.content };
    }
  }
  return null;
}

export function getNewsSlugs(lang: NewsLang, root: string = CONTENT_ROOT): string[] {
  return getAllNews(lang, root).map((item) => item.slug);
}

/**
 * Returns a sorted list of unique tags across all articles in the given lang.
 */
export function getAllTags(lang: NewsLang, root: string = CONTENT_ROOT): string[] {
  const tagSet = new Set<string>();
  for (const article of getAllNews(lang, root)) {
    for (const tag of article.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/**
 * Returns articles (date-desc) that include the given tag.
 */
export function getNewsByTag(lang: NewsLang, tag: string, root: string = CONTENT_ROOT): NewsMeta[] {
  return getAllNews(lang, root).filter((a) => a.tags.includes(tag));
}
