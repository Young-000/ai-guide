'use client';

import { useState } from 'react';
import Link from 'next/link';
import toolsData from '@/data/tools.json';
import type { Tool } from '@/types';

interface Question {
  id: number;
  question: string;
  options: { label: string; value: string }[];
  category: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "AI를 주로 어디에 사용하고 싶으세요?",
    options: [
      { label: "🗣️ 대화하면서 질문하기", value: "chat" },
      { label: "💻 코딩/개발 도움받기", value: "coding" },
      { label: "🔍 정보 검색/리서치", value: "search" },
      { label: "🎨 이미지 만들기", value: "image" },
      { label: "📄 문서 작성/정리", value: "productivity" },
    ],
    category: "purpose"
  },
  {
    id: 2,
    question: "예산은 어느 정도 생각하고 계세요?",
    options: [
      { label: "💸 무료로만 쓰고 싶어요", value: "free" },
      { label: "💰 월 $20 정도는 괜찮아요", value: "mid" },
      { label: "💎 좋은 거라면 더 낼 수 있어요", value: "premium" },
    ],
    category: "budget"
  },
  {
    id: 3,
    question: "AI 경험이 어느 정도 되시나요?",
    options: [
      { label: "🐣 완전 처음이에요", value: "beginner" },
      { label: "🐥 ChatGPT 정도는 써봤어요", value: "intermediate" },
      { label: "🦅 여러 AI를 써봤어요", value: "advanced" },
    ],
    category: "experience"
  },
  {
    id: 4,
    question: "어떤 기능이 가장 중요하세요?",
    options: [
      { label: "📚 긴 문서도 잘 처리하는 것", value: "long-context" },
      { label: "🌐 최신 정보를 알려주는 것", value: "realtime" },
      { label: "🎯 정확하고 믿을 수 있는 답변", value: "accuracy" },
      { label: "⚡ 빠르고 간편한 것", value: "speed" },
    ],
    category: "priority"
  },
  {
    id: 5,
    question: "주로 어떤 환경에서 사용하실 건가요?",
    options: [
      { label: "🖥️ 컴퓨터에서 코딩할 때", value: "desktop-coding" },
      { label: "📱 이동 중 스마트폰으로", value: "mobile" },
      { label: "💼 업무용 (팀/회사)", value: "business" },
      { label: "🏠 개인 용도", value: "personal" },
    ],
    category: "environment"
  }
];

interface Answers {
  [key: string]: string;
}

function getRecommendations(answers: Answers): Tool[] {
  const tools = toolsData.tools as Tool[];

  const scores: { [slug: string]: number } = {};
  tools.forEach(t => scores[t.slug] = 0);

  // 목적별 점수
  if (answers.purpose === 'chat') {
    scores['chatgpt'] += 3;
    scores['claude'] += 3;
    scores['gemini'] += 3;
    scores['perplexity'] += 2;
  } else if (answers.purpose === 'coding') {
    scores['cursor'] += 5;
    scores['github-copilot'] += 4;
    scores['claude'] += 3;
    scores['chatgpt'] += 2;
  } else if (answers.purpose === 'search') {
    scores['perplexity'] += 5;
    scores['gemini'] += 3;
    scores['chatgpt'] += 2;
  } else if (answers.purpose === 'image') {
    scores['midjourney'] += 5;
    scores['dall-e'] += 4;
  } else if (answers.purpose === 'productivity') {
    scores['notion-ai'] += 4;
    scores['gamma'] += 4;
    scores['claude'] += 2;
    scores['chatgpt'] += 2;
  }

  // 예산별 점수
  if (answers.budget === 'free') {
    tools.forEach(t => {
      if (t.pricing.free) scores[t.slug] += 3;
    });
  } else if (answers.budget === 'premium') {
    scores['cursor'] += 2;
    scores['github-copilot'] += 2;
    scores['midjourney'] += 2;
  }

  // 경험별 점수
  if (answers.experience === 'beginner') {
    scores['chatgpt'] += 3;
    scores['gemini'] += 2;
    scores['gamma'] += 2;
  } else if (answers.experience === 'advanced') {
    scores['claude'] += 2;
    scores['cursor'] += 2;
    scores['perplexity'] += 2;
  }

  // 우선순위별 점수
  if (answers.priority === 'long-context') {
    scores['claude'] += 4;
    scores['gemini'] += 2;
  } else if (answers.priority === 'realtime') {
    scores['perplexity'] += 4;
    scores['gemini'] += 3;
  } else if (answers.priority === 'accuracy') {
    scores['claude'] += 3;
    scores['perplexity'] += 2;
  }

  // 환경별 점수
  if (answers.environment === 'desktop-coding') {
    scores['cursor'] += 4;
    scores['github-copilot'] += 3;
  } else if (answers.environment === 'business') {
    scores['chatgpt'] += 2;
    scores['notion-ai'] += 3;
  }

  // 점수 순으로 정렬하여 상위 3개 반환
  const sortedTools = tools
    .map(t => ({ tool: t, score: scores[t.slug] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.tool);

  return sortedTools;
}

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (value: string) => {
    const question = questions[currentStep];
    const newAnswers = { ...answers, [question.category]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
  };

  const recommendations = showResult ? getRecommendations(answers) : [];

  if (showResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            분석 완료!
          </h1>
          <p className="text-gray-600">
            당신에게 딱 맞는 AI 도구를 찾았어요
          </p>
        </div>

        <div className="space-y-6 mb-12">
          {recommendations.map((tool, index) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`}>
              <div className={`bg-white rounded-2xl border-2 p-6 hover:shadow-lg transition-all ${
                index === 0 ? 'border-blue-500 shadow-md' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-3xl`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                          BEST
                        </span>
                      )}
                      <span className="text-sm text-gray-500">#{index + 1} 추천</span>
                    </div>
                    <h2 className="font-bold text-xl text-gray-900">{tool.name}</h2>
                    <p className="text-gray-500">{tool.tagline}</p>
                  </div>
                  <div className="text-right">
                    {tool.pricing.free ? (
                      <span className="text-green-600 font-medium">무료 가능</span>
                    ) : (
                      <span className="text-gray-500">유료</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tool.bestFor.slice(0, 2).map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            다시 테스트하기
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors text-center"
          >
            모든 도구 보기
          </Link>
        </div>
      </div>
    );
  }

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          나에게 맞는 AI 찾기
        </h1>
        <p className="text-gray-600">
          5개 질문에 답하면 딱 맞는 AI를 추천해드려요
        </p>
      </div>

      {/* 진행 바 */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>질문 {currentStep + 1} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 질문 카드 */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 rounded-xl transition-all group"
            >
              <span className="text-lg group-hover:translate-x-1 inline-block transition-transform">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 뒤로가기 */}
      {currentStep > 0 && (
        <button
          onClick={() => setCurrentStep(currentStep - 1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mx-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          이전 질문
        </button>
      )}
    </div>
  );
}
