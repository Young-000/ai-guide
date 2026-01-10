// AI 도구 타입 정의

export type Category = 'chatbot' | 'coding' | 'image' | 'video' | 'productivity' | 'search';

export interface PricingPlan {
  name: string;
  price: number | string;
  features?: string[];
}

export interface Pricing {
  free: boolean;
  plans: PricingPlan[];
}

export interface UseCase {
  title: string;
  description: string;
  example: string;
}

export interface Guide {
  gettingStarted: string[];
  proTips: string[];
  useCases: UseCase[];
  limitations: string[];
}

export interface Tool {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  pricing: Pricing;
  features: string[];
  bestFor: string[];
  url: string;
  alternatives: string[];
  icon?: string;
  color?: string;
  guide?: Guide;
}

export interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  example?: string;
  relatedTools?: string[];
}

export interface CompareItem {
  feature: string;
  chatgpt: string;
  claude: string;
  gemini: string;
}

// 상황별 AI 추천 타입
export type SituationCategory = 'work' | 'study' | 'coding' | 'design' | 'content' | 'research';

export interface RecommendedTool {
  slug: string;
  name: string;
  reason: string;
  isPrimary: boolean;
}

export interface Step {
  order: number;
  title: string;
  description: string;
}

export interface Prompt {
  title: string;
  content: string;
  tip?: string;
}

export interface Situation {
  slug: string;
  title: string;
  subtitle: string;
  category: SituationCategory;
  icon: string;
  problem: string;
  recommendedTools: RecommendedTool[];
  steps: Step[];
  prompts: Prompt[];
  expectedResult: string;
  timeToComplete: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
