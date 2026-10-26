import type { NewsLang } from '../types/news';

/**
 * 제목만 보고 쓴 기사는 본문이 스스로 그렇게 말한다 (2026-10-25 실측: "현재 확인 가능한 정보는 보도 제목과
 * 요약 수준이며", "원문에서 확인이 필요하다"). 원문을 읽지 않고 다시 쓴 페이지라 AdSense 가 "가치가 별로 없는
 * 콘텐츠"로 보는 바로 그 형태다. 생성 단계(news-validate)와 이미 발행된 기사의 noindex 판정(news)이 같은
 * 정규식을 보게 해서 한쪽만 고쳐지는 일이 없게 한다.
 */
const HEADLINE_ONLY_ADMISSION: Record<NewsLang, RegExp> = {
  ko: /보도 제목(과|만)|제목과 요약 수준|원문에서 (세부 내용을 |추가로? )?확인이 필요/,
  // Only admissions: "details beyond the headline are not available", "only the headline … is available".
  // A comparison such as "more than the headline number" is analysis, not an admission (review #50).
  en: /(details|information) beyond the headline|only the headline|headline and (a )?(brief )?summary (is|are) available/i,
};

export function admitsHeadlineOnly(lang: NewsLang, body: string): boolean {
  return HEADLINE_ONLY_ADMISSION[lang].test(body);
}
