import { getAllNews } from '@/lib/news';
import type { NewsLang } from '@/types/news';

export type GraphNodeType = 'article' | 'tag';

export type GraphNode = {
  id: string;      // 'a:<slug>' | 't:<tag>'
  label: string;   // article title or tag name
  type: GraphNodeType;
  url: string;     // '/news/<slug>' | '/news/topic/<tag>'
  val: number;     // size: tag = article count, article = 3 (fixed)
};

export type GraphLink = {
  source: string;  // article node id
  target: string;  // tag node id
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

export type BuildNewsGraphOptions = {
  /**
   * Minimum number of articles a tag needs to appear on the map. Default 2.
   *
   * A tag used by exactly one article connects nothing — it draws a dot and a line
   * and tells the reader nothing about how topics relate. In production those were
   * 473 of 696 tags (68%), which is what turned the map into an unreadable cloud.
   * Pass 1 to keep every tag.
   */
  minTagCount?: number;
};

/**
 * Builds a force-graph data structure from all news articles in `lang`.
 * Article nodes are fixed-size (val=3); tag nodes are sized by article count.
 * Called server-side only (uses fs via getAllNews).
 */
export function buildNewsGraph(lang: NewsLang, options: BuildNewsGraphOptions = {}): GraphData {
  const { minTagCount = 2 } = options;
  const articles = getAllNews(lang);

  // Count how many articles each tag appears in
  const tagCounts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const keptTags = new Map(
    Array.from(tagCounts.entries()).filter(([, count]) => count >= minTagCount),
  );

  const links: GraphLink[] = articles.flatMap((article) =>
    article.tags
      .filter((tag) => keptTags.has(tag))
      .map((tag) => ({
        source: `a:${article.slug}`,
        target: `t:${tag}`,
      })),
  );

  // An article whose tags were all filtered out has nothing to connect to. Keeping it
  // would scatter unconnected dots around the edge of the graph — noise, not information.
  const linkedArticles = new Set(links.map((link) => link.source));

  const articleNodes: GraphNode[] = articles
    .map((article) => ({
      id: `a:${article.slug}`,
      label: article.title,
      type: 'article' as const,
      url: `/news/${article.slug}`,
      val: 3,
    }))
    .filter((node) => linkedArticles.has(node.id));

  // Biggest topics first: the canvas painter draws in array order and gives the first
  // label to claim a spot priority when labels would overlap. Ordering here means the
  // topic that carries the most articles is the one that stays readable.
  const tagNodes: GraphNode[] = Array.from(keptTags.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => ({
      id: `t:${tag}`,
      label: tag,
      type: 'tag' as const,
      url: `/news/topic/${encodeURIComponent(tag)}`,
      val: count,
    }));

  return { nodes: [...articleNodes, ...tagNodes], links };
}
