import type { Tool, Situation } from '@/types';

/** Onboarding role options */
export type OnboardingRole = 'office_worker' | 'student' | 'creator' | 'business_owner';

/** Onboarding experience level options */
export type OnboardingExperience = 'never' | 'basic' | 'some' | 'expert';

/** Onboarding budget preference options */
export type OnboardingBudget = 'free_only' | 'affordable' | 'any';

/** User answers from the onboarding survey */
export type OnboardingAnswers = {
  role: OnboardingRole;
  purpose: string;
  experience: OnboardingExperience;
  budget: OnboardingBudget;
};

/** Single selectable option card in a question */
export type OnboardingOptionCard = {
  value: string;
  label: string;
  icon: string;
  description: string;
};

/** Question definition for the onboarding flow */
export type OnboardingQuestion = {
  id: string;
  title: string;
  subtitle?: string | null;
  options: OnboardingOptionCard[];
  dynamicOptions?: Record<string, OnboardingOptionCard[]>;
  showSkip?: boolean;
};

/** A recommended tool with context */
export type RecommendedToolResult = {
  tool: Tool;
  reason: string;
  situation: Situation;
};

/** Full result from the onboarding recommendation engine */
export type OnboardingResult = {
  primaryTool: Tool | null;
  primaryReason: string;
  alternatives: RecommendedToolResult[];
  recommendedSituation: Situation | null;
  relatedSituations: Situation[];
  personalizedReason: string;
  answers: OnboardingAnswers;
};

/** Schema for localStorage persistence */
export type OnboardingStorage = {
  version: 1;
  answers: OnboardingAnswers;
  resultTimestamp: string;
  primaryToolSlug: string | null;
};
