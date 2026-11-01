/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { MAX_RAW_OUTPUT_FILES, saveRawOutput } from '../raw-output-store';

const TEMP_PREFIX = path.join(os.tmpdir(), 'ai-guide-raw-');

describe('saveRawOutput', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(TEMP_PREFIX);
  });
  afterEach(() => {
    if (dir.startsWith(TEMP_PREFIX)) fs.rmSync(dir, { recursive: true, force: true });
  });

  const entry = {
    reason: 'malformed',
    title: 'A / story: odd "title"',
    url: 'https://example.com/a',
    text: 'raw text',
  };

  it('writes the metadata and the untouched text under a safe file name', () => {
    const file = saveRawOutput(entry, { dir, now: new Date('2026-11-01T05:12:38.000Z') }) as string;

    expect(path.dirname(file)).toBe(dir);
    expect(path.basename(file)).toMatch(/^2026-11-01T05-12-38-000Z-malformed-[a-z0-9-]+\.txt$/);
    const saved = fs.readFileSync(file, 'utf8');
    expect(saved).toContain('reason: malformed\n');
    expect(saved).toContain('url: https://example.com/a\n');
    expect(saved.endsWith('raw text')).toBe(true);
  });

  it('keeps only the newest files', () => {
    for (let i = 0; i <= MAX_RAW_OUTPUT_FILES + 2; i++) {
      saveRawOutput(entry, { dir, now: new Date(Date.UTC(2026, 10, 1, 0, 0, i)) });
    }

    const files = fs.readdirSync(dir).sort();
    expect(files).toHaveLength(MAX_RAW_OUTPUT_FILES);
    expect(files[0]).toContain('T00-00-03');
  });

  it('returns null instead of throwing when the directory cannot be written', () => {
    const blocker = path.join(dir, 'a-file');
    fs.writeFileSync(blocker, '');

    expect(saveRawOutput(entry, { dir: path.join(blocker, 'sub') })).toBeNull();
  });
});

