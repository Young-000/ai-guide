---
title: "MiniMax M3 공개 — MSA 아키텍처로 100만 토큰 컨텍스트·GPT-5.5 초과 코딩 성능"
lang: ko
date: 2026-06-17
slug: minimax-m3-sparse-attention-1m-context
summary: "중국 AI 연구소 MiniMax가 6월 1일 오픈웨이트 모델 M3를 출시했다. 새로운 희소 어텐션 구조(MSA)로 100만 토큰 컨텍스트를 구현하고, SWE-Bench Pro에서 GPT-5.5를 상회하는 성능을 GPT-5.5 비용의 5~10% 수준에 제공한다."
tags: ["MiniMax", "LLM", "오픈웨이트", "멀티모달", "코딩", "중국AI"]
sources:
  - title: "MiniMax Releases MiniMax M3 with MSA Architecture Supporting 1M-Token Context"
    url: "https://www.marktechpost.com/2026/06/01/minimax-releases-minimax-m3-with-msa-architecture-supporting-1m-token-context-native-multimodality-and-agentic-coding/"
  - title: "MiniMax-M3 debuts, eclipsing GPT-5.5 and Gemini 3.1 Pro on key benchmark performance"
    url: "https://venturebeat.com/technology/minimax-m3-debuts-eclipsing-gpt-5-5-and-gemini-3-1-pro-on-key-benchmark-performance-for-just-5-10-of-the-cost"
---

**한 줄 요약**: MiniMax가 희소 어텐션(MSA) 기반 오픈웨이트 모델 M3를 공개해, 100만 토큰 컨텍스트·멀티모달 입력·프론티어급 코딩 성능을 단일 아키텍처에 담았다.

### 핵심
- **MSA(MiniMax Sparse Attention)**: 100만 토큰 컨텍스트에서 기존 M2 대비 프리필 속도 9배 이상, 디코딩 15배 이상 향상; 1/20 수준의 토큰당 연산량
- **성능**: SWE-Bench Pro 59.0% — GPT-5.5, Gemini 3.1 Pro 상회; 비용은 GPT-5.5의 5~10% 수준으로 알려짐
- **네이티브 멀티모달**: 이미지·동영상 입력, 데스크톱 컴퓨터 조작 기능 기본 내장
- API는 즉시 사용 가능; 모델 가중치 및 기술 보고서는 출시 10일 내 공개 예정

### 왜 중요한가
M3는 "100만 토큰 컨텍스트 + 네이티브 멀티모달 + 오픈웨이트"를 동시에 달성한 최초의 모델이라고 MiniMax는 주장한다. 프론티어 성능을 10분의 1 미만 비용으로 제공하는 오픈웨이트 모델의 등장은 OpenAI·Anthropic의 클로즈드 API 의존 구조를 흔드는 압박 요인으로, 에이전틱 워크플로우와 대규모 문서 처리 시장을 겨냥한 경쟁이 한층 치열해질 전망이다.

### 더 보기
- [MiniMax Releases MiniMax M3 with MSA Architecture](https://www.marktechpost.com/2026/06/01/minimax-releases-minimax-m3-with-msa-architecture-supporting-1m-token-context-native-multimodality-and-agentic-coding/) — MarkTechPost
- [MiniMax-M3 debuts, eclipsing GPT-5.5 and Gemini 3.1 Pro](https://venturebeat.com/technology/minimax-m3-debuts-eclipsing-gpt-5-5-and-gemini-3-1-pro-on-key-benchmark-performance-for-just-5-10-of-the-cost) — VentureBeat
