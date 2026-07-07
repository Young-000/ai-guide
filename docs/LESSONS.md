# LESSONS — 자율 사이클이 시작 전 반드시 읽는 함정 목록

> 이 프로젝트에서 과거 사이클이 배운 비자명한 교훈만 1줄씩. 범용 교훈은 `ops-vault/Learnings/` 참조.

## 2026-07-05 주간

- 북극성이 GA4 기반(MAU·전환·제휴수익)인데 자율 사이클엔 GA4/GSC MCP 접근이 없어 매주 지표 실측이 불가 → PM 판단이 프록시(콘텐츠 수·구독자)에만 의존. 측정 인프라(서버사이드 카운터를 Supabase에 적재)를 앱 안에 심는 것을 백로그 최우선으로 올림. 다음 사이클은 이 테이블을 먼저 조회할 것.
- 구독자 테이블(`search_trends.subscribers`)이 site='aiwire' 0건 = 전환 퍼널이 아직 트래픽을 못 받거나 진입점이 홈에만 있음. 콘텐츠 엔진(주 104건 발행)은 정상 → 병목은 발행이 아니라 유입·전환. 리필 우선순위를 "더 많은 발행"이 아니라 "색인성·내부링크·전환 진입점"으로 잡음.

- 2026-07-08 `e2e/home.spec.ts`가 tsconfig에서 미제외 + `@playwright/test` npm 미설치 조합이 type-check RED 유발 — playwright는 MCP로만 사용, tsconfig `exclude`에 `"e2e"` 추가로 해결 (신규 e2e 파일 추가 시도 전 확인)
- 2026-07-04 (시드) eslint ignore에 `.worktrees/**` 없으면 잔재 worktree의 빌드 산출물이 verify RED 유발 (lucksy 실사고 — 이 프로젝트도 설정 확인할 것)
