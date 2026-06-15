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

/**
 * Builds a force-graph data structure from all news articles in `lang`.
 * Article nodes are fixed-size (val=3); tag nodes are sized by article count.
 * Called server-side only (uses fs via getAllNews).
 */
export function buildNewsGraph(lang: NewsLang): GraphData {
  const articles = getAllNews(lang);

  // Count how many articles each tag appears in
  const tagCounts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const articleNodes: GraphNode[] = articles.map((article) => ({
    id: `a:${article.slug}`,
    label: article.title,
    type: 'article' as const,
    url: `/news/${article.slug}`,
    val: 3,
  }));

  const tagNodes: GraphNode[] = Array.from(tagCounts.entries()).map(([tag, count]) => ({
    id: `t:${tag}`,
    label: tag,
    type: 'tag' as const,
    url: `/news/topic/${encodeURIComponent(tag)}`,
    val: count,
  }));

  const links: GraphLink[] = articles.flatMap((article) =>
    article.tags.map((tag) => ({
      source: `a:${article.slug}`,
      target: `t:${tag}`,
    })),
  );

  return { nodes: [...articleNodes, ...tagNodes], links };
}
