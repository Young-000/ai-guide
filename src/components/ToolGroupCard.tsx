'use client';

import type { ToolGroup, Tool } from '@/types';

interface ToolGroupCardProps {
  group: ToolGroup;
  tools: Tool[];
  onClick?: () => void;
  selected?: boolean;
}

export default function ToolGroupCard({
  group,
  tools,
  onClick,
  selected = false
}: ToolGroupCardProps) {
  // 그룹에 속한 도구들 (최대 4개만 표시)
  const displayTools = tools.slice(0, 4);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full p-4 rounded-2xl text-left transition-all duration-200
        bg-gradient-to-br ${group.color}
        ${selected
          ? 'ring-4 ring-white/50 scale-[1.02] shadow-xl'
          : 'hover:scale-[1.02] hover:shadow-lg shadow-md'
        }
      `}
    >
      {/* 아이콘 + 이름 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl filter drop-shadow-sm">{group.icon}</span>
        <h3 className="text-white font-bold text-lg">{group.name}</h3>
      </div>

      {/* 설명 */}
      <p className="text-white/80 text-sm mb-3">{group.description}</p>

      {/* 도구 아이콘들 */}
      <div className="flex items-center gap-2">
        {displayTools.map((tool) => (
          <div
            key={tool.slug}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center"
            title={tool.name}
          >
            <span className="text-sm">{tool.icon || '🤖'}</span>
          </div>
        ))}
        {tools.length > 4 && (
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <span className="text-white/80 text-xs font-medium">
              +{tools.length - 4}
            </span>
          </div>
        )}
      </div>

      {/* 선택 표시 */}
      {selected && (
        <div className="mt-3 flex items-center gap-1 text-white text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          선택됨
        </div>
      )}
    </button>
  );
}

// 그룹 그리드 컴포넌트
interface ToolGroupGridProps {
  groups: ToolGroup[];
  allTools: Tool[];
  selectedGroupId?: string | null;
  onGroupSelect?: (groupId: string | null) => void;
}

export function ToolGroupGrid({
  groups,
  allTools,
  selectedGroupId,
  onGroupSelect
}: ToolGroupGridProps) {
  const getToolsForGroup = (group: ToolGroup): Tool[] => {
    return group.tools
      .map(slug => allTools.find(t => t.slug === slug))
      .filter((t): t is Tool => t !== undefined);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {groups.map((group) => (
        <ToolGroupCard
          key={group.id}
          group={group}
          tools={getToolsForGroup(group)}
          selected={selectedGroupId === group.id}
          onClick={() => {
            if (onGroupSelect) {
              onGroupSelect(selectedGroupId === group.id ? null : group.id);
            }
          }}
        />
      ))}
    </div>
  );
}
