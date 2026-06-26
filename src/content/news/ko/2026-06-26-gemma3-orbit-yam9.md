---
title: "구글 Gemma 3, 우주 궤도에서 처음 실행 — AI가 위성에서 직접 지구를 분석하다"
lang: ko
date: 2026-06-26
slug: gemma3-orbit-yam9
summary: "Loft Orbital의 YAM-9 위성이 구글 Gemma 3 비전-언어 모델을 궤도에서 직접 구동해 지구 이미지를 실시간 분석하는 데 성공했다. 지상 전송 없이 위성 자체가 AI로 판단을 내린 첫 공개 사례다."
tags: ["Google", "Gemma", "우주AI", "엣지AI", "LoftOrbital", "위성"]
sources:
  - title: "A satellite just learned to find things on its own — here's what that means"
    url: "https://techcrunch.com/2026/06/15/a-satellite-just-learned-to-find-things-on-its-own-heres-what-that-means/"
  - title: "Satellite AI Inference Clears Orbit: Gemma 3 Ran Aboard YAM-9 in April"
    url: "https://www.techtimes.com/articles/318563/20260617/satellite-ai-inference-clears-orbit-gemma-3-ran-aboard-yam-9-april.htm"
---

**한 줄 요약**: Loft Orbital의 YAM-9 위성이 2026년 4월 궤도에서 구글 Gemma 3를 구동해 지구 영상을 자연어 질의로 분석—위성 탑재 VLM 실행을 공개 확인한 최초 사례다.

### 핵심
- YAM-9는 2025년 11월 SpaceX Transporter-15 라이드쉐어로 발사, 온보드 GPU는 Nvidia Jetson Orin AGX
- Gemma 3(오픈웨이트 VLM)와 NASA JPL의 NAVI-Orbital 소프트웨어 하네스, LangGraph 에이전트 프레임워크 세 요소를 조합해 실행
- "철도 허브 주변 인프라를 탐지하라" 등 자연어 질의에 픽셀 원본을 지상으로 내려보내지 않고 위성 자체가 분류·요약 결과만 전송
- 실시간 전지구 커버리지를 위해 유사 위성 50~100기가 필요하다고 Loft Orbital 측이 추정

### 왜 중요한가
원시 영상을 지상에 내리는 대신 온보드에서 AI가 판단을 완결한다는 것은 대역폭·지연 시간·보안 세 측면을 동시에 해결한다. 위성 AI 추론이 상업적으로 검증되면서 국방·재난 대응·기후 모니터링 분야의 '실시간 지구 관측' 가능성이 한층 현실에 가까워졌다.

### 더 보기
- [TechCrunch 원문](https://techcrunch.com/2026/06/15/a-satellite-just-learned-to-find-things-on-its-own-heres-what-that-means/) — TechCrunch
- [TechTimes 기술 상세](https://www.techtimes.com/articles/318563/20260617/satellite-ai-inference-clears-orbit-gemma-3-ran-aboard-yam-9-april.htm) — TechTimes
