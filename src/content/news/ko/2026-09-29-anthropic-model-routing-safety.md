---
title: "Anthropic, '고위험' 요청은 Sonnet 5로 재라우팅한다"
lang: ko
date: 2026-09-29
slug: anthropic-model-routing-safety
summary: "사용자가 Claude Sonnet 5.5를 골라도, Anthropic이 '위험이 높다'고 판단한 요청은 이전 모델인 Sonnet 5로 자동 전달될 수 있다는 보도가 나왔다."
tags: ["Anthropic", "Claude", "LLM", "AI Safety"]
sources:
  - title: "You picked Claude Sonnet 5.5 — but Anthropic may send your request to Sonnet 5 in \"higher risk\" situations"
    url: "https://news.google.com/rss/articles/CBMiZEFVX3lxTE5QdUdYcFVOQVowNWRBZEVGX09WRWdqd0pQZGoxY2hJeEdMaU9Cbk5sbEo5a1FQZTNDd3o4RWRfLXNpZHZNcGFzVVJZWGhpQnFvR2hTWTViM0R0amRCMlAxT0daMTQ?oc=5"
---

**한 줄 요약**: 사용자가 Claude Sonnet 5.5를 지정해도 '고위험' 상황으로 판단되면 Anthropic이 요청을 이전 모델 Sonnet 5로 넘길 수 있다는 보도가 나왔다.

### 핵심
- The New Stack에 따르면, 선택한 모델과 실제 처리 모델이 항상 일치하지 않을 수 있다.
- 트리거는 '더 높은 위험(higher risk)'으로 분류된 요청으로 알려졌으며, 안전 정책의 일부로 보인다.
- 개발자가 API에서 모델을 명시해도 내부 라우팅이 개입할 여지가 있다는 점이 쟁점이다.

### 왜 중요한가
모델 지정은 출력 품질·비용·재현성의 전제다. 사용자가 고른 모델과 실제 응답 모델이 달라질 수 있다면, 프로덕션 파이프라인의 결과 일관성과 벤치마크 신뢰도에 영향을 줄 수 있다. 투명성과 사전 고지 여부가 향후 논점이 될 전망이다.

### 더 보기
- [You picked Claude Sonnet 5.5 — but Anthropic may send your request to Sonnet 5](https://news.google.com/rss/articles/CBMiZEFVX3lxTE5QdUdYcFVOQVowNWRBZEVGX09WRWdqd0pQZGoxY2hJeEdMaU9Cbk5sbEo5a1FQZTNDd3o4RWRfLXNpZHZNcGFzVVJZWGhpQnFvR2hTWTViM0R0amRCMlAxT0daMTQ?oc=5) — The New Stack
