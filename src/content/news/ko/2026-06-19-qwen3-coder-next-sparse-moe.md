---
title: "알리바바, Qwen3-Coder-Next 공개 — 80B 파라미터에 3B만 활성화, SWE-Bench 70.6%"
lang: ko
date: 2026-06-19
slug: qwen3-coder-next-sparse-moe
summary: "알리바바가 오픈소스 코딩 특화 MoE 모델 Qwen3-Coder-Next를 공개했다. 총 800억 파라미터 중 추론 시 30억만 활성화하는 초희소 구조로, 동급 밀집 모델 대비 처리량이 최대 10배 높다."
tags: ["Qwen", "알리바바", "오픈소스", "코딩AI", "MoE", "LLM"]
sources:
  - title: "Qwen3-Coder-Next offers vibe coders a powerful open source, ultra-sparse model"
    url: "https://venturebeat.com/technology/qwen3-coder-next-offers-vibe-coders-a-powerful-open-source-ultra-sparse"
  - title: "Qwen3-Coder-Next: Pushing Small Hybrid Models"
    url: "https://qwen.ai/blog?id=qwen3-coder-next"
---

**한 줄 요약**: 알리바바가 800억 파라미터 중 30억만 활성화하는 초희소 MoE 코딩 모델을 오픈소스로 공개해, 소규모 GPU로도 대형 모델 수준의 코딩 성능을 구현했다.

### 핵심
- **아키텍처**: 총 80B 파라미터, 추론 시 활성 파라미터 3B — 동급 밀집 모델 대비 처리량 최대 10배
- **성능**: SWE-Bench Verified 70.6%, Claude Opus 4.5를 보안 코드 생성 벤치마크에서 앞서
- **맥락 길이**: 최대 100만 토큰 지원, 370개 이상 프로그래밍 언어 커버
- **라이선스**: Apache 2.0 — 상업 이용·파인튜닝 자유

### 왜 중요한가
3B 수준의 연산 비용으로 70B+ 밀집 모델과 맞먹는 코딩 성능을 내는 모델이 완전 오픈소스로 나온 것은 비용 장벽이 낮아지는 신호다. 폐쇄형 유료 코딩 모델에 대한 오픈소스 대안이 실용적 수준에 도달했다는 점에서, 엔터프라이즈 코딩 AI 시장의 지형을 바꿀 수 있다.

### 더 보기
- [Qwen3-Coder-Next: ultra-sparse open source model](https://venturebeat.com/technology/qwen3-coder-next-offers-vibe-coders-a-powerful-open-source-ultra-sparse) — VentureBeat
- [Qwen3-Coder-Next 공식 블로그](https://qwen.ai/blog?id=qwen3-coder-next) — Qwen AI
