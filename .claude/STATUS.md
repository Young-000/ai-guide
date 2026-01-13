# Project: ai-guide

## Overview
- **Name**: AI Guide
- **Description**: 상황 기반 AI 가이드 서비스
- **Tech Stack**: Next.js + React + TypeScript
- **Repository**: local

## Status
- **Current Status**: 🟡 In Progress
- **Progress**: 70%
- **Priority**: Medium
- **Last Updated**: 2026-01-13 10:00:00

## Infrastructure

### Deployment
| Environment | Status | URL | Platform |
|-------------|--------|-----|----------|
| Production | 🟢 Deployed | [ai-guide-nu.vercel.app](https://ai-guide-nu.vercel.app) | Vercel |
| Staging | ⚪ Not Set | - | - |
| Development | 🟢 Running | localhost:3000 | Local |

### Database
| Type | Status | Provider | Notes |
|------|--------|----------|-------|
| Primary | ⚪ Not Required | - | JSON 기반 정적 데이터 |

### External Services
| Service | Status | Purpose |
|---------|--------|---------|
| AI API | ⚪ Not Required | 현재 정적 가이드 제공 |

### Completion
| Category | Progress | Notes |
|----------|----------|-------|
| Features | 80% | 핵심 기능 구현 완료 |
| Tests | 30% | 검색 로직 테스트 추가됨 |
| Docs | 30% | WARP.md 추가 |
| CI/CD | 🟢 | GitHub Actions 설정됨 |

## Git Statistics
- **Total Commits**: 5
- **Last Commit**: 2026-01-12
- **Last Commit Message**: fix: taskToSituationMap 매핑 상황이 난이도 필터 우회하도록 수정
- **Current Branch**: feature/situation-based-pivot
- **Uncommitted Changes**: 0 files

## Build Status
- **Lint**: ✅ 통과
- **Build**: ✅ 성공 (32개 페이지)
- **Type Check**: ✅ 통과

## Implementation Status

### Completed
- [x] 프로젝트 초기 설정
- [x] 상황 기반 피벗 설계
- [x] 상황 검색 기능 (자연어 + 카테고리 필터)
- [x] 설문 위저드 (6단계 맞춤 추천)
- [x] 가이드 패널 (단계별 안내 + 프롬프트 복사)
- [x] 도구 상세 페이지 (21개 AI 도구)
- [x] 반응형 UI (모바일 패널)
- [x] Vercel 배포
- [x] E2E 테스트 환경 구축

### In Progress
- [ ] 코드 품질 개선 (Critical 이슈 수정)

### Pending (우선순위 순)
| 우선순위 | 작업 | 설명 |
|:--------:|------|------|
| Critical | setTimeout 메모리 누수 수정 | SurveyWizard.tsx - 언마운트 시 정리 |
| Critical | 중복 로직 리팩토링 | SurveyWizard.tsx - 결과 계산 로직 통합 |
| Warning | useCallback 적용 | page.tsx - 핸들러 최적화 |
| Warning | 미사용 상태 정리 | page.tsx - surveyResult 상태 |
| Warning | 접근성 개선 | ESC 키 모달 닫기 |
| Low | 테스트 커버리지 확대 | 컴포넌트 테스트 추가 |

## Code Review Summary (2026-01-13)

| 구분 | 개수 | 파일 |
|------|:----:|------|
| Critical | 2 | SurveyWizard.tsx |
| Warning | 7 | page.tsx, surveyLogic.ts 등 |
| Suggestion | 3 | GuidePanel.tsx 등 |

## Notes
- 핵심 기능 구현 완료, 코드 품질 개선 단계
- feature 브랜치에서 개발 중
- main 머지 전 Critical 이슈 해결 필요

---
*Auto-updated on git commit*
