/** @jest-environment node */
import { buildClaudeCliArgs } from '../claude-cli-args';

describe('buildClaudeCliArgs', () => {
  it('defaults to claude-sonnet-5-5 with medium effort', () => {
    const args = buildClaudeCliArgs({});
    expect(args.slice(0, 5)).toEqual(['-p', '--model', 'claude-sonnet-5-5', '--effort', 'medium']);
  });

  it('honours NEWS_MODEL and NEWS_EFFORT overrides', () => {
    const args = buildClaudeCliArgs({ NEWS_MODEL: 'claude-opus-5-5', NEWS_EFFORT: 'high' });
    expect(args.slice(0, 5)).toEqual(['-p', '--model', 'claude-opus-5-5', '--effort', 'high']);
  });

  // A Stop hook in the machine's settings made the CLI answer twice. Stdout then held only the
  // second answer and the finished digest was lost (121 runs, 2026-10-17 to 11-01).
  it('loads no settings, so no hook can rewrite the answer', () => {
    const args = buildClaudeCliArgs({});
    expect(args[args.indexOf('--setting-sources') + 1]).toBe('');
  });

  it('runs with no tools, MCP servers or slash commands: the digest is text in, text out', () => {
    const args = buildClaudeCliArgs({});
    expect(args[args.indexOf('--tools') + 1]).toBe('');
    expect(args).toEqual(expect.arrayContaining(['--strict-mcp-config', '--disable-slash-commands']));
  });

  it('treats empty env values as unset', () => {
    const args = buildClaudeCliArgs({ NEWS_MODEL: '', NEWS_EFFORT: '' });
    expect(args.slice(0, 5)).toEqual(['-p', '--model', 'claude-sonnet-5-5', '--effort', 'medium']);
  });
});
