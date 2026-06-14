import type { OnboardingAnswers, OnboardingStorage } from '@/types/onboarding';

const STORAGE_KEY = 'ai-guide-onboarding';
const STORAGE_VERSION = 1;

/**
 * Save onboarding result to localStorage
 */
export function saveOnboardingResult(
  answers: OnboardingAnswers,
  primaryToolSlug: string | null
): void {
  if (typeof window === 'undefined') return;

  const data: OnboardingStorage = {
    version: STORAGE_VERSION,
    answers,
    resultTimestamp: new Date().toISOString(),
    primaryToolSlug,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be full or unavailable
  }
}

/**
 * Load previously saved onboarding result from localStorage
 */
export function loadOnboardingResult(): OnboardingStorage | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as OnboardingStorage;
    if (data.version !== STORAGE_VERSION) return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * Clear saved onboarding result from localStorage
 */
export function clearOnboardingResult(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Check if a previous onboarding result exists
 */
export function hasOnboardingResult(): boolean {
  return loadOnboardingResult() !== null;
}
