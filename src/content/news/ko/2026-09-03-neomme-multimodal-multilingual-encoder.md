---
title: "H컴퍼니, 다국어·멀티모달 인코더 'NeoMME' 공개"
lang: ko
date: 2026-09-03
slug: neomme-multimodal-multilingual-encoder
summary: "H컴퍼니가 여러 언어와 이미지·텍스트를 함께 처리하도록 설계한 경량 인코더 NeoMME를 Hugging Face 블로그를 통해 소개했다."
tags: ["멀티모달", "인코더", "다국어", "오픈모델", "Hugging Face"]
sources:
  - title: "NeoMME: an efficient Multimodal-native and Multilingual Encoder"
    url: "https://huggingface.co/blog/Hcompany/neomme"
---

**한 줄 요약**: H컴퍼니가 다국어·멀티모달을 기본 설계로 삼은 경량 인코더 'NeoMME'를 공개했다.

### 핵심
- 모델명은 NeoMME로, 여러 언어와 이미지·텍스트를 함께 다루도록 설계된 인코더로 소개됐다.
- 'multimodal-native'를 강조해 텍스트 위주 모델에 이미지를 덧붙이는 방식이 아니라 처음부터 멀티모달을 전제로 만들어졌다는 점을 내세운다.
- '효율성(efficient)'을 키워드로 내걸어 성능 대비 연산·비용 부담을 낮추는 방향을 지향하는 것으로 보인다.
- 공개 창구는 Hugging Face 블로그로, 오픈 생태계에서의 배포·활용을 염두에 둔 것으로 풀이된다.

### 왜 중요한가
인코더는 검색·분류·임베딩 같은 실무 파이프라인의 뼈대다. 다국어와 멀티모달을 한 모델에서 처리하면서 경량화를 노렸다면, 비영어권과 이미지 기반 서비스에 적용 문턱을 낮출 수 있다. 다만 구체 성능·벤치마크 수치는 원문 확인이 필요하다.

### 더 보기
- [NeoMME: an efficient Multimodal-native and Multilingual Encoder](https://huggingface.co/blog/Hcompany/neomme) — Hugging Face Blog
