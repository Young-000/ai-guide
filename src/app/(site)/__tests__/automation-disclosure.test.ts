/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 2026-11-02 점검: /about 이 "편집자가 사실 확인 및 최종 검수를 거쳐 게재"라고 썼지만 발행은 크론 자동이고
 * 사람 검수 단계가 없다. 광고 정책(사람 검토 없는 자동 생성 콘텐츠)과 독자 신뢰 모두에서 허위 표기다.
 * 실제 검수 단계가 생기기 전까지 사이트의 어떤 문구도 사람 검수를 말하면 안 된다.
 */
const SRC = join(__dirname, '..', '..', '..');
const FILES = ['app/(site)/about/page.tsx', 'app/(site)/terms/page.tsx', 'components/Footer.tsx', 'app/layout.tsx'];
const read = (file: string): string => readFileSync(join(SRC, file), 'utf8').replace(/\s+/g, ' ');

describe('automation disclosure', () => {
  it.each(FILES)('%s does not claim a human editor reviews articles', (file) => {
    const text = read(file);

    expect(text).not.toMatch(/편집자(가|의)\s*(사실|검수|검토)/);
    expect(text).not.toMatch(/편집팀/);
    expect(text).not.toMatch(/검수를 거/);
  });

  it('/about says plainly that AI writes the articles and nobody reviews them first', () => {
    const text = read('app/(site)/about/page.tsx');

    expect(text).toMatch(/AI가[^.]*자동으로 게재/);
    expect(text).toMatch(/사람이 읽거나 사실을 확인하는 단계는 없습니다/);
    expect(text).toMatch(/사람이 검수하지 않습니다/);
  });

  it.each(['components/Footer.tsx', 'app/(site)/terms/page.tsx'])('%s says the same thing', (file) => {
    expect(read(file)).toMatch(/AI가 작성해 자동으로 게재하며 사람이 검수하지 않습니다/);
  });
});
