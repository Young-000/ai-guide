/**
 * @jest-environment node
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const BACKLOG_PATH = join(process.cwd(), 'docs', 'BACKLOG.md');
const COUNTER_WIRING_PATTERN = /트래픽 카운터|recordView|카운터를 뉴스 상세/;

describe('BACKLOG 트래픽 카운터 중복', () => {
  it('이미 구현된 카운터 배선이 [todo]로 남아 있지 않다', () => {
    const lines = readFileSync(BACKLOG_PATH, 'utf8').split('\n');
    const actionable = lines.filter(
      (line) => line.startsWith('- [todo]') && COUNTER_WIRING_PATTERN.test(line),
    );

    expect(actionable.map((line) => line.slice(0, 60))).toEqual([]);
  });
});
