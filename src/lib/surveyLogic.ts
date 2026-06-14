import type { SurveyAnswer, SurveyResult, ToolGroup, Situation, Tool, SurveyOption } from '@/types';
import surveyData from '@/data/survey.json';
import situationsData from '@/data/situations.json';
import toolsData from '@/data/tools.json';

interface ToolGroupWithTags extends ToolGroup {
  tags: string[];
}

interface SurveyData {
  questions: Array<{
    id: string;
    title: string;
    options: SurveyOption[];
    dependsOn?: {
      [questionId: string]: {
        [optionValue: string]: SurveyOption[];
      };
    };
  }>;
  toolGroups: ToolGroupWithTags[];
  taskToSituationMap: Record<string, string[]>;
}

const survey = surveyData as SurveyData;
const toolGroups = survey.toolGroups;
const situations = situationsData.situations as Situation[];
const tools = toolsData.tools as Tool[];

/**
 * 설문 응답을 기반으로 추천 결과 생성
 */
export function getSurveyResult(answers: SurveyAnswer[]): SurveyResult {
  // 응답에서 값 추출
  const contextAnswer = getAnswer(answers, 'context') || 'work';
  const taskAnswer = getAnswer(answers, 'task') || 'document';
  const urgencyAnswer = getAnswer(answers, 'urgency') || 'today';
  const qualityAnswer = getAnswer(answers, 'quality') || 'balanced';
  const experienceAnswer = getAnswer(answers, 'experience') || 'basic';
  const budgetAnswer = getAnswer(answers, 'budget') || 'free';

  // 필터 조건 결정
  const difficultyFilter = getDifficultyFilter(experienceAnswer, qualityAnswer);
  const freeOnly = budgetAnswer === 'free';
  const preferQuick = urgencyAnswer === 'now' || qualityAnswer === 'quick';

  // 태그 결정 (상황 + 작업 기반)
  const targetTags = getTagsFromContext(contextAnswer, taskAnswer);

  // 도구 그룹 필터링
  const recommendedGroups = filterAndSortGroups(targetTags, freeOnly);

  // 상황 필터링 - taskToSituationMap 활용
  const recommendedSituations = filterAndSortSituations(
    taskAnswer,
    contextAnswer,
    difficultyFilter,
    freeOnly,
    preferQuick
  );

  // Best Match 결정 - 가장 적합한 상황 1개
  const bestMatch = recommendedSituations.length > 0 ? recommendedSituations[0] : null;
  const matchReason = generateMatchReason(contextAnswer, taskAnswer, bestMatch);

  return {
    recommendedGroups,
    recommendedSituations,
    bestMatch,
    matchReason
  };
}

/**
 * 응답 값 가져오기 헬퍼
 */
function getAnswer(answers: SurveyAnswer[], questionId: string): string | undefined {
  return answers.find(a => a.questionId === questionId)?.value;
}

/**
 * 상황과 작업에서 태그 추출
 */
function getTagsFromContext(context: string, task: string): string[] {
  const contextTags: Record<string, string[]> = {
    work: ['text', 'document', 'email', 'writing', 'presentation'],
    study: ['text', 'research', 'summary', 'document'],
    personal: ['code', 'coding', 'writing', 'research'],
    creative: ['image', 'design', 'media', 'content']
  };

  const taskTags: Record<string, string[]> = {
    document: ['text', 'document', 'summary', 'writing'],
    email: ['text', 'email', 'writing'],
    presentation: ['presentation', 'media', 'design'],
    coding: ['code', 'coding', 'automation'],
    image: ['image', 'design', 'creative'],
    paper: ['text', 'research', 'summary', 'document'],
    summary: ['text', 'summary', 'document'],
    concept: ['text', 'research'],
    research: ['search', 'research', 'analysis'],
    content: ['content', 'writing', 'media'],
    video: ['video', 'media', 'creative'],
    music: ['audio', 'media', 'creative'],
    analysis: ['analysis', 'research', 'search'],
    writing: ['text', 'writing', 'content'],
    automation: ['code', 'automation'],
    other: ['text', 'search']
  };

  const tags = new Set<string>();
  (contextTags[context] || []).forEach(t => tags.add(t));
  (taskTags[task] || []).forEach(t => tags.add(t));

  return Array.from(tags);
}

/**
 * 경험과 품질 요구에 따른 난이도 필터
 */
function getDifficultyFilter(
  experience: string,
  quality: string
): ('easy' | 'medium' | 'hard')[] {
  // 초보자는 쉬운 것만
  if (experience === 'never') {
    return ['easy'];
  }

  // 기본 경험 + 빠른 결과 = 쉬운 것
  if (experience === 'basic' && quality === 'quick') {
    return ['easy'];
  }

  // 기본 경험 = 쉬움 + 보통
  if (experience === 'basic') {
    return ['easy', 'medium'];
  }

  // 완벽한 결과 원하면 모든 난이도
  if (quality === 'perfect') {
    return ['easy', 'medium', 'hard'];
  }

  // 그 외 = 모두
  return ['easy', 'medium', 'hard'];
}

/**
 * 도구 그룹 필터링 및 정렬
 */
function filterAndSortGroups(
  targetTags: string[],
  freeOnly: boolean
): ToolGroup[] {
  let filtered = [...toolGroups];

  // 태그 기반 필터링
  filtered = filtered.filter(group =>
    group.tags.some(tag => targetTags.includes(tag))
  );

  // 무료만 필터링: 그룹 내 무료 도구가 있는지 확인
  if (freeOnly) {
    filtered = filtered.filter(group => {
      const groupTools = group.tools
        .map(slug => tools.find(t => t.slug === slug))
        .filter((t): t is Tool => t !== undefined);
      return groupTools.some(tool => tool.pricing.free);
    });
  }

  // 태그 매칭 점수로 정렬
  filtered.sort((a, b) => {
    const scoreA = a.tags.filter(tag => targetTags.includes(tag)).length;
    const scoreB = b.tags.filter(tag => targetTags.includes(tag)).length;
    return scoreB - scoreA;
  });

  return filtered.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    description: g.description,
    color: g.color,
    tools: g.tools
  }));
}

/**
 * 상황 필터링 및 정렬
 */
function filterAndSortSituations(
  task: string,
  context: string,
  difficultyFilter: ('easy' | 'medium' | 'hard')[],
  freeOnly: boolean,
  preferQuick: boolean
): Situation[] {
  // taskToSituationMap에서 직접 매핑된 상황들은 항상 포함 (난이도 무시)
  const taskSituationSlugs = survey.taskToSituationMap[task] || [];

  let filtered = [...situations];

  // 난이도 필터링 (단, 직접 매핑된 상황은 난이도 필터 우회)
  filtered = filtered.filter(s =>
    taskSituationSlugs.includes(s.slug) || difficultyFilter.includes(s.difficulty)
  );

  // 무료만: 추천 도구 중 무료가 있는 상황만
  if (freeOnly) {
    filtered = filtered.filter(situation => {
      return situation.recommendedTools.some(rt => {
        const tool = tools.find(t => t.slug === rt.slug);
        return tool?.pricing.free;
      });
    });
  }

  // 점수 기반 정렬
  filtered.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // taskToSituationMap에 있으면 높은 점수
    if (taskSituationSlugs.includes(a.slug)) scoreA += 100;
    if (taskSituationSlugs.includes(b.slug)) scoreB += 100;

    // 카테고리 매칭
    const contextCategoryMap: Record<string, string[]> = {
      work: ['work', 'content'],
      study: ['study', 'research'],
      personal: ['coding', 'content'],
      creative: ['design', 'content']
    };
    const matchCategories = contextCategoryMap[context] || [];
    if (matchCategories.includes(a.category)) scoreA += 50;
    if (matchCategories.includes(b.category)) scoreB += 50;

    // 빠른 결과 선호 시 예상 시간 짧은 것 우선
    if (preferQuick) {
      const timeA = parseTime(a.timeToComplete);
      const timeB = parseTime(b.timeToComplete);
      scoreA += Math.max(0, 30 - timeA);
      scoreB += Math.max(0, 30 - timeB);
    }

    // priority 보너스
    scoreA += Math.max(0, 20 - (a.priority || 99));
    scoreB += Math.max(0, 20 - (b.priority || 99));

    return scoreB - scoreA;
  });

  // 상위 6개만 반환
  return filtered.slice(0, 6);
}

/**
 * 시간 문자열 파싱 (분 단위)
 */
function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (timeStr.includes('시간')) return num * 60;
    return num;
  }
  return 30; // 기본값
}

/**
 * 매칭 이유 생성
 */
function generateMatchReason(
  context: string,
  task: string,
  bestMatch: Situation | null
): string {
  if (!bestMatch) {
    return '조건에 맞는 상황을 찾지 못했어요';
  }

  const contextLabels: Record<string, string> = {
    work: '업무',
    study: '학습',
    personal: '개인 프로젝트',
    creative: '창작 활동'
  };

  const taskLabels: Record<string, string> = {
    document: '문서 작업',
    email: '이메일',
    presentation: '발표 자료',
    coding: '코딩',
    image: '이미지 생성',
    paper: '논문/레포트',
    summary: '자료 요약',
    concept: '개념 이해',
    research: '정보 조사',
    content: 'SNS 콘텐츠',
    video: '영상',
    music: '음악',
    analysis: '데이터 분석',
    writing: '글쓰기',
    automation: '자동화',
    other: '기타 작업'
  };

  const contextLabel = contextLabels[context] || context;
  const taskLabel = taskLabels[task] || task;

  return `${contextLabel}에서 ${taskLabel}이 필요하시네요! "${bestMatch.title}"가 딱 맞아요.`;
}

/**
 * 동적 옵션 가져오기 (의존성 기반)
 */
export function getDynamicOptions(
  questionId: string,
  answers: SurveyAnswer[]
): SurveyOption[] | null {
  const question = survey.questions.find(q => q.id === questionId);
  if (!question?.dependsOn) return null;

  // 의존하는 질문의 답변 찾기
  for (const [depQuestionId, optionMap] of Object.entries(question.dependsOn)) {
    const depAnswer = answers.find(a => a.questionId === depQuestionId)?.value;
    if (depAnswer && optionMap[depAnswer]) {
      return optionMap[depAnswer] as SurveyOption[];
    }
  }

  return null;
}

/**
 * 그룹 ID로 도구 목록 가져오기
 */
export function getToolsForGroup(groupId: string): Tool[] {
  const group = toolGroups.find(g => g.id === groupId);
  if (!group) return [];

  return group.tools
    .map(slug => tools.find(t => t.slug === slug))
    .filter((t): t is Tool => t !== undefined);
}

/**
 * 모든 도구 그룹 가져오기
 */
export function getAllToolGroups(): ToolGroup[] {
  return toolGroups.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    description: g.description,
    color: g.color,
    tools: g.tools
  }));
}
