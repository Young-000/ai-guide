'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ToyProject {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate';
  timeEstimate: string;
  tools: string[];
  steps: {
    title: string;
    description: string;
    tip?: string;
  }[];
  result: string;
}

const toyProjects: ToyProject[] = [
  {
    id: 'daily-news-summary',
    title: '매일 뉴스 요약 받기',
    description: 'ChatGPT로 관심 분야 뉴스를 매일 3줄로 요약받아보세요',
    icon: '📰',
    difficulty: 'beginner',
    timeEstimate: '10분',
    tools: ['ChatGPT'],
    steps: [
      {
        title: 'ChatGPT 접속하기',
        description: 'chat.openai.com에 접속하고 무료 계정으로 로그인합니다.',
        tip: '구글 계정으로 바로 로그인할 수 있어요',
      },
      {
        title: '관심 분야 설정하기',
        description: '"나는 IT/스타트업 뉴스에 관심이 있어. 앞으로 내가 뉴스 키워드를 알려주면 3줄로 요약해줘"라고 입력합니다.',
      },
      {
        title: '뉴스 요약 요청하기',
        description: '오늘 본 뉴스 기사의 제목이나 핵심 내용을 복사해서 붙여넣고 요약을 요청합니다.',
        tip: '네이버 뉴스나 구글 뉴스에서 관심 기사를 찾아보세요',
      },
      {
        title: '대화 저장하기',
        description: 'ChatGPT는 대화 기록을 저장해두므로, 내일도 같은 대화창에서 이어서 요약을 받을 수 있습니다.',
      },
    ],
    result: '매일 5분만 투자해서 관심 분야 뉴스를 빠르게 파악할 수 있게 됩니다!',
  },
  {
    id: 'instagram-caption',
    title: '인스타그램 캡션 생성기',
    description: '사진 설명만 적으면 감성 캡션과 해시태그를 자동 생성',
    icon: '📸',
    difficulty: 'beginner',
    timeEstimate: '15분',
    tools: ['ChatGPT', 'Claude'],
    steps: [
      {
        title: 'AI 도구 접속',
        description: 'ChatGPT(chat.openai.com) 또는 Claude(claude.ai)에 접속합니다.',
      },
      {
        title: '역할 부여하기',
        description: '"너는 인스타그램 캡션 전문가야. 내가 사진 상황을 설명하면 감성적인 캡션과 관련 해시태그 5개를 만들어줘"라고 입력합니다.',
      },
      {
        title: '사진 설명하기',
        description: '예: "제주도 바다에서 일몰 보는 사진이야. 친구들이랑 여행 중"',
        tip: '장소, 분위기, 감정을 구체적으로 설명할수록 좋은 결과가 나와요',
      },
      {
        title: '결과 활용하기',
        description: 'AI가 생성한 캡션 중 마음에 드는 것을 선택하고, 필요하면 수정 요청합니다.',
        tip: '"좀 더 짧게", "이모지 추가해줘" 같이 수정 요청이 가능해요',
      },
    ],
    result: '사진마다 고민 없이 감성적인 캡션을 바로 작성할 수 있게 됩니다!',
  },
  {
    id: 'english-diary',
    title: '영어 일기 교정받기',
    description: '간단한 영어 일기를 쓰고 AI한테 자연스럽게 교정받기',
    icon: '📝',
    difficulty: 'beginner',
    timeEstimate: '15분',
    tools: ['ChatGPT', 'Claude'],
    steps: [
      {
        title: 'AI 도구 준비',
        description: 'ChatGPT 또는 Claude에 접속합니다.',
      },
      {
        title: '영어 선생님 역할 부여',
        description: '"너는 친절한 영어 선생님이야. 내가 영어 일기를 쓰면 자연스럽게 교정해주고, 왜 틀렸는지 한국어로 쉽게 설명해줘"라고 입력합니다.',
      },
      {
        title: '간단한 일기 쓰기',
        description: '3-5문장의 간단한 영어 일기를 씁니다. 예: "Today I eat lunch with friend. We go to new restaurant. Food is very delicious."',
        tip: '처음엔 틀려도 괜찮아요. AI가 친절하게 고쳐줄 거예요',
      },
      {
        title: '피드백 받기',
        description: 'AI가 교정한 문장과 설명을 읽고 이해합니다.',
      },
      {
        title: '표현 물어보기',
        description: '"오늘 정말 피곤했다"를 영어로 어떻게 표현하지?처럼 추가 질문을 합니다.',
      },
    ],
    result: '매일 10분 영어 일기로 영작 실력이 자연스럽게 향상됩니다!',
  },
  {
    id: 'simple-image',
    title: '간단한 이미지 만들기',
    description: '텍스트로 블로그 썸네일, SNS 이미지 생성하기',
    icon: '🎨',
    difficulty: 'intermediate',
    timeEstimate: '20분',
    tools: ['DALL-E', 'Midjourney'],
    steps: [
      {
        title: 'DALL-E 접속',
        description: 'ChatGPT Plus 구독자라면 ChatGPT 내에서 DALL-E를 사용할 수 있습니다. 또는 Microsoft Bing Image Creator(무료)를 사용합니다.',
      },
      {
        title: '원하는 이미지 설명하기',
        description: '"미니멀한 스타일의 커피잔이 있는 책상 일러스트, 파스텔톤 배경"처럼 원하는 이미지를 설명합니다.',
        tip: '스타일(일러스트, 사진, 미니멀 등)을 명시하면 더 좋은 결과가 나와요',
      },
      {
        title: '이미지 생성 및 선택',
        description: 'AI가 생성한 이미지 중 마음에 드는 것을 선택합니다.',
      },
      {
        title: '수정 요청하기',
        description: '"배경색을 더 밝게", "커피잔을 더 크게" 같이 수정을 요청합니다.',
      },
      {
        title: '다운로드 및 활용',
        description: '완성된 이미지를 다운로드해서 블로그나 SNS에 활용합니다.',
      },
    ],
    result: '디자인 도구 없이도 원하는 이미지를 직접 만들 수 있게 됩니다!',
  },
  {
    id: 'excel-formula',
    title: '엑셀 함수 AI한테 물어보기',
    description: '복잡한 엑셀 함수를 자연어로 설명하면 AI가 만들어줌',
    icon: '📊',
    difficulty: 'beginner',
    timeEstimate: '10분',
    tools: ['ChatGPT', 'Claude'],
    steps: [
      {
        title: 'AI 도구 준비',
        description: 'ChatGPT 또는 Claude에 접속합니다.',
      },
      {
        title: '엑셀 전문가 역할 부여',
        description: '"너는 엑셀 전문가야. 내가 원하는 기능을 설명하면 엑셀 함수로 만들어주고, 사용법도 쉽게 설명해줘"라고 입력합니다.',
      },
      {
        title: '원하는 기능 설명',
        description: '예: "A열에 있는 숫자들 중에서 100보다 큰 것만 골라서 평균 구하고 싶어"',
        tip: '구체적으로 설명할수록 정확한 함수를 받을 수 있어요',
      },
      {
        title: '함수 받기',
        description: 'AI가 =AVERAGEIF(A:A,">100") 같은 함수를 알려줍니다.',
      },
      {
        title: '엑셀에 적용',
        description: '받은 함수를 복사해서 엑셀에 붙여넣고 작동하는지 확인합니다.',
        tip: '작동하지 않으면 에러 메시지를 AI에게 보여주고 물어보세요',
      },
    ],
    result: '복잡한 엑셀 함수도 검색 없이 바로 만들 수 있게 됩니다!',
  },
  {
    id: 'meeting-summary',
    title: '회의록 자동 정리',
    description: '회의 내용을 AI에게 주면 깔끔하게 정리된 회의록 완성',
    icon: '📋',
    difficulty: 'beginner',
    timeEstimate: '15분',
    tools: ['ChatGPT', 'Claude', 'Notion AI'],
    steps: [
      {
        title: 'AI 도구 준비',
        description: 'ChatGPT, Claude, 또는 Notion AI 중 편한 도구에 접속합니다.',
      },
      {
        title: '회의록 전문가 역할 부여',
        description: '"너는 회의록 작성 전문가야. 내가 회의 내용을 알려주면 1) 핵심 논의사항 2) 결정사항 3) 액션아이템(담당자/기한) 형식으로 정리해줘"라고 입력합니다.',
      },
      {
        title: '회의 내용 입력',
        description: '회의 중 메모한 내용이나 녹취록을 그대로 붙여넣습니다.',
        tip: '완벽하지 않아도 괜찮아요. AI가 알아서 정리해줍니다',
      },
      {
        title: '정리된 회의록 받기',
        description: 'AI가 깔끔하게 정리한 회의록을 확인합니다.',
      },
      {
        title: '수정 및 공유',
        description: '필요한 부분을 수정하고 팀원들에게 공유합니다.',
        tip: '"더 간결하게", "영어로 번역해줘" 같은 추가 요청도 가능해요',
      },
    ],
    result: '회의 후 30분 걸리던 회의록 작성이 5분으로 줄어듭니다!',
  },
];

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
};

const difficultyLabels = {
  beginner: '입문',
  intermediate: '초급',
};

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<ToyProject | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});

  const handleStepComplete = (projectId: string, stepIndex: number) => {
    setCompletedSteps((prev) => {
      const projectSteps = prev[projectId] || [];
      if (projectSteps.includes(stepIndex)) {
        return prev;
      }
      return {
        ...prev,
        [projectId]: [...projectSteps, stepIndex],
      };
    });
  };

  const getProgress = (project: ToyProject) => {
    const completed = completedSteps[project.id]?.length || 0;
    return Math.round((completed / project.steps.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="text-blue-500 hover:text-blue-600 text-sm mb-4 inline-block">
            ← 홈으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 토이 프로젝트
          </h1>
          <p className="text-gray-600">
            AI를 처음 배우는 분들을 위한 작은 프로젝트들이에요. <br />
            따라하면서 자연스럽게 AI 사용법을 익혀보세요!
          </p>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 프로젝트 리스트 */}
        {!selectedProject ? (
          <div className="grid gap-4 md:grid-cols-2">
            {toyProjects.map((project) => {
              const progress = getProgress(project);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{project.icon}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[project.difficulty]}`}>
                      {difficultyLabels[project.difficulty]}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">⏱ {project.timeEstimate}</span>
                    {progress > 0 && (
                      <span className="text-green-600 font-medium">{progress}% 완료</span>
                    )}
                  </div>
                  {progress > 0 && (
                    <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* 프로젝트 상세 */
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* 헤더 */}
            <div className="p-6 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="text-blue-500 hover:text-blue-600 text-sm mb-4 inline-block"
              >
                ← 프로젝트 목록
              </button>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{selectedProject.icon}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[selectedProject.difficulty]}`}>
                  {difficultyLabels[selectedProject.difficulty]}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedProject.title}
              </h2>
              <p className="text-gray-600 mb-4">{selectedProject.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>⏱ 예상 소요: {selectedProject.timeEstimate}</span>
                <span>🛠 사용 도구: {selectedProject.tools.join(', ')}</span>
              </div>
            </div>

            {/* 진행률 */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">진행률</span>
                <span className="text-sm text-gray-500">
                  {completedSteps[selectedProject.id]?.length || 0}/{selectedProject.steps.length} 완료
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                  style={{ width: `${getProgress(selectedProject)}%` }}
                />
              </div>
            </div>

            {/* 단계별 가이드 */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📝 따라하기</h3>
              <div className="space-y-4">
                {selectedProject.steps.map((step, index) => {
                  const isCompleted = completedSteps[selectedProject.id]?.includes(index);
                  return (
                    <div key={index} className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => handleStepComplete(selectedProject.id, index)}
                        disabled={isCompleted}
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                          transition-all focus:outline-none focus:ring-2 focus:ring-blue-400
                          ${isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 border-2 border-gray-300'
                          }
                        `}
                        aria-label={isCompleted ? `${index + 1}단계 완료됨` : `${index + 1}단계 완료 표시하기`}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium mb-1 ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {step.title}
                        </h4>
                        <p className={`text-sm ${isCompleted ? 'text-gray-300' : 'text-gray-600'}`}>
                          {step.description}
                        </p>
                        {step.tip && !isCompleted && (
                          <p className="text-sm mt-2 px-3 py-2 bg-yellow-50 rounded-lg text-yellow-700">
                            💡 <span className="font-medium">Tip:</span> {step.tip}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 기대 결과 */}
            <div className="px-6 pb-6">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="text-sm font-bold text-green-800 mb-1">✨ 이걸 완료하면</h4>
                <p className="text-sm text-green-700">{selectedProject.result}</p>
              </div>
            </div>

            {/* 완료 시 축하 메시지 */}
            {getProgress(selectedProject) === 100 && (
              <div className="px-6 pb-6">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 text-center">
                  <span className="text-4xl block mb-2">🎉</span>
                  <h4 className="text-lg font-bold text-purple-800 mb-1">축하합니다!</h4>
                  <p className="text-sm text-purple-600">프로젝트를 완료했어요. 다른 프로젝트도 도전해보세요!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
