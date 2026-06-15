import TagChips from '@/components/news/TagChips';

type CategoryStripProps = {
  tags: string[];
};

export default function CategoryStrip({ tags }: CategoryStripProps): JSX.Element | null {
  if (tags.length === 0) return null;

  return (
    <section
      aria-labelledby="category-strip-heading"
      className="py-5 border-b border-slate-200 bg-slate-50"
    >
      <div className="max-w-5xl mx-auto px-4">
        <h2 id="category-strip-heading" className="sr-only">
          뉴스 카테고리
        </h2>
        <TagChips tags={tags} showAll />
      </div>
    </section>
  );
}
