---
title: "Shopify, 시스템 프롬프트를 '학습 토큰'으로 압축하는 Gisting 도입"
lang: ko
date: 2026-09-03
slug: shopify-gisting-prompt-compression
summary: "Shopify가 긴 LLM 시스템 프롬프트를 소수의 학습된 토큰으로 압축하는 Gisting 기법을 적용해 토큰 비용과 지연을 줄였다고 InfoQ가 전했다."
tags: ["LLM", "Shopify", "프롬프트 최적화", "추론 비용"]
sources:
  - title: "Shopify Introduces Gisting: Compressing LLM System Prompts into Learned Tokens"
    url: "https://news.google.com/rss/articles/CBMidkFVX3lxTFB1Nll0ZHBnSzdEV3BRMlJ6X0lJelUzT2hRUV91YThKeTB3eTFzUXhKR3h2OFB3Rjhqc1NCa3VMUkZ6TXF6bl9zQnRRQ1l3NWRjWWltMDRpMnNxcmZsanp4MjFrSzc4WTk4ekFqS0V0N0xpVGpIRkE?oc=5"
---

**한 줄 요약**: Shopify가 반복되는 긴 시스템 프롬프트를 소수의 '학습된 토큰(gist token)'으로 압축하는 Gisting 기법을 도입했다고 알려졌다.

### 핵심
- Gisting은 고정된 시스템 프롬프트를 소수의 학습된 토큰으로 대체해, 매 요청마다 같은 지시문을 전부 넣지 않도록 하는 프롬프트 압축 기법이다.
- Shopify는 이를 프로덕션 LLM 워크로드에 적용해 입력 토큰 수를 줄이고 추론 비용·지연을 낮추는 것을 목표로 했다고 InfoQ가 전했다.
- 원 개념은 반복 지시문을 압축해도 모델 응답 품질을 크게 훼손하지 않는다는 선행 연구에 기반한다.

### 왜 중요한가
시스템 프롬프트가 길수록 요청마다 같은 토큰 비용이 반복된다. 대규모로 LLM을 운영하는 기업에는 프롬프트 압축이 비용·속도를 직접 개선하는 실전 최적화 수단이 될 수 있다.

### 더 보기
- [Shopify Introduces Gisting: Compressing LLM System Prompts into Learned Tokens](https://news.google.com/rss/articles/CBMidkFVX3lxTFB1Nll0ZHBnSzdEV3BRMlJ6X0lJelUzT2hRUV91YThKeTB3eTFzUXhKR3h2OFB3Rjhqc1NCa3VMUkZ6TXF6bl9zQnRRQ1l3NWRjWWltMDRpMnNxcmZsanp4MjFrSzc4WTk4ekFqS0V0N0xpVGpIRkE?oc=5) — InfoQ
