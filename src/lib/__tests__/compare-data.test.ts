import compareData from '@/data/compare.json';

const { comparison } = compareData as {
  comparison: {
    description: string;
    updatedAt?: string;
    sources?: { title: string; url: string }[];
    items: { feature: string; chatgpt: string; claude: string; gemini: string }[];
  };
};

/**
 * 🔴 왜 (2026-09-26): 이 비교표는 "2026년 6월 현재"에 멈춘 채 석 달을 버텼다. 그 사이
 * 세 회사 모두 주력 모델이 바뀌었다(GPT-6 Astra 9/3 · Claude Opus 5.5 9/22 · Gemini 3.8
 * Flash 9/2). AdSense·AdFit 심사자가 보는 페이지이고, 틀린 비교는 사이트 전체의
 * 신뢰를 깎는다.
 *
 * 날짜·출처를 데이터에 넣고, 빠지면 테스트가 실패하게 한다 — 기준일이 화면에 보이면
 * 낡은 것도 낡았다고 보인다.
 */
describe('compare.json', () => {
  it('기준일이 있다 (YYYY-MM-DD)', () => {
    expect(comparison.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('출처가 있다 — 모델·가격은 확인한 곳을 밝힌다', () => {
    expect(comparison.sources?.length ?? 0).toBeGreaterThanOrEqual(3);
    for (const source of comparison.sources ?? []) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.title.length).toBeGreaterThan(0);
    }
  });

  /* 설명에 날짜를 박으면 그 문장이 낡는다 — 날짜는 updatedAt 한 곳에서만 말한다. */
  it('설명 문장에 날짜를 박지 않는다', () => {
    expect(comparison.description).not.toMatch(/\d{4}년\s*\d{1,2}월/);
  });

  it('모든 줄의 세 칸이 채워져 있다', () => {
    for (const item of comparison.items) {
      expect([item.chatgpt, item.claude, item.gemini].every((cell) => cell.trim().length > 0)).toBe(true);
    }
  });

  /* 근거 없는 최상급은 쓰지 않는다 (creative-copy 금지 목록). 비교표에서 '최고'는 판정이지 사실이 아니다. */
  it('근거 없는 최상급을 쓰지 않는다', () => {
    for (const item of comparison.items) {
      for (const cell of [item.chatgpt, item.claude, item.gemini]) {
        expect(cell).not.toMatch(/최고|벤치 1위|역대급/);
      }
    }
  });
});
