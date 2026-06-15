import Link from 'next/link';

type PersonaType = 'office_worker' | 'student' | 'creator' | 'business_owner';

export interface PersonaCardData {
  type: PersonaType;
  icon: string;
  label: string;
  painPoint: string;
  ctaText: string;
  ctaHref: string;
}

interface PersonaCardProps {
  persona: PersonaCardData;
}

export default function PersonaCard({ persona }: PersonaCardProps): JSX.Element {
  return (
    <Link
      href={persona.ctaHref}
      className="block bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all group"
    >
      <span className="text-4xl block mb-3" aria-hidden="true">
        {persona.icon}
      </span>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {persona.label}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        &ldquo;{persona.painPoint}&rdquo;
      </p>
      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1">
        {persona.ctaText}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </span>
    </Link>
  );
}
