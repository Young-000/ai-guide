---
title: "Meta, 첫 터미널 코딩 에이전트 'Muse Code' 베타 출시 — Muse Spark 1.2 모델 동시 공개"
lang: ko
date: 2026-08-06
slug: meta-muse-code-launch
summary: "Meta가 8월 5일 터미널 기반 코딩 에이전트 Muse Code(베타)와 코딩 특화 모델 Muse Spark 1.2를 동시 공개했다. 세션 전체를 유지하는 비동기 백그라운드 에이전트와 100만 토큰 컨텍스트가 특징이다."
tags: ["Meta", "코딩 에이전트", "Muse Code", "Muse Spark", "LLM"]
sources:
  - title: "Meta debuts first AI coding agent to take on Anthropic and OpenAI"
    url: "https://www.cnbc.com/2026/08/05/meta-debuts-muse-code-to-take-on-anthropic-and-openai-.html"
  - title: "Meta enters the AI coding wars with Muse Spark 1.2 and Muse Code"
    url: "https://venturebeat.com/orchestration/meta-enters-the-ai-coding-wars-with-muse-spark-1-2-and-muse-code-with-persistent-async-background-agents"
  - title: "Introducing Muse Code and Muse Spark 1.2"
    url: "https://research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2"
---

**한 줄 요약**: Meta가 Anthropic Claude·OpenAI Codex에 맞서 터미널 기반 코딩 에이전트 Muse Code를 출시하고, 이를 구동하는 코딩 특화 모델 Muse Spark 1.2를 함께 공개했다.

### 핵심
- **Muse Code**: macOS·Linux 대상 터미널 CLI(`curl -fsSL https://dev.meta.ai/install.sh | bash`), 베타 무료 제공. 계획→코드 작성→검증의 전 주기를 단일 세션에서 처리하며, 태스크별로 재생성하는 대신 세션 내내 살아있는 비동기 백그라운드 에이전트를 유지한다.
- **Muse Spark 1.2**: 100만 토큰 컨텍스트 윈도우, 코드 생성·복잡 디버깅·대형 코드베이스 이해에서 전 버전 대비 향상 보고. Muse Code 하니스와 함께 공동 학습(co-trained)됐다.
- **이벤트 로그**: 모든 모델 호출·툴 실행·편집 이력을 로컬 append-only 로그에 기록해 세션 중단 후에도 정확히 재현·재시작 가능.
- **API 제공**: Muse Spark 1.2는 Meta Model API를 통해 기업·개발자에게도 제공, 글로벌 접근 확대.

### 왜 중요한가
Anthropic의 Claude Code, OpenAI의 Codex에 이어 Meta도 코딩 에이전트 시장에 직접 뛰어들었다. 특히 에이전트를 태스크마다 새로 생성하지 않고 세션 전체를 유지하는 아키텍처는 긴 개발 작업에서 맥락 손실을 줄이는 차별점이다. Meta가 자체 코딩 에이전트를 내놓으면서 2026년 하반기 AI 코딩 시장 경쟁은 세 강자 구도로 재편될 전망이다.

### 더 보기
- [CNBC 보도](https://www.cnbc.com/2026/08/05/meta-debuts-muse-code-to-take-on-anthropic-and-openai-.html) — CNBC
- [VentureBeat 기술 분석](https://venturebeat.com/orchestration/meta-enters-the-ai-coding-wars-with-muse-spark-1-2-and-muse-code-with-persistent-async-background-agents) — VentureBeat
