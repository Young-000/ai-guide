# AI Guide

AI 도구 활용 가이드 웹앱 - 상황 기반 AI 추천 서비스

## Overview

| 항목 | 값 |
|------|-----|
| 배포 URL | https://ai-guide-nu.vercel.app |
| Supabase | 미사용 |
| 스키마 | 해당없음 |
| 브랜치 | feature/situation-based-pivot |
| 완성도 | 85% |

## 기술 스택

- Next.js 14.2 + React 18 + TypeScript
- Tailwind CSS
- Jest + Testing Library

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router
│   ├── compare/      # AI 도구 비교
│   ├── glossary/     # 용어 사전
│   ├── projects/     # 프로젝트
│   ├── quiz/         # 인터랙티브 퀴즈
│   ├── situations/   # 상황별 추천 (핵심)
│   ├── tools/        # 도구 카탈로그
│   └── trends/       # 트렌드 추적
├── components/       # 15개 컴포넌트
├── data/             # JSON 데이터 파일
├── lib/              # 유틸리티
└── types/            # 타입 정의
```

## 진행상황

- [x] Next.js App Router 셋업
- [x] AI 도구 카탈로그
- [x] 도구 비교 기능
- [x] 용어 사전
- [x] 인터랙티브 퀴즈
- [x] 트렌드 추적
- [x] Vercel 배포
- [ ] 상황 기반 추천 피벗 (feature 브랜치 진행 중)
- [ ] GitHub 원격 저장소 설정

## 개발 명령어

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run test     # 테스트 실행
npm run lint     # 린트 검사
```

## Known Issues (프로젝트 고유)

- Git 원격 저장소 미설정 (GitHub에 push되지 않은 상태)
- feature/situation-based-pivot 브랜치가 18일간 방치 (2026-01-26 마지막 커밋)
- 테스트 커버리지 부족 (유닛 1개, e2e 1개)

---

*전역 설정 참조: `workspace/CLAUDE.md`*
