---
title: "Claude Mythos, 한 달 만에 오픈소스 1만여 보안 취약점 발견"
lang: ko
date: 2026-06-21
slug: project-glasswing-10k-vulns
summary: "Anthropic의 Project Glasswing을 통해 Claude Mythos 모델이 주요 오픈소스 소프트웨어에서 1만 건 이상의 고위험·치명적 취약점을 식별했다. 90% 이상이 실제 취약점으로 검증됐다."
tags: ["Anthropic", "Claude", "보안", "사이버보안", "Glasswing"]
sources:
  - title: "Project Glasswing: An initial update"
    url: "https://www.anthropic.com/research/glasswing-initial-update"
  - title: "Claude Mythos AI Finds 10,000 High-Severity Flaws in Widely Used Software"
    url: "https://thehackernews.com/2026/05/claude-mythos-ai-finds-10000-high.html"
---

**한 줄 요약**: Anthropic의 Claude Mythos 모델이 Project Glasswing을 통해 오픈소스 1,000개 이상의 프로젝트를 스캔하고, 한 달 만에 1만 건 이상의 고위험 취약점을 발견했다.

### 핵심
- 오픈소스 1,000개+ 프로젝트 스캔 → 2만 3,019건 문제 식별, 이 중 6,202건이 고위험·치명적 등급
- 독립 보안 기관 6곳이 검토한 1,752건 중 90% 이상이 실제 취약점으로 확인 (낮은 오탐률)
- wolfSSL(수십억 대 기기에 탑재된 암호화 라이브러리)에서 가짜 은행 사이트 인증서를 위조할 수 있는 제로데이 취약점 발견·익스플로잇 코드까지 생성
- Anthropic은 미국 및 동맹국 정부와 협력해 Glasswing을 확대할 계획이나, Mythos 급 모델의 일반 공개는 더 강력한 안전장치 마련 후로 미룸

### 왜 중요한가
AI가 기존 보안 도구보다 빠르고 광범위하게 제로데이 취약점을 탐지할 수 있음이 실증됐다. 동시에, 동일한 모델이 공격에 악용될 경우의 위험도 부각돼 AI 보안 통제의 중요성을 재확인시켰다.

### 더 보기
- [Anthropic 공식 업데이트](https://www.anthropic.com/research/glasswing-initial-update) — Anthropic
- [The Hacker News 보도](https://thehackernews.com/2026/05/claude-mythos-ai-finds-10000-high.html) — The Hacker News
