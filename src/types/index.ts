// AI 도구 타입 정의

export type Category = 'chatbot' | 'coding' | 'image' | 'video' | 'productivity' | 'search' | 'data' | 'audio' | 'design' | 'writing';

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

export interface BasicUsageStep {
  title: string;
  description: string;
}

export interface Guide {
  gettingStarted: string[];
  basicUsage?: BasicUsageStep[];
  proTips: string[];
  useCases: UseCase[];
  limitations: string[];
}

export interface InstallationStep {
  title: string;
  description: string;
  details?: string[];
}

export interface Installation {
  steps: InstallationStep[];
  requirements: string[];
  timeToSetup: string;
  quickStart?: string[];
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
  installation?: Installation;
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
  // 검색용 필드
  searchKeywords?: string[];
  naturalQueries?: string[];
  priority?: number;
}

// 활용 사례 라이브러리 타입
export type UseCaseDifficulty = 'easy' | 'medium' | 'hard';

export type Profession =
  | 'marketer'
  | 'developer'
  | 'designer'
  | 'student'
  | 'office-worker'
  | 'freelancer'
  | 'business-owner';

export interface UseCaseStory {
  slug: string;
  title: string;
  profession: Profession;
  professionLabel: string;
  situation: string;
  persona: string;
  challenge: string;
  solution: string;
  result: string;
  resultHighlight: string;
  toolUsed: string;
  additionalTools?: string[];
  difficulty: UseCaseDifficulty;
  tags: string[];
}

// 카테고리 정보 타입
export interface CategoryInfo {
  id: SituationCategory;
  name: string;
  icon: string;
  description: string;
}

// 도구 그룹 타입 (용도별 분류)
export interface ToolGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  tools: string[]; // Tool slugs
}

// 설문조사 타입
export interface SurveyOption {
  value: string;
  label: string;
  icon: string;
  description?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'any';
  freeOnly?: boolean;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  options: SurveyOption[];
  dependsOn?: {
    [questionId: string]: {
      [optionValue: string]: SurveyOption[];
    };
  };
}

export interface SurveyAnswer {
  questionId: string;
  value: string;
}

export interface SurveyResult {
  recommendedGroups: ToolGroup[];
  recommendedSituations: Situation[];
  bestMatch: Situation | null; // 가장 적합한 상황 (바로 가이드로 이동용)
  matchReason: string; // 매칭 이유 설명
}
