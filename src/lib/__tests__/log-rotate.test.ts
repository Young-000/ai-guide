/**
 * @jest-environment node
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { rotatePublishLog } from '@/lib/log-rotate';

const NOW = new Date('2026-10-17T12:00:00+09:00');

function run(date: string, body: string): string {
  return `▶ ai-guide local publish — ${date} 10:10:00\n${body}\n`;
}

describe('rotatePublishLog', () => {
  let tmp: string;
  let logPath: string;
  let archiveDir: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-guide-rotate-'));
    logPath = path.join(tmp, 'ai-guide-publish.log');
    archiveDir = path.join(tmp, 'archive');
  });

  afterEach(() => {
    if (tmp.startsWith(os.tmpdir())) fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('gzips runs older than the keep window and keeps the last 7 days in place', () => {
    const old = run('2026-09-28', 'old run 한글') + run('2026-10-09', 'still old');
    const recent = run('2026-10-10', 'cutoff day') + run('2026-10-17', 'today');
    fs.writeFileSync(logPath, old + recent);

    const result = rotatePublishLog({ logPath, archiveDir, keepDays: 7, now: NOW });

    expect(result.rotated).toBe(true);
    expect(fs.readFileSync(logPath, 'utf8')).toBe(recent);
    const archives = fs.readdirSync(archiveDir);
    expect(archives).toHaveLength(1);
    expect(archives[0]).toMatch(/\.gz$/);
    const restored = zlib.gunzipSync(fs.readFileSync(path.join(archiveDir, archives[0]))).toString('utf8');
    expect(restored).toBe(old);
  });

  it('leaves the log alone when nothing is older than the keep window', () => {
    const content = run('2026-10-12', 'a') + run('2026-10-17', 'b');
    fs.writeFileSync(logPath, content);
    const result = rotatePublishLog({ logPath, archiveDir, keepDays: 7, now: NOW });
    expect(result).toEqual({ rotated: false, reason: 'nothing older than 7 days' });
    expect(fs.readFileSync(logPath, 'utf8')).toBe(content);
    expect(fs.existsSync(archiveDir)).toBe(false);
  });

  it('does not touch a log that has no run headers', () => {
    fs.writeFileSync(logPath, 'random text\nwithout headers\n');
    const result = rotatePublishLog({ logPath, archiveDir, keepDays: 7, now: NOW });
    expect(result.rotated).toBe(false);
    expect(fs.readFileSync(logPath, 'utf8')).toBe('random text\nwithout headers\n');
  });

  it('archives everything when every run is older than the window', () => {
    const content = run('2026-09-01', 'a') + run('2026-09-02', 'b');
    fs.writeFileSync(logPath, content);
    const result = rotatePublishLog({ logPath, archiveDir, keepDays: 7, now: NOW });
    expect(result.rotated).toBe(true);
    expect(fs.readFileSync(logPath, 'utf8')).toBe('');
  });

  it('is a no-op when the log file does not exist', () => {
    const result = rotatePublishLog({ logPath, archiveDir, keepDays: 7, now: NOW });
    expect(result).toEqual({ rotated: false, reason: 'log file missing' });
  });

  it('keeps the file below the size floor untouched when minBytes is set', () => {
    fs.writeFileSync(logPath, run('2026-09-01', 'small'));
    const result = rotatePublishLog({ logPath, archiveDir, keepDays: 7, now: NOW, minBytes: 1024 });
    expect(result).toEqual({ rotated: false, reason: 'below size floor' });
  });
});
