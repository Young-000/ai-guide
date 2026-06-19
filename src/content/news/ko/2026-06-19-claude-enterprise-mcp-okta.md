---
title: "Claude 엔터프라이즈, Okta 연동 MCP 커넥터 관리자 중앙 프로비저닝 기능 출시"
lang: ko
date: 2026-06-19
slug: claude-enterprise-mcp-okta
summary: "Anthropic이 Claude 엔터프라이즈에 관리자 중앙 MCP 커넥터 인증 기능을 베타 출시했다. Okta를 통해 조직 전체 MCP 연결을 한 번에 설정하면, 임직원은 첫 로그인 시 자동으로 Asana·Atlassian·Figma 등 도구에 접근할 수 있다."
tags: ["Anthropic", "Claude", "엔터프라이즈", "MCP", "Okta", "보안", "ID관리"]
sources:
  - title: "Centrally manage authorization for MCP connectors"
    url: "https://claude.com/blog/enterprise-managed-auth"
  - title: "Okta becomes a featured identity provider for Claude Enterprise"
    url: "https://www.okta.com/en-ca/newsroom/press-releases/okta-becomes-a-featured-identity-provider-powering-secure-ai-agent-connections-for-claude-enterprise/"
---

**한 줄 요약**: Claude 엔터프라이즈 Team·Enterprise 플랜에서 IT 관리자가 Okta로 MCP 커넥터를 조직 전체에 한 번에 설정하면, 직원들은 별도 인증 없이 첫 로그인 시 자동으로 업무 도구에 연결된다.

### 핵심
- **작동 방식**: 관리자가 Okta IdP에서 커넥터 프로비저닝 → 임직원은 Claude 첫 로그인 시 자동으로 접근 권한 부여, 추가 OAuth 절차 없음
- **지원 커넥터**: Asana, Atlassian, Canva, Figma, Granola, Linear, Supabase (베타); Slack 곧 추가 예정
- **범위**: Claude 채팅, Claude Code, Claude Cowork 모두 동일 인증 적용
- **보안**: IdP 그룹/역할 기반으로 접근 범위 자동 결정; 업무-개인 계정 혼용 방지 강제 설정 가능; Ramp는 임직원 2,000명 제로 추가 작업으로 배포 완료

### 왜 중요한가
대규모 조직에서 AI 에이전트가 외부 도구에 접근하는 과정의 최대 병목은 "누가 어떤 권한으로 연결되는가"였다. 관리자 중앙 프로비저닝은 IT 보안 정책과 AI 에이전트 배포를 동기화해, 기업 전반에 Claude 기반 자동화를 롤아웃하는 속도를 대폭 높일 수 있다.

### 더 보기
- [Centrally manage authorization for MCP connectors](https://claude.com/blog/enterprise-managed-auth) — Claude 공식 블로그
- [Okta becomes featured identity provider for Claude Enterprise](https://www.okta.com/en-ca/newsroom/press-releases/okta-becomes-a-featured-identity-provider-powering-secure-ai-agent-connections-for-claude-enterprise/) — Okta 뉴스룸
