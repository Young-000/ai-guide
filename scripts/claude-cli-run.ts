import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { buildClaudeCliArgs } from './claude-cli-args';

const CLI_TIMEOUT_MS = 180_000;
const MESSAGE_CHARS = 300;

/** A failed CLI call. `rawOutput` is everything the CLI printed, kept for diagnosis. */
export class ClaudeCliError extends Error {
  constructor(message: string, readonly rawOutput: string) {
    super(message);
    this.name = 'ClaudeCliError';
  }
}

function combineOutput(stdout: string, stderr: string): string {
  return stderr ? `${stdout}\n--- stderr ---\n${stderr}` : stdout;
}

// The CLI prints quota and login failures on stdout and leaves stderr empty, so 41 runs logged only
// "claude CLI exit 1: " while the reason ("You've hit your weekly limit") was thrown away.
function exitMessage(code: number | null, stdout: string, stderr: string): string {
  const detail = (stderr.trim() || stdout.trim()).slice(0, MESSAGE_CHARS);
  return `claude CLI exit ${code}: ${detail}`;
}

// Local backend: pipe the prompt to `claude -p` (headless) via stdin, capture stdout. Uses the
// machine's Claude Code auth, no ANTHROPIC_API_KEY needed. --setting-sources does not cover auto
// memory, which is keyed by working directory: without this variable, notes saved by any session
// opened in that directory would join every article prompt.
export function runClaudeCli(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', buildClaudeCliArgs(), {
      cwd: tmpdir(),
      env: { ...process.env, CLAUDE_CODE_DISABLE_AUTO_MEMORY: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new ClaudeCliError(`claude CLI timed out after ${CLI_TIMEOUT_MS}ms`, combineOutput(out, err)));
    }, CLI_TIMEOUT_MS);
    child.stdout.on('data', (chunk: Buffer) => (out += chunk.toString()));
    child.stderr.on('data', (chunk: Buffer) => (err += chunk.toString()));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(new ClaudeCliError(`claude CLI could not start: ${e.message}`, combineOutput(out, err)));
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(out);
      else reject(new ClaudeCliError(exitMessage(code, out, err), combineOutput(out, err)));
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

