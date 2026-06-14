'use client';

import type { SituationCategory, CategoryInfo } from '@/types';

// 카테고리 데이터
export const categories: CategoryInfo[] = [
  { id: 'work', name: '업무', icon: '💼', description: '업무 효율화' },
  { id: 'study', name: '학습', icon: '📚', description: '학습 및 공부' },
  { id: 'coding', name: '개발', icon: '💻', description: '코딩 및 개발' },
  { id: 'design', name: '디자인', icon: '🎨', description: '디자인 작업' },
  { id: 'content', name: '콘텐츠', icon: '✍️', description: '글쓰기 및 콘텐츠' },
  { id: 'research', name: '리서치', icon: '🔍', description: '조사 및 분석' },
];

interface CategoryButtonsProps {
  selected: SituationCategory | null;
  onChange: (category: SituationCategory | null) => void;
}

export default function CategoryButtons({ selected, onChange }: CategoryButtonsProps) {
  const handleClick = (categoryId: SituationCategory) => {
    // 이미 선택된 카테고리를 다시 클릭하면 해제
    if (selected === categoryId) {
      onChange(null);
    } else {
      onChange(categoryId);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => {
        const isSelected = selected === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => handleClick(category.id)}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-200
              ${
                isSelected
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
