# AI Guide 기술 리뷰 결과

> 리뷰 날짜: 2026-01-20
> 상태: ✅ 완료

---

## 1. Frontend 리뷰

### 아키텍처 (양호)

| 항목 | 평가 | 설명 |
|------|:----:|------|
| **Next.js App Router** | ✅ | 적절한 라우팅 구조 |
| **컴포넌트 분리** | ✅ | 재사용 가능한 컴포넌트 분리 |
| **타입 안전성** | ✅ | 모든 타입 정의 완료 |

### 개선 완료 사항

#### Critical - setTimeout cleanup 누락

**위치**: `src/app/situations/[slug]/page.tsx`, `src/components/GuidePanel.tsx`, `src/components/ProgressStepper.tsx`

```typescript
// 문제 코드
setTimeout(() => setCopiedIndex(null), 2000); // cleanup 없음
```

**해결**: `useRef`와 `useEffect`로 cleanup 패턴 적용

**상태**: ✅ 수정 완료

#### Medium - 중복 코드

**위치**: `GuidePanel.tsx`, `situations/[slug]/page.tsx`

```typescript
const getToolInfo = (slug: string) => tools.find((t) => t.slug === slug);
```

**해결**: `src/lib/tools.ts`로 유틸리티 함수 분리 (`getToolBySlug`)

**상태**: ✅ 수정 완료

---

## 2. Backend 리뷰

### 현재 상태

- 순수 정적 사이트 (SSG)
- API Routes 미사용
- `generateStaticParams` 활용 빌드 최적화

### 개선 계획

향후 사용자 데이터 영속화를 위해 Supabase 연동 예정 (Phase 2)

---

## 3. Logic 리뷰

### 핵심 로직 파일

| 파일 | 역할 | 평가 |
|------|------|:----:|
| `src/lib/search.ts` | 상황 검색 | ✅ |
| `src/lib/surveyLogic.ts` | 설문 추천 | ✅ |
| `src/lib/synonyms.ts` | 동의어 확장 | ✅ |
| `src/lib/tools.ts` | 도구 유틸리티 | ✅ (신규) |
| `src/lib/levelSystem.ts` | 레벨 시스템 | ✅ (신규) |
| `src/lib/progress.ts` | 진도 관리 | ✅ (신규) |

---

## 4. DB 관점 리뷰

### 현재 상태

- JSON 파일 기반 정적 데이터
- LocalStorage 기반 사용자 진도 저장
- Supabase 미연동

### 데이터 파일

```
src/data/
├── situations.json   # 상황 데이터
├── tools.json        # 도구 데이터
├── survey.json       # 설문 데이터
├── glossary.json     # 용어 사전
├── compare.json      # 도구 비교
└── trends.json       # 트렌드
```

### LocalStorage 스키마

```typescript
// ai-guide-progress
{
  completedSituations: string[];      // 완료한 상황 slug
  completedSteps: Record<string, number[]>; // 상황별 완료 스텝
  totalXp: number;                    // 총 XP
  currentLevel: number;               // 현재 레벨
  lastVisit: string;                  // 마지막 방문
  isOnboarded: boolean;               // 온보딩 완료 여부
}
```

---

## 5. 비즈니스 개선 - AI 레벨업 시스템

### Phase 1: 초심자 경험 강화 ✅ 구현 완료

- [x] 온보딩 모달 (4단계 인트로)
- [x] 로컬스토리지 진도 저장
- [x] 완료 체크 시스템 (스텝별 XP 획득)
- [x] 레벨 시스템 v1 (5단계 레벨)
- [x] 헤더 레벨 뱃지 표시
- [x] 실시간 XP 업데이트

### 레벨 정의

| 레벨 | 타이틀 | 아이콘 | XP 범위 |
|:----:|--------|:------:|---------|
| 1 | AI 새싹 | 🌱 | 0-99 |
| 2 | AI 탐험가 | 🔍 | 100-299 |
| 3 | AI 실험가 | 🧪 | 300-599 |
| 4 | AI 숙련자 | ⚡ | 600-999 |
| 5 | AI 마스터 | 🏆 | 1000+ |

### XP 보상 체계

| 행동 | XP |
|------|---:|
| 첫 방문 (온보딩 완료) | +10 |
| 스텝 1개 완료 | +10 |
| 상황 전체 완료 보너스 | +30 |

### 신규 구현 파일

| 파일 | 설명 |
|------|------|
| `src/lib/levelSystem.ts` | 레벨 계산, XP 관리 로직 |
| `src/lib/progress.ts` | 진도 관리자 클래스 |
| `src/components/OnboardingModal.tsx` | 온보딩 UI (4단계) |
| `src/components/LevelBadge.tsx` | 레벨 뱃지 컴포넌트 |
| `src/components/ProgressStepper.tsx` | XP 연동 스테퍼 (업데이트) |
| `src/components/Header.tsx` | 레벨 뱃지 표시 (업데이트) |

---

## 6. Playwright 테스트 결과

### 테스트 항목

| 기능 | 결과 |
|------|:----:|
| 온보딩 모달 표시 | ✅ |
| 온보딩 스텝 진행 | ✅ |
| 온보딩 완료 후 레벨 뱃지 표시 | ✅ |
| 검색 기능 | ✅ |
| 가이드 패널 표시 | ✅ |
| 스텝 클릭 시 XP 획득 | ✅ |
| 실시간 XP 업데이트 | ✅ |
| 전체 스텝 완료 시 보너스 XP | ✅ |
| 완료된 스텝 재클릭 방지 | ✅ |

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-01-20 | 초기 리뷰 및 개선 시작 |
| 2026-01-20 | Critical 이슈 수정 완료 (setTimeout cleanup) |
| 2026-01-20 | Medium 이슈 수정 완료 (중복 코드 분리) |
| 2026-01-20 | AI 레벨업 시스템 설계 및 구현 |
| 2026-01-20 | Playwright MCP 테스트 완료 |
| 2026-01-20 | 최종 리뷰 완료 |
