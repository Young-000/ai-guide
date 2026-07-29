---
title: "LiquidAI, CPU용 장문맥 인코더 'LFM2.5-Encoders' 공개"
lang: ko
date: 2026-07-28
slug: liquidai-lfm2-5-encoders-cpu
summary: "LiquidAI가 CPU에서 빠른 장문맥 추론을 목표로 한 인코더 모델군 LFM2.5-Encoders를 공개했다. 임베딩·검색 등 인코더 작업을 GPU 없이 돌리려는 시도다."
tags: ["LLM", "LiquidAI", "Embeddings", "온디바이스"]
sources:
  - title: "LFM2.5-Encoders for Fast Long-Context Inference on CPU"
    url: "https://huggingface.co/blog/LiquidAI/lfm2-5-encoders"
---

**한 줄 요약**: LiquidAI가 CPU에서 긴 문맥을 빠르게 처리하도록 설계한 인코더 모델군 'LFM2.5-Encoders'를 공개했다.

### 핵심
- LiquidAI가 자사 LFM2.5 계열의 **인코더 버전**을 Hugging Face 블로그를 통해 발표.
- 목표는 GPU 없이 **CPU에서의 빠른 장문맥(long-context) 추론** — 임베딩·검색·분류 같은 인코더 계열 작업을 겨냥한 것으로 보인다.
- 온디바이스·엣지 환경처럼 GPU 자원이 제한된 배포 시나리오를 염두에 둔 모델군으로 소개됐다.

### 왜 중요한가
인코더 모델은 RAG·시맨틱 검색·문서 분류의 핵심 부품이다. 이를 CPU에서 효율적으로 돌릴 수 있다면 GPU 비용 없이 검색·임베딩 파이프라인을 구축·확장할 수 있어, 온디바이스와 저비용 서버 배포의 문턱이 낮아진다.

### 더 보기
- [LFM2.5-Encoders for Fast Long-Context Inference on CPU](https://huggingface.co/blog/LiquidAI/lfm2-5-encoders) — Hugging Face Blog
