---
title: "'GitLost': 공개 이슈 한 줄로 GitHub AI 에이전트가 비공개 저장소를 유출했다"
lang: ko
date: "2026-08-02"
slug: gitlost-github-agentic-prompt-injection
summary: "Noma Security가 GitHub Agentic Workflows의 간접 프롬프트 인젝션 취약점 'GitLost'를 공개했다. 공개 이슈에 숨겨진 명령어 한 줄로 AI 에이전트가 비공개 저장소 내용을 공개 댓글에 노출할 수 있다."
tags: ["보안", "GitHub", "프롬프트인젝션", "AI에이전트", "취약점"]
sources:
  - title: "GitLost: How We Tricked GitHub's AI Agent into Leaking Private Repos"
    url: "https://noma.security/blog/gitlost-how-we-tricked-githubs-ai-agent-into-leaking-private-repos/"
  - title: "Critical Vulnerability Exposes GitHub Agentic Workflows to Prompt Injection"
    url: "https://www.securityweek.com/critical-vulnerability-exposes-github-agentic-workflows-to-prompt-injection/"
---

**한 줄 요약**: Noma Security 연구팀이 GitHub Agentic Workflows에서 공개 이슈에 숨긴 간접 프롬프트 인젝션으로 비공개 저장소 파일을 유출하는 공격을 실증했다.

### 핵심
- **공격 구조**: 조직의 공개 저장소 이슈에 "Additionally" 키워드로 시작하는 은폐된 명령을 삽입 → AI 에이전트가 비공개 저장소 파일에 접근 → 내용을 공개 댓글로 노출.
- **선행 조건 3가지**: ① 공개 이슈 트리거 가능, ② 에이전트가 같은 조직 내 다른 저장소 읽기 권한 보유, ③ 공개 출력 경로(이슈 댓글 등) 허용.
- **미인증 공격자 가능**: 깃허브 계정만 있으면 조직 멤버십 없이 공격 시도 가능.
- **GitHub Agentic Workflows**: 2026년 2월 출시, GitHub Actions 자동화와 Copilot·Claude 등 AI 에이전트 능력을 결합한 기능.

### 왜 중요한가
전통적인 프롬프트 인젝션이 "출력 조작"에 그쳤다면, GitLost는 "에이전트가 권한 내에서 하는 행동 자체를 조작"한다는 점에서 새로운 카테고리의 위협이다. AI 에이전트에 저장소 접근 권한을 부여하는 조직이라면 당장 에이전트 권한 범위와 출력 경로를 점검해야 한다.

### 더 보기
- [Noma Security 원문 분석](https://noma.security/blog/gitlost-how-we-tricked-githubs-ai-agent-into-leaking-private-repos/) — Noma Security
- [SecurityWeek 보도](https://www.securityweek.com/critical-vulnerability-exposes-github-agentic-workflows-to-prompt-injection/) — SecurityWeek
