import { getNewsSlugs } from './news';

/**
 * True when `slug` is already used by an existing ko or en article.
 *
 * getNewsBySlug returns the FIRST file matching a slug, so writing a new
 * article with a reused slug would silently shadow the existing one (and
 * create a duplicate sitemap row). Callers must check this before writing
 * a new article file and skip on collision rather than overwrite.
 */
export function isSlugTaken(slug: string, root?: string): boolean {
  return getNewsSlugs('ko', root).includes(slug) || getNewsSlugs('en', root).includes(slug);
}
