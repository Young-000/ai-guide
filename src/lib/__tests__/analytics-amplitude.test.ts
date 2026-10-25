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
});
