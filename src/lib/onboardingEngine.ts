import type { Tool, Situation } from '@/types';
import type { OnboardingAnswers, OnboardingResult } from '@/types/onboarding';
import onboardingData from '@/data/onboarding.json';
import situationsData from '@/data/situations.json';
import toolsData from '@/data/tools.json';
import { buildToolUrl } from '@/lib/affiliateLinks';

const allSituations = situationsData.situations as Situation[];
const allTools = toolsData.tools as Tool[];
const purposeToSituationMap = onboardingData.purposeToSituationMap as Record<string, string[]>;

// --- Scoring helpers ---

type ScoringInput = {
  role: string;
  purpose: string;
  experience: string;
  budget: string;
};

/**
 * Map experience level to allowed difficulties
 */
function getDifficultyFilter(experience: string): ('easy' | 'medium' | 'hard')[] {
  switch (experience) {
    case 'never':
      return ['easy'];
    case 'basic':
      return ['easy', 'medium'];
    case 'some':
    case 'expert':
      return ['easy', 'medium', 'hard'];
    default:
      return ['easy', 'medium'];
  }
}

/**
 * Score how well a user's experience matches a situation's difficulty
 */
function getDifficultyMatchScore(experience: string, difficulty: string): number {
  const matchMap: Record<string, Record<string, number>> = {
    never:  { easy: 15, medium: 5,  hard: 0 },
    basic:  { easy: 10, medium: 15, hard: 5 },
    some:   { easy: 5,  medium: 10, hard: 15 },
    expert: { easy: 0,  medium: 5,  hard: 15 },
  };
  return matchMap[experience]?.[difficulty] ?? 5;
}

/**
 * Score how well a user's role aligns with a situation's category
 */
function getRoleCategoryScore(role: string, category: string): number {
  const roleCategories: Record<string, string[]> = {
    office_worker:  ['work', 'content'],
    student:        ['study', 'research', 'coding'],
    creator:        ['design', 'content'],
    business_owner: ['work', 'content', 'research'],
  };
  return (roleCategories[role] ?? []).includes(category) ? 10 : 0;
}

/**
 * Calculate a score for a given tool within a situation context
 */
function calculateToolScore(
  tool: Tool,
  situation: Situation,
  input: ScoringInput
): number {
  let score = 0;

  // (1) Primary tool bonus
  const recommended = situation.recommendedTools.find(rt => rt.slug === tool.slug);
  if (!recommended) return 0;
  if (recommended.isPrimary) {
    score += 50;
  } else {
    score += 20;
  }

  // (2) Situation priority bonus (lower priority number = higher score)
  const priorityScore = Math.max(0, 20 - (situation.priority ?? 10));
  score += priorityScore;

  // (3) Experience-difficulty matching
  score += getDifficultyMatchScore(input.experience, situation.difficulty);

  // (4) Budget matching
  if (input.budget === 'free_only' && tool.pricing.free) {
    score += 15;
  }
  if (input.budget === 'any' && !tool.pricing.free) {
    score += 5;
  }
  if (input.budget === 'affordable' && tool.pricing.free) {
    score += 10;
  }

  // (5) Role-category matching
  score += getRoleCategoryScore(input.role, situation.category);

  return score;
}

// --- Personalized reason generation ---

const ROLE_LABELS: Record<string, string> = {
  office_worker: '직장인',
  student: '학생',
  creator: '크리에이터',
  business_owner: '사업가',
};

const PURPOSE_LABELS: Record<string, string> = {
  writing: '문서 작성',
  email: '이메일 작성',
  presentation: '발표 자료 제작',
  data: '데이터 분석',
  translation: '번역',
  paper: '논문 분석',
  concept: '개념 이해',
  coding: '코딩',
  english: '영어 공부',
  research: '자료 조사',
  image: '이미지 생성',
  video: '영상 제작',
  sns: 'SNS 콘텐츠',
  blog: '블로그 작성',
  ui_design: 'UI 디자인',
  product_desc: '상품 설명',
  marketing: '마케팅',
  customer: '고객 응대',
  analysis: '매출 분석',
  sns_biz: 'SNS 운영',
};

/**
 * Korean particle helper — selects correct particle based on 받침 (final consonant)
 */
function addParticle(word: string, type: 'subject' | 'object'): string {
  const lastChar = word.charAt(word.length - 1);
  const code = lastChar.charCodeAt(0);

  // Korean syllable range: 0xAC00 ~ 0xD7A3
  const hasBatchim = code >= 0xAC00 && code <= 0xD7A3
    ? (code - 0xAC00) % 28 !== 0
    : false; // Non-Korean (English, etc.) treated as no 받침

  if (type === 'subject') {
    return hasBatchim ? `${word}이` : `${word}가`;
  }
  return hasBatchim ? `${word}을` : `${word}를`;
}

function generatePersonalizedReason(
  input: ScoringInput,
  tool: Tool | null,
  situation: Situation | null
): string {
  if (!tool || !situation) {
    return '조건에 맞는 AI 도구를 찾지 못했어요. 전체 도구를 둘러보세요.';
  }

  const role = ROLE_LABELS[input.role] ?? input.role;
  const purpose = PURPOSE_LABELS[input.purpose] ?? input.purpose;

  const budgetNote = input.budget === 'free_only'
    ? ' 무료로 바로 시작할 수 있어요!'
    : '';

  return `${addParticle(role, 'subject')} ${addParticle(purpose, 'object')} 할 때 ${addParticle(tool.name, 'subject')} 가장 적합해요.${budgetNote}`;
}

// --- Main recommendation function ---

/**
 * Generate a personalized recommendation based on onboarding answers.
 * Uses purpose-to-situation mapping, difficulty filtering, budget filtering,
 * and multi-factor scoring to return the best tool + alternatives.
 */
export function generateRecommendation(answers: OnboardingAnswers): OnboardingResult {
  const input: ScoringInput = {
    role: answers.role,
    purpose: answers.purpose,
    experience: answers.experience,
    budget: answers.budget,
  };

  // 1. Get mapped situation slugs for this purpose + validate against actual data
  const rawSlugs = purposeToSituationMap[input.purpose] ?? [];
  const validSlugs = rawSlugs.filter(slug =>
    allSituations.some(s => s.slug === slug)
  );

  if (validSlugs.length !== rawSlugs.length) {
    console.warn(
      `[onboardingEngine] Invalid situation slugs for purpose "${input.purpose}":`,
      rawSlugs.filter(s => !validSlugs.includes(s))
    );
  }

  // 2. Resolve situation objects
  let candidateSituations = allSituations.filter(s => validSlugs.includes(s.slug));

  // Fallback: if no mapping found, use role-category based situations
  if (candidateSituations.length === 0) {
    const roleCategories: Record<string, string[]> = {
      office_worker:  ['work', 'content'],
      student:        ['study', 'research', 'coding'],
      creator:        ['design', 'content'],
      business_owner: ['work', 'content', 'research'],
    };
    const cats = roleCategories[input.role] ?? [];
    candidateSituations = allSituations.filter(s => cats.includes(s.category));
  }

  // 3. Difficulty filtering
  const diffFilter = getDifficultyFilter(input.experience);
  const filteredByDifficulty = candidateSituations.filter(s => diffFilter.includes(s.difficulty));

  // Fallback: if difficulty filter removes everything, keep original candidates
  if (filteredByDifficulty.length > 0) {
    candidateSituations = filteredByDifficulty;
  }

  // 4. Score all candidate tools across all candidate situations
  const toolScores: { tool: Tool; situation: Situation; score: number }[] = [];

  for (const situation of candidateSituations) {
    for (const rt of situation.recommendedTools) {
      const tool = allTools.find(t => t.slug === rt.slug);
      if (!tool) continue;

      // Budget filter: free_only excludes paid-only tools
      if (input.budget === 'free_only' && !tool.pricing.free) continue;

      const score = calculateToolScore(tool, situation, input);
      toolScores.push({ tool, situation, score });
    }
  }

  // 5. Sort by score descending
  toolScores.sort((a, b) => b.score - a.score);

  // 6. Determine primary tool
  const primary = toolScores[0] ?? null;

  // 7. Determine alternative tools (different slug from primary, deduplicated)
  const alternatives = toolScores
    .filter(ts => ts.tool.slug !== primary?.tool.slug)
    .reduce<typeof toolScores>((acc, ts) => {
      if (!acc.find(a => a.tool.slug === ts.tool.slug)) {
        acc.push(ts);
      }
      return acc;
    }, [])
    .slice(0, 3);

  // 8. Recommended situation
  const recommendedSituation = primary?.situation ?? null;

  // 9. Related situations (exclude the primary one)
  const relatedSituations = candidateSituations
    .filter(s => s.slug !== recommendedSituation?.slug)
    .slice(0, 3);

  // 10. Personalized reason
  const reason = generatePersonalizedReason(input, primary?.tool ?? null, recommendedSituation);

  // 11. Primary reason from situation data
  const primaryReason = primary
    ? (primary.situation.recommendedTools.find(rt => rt.slug === primary.tool.slug)?.reason ?? '')
    : '';

  return {
    primaryTool: primary?.tool ?? null,
    primaryReason,
    alternatives: alternatives.map(a => ({
      tool: a.tool,
      reason: a.situation.recommendedTools.find(rt => rt.slug === a.tool.slug)?.reason ?? '',
      situation: a.situation,
    })),
    recommendedSituation,
    relatedSituations,
    personalizedReason: reason,
    answers,
  };
}

// --- URL encoding/decoding for shareable results ---

/**
 * Encode onboarding answers into a Base64 string for URL sharing
 */
export function encodeOnboardingResult(answers: OnboardingAnswers): string {
  const params = `${answers.role},${answers.purpose},${answers.experience},${answers.budget}`;
  return btoa(params);
}

/**
 * Decode a Base64 encoded string back into onboarding answers
 */
export function decodeOnboardingResult(encoded: string): OnboardingAnswers | null {
  try {
    const decoded = atob(encoded);
    const [role, purpose, experience, budget] = decoded.split(',');
    if (!role || !purpose || !experience || !budget) return null;
    return {
      role: role as OnboardingAnswers['role'],
      purpose,
      experience: experience as OnboardingAnswers['experience'],
      budget: budget as OnboardingAnswers['budget'],
    };
  } catch {
    return null;
  }
}

/**
 * Get the external link for a tool (affiliate URL if available, otherwise official URL)
 */
export function getToolLink(tool: Tool): string {
  return buildToolUrl(tool.url, tool.slug, 'onboarding-result');
}
