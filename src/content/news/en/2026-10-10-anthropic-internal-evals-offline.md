---
title: "Anthropic Reportedly Taking Its Internal Evals Offline"
lang: en
date: 2026-10-10
slug: anthropic-internal-evals-offline
summary: "The Verge reports that Anthropic is cutting off its internal model evaluations from the internet, a move seen as guarding against benchmark contamination and leaks."
tags: ["Anthropic", "AI Evaluation", "Benchmarks", "AI Safety", "LLM"]
sources:
  - title: "Anthropic is cutting off its internal evaluations from the internet"
    url: "https://news.google.com/rss/articles/CBMixgFBVV95cUxPa2xCTW03U0tfNkxxUDMyUEtsLXhvTUhaZWdtVlRhcmJCc2dLU1FtSXptZlZhZ0pCODI3NkpPWkhOVkZCYWlhenhNVEtQd1NjdU5za21Pbm9VVl8zQjh3bzNrcHhHOWR0eXJyY1NUZEtPMUJ0ZG4xNmFfS3R0T2NJTGxITVpvdGMwdDdYS3dUUXg4YnVseFV5a1JETGFqT29SY05mbWxBTjU4NjIzS1MzN05wWk9nOFM0OWh2LXJ6aUlsM0V1RlE?oc=5"
---

**In brief**: The Verge reports that Anthropic is cutting off its internal evaluations, the tests it uses to measure model capability and safety, from the internet.

### Key points
- The move covers the **internal eval suites** Anthropic uses to judge what its models can do and how risky they are.
- The core step is **isolating** those evals from the internet. The aim is reportedly to keep test questions and answers from being published online or accessed from outside.
- Scope, timing, and implementation details aren't known beyond the report itself. Readers should check the original article for specifics.

### Why it matters
When eval questions spread online, they can end up in the training data of future models. This is known as contamination. Contaminated models score higher than their real ability, which makes benchmarks unreliable. Evals increasingly shape release and safety decisions, so protecting them fits a wider industry push to keep evaluation results trustworthy.

### Read more
- [Anthropic is cutting off its internal evaluations from the internet](https://news.google.com/rss/articles/CBMixgFBVV95cUxPa2xCTW03U0tfNkxxUDMyUEtsLXhvTUhaZWdtVlRhcmJCc2dLU1FtSXptZlZhZ0pCODI3NkpPWkhOVkZCYWlhenhNVEtQd1NjdU5za21Pbm9VVl8zQjh3bzNrcHhHOWR0eXJyY1NUZEtPMUJ0ZG4xNmFfS3R0T2NJTGxITVpvdGMwdDdYS3dUUXg4YnVseFV5a1JETGFqT29SY05mbWxBTjU4NjIzS1MzN05wWk9nOFM0OWh2LXJ6aUlsM0V1RlE?oc=5) — The Verge
