/** @jest-environment jsdom */
import * as sdk from '@amplitude/analytics-browser';
import { startAmplitude } from '../analytics';

/** The REAL SDK plugin pipeline with `fetch` replaced by a recorder: what is asserted is what would leave the browser. */
describe('real Amplitude pipeline never sends auth-callback secrets', () => {
  it('callback address, then another page: no sent event holds code=, access_token or #', async () => {
    const bodies: string[] = [];
    const fetchStub = jest.fn(async (_url: string, init?: { body?: unknown }) => {
      if (typeof init?.body === 'string') bodies.push(init.body);
      const payload = { code: 200, server_upload_time: Date.now(), payload_size_bytes: 1, events_ingested: 1 };
      return { ok: true, status: 200, json: async () => payload, text: async () => JSON.stringify(payload) };
    });
    (globalThis as unknown as { fetch: unknown }).fetch = fetchStub;

    window.history.replaceState({}, '', '/auth/callback?code=x#access_token=y&refresh_token=z&utm_source=a');
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'http://localhost/login?token=t&code=x',
    });

    // The shipped options as they are: network, web-vitals and performance capture are off, remote config is pinned off.
    await startAmplitude(sdk, 'test-key', { flushIntervalMillis: 20, flushQueueSize: 1 });
    window.history.pushState({}, '', '/next');
    window.history.pushState({}, '', '/next2?code=again#access_token=again');
    await sdk.flush().promise;
    await new Promise((resolve) => setTimeout(resolve, 300));
    await sdk.flush().promise;

    const text = bodies.join('\n');
    expect(text).toContain('/next');
    expect(text).not.toMatch(/code=|access_token|refresh_token|token=t|#/);
    // The IP address is switched off: no event carries an `ip` field (the SDK default would be "$remote").
    const events = bodies.flatMap((body) => (JSON.parse(body) as { events: Record<string, unknown>[] }).events);
    expect(events.length).toBeGreaterThan(0);
    expect(events.some((event) => 'ip' in event)).toBe(false);
  });
});
