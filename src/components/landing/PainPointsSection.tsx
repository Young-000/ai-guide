import PersonaCard from './PersonaCard';
import type { PersonaCardData } from './PersonaCard';

const PERSONA_CARDS: PersonaCardData[] = [
  {
    type: 'office_worker',
    icon: '💼',
    label: '직장인이세요?',
    painPoint: '팀장이 AI 활용하라는데, 뭐부터 시작해야 할지 모르겠어요',
    ctaText: '직장인 맞춤 추천',
    ctaHref: '/onboarding?persona=office_worker',
  },
  {
    type: 'student',
    icon: '📚',
    label: '학생이세요?',
    painPoint: 'AI로 레포트 쓰고 싶은데, 프롬프트를 어떻게 써야 할지...',
    ctaText: '학생 맞춤 추천',
    ctaHref: '/onboarding?persona=student',
  },
  {
    type: 'creator',
    icon: '🎨',
    label: '크리에이터세요?',
    painPoint: '이미지 AI가 너무 많은데, 내 작업에 뭐가 맞는지 모르겠어요',
    ctaText: '크리에이터 맞춤 추천',
    ctaHref: '/onboarding?persona=creator',
  },
  {
    type: 'business_owner',
    icon: '🏪',
    label: '사업하세요?',
    painPoint: 'AI가 대세라는데, 내 사업에 어떻게 활용하는 건지...',
    ctaText: '사업자 맞춤 추천',
    ctaHref: '/onboarding?persona=business_owner',
  },
];

export default function PainPointsSection(): JSX.Element {
  return (
    <section aria-labelledby="pain-points-title" className="bg-white py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2
          id="pain-points-title"
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10"
        >
          혹시 이런 고민 있으신가요?
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 list-none p-0">
          {PERSONA_CARDS.map((persona) => (
            <li key={persona.type}>
              <PersonaCard persona={persona} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
