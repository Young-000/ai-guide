/**
 * 아웃클릭(광고·제휴 링크 클릭) 기록용 payload.
 *
 * 🔴 왜 (2026-09-26): 쿠팡 배너는 승인된 유일한 즉시 수익 경로인데 클릭이 몇 번인지
 * 몰랐다. AdSense 는 심사 대기이고 AdFit 은 카카오 하우스 광고만 채워지는 상태라,
 * 이 경로가 실제로 얼마를 버는지가 다음 판단의 근거가 된다.
 *
 * 방문과 같은 표(`search_trends.site_visits`)에 남긴다 — 방문과 클릭을 따로 세면
 * 클릭률을 낼 수 없다. `source` 에 'coupang', `medium` 에 배치 이름이 들어간다.
 */

const MAX_LENGTH = 40;

export type OutclickPayload = { source: string; medium: string };

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, MAX_LENGTH);
}

export function buildOutclickPayload(network: string, placement: string): OutclickPayload {
  return {
    source: sanitize(network) || 'unknown',
    medium: sanitize(placement) || 'unknown',
  };
}
