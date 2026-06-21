---
title: "AI 코딩 에이전트 신종 공격 '에이전트재킹' — 가짜 버그 리포트 하나로 개발자 PC 장악"
lang: ko
date: 2026-06-21
slug: agentjacking-coding-agent-security
summary: "보안업체 Tenet Security가 AI 코딩 에이전트를 하이재킹하는 '에이전트재킹(Agentjacking)' 공격 기법을 공개했다. 공격자는 공개 Sentry DSN을 통해 조작된 오류 리포트를 주입해 에이전트가 악성 코드를 개발자 권한으로 실행하게 만든다."
tags: ["보안", "AI 에이전트", "Sentry", "개발자", "취약점"]
sources:
  - title: "Agentjacking Attack Tricks AI Coding Agents Into Running Malicious Code"
    url: "https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html"
  - title: "Agentjacking: a fake bug report can hijack your AI coding agent"
    url: "https://thenextweb.com/news/agentjacking-ai-coding-agents-sentry"
---

**한 줄 요약**: AI 코딩 에이전트가 Sentry 오류 리포트를 무조건 신뢰한다는 허점을 노린 '에이전트재킹' 공격이 공개됐다.

### 핵심
- Tenet Security가 6월 3일 Sentry에 신고·공개한 공격 기법으로, 공격자는 **공개 DSN(Data Source Name)** 만으로 조작된 오류 이벤트를 심을 수 있다
- AI 에이전트가 "버그를 고쳐달라"는 요청을 받으면 해당 오류 데이터를 신뢰된 컨텍스트로 읽어들여 **공격자 코드를 개발자 권한으로 실행**
- 통제된 테스트에서 **2,388개 조직** 노출 확인, 100개 이상 에이전트가 주입된 명령에 반응 — Fortune 100 기업 포함
- 탈취 가능한 정보: 환경 변수, Git 자격증명, 비공개 저장소 URL

### 왜 중요한가
이 공격의 핵심은 취약점 해킹이 아니라 **AI 에이전트의 신뢰 모델 자체를 악용**한다는 점이다. Sentry가 콘텐츠 필터를 추가했지만 "에이전트가 외부 입력을 명령어로 해석한다"는 근본 문제는 해결되지 않았다. Cursor·GitHub Copilot 등 광범위하게 쓰이는 코딩 에이전트 사용자는 지금 당장 Sentry 연동 설정을 점검해야 한다.

### 더 보기
- [Agentjacking Attack Tricks AI Coding Agents](https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html) — The Hacker News
- [Agentjacking: a fake bug report can hijack your AI coding agent](https://thenextweb.com/news/agentjacking-ai-coding-agents-sentry) — The Next Web
