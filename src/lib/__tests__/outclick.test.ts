import { buildOutclickPayload } from '../outclick';

/**
 * 🔴 왜 (2026-09-26): 쿠팡 배너는 승인된 유일한 즉시 수익 경로인데, 클릭이 몇 번인지
 * 아무도 모른다. AdSense 는 심사 대기, AdFit 은 카카오 하우스 광고만 채워지는 상태라
 * 이 경로가 실제로 얼마를 버는지가 다음 판단의 근거가 된다.
 */
describe('buildOutclickPayload', () => {
  it('배치와 대상을 함께 남긴다', () => {
    expect(buildOutclickPayload('coupang', 'aiwire-article')).toEqual({
      source: 'coupang',
      medium: 'aiwire-article',
    });
  });

  /* 값은 그대로 DB 로 간다 — 길이·문자를 제한하지 않으면 쓰레기가 쌓인다. */
  it('안전하지 않은 문자를 버린다', () => {
    const payload = buildOutclickPayload('coupang', 'a b/c?d=<script>');
    expect(payload.medium).toMatch(/^[a-zA-Z0-9_.-]*$/);
  });

  it('빈 값이면 unknown 으로 남긴다', () => {
    expect(buildOutclickPayload('coupang', '').medium).toBe('unknown');
  });
});
