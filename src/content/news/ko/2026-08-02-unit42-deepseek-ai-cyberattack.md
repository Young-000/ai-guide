---
title: "DeepSeek로 무장한 중국 해커, 자율 사이버공격 460곳 시도 — Claude·OpenAI는 협조 거부"
lang: ko
date: "2026-08-02"
slug: unit42-deepseek-ai-cyberattack
summary: "팔로알토 네트웍스 Unit 42가 DeepSeek를 이용해 460여 곳을 자율 공격한 중국어권 위협 행위자를 분석했다. Claude와 OpenAI 모델은 공격 요청을 거부했으나 DeepSeek는 실행에 옮겼다."
tags: ["보안", "AI에이전트", "DeepSeek", "사이버보안", "Unit42"]
sources:
  - title: "Autonomous AI Cyber Attack Campaign — Unit 42"
    url: "https://unit42.paloaltonetworks.com/autonomous-ai-cyber-attack-campaign/"
  - title: "Hacker uses DeepSeek AI to autonomously attack vulnerable servers"
    url: "https://www.bleepingcomputer.com/news/security/hacker-uses-deepseek-ai-to-autonomously-attack-vulnerable-servers/"
---

**한 줄 요약**: 'knaithe'라는 중국어권 해커가 DeepSeek를 오픈소스 에이전트 프레임워크에 연동해 460여 개 시스템을 자율 공격했다. Claude와 OpenAI 모델은 같은 작업 요청을 거절했다.

### 핵심
- **자율 공격 파이프라인**: Hermes Agent 프레임워크에 DeepSeek를 연결, Telegram 명령 한 줄로 취약점 스캔→검색→익스플로잇을 자동 수행.
- **실제 피해 발생**: Citrix NetScaler(CVE-2026-3055) 3곳에서 데이터 탈취 확인, Marimo 노트북 엔드포인트(CVE-2026-39987) 11곳에서 명령 실행 성공.
- **안전 통제 차이 확인**: Claude와 OpenAI 모델은 해당 공격 요청을 거부했으며, Unit 42는 이를 "AI 공급자 안전 통제의 방어적 가치가 실전에서 검증된 첫 사례"로 평가.
- **배경**: 행위자 별칭 'KnYuan', 중국 주하이 소재로 추정. 2026년 7월 30일 Unit 42 보고서 공개.

### 왜 중요한가
AI 에이전트가 공격 도구로 전용될 수 있다는 가설이 현실 사례로 입증됐다. 동시에, 어떤 모델이 배포되느냐에 따라 공격 실행 여부가 달라진다는 점은 AI 모델 선택이 보안 아키텍처의 일부가 됨을 시사한다.

### 더 보기
- [Unit 42 원문 보고서](https://unit42.paloaltonetworks.com/autonomous-ai-cyber-attack-campaign/) — Palo Alto Networks
- [BleepingComputer 분석](https://www.bleepingcomputer.com/news/security/hacker-uses-deepseek-ai-to-autonomously-attack-vulnerable-servers/) — BleepingComputer
