/**
 * @jest-environment node
 *
 * End-to-end test of scripts/publish-local.sh with stubbed `npm` (fetch/generate/build) and a
 * local bare repo as origin. Validation runs for real (tsx + the project's own validator).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
// A git worktree has no node_modules of its own; Node resolves packages from an ancestor checkout.
const NODE_MODULES = path.resolve(path.dirname(require.resolve('tsx/package.json')), '..');

const GOOD = (slug: string, lang: 'ko' | 'en', extra = ''): string => `---
title: "Title ${slug} ${lang}"
lang: ${lang}
date: 2026-10-17
slug: ${slug}
summary: "summary"
tags: ["AI"]
sources:
  - title: "Source"
    url: https://example.com/${slug}
---
Body ${extra}
`;

const POISONED_KO = `---
title: "Poisoned"
lang: ko
date: 2026-10-17
slug: poisoned
summary: "summary"
tags: ["AI"]
sources:
  - title: "Source"
    url: https://example.com/a
    url: https://example.com/b
---
Body
`;

const STUB_NPM = `#!/usr/bin/env bash
name=""
for a in "$@"; do case "$a" in run|--silent) ;; *) name="$a"; break;; esac; done
case "$name" in
  fetch-news|rotate-log) exit 0 ;;
  generate-news) bash "$STUB_DIR/generate.sh"; exit $? ;;
  # node --import tsx, not the tsx CLI: the CLI opens an IPC unix socket, which sandboxes forbid.
  validate-news) exec node --import tsx scripts/validate-news.ts ;;
  build) exec env NODE_PATH="$PWD/node_modules" node "$STUB_DIR/build.js" ;;
  *) echo "unexpected npm call: $*" >&2; exit 99 ;;
esac
`;

// Mirrors the real failure mode: next build dies on any article whose frontmatter does not parse.
const STUB_BUILD = `
const fs = require('fs'); const path = require('path'); const matter = require('gray-matter');
let bad = 0;
for (const lang of ['ko', 'en']) {
  const dir = path.join('src/content/news', lang);
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    try { matter(raw, {}); } catch (e) { console.error('YAMLException in ' + f); bad++; }
    if (raw.includes('BUILD_BREAKER')) { console.error('prerender failed ' + f); bad++; }
  }
}
process.exit(bad ? 1 : 0);
`;

const STUB_GENERATE = `#!/usr/bin/env bash
set -e
# STUB_GEN_NO_SUMMARY=1 simulates a crash that never reaches the real generator's summary line.
summary() { [ "\${STUB_GEN_NO_SUMMARY:-0}" = "1" ] || echo "stub: 0 article pair(s) written, 0 failed, 0 skipped"; }
if [ -z "$(find "$GEN_FIXTURE" -type f)" ]; then summary; exit "\${STUB_GEN_EXIT:-0}"; fi
cp -R "$GEN_FIXTURE"/. src/content/news/
node -e '
  const fs = require("fs"); const p = "scripts/_published.json";
  const l = JSON.parse(fs.readFileSync(p, "utf8")); l.urls.push("https://example.com/" + Date.now());
  fs.writeFileSync(p, JSON.stringify(l, null, 2) + "\\n");
'
summary
exit "\${STUB_GEN_EXIT:-0}"
`;

type Fixture = { ko?: Record<string, string>; en?: Record<string, string> };

type Harness = {
  tmp: string;
  repo: string;
  origin: string;
  statusFile: string;
  run: (
    fixture: Fixture | null,
    genExit?: number,
    extraEnv?: Record<string, string>,
  ) => ReturnType<typeof spawnSync>;
  git: (...args: string[]) => string;
};

function sh(cwd: string, command: string, args: string[]): string {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
}

// Deletes a test directory only when it is a non-empty path strictly below `prefix`. A computed
// path that came out empty or equal to the prefix must never reach rmSync.
function removeTempDir(dir: string, prefix: string): void {
  if (!dir || !dir.startsWith(prefix) || dir === prefix) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function writeFiles(root: string, files: Record<string, string>): void {
  for (const [rel, content] of Object.entries(files)) {
    const target = path.join(root, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
}

function setup(): Harness {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-guide-publish-'));
  const origin = path.join(tmp, 'origin.git');
  const repo = path.join(tmp, 'repo');
  sh(tmp, 'git', ['init', '--bare', '-b', 'main', origin]);
  sh(tmp, 'git', ['clone', origin, repo]);
  const git = (...args: string[]): string => sh(repo, 'git', args);
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'test');
  git('checkout', '-b', 'main');

  for (const rel of ['scripts/publish-local.sh', 'scripts/validate-news.ts', 'src/lib/news.ts', 'src/lib/news-validate.ts', 'src/types/news.ts']) {
    fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
    fs.copyFileSync(path.join(REPO_ROOT, rel), path.join(repo, rel));
  }
  writeFiles(repo, {
    'scripts/_published.json': '{\n  "urls": []\n}\n',
    'src/content/news/ko/2026-10-01-seed.md': GOOD('seed', 'ko'),
    'src/content/news/en/2026-10-01-seed.md': GOOD('seed', 'en'),
    '.gitignore': 'node_modules\n',
  });
  fs.symlinkSync(NODE_MODULES, path.join(repo, 'node_modules'));
  git('add', '-A');
  git('commit', '-m', 'seed');
  git('push', '-u', 'origin', 'main');

  const stubDir = path.join(tmp, 'stub');
  writeFiles(stubDir, { 'npm': STUB_NPM, 'generate.sh': STUB_GENERATE, 'build.js': STUB_BUILD });
  fs.chmodSync(path.join(stubDir, 'npm'), 0o755);
  const statusFile = path.join(tmp, 'publish.status');

  const run: Harness['run'] = (fixture, genExit = 0, extraEnv = {}) => {
    const fixtureDir = path.join(tmp, 'fixture');
    fs.rmSync(fixtureDir, { recursive: true, force: true });
    fs.mkdirSync(fixtureDir, { recursive: true });
    for (const lang of ['ko', 'en'] as const) {
      writeFiles(path.join(fixtureDir, lang), fixture?.[lang] ?? {});
    }
    return spawnSync('bash', ['scripts/publish-local.sh'], {
      cwd: repo,
      encoding: 'utf8',
      env: Object.assign({} as NodeJS.ProcessEnv, {
        PATH: `${stubDir}:${process.env.PATH}`,
        HOME: tmp,
        TMPDIR: os.tmpdir(),
        CLAUDECODE: '1',
        STUB_DIR: stubDir,
        GEN_FIXTURE: fixtureDir,
        STUB_GEN_EXIT: String(genExit),
        AI_GUIDE_STATUS_FILE: statusFile,
        AI_GUIDE_FAILED_DIR: path.join(tmp, 'failed'),
        AI_GUIDE_LOG_FILE: path.join(tmp, 'publish.log'),
        GIT_CONFIG_GLOBAL: '/dev/null',
      }, extraEnv),
    });
  };
  return { tmp, repo, origin, statusFile, run, git };
}

function expectExit(result: ReturnType<typeof spawnSync>, code: number): void {
  if (result.status !== code) {
    throw new Error(`exit ${result.status} (wanted ${code})\n--- stdout\n${result.stdout}\n--- stderr\n${result.stderr}`);
  }
}

describe('publish-local.sh', () => {
  let h: Harness;
  beforeEach(() => {
    h = setup();
  });
  afterEach(() => {
    removeTempDir(h.tmp, path.join(os.tmpdir(), 'ai-guide-publish-'));
  });

  const originFiles = (): string[] => sh(h.origin, 'git', ['ls-tree', '-r', '--name-only', 'main']).split('\n');
  const lastStatus = (): string => fs.readFileSync(h.statusFile, 'utf8').trim().split('\n').pop() ?? '';

  it('quarantines the one poisoned pair, publishes the rest and leaves a clean tree', () => {
    const result = h.run({
      ko: {
        'good-a.md': GOOD('good-a', 'ko'),
        'poisoned.md': POISONED_KO,
        'good-b.md': GOOD('good-b', 'ko'),
      },
      en: {
        'good-a.md': GOOD('good-a', 'en'),
        'poisoned.md': GOOD('poisoned', 'en'),
        'good-b.md': GOOD('good-b', 'en'),
      },
    });

    expectExit(result, 0);
    const files = originFiles();
    expect(files).toEqual(expect.arrayContaining([
      'src/content/news/ko/good-a.md',
      'src/content/news/en/good-b.md',
      'src/content/_quarantine/ko/poisoned.md',
      'src/content/_quarantine/en/poisoned.md',
    ]));
    expect(files).not.toContain('src/content/news/ko/poisoned.md');
    expect(h.git('status', '--porcelain')).toBe('');
    expect(h.git('rev-list', '--count', 'origin/main..main')).toBe('0');
    expect(lastStatus()).toMatch(/result=ok .*quarantined=2 .*built=yes .*pushed=yes/);
  });

  it('when the build still fails, publishes nothing, restores the ledger and leaves a clean tree', () => {
    const before = h.git('rev-parse', 'origin/main');
    const result = h.run({
      ko: { 'breaker.md': GOOD('breaker', 'ko', 'BUILD_BREAKER') },
      en: { 'breaker.md': GOOD('breaker', 'en') },
    });

    expectExit(result, 3);
    expect(h.git('status', '--porcelain')).toBe('');
    expect(fs.readFileSync(path.join(h.repo, 'scripts/_published.json'), 'utf8')).toBe('{\n  "urls": []\n}\n');
    expect(sh(h.origin, 'git', ['rev-parse', 'main'])).toBe(before);
    expect(lastStatus()).toMatch(/result=build-failed/);
    expect(fs.readdirSync(path.join(h.tmp, 'failed')).length).toBe(1);
  });

  it('exits non-zero when every generation attempt failed (not "quiet news day")', () => {
    const result = h.run(null, 2);
    expectExit(result, 2);
    expect(lastStatus()).toMatch(/result=generation-failed/);
  });

  it('exits 0 and says so when there was simply nothing new', () => {
    const result = h.run(null, 1);
    expectExit(result, 0);
    expect(lastStatus()).toMatch(/result=nothing-new/);
  });

  it('publishes a clean batch when src/content/_quarantine does not exist (nothing quarantined)', () => {
    expect(fs.existsSync(path.join(h.repo, 'src/content/_quarantine'))).toBe(false);
    const result = h.run({
      ko: { 'good-a.md': GOOD('good-a', 'ko'), 'good-b.md': GOOD('good-b', 'ko') },
      en: { 'good-a.md': GOOD('good-a', 'en'), 'good-b.md': GOOD('good-b', 'en') },
    });

    expectExit(result, 0);
    expect(h.git('status', '--porcelain')).toBe('');
    expect(originFiles()).toEqual(expect.arrayContaining([
      'src/content/news/ko/good-a.md',
      'src/content/news/en/good-b.md',
    ]));
    expect(h.git('rev-list', '--count', 'origin/main..main')).toBe('0');
    expect(lastStatus()).toMatch(/result=ok .*quarantined=0 .*built=yes .*pushed=yes/);
  });

  it('reports a push failure, then pushes the stranded commit on the next quiet run', () => {
    const goodOrigin = h.origin;
    h.git('remote', 'set-url', 'origin', path.join(h.tmp, 'missing.git'));
    const failed = h.run({
      ko: { 'late.md': GOOD('late', 'ko') },
      en: { 'late.md': GOOD('late', 'en') },
    });

    expectExit(failed, 1);
    expect(lastStatus()).toMatch(/result=push-failed .*pushed=no exit=1/);
    expect(h.git('rev-list', '--count', 'origin/main..main')).toBe('1');

    h.git('remote', 'set-url', 'origin', goodOrigin);
    const recovered = h.run(null, 1);

    expectExit(recovered, 0);
    expect(originFiles()).toContain('src/content/news/ko/late.md');
    expect(h.git('rev-list', '--count', 'origin/main..main')).toBe('0');
    expect(lastStatus()).toMatch(/result=ok .*pushed=yes/);
  });

  it('keeps reporting push-failed while an unpushed commit cannot be sent on a quiet run', () => {
    const goodOrigin = h.origin;
    h.git('remote', 'set-url', 'origin', path.join(h.tmp, 'missing.git'));
    expectExit(h.run({ ko: { 'late.md': GOOD('late', 'ko') }, en: { 'late.md': GOOD('late', 'en') } }), 1);

    const stillBroken = h.run(null, 1);

    expectExit(stillBroken, 1);
    expect(lastStatus()).toMatch(/result=push-failed/);
    h.git('remote', 'set-url', 'origin', goodOrigin);
  });

  describe('push failure alert', () => {
    // Stub for slack-bot-send.sh: records "<bot> <channel> <message>" one line per call.
    const alertEnv = (): Record<string, string> => {
      const log = path.join(h.tmp, 'alerts.log');
      const stub = path.join(h.tmp, 'alert-stub.sh');
      fs.writeFileSync(stub, '#!/usr/bin/env bash\nprintf "%s|%s|%s\\n" "$1" "$2" "$3" >> "$ALERT_LOG"\n');
      fs.chmodSync(stub, 0o755);
      return { AI_GUIDE_ALERT_CMD: stub, AI_GUIDE_ALERT_STATE: path.join(h.tmp, 'alert.state'), ALERT_LOG: log };
    };
    const alerts = (): string[] => {
      const log = path.join(h.tmp, 'alerts.log');
      return fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n') : [];
    };
    const breakOrigin = (): void => {
      h.git('remote', 'set-url', 'origin', path.join(h.tmp, 'missing.git'));
    };
    const late = { ko: { 'late.md': GOOD('late', 'ko') }, en: { 'late.md': GOOD('late', 'en') } };

    it('logs a PUSH FAILED line with the stranded commit count and alerts main-checklist', () => {
      breakOrigin();
      const failed = h.run(late, 0, alertEnv());

      expectExit(failed, 1);
      expect(failed.stdout).toMatch(/^PUSH FAILED: .*1 commit/m);
      expect(alerts()).toHaveLength(1);
      expect(alerts()[0]).toMatch(/^ceo\|C0BK57317B2\|.*푸시/);
    });

    it('does not repeat the alert on every run while the failure persists', () => {
      breakOrigin();
      const env = alertEnv();
      expectExit(h.run(late, 0, env), 1);
      const again = h.run(null, 1, env);

      expectExit(again, 1);
      expect(again.stdout).toMatch(/^PUSH FAILED:/m);
      expect(alerts()).toHaveLength(1);
    });

    it('still fails loudly when the alert command itself is missing', () => {
      breakOrigin();
      const failed = h.run(late, 0, { AI_GUIDE_ALERT_CMD: path.join(h.tmp, 'nope.sh') });

      expectExit(failed, 1);
      expect(failed.stdout).toMatch(/^PUSH FAILED:/m);
    });

    it('stays silent on a healthy publish', () => {
      const ok = h.run(late, 0, alertEnv());

      expectExit(ok, 0);
      expect(ok.stdout).not.toMatch(/PUSH FAILED/);
      expect(alerts()).toHaveLength(0);
    });
  });

  it('refuses to publish when the checkout is not on main', () => {
    const before = h.git('rev-parse', 'origin/main');
    h.git('checkout', '-b', 'feature/x');
    const result = h.run({ ko: { 'a.md': GOOD('a', 'ko') }, en: { 'a.md': GOOD('a', 'en') } });

    expectExit(result, 4);
    expect(result.stderr).toContain('not main');
    expect(lastStatus()).toMatch(/result=wrong-branch .*pushed=no exit=4/);
    expect(sh(h.origin, 'git', ['rev-parse', 'main'])).toBe(before);
    expect(h.git('rev-list', '--count', 'main..HEAD')).toBe('0');
  });

  it('treats a generator crash as an error, not as "nothing new"', () => {
    const noSummary = h.run(null, 1, { STUB_GEN_NO_SUMMARY: '1' });
    expectExit(noSummary, 4);
    expect(lastStatus()).toMatch(/result=generation-error/);

    const crashCode = h.run(null, 4);
    expectExit(crashCode, 4);
    expect(lastStatus()).toMatch(/result=generation-error .*exit=4/);
  });
});
