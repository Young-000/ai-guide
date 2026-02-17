'use client';

import Link from 'next/link';
import type { WeeklyReport } from '@/lib/weeklyReport';

interface WeeklyLearningReportProps {
  report: WeeklyReport;
}

function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(weekEnd + 'T00:00:00');
  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  const endMonth = end.getMonth() + 1;
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth}/${startDay} ~ ${endDay}`;
  }
  return `${startMonth}/${startDay} ~ ${endMonth}/${endDay}`;
}

function ChangeIndicator({ value, unit }: { value: number; unit: string }) {
  if (value === 0) {
    return <span className="text-xs text-gray-400">-</span>;
  }
  if (value > 0) {
    return (
      <span className="text-xs text-green-600 font-medium">
        ↑{value}{unit}
      </span>
    );
  }
  return (
    <span className="text-xs text-gray-500 font-medium">
      ↓{Math.abs(value)}{unit}
    </span>
  );
}

export default function WeeklyLearningReport({ report }: WeeklyLearningReportProps) {
  const hasActivity = report.guidesCompleted > 0 || report.stepsCompleted > 0 || report.xpEarned > 0;
  const weekRange = formatWeekRange(report.weekStart, report.weekEnd);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">이번 주 학습 리포트</h2>
        <span className="text-xs text-gray-400">{weekRange}</span>
      </div>

      {!hasActivity ? (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
          <span className="text-3xl block mb-2" aria-hidden="true">📝</span>
          <p className="text-sm text-gray-600 mb-3">
            이번 주는 아직 학습 기록이 없어요.
          </p>
          <Link
            href="/situations"
            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            가이드 둘러보기 →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{report.guidesCompleted}</p>
              <p className="text-xs text-gray-500 mt-1">가이드</p>
              <ChangeIndicator value={report.guidesChange} unit="개" />
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{report.xpEarned}</p>
              <p className="text-xs text-gray-500 mt-1">XP 획득</p>
              <ChangeIndicator value={report.xpChange} unit="XP" />
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{report.newToolsTried.length}</p>
              <p className="text-xs text-gray-500 mt-1">새 도구</p>
            </div>
          </div>

          {report.guidesChange !== 0 && (
            <p className="text-xs text-gray-500 text-center">
              지난 주 대비:{' '}
              {report.guidesChange > 0 ? (
                <span className="text-green-600 font-medium">
                  가이드 +{report.guidesChange}개 더 완료
                </span>
              ) : (
                <span className="text-gray-500">
                  가이드 {Math.abs(report.guidesChange)}개 적게 완료
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
