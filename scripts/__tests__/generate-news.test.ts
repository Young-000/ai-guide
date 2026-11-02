/**
 * @jest-environment node
 *
 * End-to-end test of scripts/generate-news.ts with a stub `claude` on PATH. Parsing, validation and
 * file writing run for real inside a throwaway copy of the generator.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const NODE_MODULES = path.resolve(path.dirname(require.resolve('tsx/package.json')), '..');
const TEMP_PREFIX = path.join(os.tmpdir(), 'ai-guide-generate-');

// What the CLI printed on 2026-11-01 05:10 after the Stop hook asked for a rewrite. The finished
// digest was the answer before this one, so stdout no longer contained it.
const REWRITE_FOLLOW_UP = `직전 출력의 영어 부분은 영문판 다이제스트 파일(\`===EN_START===\` ~ \`===EN_END===\`)입니다.
출력 형식이 고정돼 있어 같은 구조를 다시 내보내지 않았습니다. 앞서 낸 블록을 그대로 쓰시면 됩니다.`;

const URL_LEAD = 'https://example.com/story';
const URL_RELATED = 'https://other.example.org/story';
const KO_BODY = '가나다라마바사아자차'.repeat(90);
const EN_BODY = Array.from({ length: 360 }, () => 'word').join(' ');

const article = (lang: 'ko' | 'en', body = lang === 'ko' ? KO_BODY : EN_BODY, urls = [URL_LEAD, URL_RELATED]): string => `---
title: "Title ${lang}"
lang: ${lang}
date: 2026-11-01
slug: stub-story
summary: "summary"
tags: ["AI"]
sources:
${urls.map((url) => `  - title: "Source"\n    url: ${url}`).join('\n')}
---
${body}`;

const GOOD_OUTPUT = `===SLUG_START===
stub-story
===SLUG_END===
===KO_START===
${article('ko')}
===KO_END===
===EN_START===
${article('en')}
===EN_END===`;

const STUB_CLAUDE = `#!/usr/bin/env bash
cat > /dev/null
printf '%s\\n' "$PWD" > "$STUB_RECORD"
printf 'memory=%s\\n' "$CLAUDE_CODE_DISABLE_AUTO_MEMORY" >> "$STUB_RECORD"
printf '%s\\n' "$@" >> "$STUB_RECORD"
cat "$STUB_STDOUT"
[ -f "$STUB_STDERR" ] && cat "$STUB_STDERR" >&2
exit "\${STUB_EXIT:-0}"
`;

const SUMMARY = 'Lorem ipsum source text that carries real reporting beyond the headline itself. '.repeat(3);

type RunOptions = { exit?: number; stderr?: string; env?: Record<string, string> };

type Harness = {
  tmp: string;
  repo: string;
  rawDir: string;
  run: (stdout: string, options?: RunOptions) => ReturnType<typeof spawnSync>;
  rawFiles: () => string[];
  published: () => string[];
  articles: () => string[];
  record: () => string[];
  called: () => boolean;
};

function copy(relative: string, repo: string): void {
  fs.cpSync(path.join(REPO_ROOT, relative), path.join(repo, relative), { recursive: true });
}

type Story = { title: string; url: string; source: string; publishedAt: string; summary: string; related?: object[] };

const RELATED_ITEM = {
  title: 'Stub story, second outlet',
  url: URL_RELATED,
  source: 'Other',
  publishedAt: '2026-11-01',
  summary: SUMMARY,
};
const LEAD_ITEM: Story = {
  title: 'Stub story',
  url: URL_LEAD,
  source: 'Example',
  publishedAt: '2026-11-01',
  summary: SUMMARY,
  related: [RELATED_ITEM],
};

function writeWorklist(repo: string, items: Story[]): void {
  fs.writeFileSync(path.join(repo, 'scripts/worklist.json'), JSON.stringify({ generatedAt: '2026-11-01T00:00:00.000Z', items }));
}

function writeTodaysArticle(repo: string, slug: string): void {
  const dir = path.join(repo, 'src/content/news/en');
  fs.mkdirSync(dir, { recursive: true });
  const today = new Date().toISOString().split('T')[0];
  fs.writeFileSync(
    path.join(dir, `${today}-${slug}.md`),
    `---\ntitle: "Earlier ${slug}"\nlang: en\ndate: ${today}\nslug: ${slug}\nsummary: "earlier"\ntags: ["AI"]\nsources: []\n---\nBody\n`,
  );
}

function setupRepo(repo: string): void {
  fs.mkdirSync(path.join(repo, 'scripts'), { recursive: true });
  for (const name of fs.readdirSync(path.join(REPO_ROOT, 'scripts'))) {
    if (name.endsWith('.ts') || name === 'GENERATION_PROMPT.md') copy(path.join('scripts', name), repo);
  }
  copy('src/lib', repo);
  copy('src/types', repo);
  fs.symlinkSync(NODE_MODULES, path.join(repo, 'node_modules'));
  fs.writeFileSync(path.join(repo, 'scripts/_published.json'), '{\n  "urls": []\n}\n');
  writeWorklist(repo, [LEAD_ITEM]);
}

function setup(): Harness {
  const tmp = fs.mkdtempSync(TEMP_PREFIX);
  const repo = path.join(tmp, 'repo');
  const stubDir = path.join(tmp, 'stub');
  setupRepo(repo);
  fs.mkdirSync(stubDir);
  fs.writeFileSync(path.join(stubDir, 'claude'), STUB_CLAUDE);
  fs.chmodSync(path.join(stubDir, 'claude'), 0o755);

  const failedDir = path.join(tmp, 'failed');
  const rawDir = path.join(failedDir, 'raw-output');
  const recordFile = path.join(tmp, 'claude-call.txt');
  const run: Harness['run'] = (stdout, options = {}) => {
    const stdoutFile = path.join(tmp, 'stub-stdout.txt');
    const stderrFile = path.join(tmp, 'stub-stderr.txt');
    fs.writeFileSync(stdoutFile, stdout);
    fs.rmSync(stderrFile, { force: true });
    if (options.stderr) fs.writeFileSync(stderrFile, options.stderr);
    return spawnSync('node', ['--import', 'tsx', 'scripts/generate-news.ts'], {
      cwd: repo,
      encoding: 'utf8',
      env: Object.assign({} as NodeJS.ProcessEnv, {
        PATH: `${stubDir}:${process.env.PATH}`,
        HOME: tmp,
        TMPDIR: os.tmpdir(),
        AI_GUIDE_FAILED_DIR: failedDir,
        STUB_RECORD: recordFile,
        STUB_STDOUT: stdoutFile,
        STUB_STDERR: stderrFile,
        STUB_EXIT: String(options.exit ?? 0),
      }, options.env),
    });
  };
  return {
    tmp,
    repo,
    rawDir,
    run,
    rawFiles: () => (fs.existsSync(rawDir) ? fs.readdirSync(rawDir).sort() : []),
    published: () => {
      const raw = fs.readFileSync(path.join(repo, 'scripts/_published.json'), 'utf8');
      return (JSON.parse(raw) as { urls: string[] }).urls;
    },
    articles: () => {
      const dir = path.join(repo, 'src/content/news');
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir, { recursive: true }).map(String).filter((file) => file.endsWith('.md'));
    },
    record: () => fs.readFileSync(recordFile, 'utf8').trim().split('\n'),
    called: () => fs.existsSync(recordFile),
  };
}

describe('generate-news.ts', () => {
  let h: Harness;
  beforeEach(() => {
    h = setup();
  });
  afterEach(() => {
    if (h.tmp.startsWith(TEMP_PREFIX)) fs.rmSync(h.tmp, { recursive: true, force: true });
  });

  const savedRaw = (): string => fs.readFileSync(path.join(h.rawDir, h.rawFiles()[0]), 'utf8');

  it('writes a valid pair, records its URL and saves no raw output', () => {
    const result = h.run(GOOD_OUTPUT);

    expect(result.status).toBe(0);
    expect(h.articles()).toHaveLength(2);
    expect(h.published()).toEqual([URL_LEAD, URL_RELATED]);
    expect(h.rawFiles()).toEqual([]);
  });

  it('calls the CLI outside the repo with auto memory off, so nothing but the prompt reaches the model', () => {
    h.run(GOOD_OUTPUT);

    const [cwd, memory, ...argv] = h.record();
    expect(memory).toBe('memory=1');
    expect(fs.realpathSync(cwd).startsWith(fs.realpathSync(h.repo))).toBe(false);
    expect(argv).toEqual(expect.arrayContaining(['--strict-mcp-config', '--disable-slash-commands']));
  });

  it('saves the raw output when the markers are missing, and writes nothing', () => {
    const result = h.run(REWRITE_FOLLOW_UP);

    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/Malformed output for "Stub story"/);
    expect(h.articles()).toEqual([]);
    expect(h.published()).toEqual([]);
    expect(h.rawFiles()).toHaveLength(1);
    expect(savedRaw()).toContain(REWRITE_FOLLOW_UP);
    expect(savedRaw()).toContain('reason: malformed');
    expect(savedRaw()).toContain('title: Stub story');
    expect(savedRaw()).toContain('url: https://example.com/story');
    expect(result.stderr).toContain(path.join(h.rawDir, h.rawFiles()[0]));
  });

  it('reports what the CLI printed on stdout when it exits non-zero (quota text used to vanish)', () => {
    const quota = "You've hit your weekly limit · resets 2pm (Asia/Seoul)";
    const result = h.run(quota, { exit: 1 });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain(`claude CLI exit 1: ${quota}`);
    expect(savedRaw()).toContain('reason: cli-error');
    expect(savedRaw()).toContain(`error: claude CLI exit 1: ${quota}`);
  });

  it('keeps stderr in the saved file when the CLI exits non-zero', () => {
    const result = h.run('', { exit: 1, stderr: 'boom on stderr' });

    expect(result.stderr).toContain('claude CLI exit 1: boom on stderr');
    expect(savedRaw()).toContain('boom on stderr');
  });

  it('still rejects an article the quality gate refuses, and saves why', () => {
    const headlineOnly = GOOD_OUTPUT.replace(KO_BODY, `보도 제목과 요약 수준으로만 확인된다.${KO_BODY}`);
    const result = h.run(headlineOnly);

    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/invalid article 'stub-story'/);
    expect(h.articles()).toEqual([]);
    expect(h.published()).toEqual([]);
    expect(savedRaw()).toContain('reason: invalid-article');
  });

  it('rejects a pair whose Korean body is too short, exits 1 as quality-rejected and records no URL', () => {
    const shortKo = GOOD_OUTPUT.replace(KO_BODY, '짧은 본문');
    const result = h.run(shortKo);

    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/\(quality-rejected\)/);
    expect(result.stderr).toMatch(/quality gate 'stub-story'.*ko: body is \d+ chars/);
    expect(h.articles()).toEqual([]);
    expect(h.published()).toEqual([]);
    expect(savedRaw()).toContain('reason: quality-rejected');
  });

  it('rejects a pair that cites only one of the supplied sources', () => {
    const oneSource = GOOD_OUTPUT.replace(`  - title: "Source"\n    url: ${URL_RELATED}\n`, '');
    const result = h.run(oneSource);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/cites 1 distinct source/);
    expect(h.articles()).toEqual([]);
  });

  it('rejects a pair that cites a URL it was never given', () => {
    const invented = GOOD_OUTPUT.split(URL_RELATED).join('https://invented.example/x');
    const result = h.run(invented);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/source url was not supplied: https:\/\/invented\.example\/x/);
  });

  it('does not call the model for a story with a single outlet', () => {
    writeWorklist(h.repo, [{ ...LEAD_ITEM, related: undefined }]);
    const result = h.run(GOOD_OUTPUT);

    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/1 too-few-sources/);
    expect(result.stdout).toMatch(/article pair\(s\) written/); // publish-local.sh reads exit 1 + this line as "nothing new"
    expect(h.called()).toBe(false);
    expect(h.published()).toEqual([]);
  });

  it('does not call the model once the daily limit is reached', () => {
    writeTodaysArticle(h.repo, 'earlier-one');
    writeTodaysArticle(h.repo, 'earlier-two');
    const result = h.run(GOOD_OUTPUT);

    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/1 daily-limit/);
    expect(result.stdout).toMatch(/2\/2 published today/);
    expect(h.called()).toBe(false);
  });

  it('lets NEWS_DAILY_LIMIT raise the cap', () => {
    writeTodaysArticle(h.repo, 'earlier-one');
    writeTodaysArticle(h.repo, 'earlier-two');
    const result = h.run(GOOD_OUTPUT, { env: { NEWS_DAILY_LIMIT: '3' } });

    expect(result.status).toBe(0);
    expect(h.articles().filter((file) => file.includes('stub-story'))).toHaveLength(2);
  });

  it('skips a promotional story without calling the model', () => {
    writeWorklist(h.repo, [{ ...LEAD_ITEM, title: '4 days left: TechCrunch Founder Summit passes' }]);
    const result = h.run(GOOD_OUTPUT);

    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/1 promotional/);
    expect(h.called()).toBe(false);
  });
});
