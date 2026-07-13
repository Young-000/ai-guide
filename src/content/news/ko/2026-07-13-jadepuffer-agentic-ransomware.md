---
title: "JADEPUFFER: AI 에이전트가 처음부터 끝까지 자동 수행한 세계 최초 랜섬웨어"
lang: ko
date: 2026-07-13
slug: jadepuffer-agentic-ransomware
summary: "보안 업체 Sysdig이 7월 초 공개한 JADEPUFFER는 대형 언어 모델이 침입·이동·암호화를 자율적으로 수행한 최초의 에이전트형 랜섬웨어 사례다."
tags: ["AI 보안", "랜섬웨어", "사이버보안", "LLM", "에이전트 AI"]
sources:
  - title: "JADEPUFFER: Agentic ransomware for automated database extortion"
    url: "https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion"
  - title: "JadePuffer ransomware used AI agent to automate entire attack"
    url: "https://www.bleepingcomputer.com/news/security/jadepuffer-ransomware-used-ai-agent-to-automate-entire-attack/"
  - title: "The First Ransomware Attack Run From Start To Finish By An AI Agent"
    url: "https://www.forbes.com/sites/jonmarkman/2026/07/07/the-first-ransomware-attack-run-from-start-to-finish-by-an-ai-agent/"
---

**한 줄 요약**: AI 에이전트가 침해부터 암호화까지 전 과정을 인간 개입 없이 수행한 최초의 랜섬웨어 JADEPUFFER가 Sysdig에 의해 공개됐다.

### 핵심
- Langflow의 미인증 원격 코드 실행 취약점(CVE-2025-3248)을 초기 침투 경로로 활용
- LLM 에이전트가 자격증명 탈취→권한 상승→측면 이동→지속성 확보→Nacos 서비스 설정 1,342건 암호화를 자율 실행
- 실패한 로그인 시도를 31초 안에 스스로 수정·재시도하는 실시간 적응 행동 확인
- 암호화 키가 표준 출력에만 노출되고 저장·전송되지 않아 몸값을 지불해도 복호화 불가

### 왜 중요한가
에이전트 AI가 사이버 공격의 자동화 수준을 새로운 단계로 끌어올렸다. 전문 해킹 기술 없이도 LLM 하나로 정교한 랜섬웨어 공격을 실행할 수 있다는 '기술 진입 장벽의 소멸'이 입증됐다. Sysdig은 이를 "에이전트 위협 행위자(ATA) 시대의 개막"으로 규정했다.

### 더 보기
- [JADEPUFFER: Agentic ransomware for automated database extortion](https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion) — Sysdig
- [JadePuffer ransomware used AI agent to automate entire attack](https://www.bleepingcomputer.com/news/security/jadepuffer-ransomware-used-ai-agent-to-automate-entire-attack/) — BleepingComputer
- [The First Ransomware Attack Run From Start To Finish By An AI Agent](https://www.forbes.com/sites/jonmarkman/2026/07/07/the-first-ransomware-attack-run-from-start-to-finish-by-an-ai-agent/) — Forbes
