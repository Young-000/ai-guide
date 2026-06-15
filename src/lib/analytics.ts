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

/**
 * Initialise Amplitude. Safe to call multiple times — subsequent calls are
 * no-ops. Completely inert when NEXT_PUBLIC_AMPLITUDE_API_KEY is unset.
 */
export async function initAmplitude(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (amplitudeInitialized) return;

  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) return;

  // Dynamic import keeps Amplitude out of the SSR bundle.
  const amplitude = await import('@amplitude/analytics-browser');
  amplitude.init(apiKey, {
    autocapture: true, // automatic pageviews, clicks, sessions, form interactions
  });
  amplitudeInitialized = true;
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
