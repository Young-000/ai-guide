---
title: "OpenAI, GPT-6 토큰 가격 절반으로 인하… '진짜 지렛대는 캐시'"
lang: ko
date: 2026-09-23
slug: gpt-6-price-cut-cache
summary: "OpenAI가 GPT-6의 토큰 가격을 절반으로 내렸지만, 실제 비용을 좌우하는 건 프롬프트 캐시라는 분석이 나왔다."
tags: ["LLM", "OpenAI", "GPT-6", "가격", "프롬프트캐시"]
sources:
  - title: "OpenAI cut GPT-6 token prices in half. The bigger lever may be the cache."
    url: "https://news.google.com/rss/articles/CBMiYEFVX3lxTE5QVzluOGZySDI3YnZSZEF2Z1RkWlpheVhTMVRxLV9FVl9jQWUwNFF4WFFiLS0tdGxkb3lHeWhzeW5Ndi1lYmplcDVwbDg5UmtIa0pVMXU0SVBnM2dkWEdibA?oc=5"
---

**한 줄 요약**: OpenAI가 GPT-6 토큰 가격을 절반으로 내렸지만, 실제 API 비용을 더 크게 좌우하는 건 프롬프트 캐시라는 분석이 나왔다.

### 핵심
- OpenAI가 GPT-6의 토큰 단가를 기존 대비 절반 수준으로 인하한 것으로 알려졌다.
- The New Stack은 표면적 단가 인하보다 **프롬프트 캐시(prompt cache)** 활용이 실제 지출에 더 큰 영향을 준다고 짚었다.
- 반복되는 시스템 프롬프트·긴 컨텍스트를 캐시로 재사용하면 캐시된 입력 토큰이 훨씬 낮은 요율로 청구된다.

### 왜 중요한가
가격표의 단가만 보면 절반 인하가 눈에 띄지만, 에이전트·RAG처럼 같은 컨텍스트를 반복 호출하는 워크로드에서는 캐시 히트율이 월 청구액을 좌우한다. 단가 비교에 앞서 캐시 설계를 먼저 점검하라는 신호다.

### 더 보기
- [OpenAI cut GPT-6 token prices in half. The bigger lever may be the cache.](https://news.google.com/rss/articles/CBMiYEFVX3lxTE5QVzluOGZySDI3YnZSZEF2Z1RkWlpheVhTMVRxLV9FVl9jQWUwNFF4WFFiLS0tdGxkb3lHeWhzeW5Ndi1lYmplcDVwbDg5UmtIa0pVMXU0SVBnM2dkWEdibA?oc=5) — The New Stack
