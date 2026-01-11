'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

export default function SearchInput({
  value,
  onChange,
  placeholder = '예: PDF 요약하고 싶어요, 코드 에러 해결...',
  suggestions = [],
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const justSelectedSuggestion = useRef(false);

  // 외부 클릭 시 제안 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // 제안 클릭 직후에는 드롭다운을 다시 열지 않음
    if (justSelectedSuggestion.current) {
      justSelectedSuggestion.current = false;
      return;
    }
    if (suggestions.length > 0 && !value) {
      setShowSuggestions(true);
    }
  }, [suggestions.length, value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      setShowSuggestions(newValue === '' && suggestions.length > 0);
    },
    [onChange, suggestions.length]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      justSelectedSuggestion.current = true;
      onChange(suggestion);
      setShowSuggestions(false);
      inputRef.current?.focus();
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className={`
          relative flex items-center bg-white rounded-2xl border-2 transition-all duration-200
          ${isFocused ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        {/* 검색 아이콘 */}
        <div className="pl-4 pr-2">
          <svg
            className={`w-5 h-5 transition-colors ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* 입력창 */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 py-4 pr-4 text-gray-900 placeholder-gray-400 bg-transparent outline-none text-lg"
        />

        {/* 클리어 버튼 */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 제안 드롭다운 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 font-medium">
            이런 걸 물어보세요
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <span className="text-gray-400">💡</span>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
