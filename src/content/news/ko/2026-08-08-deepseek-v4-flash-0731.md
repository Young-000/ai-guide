---
title: "DeepSeek V4-Flash-0731 재훈련 모델, 자사 프로 버전을 9개 에이전트 벤치마크에서 전부 앞서"
lang: ko
date: 2026-08-08
slug: deepseek-v4-flash-0731
summary: "DeepSeek이 7월 31일 V4-Flash-0731을 공식 출시했다. 모델 구조는 그대로 두고 포스트 트레이닝만 재작업한 결과, 자사 플래그십인 V4-Pro보다 9개 에이전트·코딩 벤치마크에서 모두 높은 점수를 기록했다."
tags: ["DeepSeek", "LLM", "에이전트", "코딩", "벤치마크"]
sources:
  - title: "DeepSeek Upgrades DeepSeek-V4-Flash-0731 with Major Agentic and Coding Gains"
    url: "https://www.marktechpost.com/2026/07/31/deepseek-upgrades-deepseek-v4-flash-0731-with-major-agentic-and-coding-gains/"
  - title: "DeepSeek Retrained V4-Flash Beats Its Flagship Pro on Nine Agent Benchmarks"
    url: "https://www.techtimes.com/articles/322513/20260731/deepseek-retrained-v4-flash-beats-its-flagship-pro-nine-agent-benchmarks.htm"
  - title: "DeepSeek-V4-Flash Goes Official: Agent Benchmarks Beat V4-Pro-Preview"
    url: "https://deepseek.ai/blog/deepseek-v4-flash-ga-agent-benchmarks"
---

**한 줄 요약**: DeepSeek이 Flash 버전의 포스트 트레이닝을 전면 재작업해 자사 Pro 대비 에이전트·코딩 성능을 대폭 끌어올렸고, Flash 가격에 Pro 이상의 성능을 제공한다.

### 핵심
- **구성**: 284B 파라미터(활성 13B MoE), 1M 토큰 컨텍스트 — 아키텍처 변경 없이 포스트 트레이닝만 교체
- **주요 벤치마크 점수**: Terminal Bench 2.1 **82.7** (Preview 61.8 → +33%), DeepSWE **54.4** (7.3 → +645%), NL2Repo **54.2** (39.4), Cybergym **76.7** (38.7)
- **가격 이점**: V4-Flash 요금으로 V4-Pro-Preview 이상의 에이전트 성능 제공
- **주의사항**: 에이전트 벤치마크는 실행 환경(harness)에 민감해 독립 재현 전까지 벤더 발표치로 간주해야 함

### 왜 중요한가
포스트 트레이닝의 변화만으로도 모델 성능이 드라마틱하게 바뀔 수 있음을 다시 한번 증명했다. Flash 요금으로 Pro급 성능을 제공한다는 점은 비용 민감 에이전트 워크로드 선택지를 바꿀 수 있다. 특히 DeepSWE(7.3→54.4)의 급상승은 소프트웨어 엔지니어링 에이전트 경쟁에서 괄목할 만한 도약이다.

### 더 보기
- [DeepSeek 공식 블로그: V4-Flash GA](https://deepseek.ai/blog/deepseek-v4-flash-ga-agent-benchmarks) — DeepSeek
- [MarkTechPost 상세 분석](https://www.marktechpost.com/2026/07/31/deepseek-upgrades-deepseek-v4-flash-0731-with-major-agentic-and-coding-gains/) — MarkTechPost
