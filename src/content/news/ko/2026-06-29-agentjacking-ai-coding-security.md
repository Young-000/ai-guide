---
title: "'에이전트재킹(Agentjacking)' 신종 공격 공개 — AI 코딩 에이전트 85% 익스플로잇 성공"
lang: ko
date: 2026-06-29
slug: agentjacking-ai-coding-security
summary: "AI 코딩 에이전트를 노리는 신종 공격 기법 '에이전트재킹(Agentjacking)'이 공개됐다. 가짜 오류 보고서 안에 마크다운 인젝션을 심는 방식으로 에이전트를 조작하며, 테스트에서 85% 익스플로잇 성공률을 기록하고 2,388개 조직이 잠재적 영향권에 포함된다고 알려졌다."
tags: ["AI보안", "에이전트", "사이버보안", "마크다운인젝션", "AI코딩"]
sources:
  - title: "Agentjacking attack tricks AI coding agents"
    url: "https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html"
  - title: "Agentjacking: AI coding agents, Sentry"
    url: "https://thenextweb.com/news/agentjacking-ai-coding-agents-sentry"
---

**한 줄 요약**: 공격자가 가짜 에러 메시지 안에 숨긴 마크다운 명령으로 AI 코딩 에이전트를 하이재킹하는 '에이전트재킹' 기법이 새롭게 공개됐다.

### 핵심
- **공격 방식**: 위조 오류 보고서(fake error report)에 마크다운 인젝션을 삽입 → AI 에이전트가 합법적 디버깅 지침으로 오해하고 실행
- **성공률**: 연구 테스트에서 **85% 익스플로잇 달성**
- **영향 범위**: **2,388개 조직** 잠재적 노출 — 오픈소스 에코시스템과 공개 이슈 트래커 경유 확산 가능
- 특히 Sentry 등 에러 추적 플랫폼 연동 에이전트가 주요 공격 벡터로 지목

### 왜 중요한가
AI 코딩 에이전트 도입이 빠르게 늘면서 새로운 공격 표면이 열렸다. 에이전트재킹은 코드 실행 권한을 가진 에이전트를 장악하면 자격증명 탈취·악성코드 삽입·공급망 오염이 모두 가능하다는 점에서 위협 등급이 높다. 개발팀은 지금 당장 에이전트에 입력되는 외부 콘텐츠(이슈·오류 메시지)에 대한 샌드박싱과 검증 절차를 검토해야 한다.

### 더 보기
- [Agentjacking attack tricks AI coding agents](https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html) — The Hacker News
- [Agentjacking explained: Sentry and AI agents](https://thenextweb.com/news/agentjacking-ai-coding-agents-sentry) — The Next Web
