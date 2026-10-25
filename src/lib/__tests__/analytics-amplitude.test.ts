/** @jest-environment jsdom */
const done = (...args: unknown[]) => ({ promise: Promise.resolve(args.length) });
const sdk = { init: jest.fn(done), add: jest.fn(done), track: jest.fn() };
jest.mock('@amplitude/analytics-browser', () => sdk);

describe('initAmplitude', () => {
  const original = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

  beforeEach(() => {
    jest.resetModules();
    sdk.init.mockClear();
    sdk.add.mockClear();
  });
  afterEach(() => {
    process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = original;
    Reflect.deleteProperty(navigator, 'webdriver');
    jest.restoreAllMocks();
  });

  it('does nothing without a key', async () => {
    delete process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    const { initAmplitude } = await import('../analytics');
    await initAmplitude();
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.add).not.toHaveBeenCalled();
  });

  it('with a key, initialises once and attaches the URL sanitizer plugin', async () => {
    process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'k';
    const { initAmplitude } = await import('../analytics');
    await initAmplitude();
    await initAmplitude();
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.add.mock.calls.map((call: unknown[]) => (call[0] as { name: string }).name)).toEqual([
      'sanitize-urls-early',
      'sanitize-urls',
    ]);
    const options = sdk.init.mock.calls[0][1] as { autocapture: { pageUrlEnrichment: boolean } };
    expect(options.autocapture.pageUrlEnrichment).toBe(false);
  });

  describe('bot guard (METRICS 2026-08-11: bot UA or navigator.webdriver -> do not init)', () => {
    it('does not init when navigator.webdriver is set', async () => {
      process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'k';
      Object.defineProperty(navigator, 'webdriver', { configurable: true, value: true });
      const { initAmplitude } = await import('../analytics');
      await initAmplitude();
      expect(sdk.init).not.toHaveBeenCalled();
      expect(sdk.add).not.toHaveBeenCalled();
    });

    it.each(['Mozilla/5.0 (compatible; Googlebot/2.1)', 'Mozilla/5.0 HeadlessChrome/120.0'])(
      'does not init for the bot user agent %s',
      async (userAgent) => {
        process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'k';
        jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
        const { initAmplitude } = await import('../analytics');
        await initAmplitude();
        expect(sdk.init).not.toHaveBeenCalled();
      },
    );

    it('still inits for a normal in-app browser user agent', async () => {
      process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'k';
      jest
        .spyOn(navigator, 'userAgent', 'get')
        .mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 KAKAOTALK 10.0');
      const { initAmplitude } = await import('../analytics');
      await initAmplitude();
      expect(sdk.init).toHaveBeenCalledTimes(1);
    });

    it('does not let track() load the SDK or send for a bot', async () => {
      process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'k';
      Object.defineProperty(navigator, 'webdriver', { configurable: true, value: true });
      sdk.track.mockClear();
      const { track } = await import('../analytics');
      await track('page_view', { path: '/' });
      expect(sdk.track).not.toHaveBeenCalled();
    });
  });

  describe('capture level and privacy options', () => {
    it('pins remote config off, turns the IP address off and keeps only page views, sessions and attribution', async () => {
      process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'k';
      const { initAmplitude } = await import('../analytics');
      await initAmplitude();
      const options = sdk.init.mock.calls[0][1] as {
        fetchRemoteConfig: boolean;
        trackingOptions: { ipAddress: boolean };
        autocapture: Record<string, unknown>;
      };
      expect(options.fetchRemoteConfig).toBe(false);
      expect(options.trackingOptions).toEqual({ ipAddress: false });
      expect(options.autocapture).toMatchObject({
        sessions: true,
        attribution: true,
        fileDownloads: false,
        formInteractions: false,
        elementInteractions: false,
        frustrationInteractions: false,
        networkTracking: false,
        webVitals: false,
        performanceTracking: false,
        pageUrlEnrichment: false,
      });
    });
  });

  it('never throws when the SDK fails to load or start (analytics must not break the page)', async () => {
    process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'k';
    sdk.init.mockImplementationOnce(() => {
      throw new Error('blocked by an extension');
    });
    const { initAmplitude } = await import('../analytics');
    await expect(initAmplitude()).resolves.toBeUndefined();
  });
});
