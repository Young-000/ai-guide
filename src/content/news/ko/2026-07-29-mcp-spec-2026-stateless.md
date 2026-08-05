---
title: "MCP 역대 최대 업데이트 — 스테이트리스 전환·엔터프라이즈 인증 강화"
lang: ko
date: 2026-07-29
slug: mcp-spec-2026-stateless
summary: "7월 28일 Model Context Protocol 2026-07-28 스펙이 출시됐다. 세션 상태를 완전히 제거하는 역대 최대 변경으로, AI 에이전트의 분산 배포와 엔터프라이즈 보안 요건을 동시에 해결한다."
tags: ["MCP", "AI 에이전트", "오픈소스", "LLM", "인증", "표준"]
sources:
  - title: "MCP just got its biggest update ever — here's what changes for AI agents"
    url: "https://venturebeat.com/infrastructure/mcp-just-got-its-biggest-update-ever-heres-what-changes-for-ai-agents"
  - title: "MCP gets an enterprise makeover"
    url: "https://www.theregister.com/ai-and-ml/2026/07/29/mcp-gets-an-enterprise-makeover/"
  - title: "The 2026-07-28 Specification"
    url: "https://blog.modelcontextprotocol.io/posts/2026-07-28/"
---

**한 줄 요약**: Agentic AI Foundation이 MCP 2026-07-28 스펙을 릴리스했다 — 세션 레이어를 완전히 제거하고, 요청별 헤더 인증으로 전환해 스케일아웃과 OAuth 보안을 동시에 강화했다.

### 핵심
- **세션 모델 삭제**: `initialize/initialized` 핸드셰이크 완전 제거, 6개 SEP(스펙 개선 제안)로 프로토콜 레이어에서 세션 상태 완전히 분리
- **요청별 헤더**: 모든 요청에 `MCP-Protocol-Version`, `Mcp-Method`, `Mcp-Name` 헤더 포함 의무화 — 어떤 서버 인스턴스도 어떤 요청이든 처리 가능
- **SEP-2468**: OAuth Mixup 공격 방어를 위해 인증 응답에 `iss`(issuer) 파라미터 검증 추가
- Agentic AI Foundation(Linux Foundation 산하): 앤트로픽·OpenAI·Google·Microsoft·Block이 플래티넘 멤버로 거버넌스에 참여

### 왜 중요한가
스테이트리스 전환으로 AI 에이전트가 사용하는 MCP 서버를 쿠버네티스 규모로 수평 확장할 수 있게 됐다 — 기존에는 '스티키 세션'을 유지해야 해서 로드밸런싱이 어려웠다. 대형 AI 기업들이 거버넌스에 참여하면서 MCP는 사실상 AI 툴 연결의 업계 표준으로 자리잡아가고 있다.

### 더 보기
- [MCP just got its biggest update ever](https://venturebeat.com/infrastructure/mcp-just-got-its-biggest-update-ever-heres-what-changes-for-ai-agents) — VentureBeat
- [The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/) — MCP 공식 블로그
