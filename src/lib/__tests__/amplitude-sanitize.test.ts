/** @jest-environment jsdom */
import { isAuthCallbackPath, sanitizeUrl, sanitizingPlugin, scrubAuthCallbackAddress } from '../amplitude-sanitize';

const ORIGIN = 'https://aiwire.news';
const CALLBACK = `${ORIGIN}/auth/callback?code=x#access_token=y&refresh_token=z&utm_source=a`;

describe('sanitizeUrl', () => {
  it('drops the whole fragment and the secret query params, and keeps utm_*', () => {
    expect(sanitizeUrl(CALLBACK)).toBe(`${ORIGIN}/auth/callback`);
    expect(sanitizeUrl(`${ORIGIN}/duel?code=x&utm_source=a&utm_campaign=b#access_token=y`)).toBe(
      `${ORIGIN}/duel?utm_source=a&utm_campaign=b`,
    );
  });

  it.each([
    'access_token', 'refresh_token', 'id_token', 'token', 'code', 'state', 'token_hash', 'type',
    'error_description', 'apikey', 'key', 'email', 'phone',
  ])('removes %s', (name) => {
    expect(sanitizeUrl(`${ORIGIN}/p?${name}=secret&utm_source=a`)).toBe(`${ORIGIN}/p?utm_source=a`);
  });

  it('keeps fbclid and gclid, ignores name case', () => {
    expect(sanitizeUrl(`${ORIGIN}/p?FBCLID=1&gclid=2&Access_Token=s`)).toBe(`${ORIGIN}/p?FBCLID=1&gclid=2`);
  });

  it('handles relative paths and leaves plain values alone', () => {
    expect(sanitizeUrl('/auth/callback?code=x#access_token=y')).toBe('/auth/callback');
    expect(sanitizeUrl('/duel')).toBe('/duel');
    expect(sanitizeUrl('ai')).toBe('ai');
    expect(sanitizeUrl('')).toBe('');
  });
});

describe('isAuthCallbackPath', () => {
  it('matches /auth/*, /callback and locale-prefixed forms', () => {
    expect(isAuthCallbackPath('/auth/callback')).toBe(true);
    expect(isAuthCallbackPath('/auth')).toBe(true);
    expect(isAuthCallbackPath('/callback')).toBe(true);
    expect(isAuthCallbackPath('/ko/auth/callback')).toBe(true);
    expect(isAuthCallbackPath('/duel')).toBe(false);
    expect(isAuthCallbackPath('/authors')).toBe(false);
  });
});

describe('sanitizingPlugin', () => {
  it('cleans the page properties of every event, including referrer and user properties', async () => {
    const out = await sanitizingPlugin.execute!({
      event_type: '[Amplitude] Page Viewed',
      event_properties: {
        '[Amplitude] Page Location': CALLBACK,
        '[Amplitude] Page URL': `${ORIGIN}/auth/callback`,
        '[Amplitude] Page Path': '/auth/callback?code=x',
        referrer: `${ORIGIN}/login?token=t#access_token=y`,
        mode: 'ai',
        nested: { back: `${ORIGIN}/x#access_token=y` },
      },
      user_properties: {
        $set: { referrer: `${ORIGIN}/a?refresh_token=z` },
        $setOnce: { initial_referrer: `${ORIGIN}/b#access_token=y`, utm_source: 'a' },
      },
    });
    const props = out!.event_properties as Record<string, unknown>;
    const text = JSON.stringify(out);
    expect(text).not.toMatch(/access_token|refresh_token|code=x|token=t/);
    expect(props['[Amplitude] Page Location']).toBe(`${ORIGIN}/auth/callback`);
    expect(props.mode).toBe('ai');
  });

  it('keeps utm_source when the page location carries it outside the secret params', async () => {
    const out = await sanitizingPlugin.execute!({
      event_type: '[Amplitude] Page Viewed',
      event_properties: { '[Amplitude] Page Location': `${ORIGIN}/auth/callback?code=x&utm_source=a#access_token=y` },
    });
    expect((out!.event_properties as Record<string, unknown>)['[Amplitude] Page Location']).toBe(
      `${ORIGIN}/auth/callback?utm_source=a`,
    );
  });

  it('drops any property whose key ends in Query or Fragment (raw network-capture URL parts)', async () => {
    const out = await sanitizingPlugin.execute!({
      event_type: '[Amplitude] Network Request',
      event_properties: {
        '[Amplitude] URL Query': 'email=a@b.c&q=secret',
        '[Amplitude] URL Fragment': 'access_token=y',
        searchquery: 'x',
        nested: { 'URL Fragment': 'f', keep: 1 },
        '[Amplitude] URL': `${ORIGIN}/api/x`,
      },
      user_properties: { $set: { 'URL Query': 'q=1', plan: 'free' } },
    });
    const props = out!.event_properties as Record<string, unknown>;
    expect(Object.keys(props).sort()).toEqual(['[Amplitude] URL', 'nested']);
    expect(props.nested).toEqual({ keep: 1 });
    expect(out!.user_properties).toEqual({ $set: { plan: 'free' } });
  });

  it('cuts referrer properties to origin + path (no query, no fragment)', async () => {
    const out = await sanitizingPlugin.execute!({
      event_type: '[Amplitude] Page Viewed',
      event_properties: { referrer: 'https://www.google.com/search?q=private+health+query&utm_source=a#x' },
      user_properties: { $setOnce: { initial_referrer: 'https://news.example.com/a/b?id=7' }, $set: { referring_domain: 'news.example.com' } },
    });
    expect((out!.event_properties as Record<string, unknown>).referrer).toBe('https://www.google.com/search');
    expect(out!.user_properties).toEqual({
      $setOnce: { initial_referrer: 'https://news.example.com/a/b' },
      $set: { referring_domain: 'news.example.com' },
    });
  });

  it('passes events without properties through', async () => {
    const out = await sanitizingPlugin.execute!({ event_type: 'game_start' });
    expect(out).toEqual({ event_type: 'game_start' });
  });
});

describe('scrubAuthCallbackAddress', () => {
  it('cleans the address bar on an auth callback route and leaves other routes alone', () => {
    window.history.replaceState({}, '', '/auth/callback?code=x#access_token=y');
    scrubAuthCallbackAddress();
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/auth/callback');

    window.history.replaceState({}, '', '/news?utm_source=a');
    scrubAuthCallbackAddress();
    expect(window.location.pathname + window.location.search).toBe('/news?utm_source=a');
  });
});
