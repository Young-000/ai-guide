import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const RUN_HEADER = /^▶ ai-guide local publish — (\d{4}-\d{2}-\d{2}) /;
const DAY_MS = 24 * 60 * 60 * 1000;

export type RotateOptions = {
  logPath: string;
  archiveDir: string;
  keepDays: number;
  now?: Date;
  /** Skip rotation while the log is smaller than this many bytes. */
  minBytes?: number;
};

export type RotateResult =
  | { rotated: true; archivePath: string; archivedBytes: number; keptBytes: number }
  | { rotated: false; reason: string };

function localDate(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Byte offset of the first run header dated on/after the cutoff, or null when none. */
function findCutoffOffset(buffer: Buffer, cutoffDate: string): { offset: number | null; headers: number } {
  let headers = 0;
  let position = 0;
  while (position < buffer.length) {
    const newline = buffer.indexOf(0x0a, position);
    const end = newline === -1 ? buffer.length : newline;
    // Only lines starting with the marker can be headers; decode just those.
    if (buffer[position] === 0xe2) {
      const match = RUN_HEADER.exec(buffer.toString('utf8', position, Math.min(end, position + 80)));
      if (match) {
        headers++;
        if (match[1] >= cutoffDate) return { offset: position, headers };
      }
    }
    position = end + 1;
  }
  return { offset: null, headers };
}

function archiveName(logPath: string, now: Date, archiveDir: string): string {
  const base = path.basename(logPath).replace(/\.log$/, '');
  const stem = `${base}-${localDate(now)}`;
  let candidate = path.join(archiveDir, `${stem}.log.gz`);
  for (let i = 2; fs.existsSync(candidate); i++) candidate = path.join(archiveDir, `${stem}-${i}.log.gz`);
  return candidate;
}

/**
 * Archives everything before the first run dated within `keepDays` and trims the live log
 * IN PLACE (same inode) so a cron `>>` redirect that is still open keeps appending to it.
 * Run it at the start of a publish run, when this process is the log's only writer.
 */
export function rotatePublishLog(options: RotateOptions): RotateResult {
  const now = options.now ?? new Date();
  if (!fs.existsSync(options.logPath)) return { rotated: false, reason: 'log file missing' };
  if (options.minBytes && fs.statSync(options.logPath).size < options.minBytes) {
    return { rotated: false, reason: 'below size floor' };
  }

  const buffer = fs.readFileSync(options.logPath);
  const cutoffDate = localDate(new Date(now.getTime() - options.keepDays * DAY_MS));
  const { offset, headers } = findCutoffOffset(buffer, cutoffDate);
  if (headers === 0) return { rotated: false, reason: 'no run headers found' };

  const cut = offset ?? buffer.length;
  if (cut === 0) return { rotated: false, reason: `nothing older than ${options.keepDays} days` };

  fs.mkdirSync(options.archiveDir, { recursive: true });
  const archivePath = archiveName(options.logPath, now, options.archiveDir);
  fs.writeFileSync(archivePath, zlib.gzipSync(buffer.subarray(0, cut)));
  // Verify the archive round-trips before the original bytes are dropped.
  const restored = zlib.gunzipSync(fs.readFileSync(archivePath));
  if (!restored.equals(buffer.subarray(0, cut))) {
    fs.unlinkSync(archivePath);
    return { rotated: false, reason: 'archive verification failed — log left untouched' };
  }

  fs.writeFileSync(options.logPath, buffer.subarray(cut));
  return { rotated: true, archivePath, archivedBytes: cut, keptBytes: buffer.length - cut };
}
