/**
 * 주간 학습 리포트 시스템
 * 이번 주(월~일) 학습 요약을 생성합니다.
 */

import type { UserProgress } from './levelSystem';

export type WeeklyReport = {
  weekStart: string;
  weekEnd: string;
  guidesCompleted: number;
  stepsCompleted: number;
  xpEarned: number;
  newToolsTried: string[];
  achievementsEarned: string[];
  prevWeekGuidesCompleted: number;
  guidesChange: number;
  prevWeekXpEarned: number;
  xpChange: number;
};

/**
 * 주어진 날짜(YYYY-MM-DD)가 포함된 주의 월요일 반환
 */
export function getWeekStart(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const day = d.getDay();
  // getDay(): 0=일, 1=월, ..., 6=토
  // 월요일로 이동: 일요일(0)이면 -6, 나머지는 -(day-1)
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

/**
 * 주의 월요일부터 일요일까지의 날짜 범위 반환
 */
function getWeekRange(weekStart: string): { start: string; end: string } {
  const startDate = new Date(weekStart + 'T00:00:00');
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return { start: weekStart, end: formatDate(endDate) };
}

/**
 * Date를 YYYY-MM-DD 문자열로 변환
 */
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 날짜가 시작~끝 범위에 포함되는지 확인
 */
function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

/**
 * 오늘 날짜를 YYYY-MM-DD로 반환 (KST)
 */
function getTodayStr(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * 이번 주(월~일) 학습 리포트 생성
 * dailyActivities와 situationCompletions 데이터를 기반으로 집계
 */
export function generateWeeklyReport(progress: UserProgress): WeeklyReport {
  const today = getTodayStr();
  const currentWeekStart = getWeekStart(today);
  const currentWeek = getWeekRange(currentWeekStart);

  // 지난 주 범위 계산
  const prevWeekStartDate = new Date(currentWeekStart + 'T00:00:00');
  prevWeekStartDate.setDate(prevWeekStartDate.getDate() - 7);
  const prevWeekStart = formatDate(prevWeekStartDate);
  const prevWeek = getWeekRange(prevWeekStart);

  // 이번 주 가이드 완료 수
  const guidesCompleted = progress.situationCompletions.filter((sc) => {
    const completedDate = sc.completedAt.split('T')[0] ?? '';
    return isDateInRange(completedDate, currentWeek.start, currentWeek.end);
  }).length;

  // 이번 주 일별 활동 집계
  const weekActivities = progress.dailyActivities.filter((da) =>
    isDateInRange(da.date, currentWeek.start, currentWeek.end),
  );
  const stepsCompleted = weekActivities.reduce((sum, a) => sum + a.stepsCompleted, 0);
  const xpEarned = weekActivities.reduce((sum, a) => sum + a.xpEarned, 0);

  // 이번 주 새로 시도한 도구
  const newToolsTried = Object.entries(progress.toolFirstUsedAt)
    .filter(([, date]) => isDateInRange(date, currentWeek.start, currentWeek.end))
    .map(([slug]) => slug);

  // 이번 주 달성한 업적
  const achievementsEarned = progress.achievements
    .filter((a) => {
      const earnedDate = a.earnedAt.split('T')[0] ?? '';
      return isDateInRange(earnedDate, currentWeek.start, currentWeek.end);
    })
    .map((a) => a.id);

  // 지난 주 가이드 완료 수
  const prevWeekGuidesCompleted = progress.situationCompletions.filter((sc) => {
    const completedDate = sc.completedAt.split('T')[0] ?? '';
    return isDateInRange(completedDate, prevWeek.start, prevWeek.end);
  }).length;

  // 지난 주 XP 획득량
  const prevWeekActivities = progress.dailyActivities.filter((da) =>
    isDateInRange(da.date, prevWeek.start, prevWeek.end),
  );
  const prevWeekXpEarned = prevWeekActivities.reduce((sum, a) => sum + a.xpEarned, 0);

  return {
    weekStart: currentWeek.start,
    weekEnd: currentWeek.end,
    guidesCompleted,
    stepsCompleted,
    xpEarned,
    newToolsTried,
    achievementsEarned,
    prevWeekGuidesCompleted,
    guidesChange: guidesCompleted - prevWeekGuidesCompleted,
    prevWeekXpEarned,
    xpChange: xpEarned - prevWeekXpEarned,
  };
}
