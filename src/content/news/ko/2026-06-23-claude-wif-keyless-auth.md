---
title: "Anthropic, Claude API 'Keyless 인증' 정식 출시 — 정적 API 키 대신 OIDC 토큰"
lang: ko
date: 2026-06-23
slug: claude-wif-keyless-auth
summary: "Anthropic의 Workload Identity Federation(WIF)이 정식 출시됐다. 노출·분실 위험이 있는 정적 sk-ant-* API 키 대신 수명이 짧은 OIDC 토큰으로 Claude API를 인증할 수 있어 엔터프라이즈 보안이 크게 강화된다."
tags: ["Anthropic", "Claude", "보안", "API", "인증", "엔터프라이즈"]
sources:
  - title: "Workload Identity Federation is now generally available on the Claude Platform"
    url: "https://claude.com/blog/workload-identity-federation"
  - title: "Anthropic Workload Identity Federation: What It Gets Right – and What It Still Doesn't Solve"
    url: "https://securityboulevard.com/2026/06/anthropic-workload-identity-federation-what-it-gets-right-and-what-it-still-doesnt-solve/"
---

**한 줄 요약**: Anthropic이 Claude API 인증을 위한 Workload Identity Federation(WIF)을 정식 출시 — 정적 API 키 없이 기업 기존 IdP에서 발급하는 단기 토큰으로 대체한다.

### 핵심
- **지원 IdP**: AWS IAM, Google Cloud, GitHub Actions, Kubernetes, SPIFFE, Microsoft Entra ID, Okta 등 표준 OIDC 발급기관 전반
- 토큰 수명은 **분(分) 단위** — 기존 sk-ant-* 키처럼 영구 유효한 자격증명을 만들·저장·교체·유출할 필요 없음
- **Admin API**로 연동 규칙(Issuer·서비스 계정·Federation Rule) 프로그래밍 방식으로 관리 가능 → 대규모 운용 조직에 적합
- 기존 API 키와 **병행 운용** 지원 — 워크로드 단위로 점진적 마이그레이션 가능

### 왜 중요한가
AI 에이전트가 프로덕션 워크플로에 깊이 통합될수록 자격증명 관리가 새로운 공격 벡터가 된다. WIF는 "절대 만료되지 않는 키"라는 가장 흔한 구성 오류를 제거해 제로 트러스트 아키텍처와 Claude를 자연스럽게 연결한다.

### 더 보기
- [WIF 정식 출시 공식 발표](https://claude.com/blog/workload-identity-federation) — Anthropic
- [WIF 보안 분석](https://securityboulevard.com/2026/06/anthropic-workload-identity-federation-what-it-gets-right-and-what-it-still-doesnt-solve/) — Security Boulevard
