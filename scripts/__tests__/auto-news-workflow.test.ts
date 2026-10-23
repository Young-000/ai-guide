/** @jest-environment node */
import { readFileSync } from 'fs';
import { join } from 'path';

const WORKFLOW = readFileSync(
  join(__dirname, '..', '..', '.github', 'workflows', 'auto-news.yml'),
  'utf8',
);

describe('auto-news workflow failure visibility', () => {
  it('has a step that runs only when an earlier step failed', () => {
    expect(WORKFLOW).toMatch(/- name: Notify on failure\n\s+if: failure\(\)/);
  });

  it('posts to Slack through a secret, never a hardcoded URL', () => {
    expect(WORKFLOW).toMatch(/SLACK_WEBHOOK_URL: \$\{\{ secrets\.SLACK_WEBHOOK_URL \}\}/);
    expect(WORKFLOW).not.toMatch(/hooks\.slack\.com\/services\/T/);
  });

  it('stays loud in the run log even when the webhook secret is missing', () => {
    expect(WORKFLOW).toMatch(/::error::/);
  });

  it('keeps the notify step last so it sees every earlier failure', () => {
    const steps = Array.from(WORKFLOW.matchAll(/^\s+- (?:name|uses): (.+)$/gm), (m) => m[1]);
    expect(steps[steps.length - 1]).toBe('Notify on failure');
  });
});
