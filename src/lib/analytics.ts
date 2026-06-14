type GtagEvent = {
  action: string;
  params?: Record<string, string | number | boolean>;
};

function sendEvent({ action, params }: GtagEvent): void {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', action, params);
}

// --- Onboarding events ---

export function trackOnboardingStart(): void {
  sendEvent({ action: 'onboarding_start' });
}

export function trackOnboardingComplete(personaType: string): void {
  sendEvent({
    action: 'onboarding_complete',
    params: { persona_type: personaType },
  });
}

// --- Tool click events ---

export function trackToolClick(toolName: string, sourcePage: string): void {
  sendEvent({
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
  sendEvent({
    action: 'guide_step_complete',
    params: {
      situation_slug: situationSlug,
      step: stepNumber,
    },
  });
}

// --- Share events ---

export function trackShare(contentType: string, itemId: string): void {
  sendEvent({
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
  sendEvent({
    action: 'prompt_copy',
    params: {
      situation_slug: situationSlug,
      prompt_index: promptIndex,
    },
  });
}
