---
title: "'뉴럴리즈' 논란: AI가 사람이 못 읽는 언어로 생각한다면"
lang: ko
date: 2026-09-03
slug: what-is-neuralese-explained
summary: "AI 모델이 사람이 읽을 수 있는 문장 대신 내부 벡터로 추론하는 '뉴럴리즈(neuralese)' 개념과, 이것이 AI 안전·해석가능성 연구자들의 우려를 사는 이유를 정리했다."
tags: ["AI Safety", "Interpretability", "LLM", "Chain-of-Thought"]
sources:
  - title: "What is neuralese and why is everyone so concerned about it?"
    url: "https://news.google.com/rss/articles/CBMinAFBVV95cUxQcFRNR0tZcndTUC1iUWozTkJyWVI2bWFTVjBVVkVzaFBobVJ6RXBEYTFQamU0TjRNY0wwbEpDVlpwTTNPZDhfZnpFcHotZHpRNHI3Vm9URHVkRl96Wk5DLWEyczYxdy1yLWZaQjRLWnZKdG83Sm1Cblp1T3NodE5DaFdNZm94dGl5U0xjdi1pLWUyWlRvZWNyU2xHU2Y?oc=5"
---

**한 줄 요약**: '뉴럴리즈'는 AI가 사람이 읽을 수 있는 문장 대신 내부 수치 표현으로 추론하는 방식을 가리키며, 이것이 AI의 사고 과정을 감시하기 어렵게 만든다는 우려가 커지고 있다.

### 핵심
- **뉴럴리즈(neuralese)**는 모델이 생각의 사슬(chain-of-thought)을 사람 언어 토큰이 아니라 고차원 벡터·잠재 표현으로 주고받는 것을 뜻하는 용어로 알려졌다.
- 현재의 추론 모델은 대체로 사람이 읽을 수 있는 텍스트로 단계적 사고를 남기지만, 잠재 공간에서 직접 추론하는 구조로 옮겨가면 이 '읽을 수 있는 흔적'이 사라진다.
- 안전 연구자들은 사고 과정이 뉴럴리즈로 바뀌면 chain-of-thought 모니터링 같은 감독 기법이 무력화될 수 있다고 지적한다.

### 왜 중요한가
AI 안전의 상당 부분은 "모델이 왜 그렇게 답했는지"를 사람이 읽고 점검할 수 있다는 전제에 기대고 있다. 추론이 사람이 해독할 수 없는 내부 언어로 진행되면, 위험한 의도나 오작동을 사전에 포착하기가 훨씬 어려워진다는 것이 핵심 우려다.

### 더 보기
- [What is neuralese and why is everyone so concerned about it?](https://news.google.com/rss/articles/CBMinAFBVV95cUxQcFRNR0tZcndTUC1iUWozTkJyWVI2bWFTVjBVVkVzaFBobVJ6RXBEYTFQamU0TjRNY0wwbEpDVlpwTTNPZDhfZnpFcHotZHpRNHI3Vm9URHVkRl96Wk5DLWEyczYxdy1yLWZaQjRLWnZKdG83Sm1Cblp1T3NodE5DaFdNZm94dGl5U0xjdi1pLWUyWlRvZWNyU2xHU2Y?oc=5) — Transformer
