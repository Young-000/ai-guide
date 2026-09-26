import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllNews } from '@/lib/news';
import { getSectionsWithCounts } from '@/lib/news-sections';
import NewsListView from '@/components/news/NewsListView';
import NewsIndexJsonLd from '@/components/news/NewsIndexJsonLd';
import SectionChips from '@/components/news/SectionChips';
import TrendingKeywords from '@/components/TrendingKeywords';
import SubscribeBox from '@/components/SubscribeBox';
import CoupangBanner from '@/components/CoupangBanner';
import { BASE_URL } from '@/lib/site';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'AI · LLM 뉴스 | AIWire',
  description: '매일 업데이트되는 AI·LLM 최신 소식을 한국어로 핵심만 정리했습니다.',
  alternates: {
    canonical: `${BASE_URL}/news`,
    languages: {
      'ko-KR': `${BASE_URL}/news`,
      'en-US': `${BASE_URL}/en/news`,
      'x-default': `${BASE_URL}/news`,
    },
  },
  openGraph: { locale: 'ko_KR' },
};

export default function NewsPage(): JSX.Element {
  const items = getAllNews('ko');
  const sections = getSectionsWithCounts('ko');
  return (
    <>
      <NewsIndexJsonLd lang="ko" items={items} />
      <NewsListView
        lang="ko"
        items={items}
        topSlot={
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                섹션
              </p>
              <SectionChips lang="ko" sections={sections} />
              {/*
                🔴 세부 주제 태그 나열을 첫 화면에서 걷어냈다 (2026-09-26).

                이 목록은 1,027개다. 뉴스 목록 페이지인데 첫 화면에 **기사가 한 건도
                보이지 않고** 태그만 수백 개 깔렸다 — 게다가 'AI 정책'/'AI정책',
                'AI Safety'/'AI 안전'/'AI 안전성' 처럼 같은 말이 여러 벌 들어있다.
                meat-encyclopedia 가 백과사전식 나열로 지적받은 것과 같은 사고다
                (ux-baseline 7원칙 ① 질문이 입구, 정보는 창고).

                섹션 5개는 남긴다 — 그건 실제 네비게이션이고 선택지가 3±1개 범위다.
                세부 주제는 `/news/topics` 가 이미 전담한다.
              */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/news/topics"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  전체 주제 보기
                  <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/news/archive"
                  className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                >
                  월별 아카이브
                  <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            {/* Trendjacking widget — self-hides on empty/error */}
            <TrendingKeywords />
          </div>
        }
      />

      {/* Coupang Partners — after the list, so the ad never sits among our articles. */}
      <CoupangBanner subId="aiwire-news-list" />

      {/* Subscribe — added to this high-traffic page */}
      <section
        aria-labelledby="news-subscribe-heading"
        className="mx-auto max-w-5xl px-4 pb-12"
      >
        <div className="border-t border-slate-200 pt-10">
          <p id="news-subscribe-heading" className="sr-only">
            뉴스레터 구독
          </p>
          <SubscribeBox />
        </div>
      </section>
    </>
  );
}
