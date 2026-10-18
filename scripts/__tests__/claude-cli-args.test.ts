/** @jest-environment node */
import { buildClaudeCliArgs } from '../claude-cli-args';

describe('buildClaudeCliArgs', () => {
  it('defaults to claude-sonnet-5-5 with medium effort', () => {
    const args = buildClaudeCliArgs({});
    expect(args).toEqual(['-p', '--model', 'claude-sonnet-5-5', '--effort', 'medium']);
  });

  it('honours NEWS_MODEL and NEWS_EFFORT overrides', () => {
    const args = buildClaudeCliArgs({ NEWS_MODEL: 'claude-opus-5-5', NEWS_EFFORT: 'high' });
    expect(args).toEqual(['-p', '--model', 'claude-opus-5-5', '--effort', 'high']);
  });

  it('treats empty env values as unset', () => {
    const args = buildClaudeCliArgs({ NEWS_MODEL: '', NEWS_EFFORT: '' });
    expect(args).toEqual(['-p', '--model', 'claude-sonnet-5-5', '--effort', 'medium']);
  });
});
