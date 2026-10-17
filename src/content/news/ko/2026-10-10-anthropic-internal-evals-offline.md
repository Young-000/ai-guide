---
title: "Anthropic, 내부 평가 체계를 인터넷과 분리한다는 보도"
lang: ko
date: 2026-10-10
slug: anthropic-internal-evals-offline
summary: "The Verge는 Anthropic이 내부 모델 평가(evals)를 인터넷에서 분리하는 조치를 진행 중이라고 보도했다. 평가 데이터가 학습 데이터로 새어 들어가는 문제와 보안 우려를 함께 겨냥한 것으로 풀이된다."
tags: ["Anthropic", "AI 평가", "벤치마크", "AI 안전", "LLM"]
sources:
  - title: "Anthropic is cutting off its internal evaluations from the internet"
    url: "https://news.google.com/rss/articles/CBMixgFBVV95cUxPa2xCTW03U0tfNkxxUDMyUEtsLXhvTUhaZWdtVlRhcmJCc2dLU1FtSXptZlZhZ0pCODI3NkpPWkhOVkZCYWlhenhNVEtQd1NjdU5za21Pbm9VVl8zQjh3bzNrcHhHOWR0eXJyY1NUZEtPMUJ0ZG4xNmFfS3R0T2NJTGxITVpvdGMwdDdYS3dUUXg4YnVseFV5a1JETGFqT29SY05mbWxBTjU4NjIzS1MzN05wWk9nOFM0OWh2LXJ6aUlsM0V1RlE?oc=5"
---

**한 줄 요약**: The Verge에 따르면 Anthropic이 모델 성능과 안전성을 측정하는 내부 평가(evals)를 인터넷에서 분리하고 있다.

### 핵심
- 대상은 Anthropic이 자사 모델의 능력과 위험도를 확인할 때 쓰는 **내부 평가 세트**다.
- 핵심 조치는 평가를 인터넷에서 **분리**하는 것이다. 평가 문항과 정답이 웹에 공개되거나 외부에서 접근되지 않도록 막는 방향으로 알려졌다.
- 구체적인 범위·시점·방식은 원문 보도를 통해 확인해야 한다. 현재 공개된 정보는 보도 제목 수준이다.

### 왜 중요한가
평가 문항이 웹에 퍼지면 다음 세대 모델이 그 문항을 학습 데이터로 미리 접하게 된다. 이른바 '데이터 오염(contamination)'이다. 이렇게 되면 점수가 실제 능력보다 높게 나와 벤치마크를 믿을 수 없게 된다. 평가가 점점 모델 출시와 안전 판단의 근거가 되는 만큼, 이번 조치는 평가 결과의 신뢰성을 지키려는 업계 흐름과 맞닿아 있다.

### 더 보기
- [Anthropic is cutting off its internal evaluations from the internet](https://news.google.com/rss/articles/CBMixgFBVV95cUxPa2xCTW03U0tfNkxxUDMyUEtsLXhvTUhaZWdtVlRhcmJCc2dLU1FtSXptZlZhZ0pCODI3NkpPWkhOVkZCYWlhenhNVEtQd1NjdU5za21Pbm9VVl8zQjh3bzNrcHhHOWR0eXJyY1NUZEtPMUJ0ZG4xNmFfS3R0T2NJTGxITVpvdGMwdDdYS3dUUXg4YnVseFV5a1JETGFqT29SY05mbWxBTjU4NjIzS1MzN05wWk9nOFM0OWh2LXJ6aUlsM0V1RlE?oc=5) — The Verge
