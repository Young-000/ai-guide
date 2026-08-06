---
title: "DeepSeek V4-Flash 0731, 자체 플래그십 Pro 모델을 9개 에이전트 벤치마크 전부서 꺾었다"
lang: ko
date: 2026-08-06
slug: deepseek-v4-flash-0731
summary: "DeepSeek이 7월 31일 V4-Flash-0731 공식 베타를 출시했다. 284B 파라미터의 저비용 모델이 자사 플래그십 V4-Pro-Preview를 에이전트 벤치마크 9개 전부에서 앞지르며, 가격 그대로 성능만 대폭 올린 이례적 업데이트로 평가받는다."
tags: ["DeepSeek", "오픈소스", "에이전트 AI", "벤치마크", "LLM"]
sources:
  - title: "DeepSeek Retrained V4-Flash Beats Its Flagship Pro on Nine Agent Benchmarks"
    url: "https://www.techtimes.com/articles/322513/20260731/deepseek-retrained-v4-flash-beats-its-flagship-pro-nine-agent-benchmarks.htm"
  - title: "DeepSeek Upgrades DeepSeek-V4-Flash-0731 with Major Agentic and Coding Gains"
    url: "https://www.marktechpost.com/2026/07/31/deepseek-upgrades-deepseek-v4-flash-0731-with-major-agentic-and-coding-gains/"
  - title: "DeepSeek-V4-Flash Goes Official: Agent Benchmarks Beat V4-Pro-Preview"
    url: "https://deepseek.ai/blog/deepseek-v4-flash-ga-agent-benchmarks"
---

**한 줄 요약**: DeepSeek V4-Flash 0731은 아키텍처 변경 없이 포스트-트레이닝만 재수행해, 자사 플래그십 Pro 모델을 에이전트 9개 벤치마크 모두에서 능가하는 결과를 냈다.

### 핵심
- **성능 역전**: Terminal Bench 2.1에서 82.7점(V4-Pro-Preview 72.1점)으로 10점 이상 앞섰고, DeepSWE 점수는 54.4(기존 Flash Preview 7.3)로 645% 급등했다.
- **가격 동결**: 입력 토큰당 $0.14/M — 업그레이드 전과 동일. 성능 향상 비용을 개발자에게 전가하지 않았다.
- **속도**: 초당 115.9 토큰 출력, 동급 오픈웨이트 모델 중 상위권. 첫 토큰 응답(TTFT) 1.34초.
- **구조**: 284B 파라미터 MoE 모델. 아키텍처는 Flash Preview와 동일하며, 포스트-트레이닝(RL 등)만 전면 재수행.

### 왜 중요한가
'더 작고 저렴한 모델이 더 크고 비싼 모델을 에이전트 태스크에서 이긴다'는 트렌드가 다시 한번 확인됐다. 에이전트·코딩 특화 포스트-트레이닝이 모델 크기 확장보다 효율적일 수 있다는 사실은, AI 인프라 비용 압박을 받는 기업 입장에서 눈여겨볼 신호다.

### 더 보기
- [TechTimes 벤치마크 보도](https://www.techtimes.com/articles/322513/20260731/deepseek-retrained-v4-flash-beats-its-flagship-pro-nine-agent-benchmarks.htm) — TechTimes
- [DeepSeek 공식 블로그](https://deepseek.ai/blog/deepseek-v4-flash-ga-agent-benchmarks) — DeepSeek
