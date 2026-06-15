'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import situationsData from '@/data/situations.json';
import toolsData from '@/data/tools.json';
import type { Situation } from '@/types';

const situations = situationsData.situations as Situation[];
const tools = toolsData.tools;

// Dynamically computed stats
const totalSituations = situations.length;
const totalTools = tools.length;
const totalPrompts = situations.reduce(
  (sum, s) => sum + (s.prompts?.length ?? 0),
  0
);

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  { value: totalSituations, suffix: '개', label: '상황별 가이드' },
  { value: totalTools, suffix: '개', label: 'AI 도구 수록' },
  { value: totalPrompts, suffix: '+', label: '프롬프트 템플릿' },
  { value: 100, suffix: '%', label: '무료' },
];

function useCountUp(
  target: number,
  isVisible: boolean,
  duration: number = 1200
): number {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();

    function animate(currentTime: number): void {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [isVisible, target, duration]);

  return count;
}

function StatCard({
  stat,
  isVisible,
}: {
  stat: StatItem;
  isVisible: boolean;
}): JSX.Element {
  const count = useCountUp(stat.value, isVisible);

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
        {count}
        {stat.suffix}
      </div>
      <div className="text-sm text-gray-600">{stat.label}</div>
    </div>
  );
}

export default function StatsSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        setIsVisible(true);
      }
    },
    []
  );

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.3,
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="stats-title"
      className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12 md:py-16 px-4"
    >
      <h2 id="stats-title" className="sr-only">
        서비스 통계
      </h2>
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} isVisible={isVisible} />
        ))}
      </div>
    </section>
  );
}
