import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const MAX_RAW_OUTPUT_FILES = 50;

const TITLE_CHARS = 40;
const URL_HASH_CHARS = 8;

export type RawOutputEntry = { reason: string; title: string; url: string; text: string };
export type SaveRawOutputOptions = { dir?: string; now?: Date };

/** Outside the repo: a saved failure must never be committed by the publish cycle. */
export function defaultRawOutputDir(env: Record<string, string | undefined> = process.env): string {
  const failedDir = env.AI_GUIDE_FAILED_DIR || join(homedir(), '.claude', 'state', 'ai-guide-failed');
  return join(failedDir, 'raw-output');
}

function fileLabel(text: string): string {
  const label = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return label.slice(0, TITLE_CHARS).replace(/-+$/, '') || 'item';
}

function pruneOldest(dir: string): void {
  const files = readdirSync(dir).filter((name) => name.endsWith('.txt')).sort();
  for (const name of files.slice(0, Math.max(files.length - MAX_RAW_OUTPUT_FILES, 0))) {
    rmSync(join(dir, name), { force: true });
  }
}

/**
 * Saves what the model returned so the next failure can be read instead of guessed. Returns the
 * file path, or null when saving failed: a diagnostic must never change how a run ends.
 */
export function saveRawOutput(entry: RawOutputEntry, options: SaveRawOutputOptions = {}): string | null {
  const dir = options.dir ?? defaultRawOutputDir();
  const now = options.now ?? new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  // A title with no Latin letters has an empty label, so the URL keeps same-millisecond files apart.
  const urlHash = createHash('sha256').update(entry.url).digest('hex').slice(0, URL_HASH_CHARS);
  const file = join(dir, `${stamp}-${fileLabel(entry.reason)}-${fileLabel(entry.title)}-${urlHash}.txt`);
  const header = `reason: ${entry.reason}\ntitle: ${entry.title}\nurl: ${entry.url}\nat: ${now.toISOString()}\n\n`;
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, header + entry.text);
  } catch {
    return null;
  }
  try {
    pruneOldest(dir);
  } catch {
    // The file is saved; an old one staying behind is harmless.
  }
  return file;
}

