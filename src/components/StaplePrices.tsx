// Sister-site strip: everyday staples whose cheapest per-unit price is compared
// daily on hottrend.news. Static list — the slugs are hottrend's /pick routes,
// so this never goes stale the way the old trending-keyword feed did.
const STAPLES: readonly { slug: string; label: string }[] = [
  { slug: 'water', label: '생수' },
  { slug: 'ramen', label: '라면' },
  { slug: 'egg', label: '계란' },
  { slug: 'toilet-paper', label: '휴지' },
  { slug: 'wet-wipes', label: '물티슈' },
  { slug: 'instant-rice', label: '햇반·즉석밥' },
  { slug: 'detergent', label: '세탁세제' },
  { slug: 'diaper', label: '기저귀' },
];

const HOTTREND_PICK_URL = 'https://hottrend.news/pick';

type Placement = 'home' | 'news';

// utm_medium carries the placement: the referrer policy drops the path, so
// without it hottrend cannot tell home clicks from /news clicks.
function pickUrl(placement: Placement, slug?: string): string {
  const path = slug ? `${HOTTREND_PICK_URL}/${slug}` : HOTTREND_PICK_URL;
  return `${path}?utm_source=aiwire&utm_medium=widget_${placement}`;
}

type StaplePricesProps = {
  placement: Placement;
  className?: string;
};

export function StaplePrices({ placement, className }: StaplePricesProps): JSX.Element {
  return (
    <section
      aria-labelledby="staple-prices-heading"
      className={`rounded-xl border border-slate-200 bg-white p-5 ${className ?? ''}`}
    >
      <h2 id="staple-prices-heading" className="mb-3 text-sm font-bold text-slate-900">
        생필품, 오늘 제일 싼 건?
      </h2>

      <ul className="flex flex-wrap gap-2">
        {STAPLES.map((item) => (
          <li key={item.slug}>
            <a
              href={pickUrl(placement, item.slug)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {item.label}
              <span className="sr-only"> (hottrend.news, 새 창)</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-slate-500">
        단위가격(1L·1롤당)으로 비교해요 ·{' '}
        <a
          href={pickUrl(placement)}
          target="_blank"
          rel="noopener"
          className="underline hover:text-blue-700"
        >
          hottrend.news에서 품목 전체 보기
        </a>
      </p>
    </section>
  );
}
