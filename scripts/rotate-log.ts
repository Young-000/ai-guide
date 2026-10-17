/**
 * Keeps the publish log small: archives (gzip) every run older than --keep-days and leaves the
 * recent runs in place. publish-local.sh calls this at the start of each run.
 *
 *   tsx scripts/rotate-log.ts [--log <file>] [--archive <dir>] [--keep-days 7] [--min-bytes 5242880]
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { rotatePublishLog } from '../src/lib/log-rotate';

function option(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const logDir = join(homedir(), '.claude', 'logs');
const result = rotatePublishLog({
  logPath: option('log', join(logDir, 'ai-guide-publish.log')),
  archiveDir: option('archive', join(logDir, 'archive')),
  keepDays: Number(option('keep-days', '7')),
  minBytes: Number(option('min-bytes', '0')),
});

if (result.rotated) {
  console.log(`log rotated: archived ${result.archivedBytes} bytes -> ${result.archivePath}, kept ${result.keptBytes} bytes`);
} else {
  console.log(`log not rotated: ${result.reason}`);
}
