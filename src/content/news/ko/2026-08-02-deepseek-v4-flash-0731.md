---
title: "DeepSeek V4-Flash 정식 출시: Pro보다 높은 에이전트 성능, 토큰당 $0.14/M"
lang: ko
date: "2026-08-02"
slug: deepseek-v4-flash-0731
summary: "DeepSeek가 7월 31일 V4-Flash-0731을 정식 출시했다. 자사 플래그십 Pro-Preview 대비 9개 에이전트·코딩 벤치마크 전승, 가격은 입력 기준 $0.14/M 토큰."
tags: ["DeepSeek", "LLM", "모델출시", "에이전트", "오픈소스"]
sources:
  - title: "DeepSeek Retrained V4-Flash Beats Its Flagship Pro on Nine Agent Benchmarks"
    url: "https://www.techtimes.com/articles/322513/20260731/deepseek-retrained-v4-flash-beats-its-flagship-pro-nine-agent-benchmarks.htm"
  - title: "DeepSeek V4 Flash: Benchmarks, Pricing & Verdict"
    url: "https://www.cosmicjs.com/blog/deepseek-v4-flash-benchmarks-pricing"
---

**한 줄 요약**: DeepSeek가 7월 31일 V4-Flash-0731을 정식 출시했다. Preview 대비 에이전트·코딩 벤치마크를 대폭 향상시켜 자사 Pro-Preview를 전 항목 제쳤으며, API 엔드포인트는 그대로 유지된다.

### 핵심
- **벤치마크 역전**: Terminal Bench 2.1에서 82.7점으로 Pro-Preview(72.1)를 10점 이상 앞섬. DeepSWE 54.4(이전 7.3), DSBench-FullStack 68.7(이전 37.0) — 에이전트 작업 전 항목 승.
- **구조 동일, 재학습만**: 284B/13B MoE 아키텍처 그대로, Post-training만 재실시. 기존 `deepseek-v4-flash` 엔드포인트 사용자는 코드 변경 없이 즉시 업그레이드.
- **가격**: 입력 $0.14/M(캐시 미스), 캐시 히트 $0.003/M, 출력 $0.28/M — 프런티어급 에이전트 성능치고 매우 저렴.
- **주의**: 7월 31일 기준 독립 기관의 수치 재현 미확인 — 모두 자체 발표 수치.

### 왜 중요한가
Pro 모델보다 빠르고 저렴한 Flash가 에이전트 벤치마크에서도 앞선다면, 대규모 에이전트 배포에서 비용-성능 최적점이 다시 재정의된다. 오픈소스 진영이 비용 효율 면에서 계속 프런티어를 압박하고 있다는 신호다.

### 더 보기
- [TechTimes 벤치마크 분석](https://www.techtimes.com/articles/322513/20260731/deepseek-retrained-v4-flash-beats-its-flagship-pro-nine-agent-benchmarks.htm) — TechTimes
- [가격·벤치마크 종합](https://www.cosmicjs.com/blog/deepseek-v4-flash-benchmarks-pricing) — CosmicJS
