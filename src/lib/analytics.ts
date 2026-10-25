import type { Types } from '@amplitude/analytics-browser';
import { createSanitizingPlugin, isAuthCallbackPath, scrubAuthCallbackAddress } from '@/lib/amplitude-sanitize';

// ─── Google Analytics (GA4) ───────────────────────────────────────────────────

type GtagEvent = {
  action: string;
  params?: Record<string, string | number | boolean>;
};

function sendGaEvent({ action, params }: GtagEvent): void {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', action, params);
}

// --- Onboarding events ---

export function trackOnboardingStart(): void {
  sendGaEvent({ action: 'onboarding_start' });
}

export function trackOnboardingComplete(personaType: string): void {
  sendGaEvent({
    action: 'onboarding_complete',
    params: { persona_type: personaType },
  });
}

// --- Tool click events ---

export function trackToolClick(toolName: string, sourcePage: string): void {
  sendGaEvent({
    action: 'tool_click',
    params: {
      tool_name: toolName,
      source_page: sourcePage,
    },
  });
}

// --- Guide events ---

export function trackGuideStepComplete(
  situationSlug: string,
  stepNumber: number,
): void {
  sendGaEvent({
    action: 'guide_step_complete',
    params: {
      situation_slug: situationSlug,
      step: stepNumber,
    },
  });
}

// --- Share events ---

export function trackShare(contentType: string, itemId: string): void {
  sendGaEvent({
    action: 'share',
    params: {
      content_type: contentType,
      item_id: itemId,
    },
  });
}

// --- Prompt copy events ---

export function trackPromptCopy(
  situationSlug: string,
  promptIndex: number,
): void {
  sendGaEvent({
    action: 'prompt_copy',
    params: {
      situation_slug: situationSlug,
      prompt_index: promptIndex,
    },
  });
}

// ─── Amplitude ────────────────────────────────────────────────────────────────

// Lazy-loaded amplitude instance. Remains null when the API key is absent.
// Using `import type` keeps the module out of the server bundle; the real
// import happens only at runtime inside initAmplitude().
let amplitudeInitialized = false;

type AmplitudeSdk = typeof import('@amplitude/analytics-browser');

/**
 * Capture switches. Everything that `autocapture: true` turned on stays on, except the SDK's own page-URL enrichment:
 * that built-in plugin is installed late during init, runs AFTER our sanitizer and re-adds 'Previous Page Location'.
 * (Defining `autocapture` replaces `defaultTracking`, and an unset key means ON — default-tracking.js `isTrackingEnabled`.)
 */
export const AMPLITUDE_OPTIONS = {
  autocapture: {
    // The address of an auth callback route carries tokens — no page view from there.
    pageViews: { trackOn: () => !isAuthCallbackPath(location.pathname) },
    sessions: true,
    attribution: true,
    fileDownloads: true,
    formInteractions: true,
    elementInteractions: true,
    frustrationInteractions: true,
    networkTracking: true,
    webVitals: true,
    performanceTracking: true,
    pageUrlEnrichment: false,
  },
} satisfies Types.BrowserOptions;

/**
 * Order is the security: clean the address bar -> init -> sanitizer for events fired during init -> wait for init to
 * finish -> sanitizer again, now registered AFTER every built-in plugin (enrichment plugins run in registration order).
 */
export async function startAmplitude(
  amplitude: AmplitudeSdk,
  apiKey: string,
  overrides: Types.BrowserOptions = {},
): Promise<void> {
  scrubAuthCallbackAddress();
  const started = amplitude.init(apiKey, { ...AMPLITUDE_OPTIONS, ...overrides });
  void amplitude.add(createSanitizingPlugin('sanitize-urls-early'));
  await started.promise;
  await amplitude.add(createSanitizingPlugin('sanitize-urls')).promise;
}

/**
 * Initialise Amplitude. Safe to call multiple times — subsequent calls are
 * no-ops. Completely inert when NEXT_PUBLIC_AMPLITUDE_API_KEY is unset.
 */
export async function initAmplitude(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (amplitudeInitialized) return;

  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) return;

  amplitudeInitialized = true;
  // Dynamic import keeps Amplitude out of the SSR bundle.
  const amplitude = await import('@amplitude/analytics-browser');
  await startAmplitude(amplitude, apiKey);
}

/**
 * Track a named event with optional properties.
 * Safe to call before init (no-op) and without an API key (no-op).
 */
export async function track(
  eventName: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  if (typeof window === 'undefined') return;

  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) return;

  const amplitude = await import('@amplitude/analytics-browser');
  amplitude.track(eventName, properties);
}
