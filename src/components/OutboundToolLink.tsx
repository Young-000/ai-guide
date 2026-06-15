'use client';

import { useCallback } from 'react';
import { trackToolClick } from '@/lib/analytics';

interface OutboundToolLinkProps {
  href: string;
  toolName: string;
  sourcePage: string;
  /** True when href is an affiliate/sponsored URL. Switches rel to "sponsored noopener". */
  isAffiliate?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function OutboundToolLink({
  href,
  toolName,
  sourcePage,
  isAffiliate = false,
  className = '',
  children,
}: OutboundToolLinkProps): JSX.Element {
  const handleClick = useCallback((): void => {
    trackToolClick(toolName, sourcePage);
  }, [toolName, sourcePage]);

  const rel = isAffiliate ? 'sponsored noopener' : 'noopener noreferrer';

  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      className={className}
      onClick={handleClick}
      aria-label={`${toolName} (새 창에서 열림)`}
    >
      {children}
      <svg
        className="inline-block w-3 h-3 ml-1 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
