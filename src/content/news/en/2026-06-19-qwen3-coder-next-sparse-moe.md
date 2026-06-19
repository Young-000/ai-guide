---
title: "Alibaba's Qwen3-Coder-Next: 80B-Param MoE Coding Model With Only 3B Active — Scores 70.6% on SWE-Bench"
lang: en
date: 2026-06-19
slug: qwen3-coder-next-sparse-moe
summary: "Alibaba open-sourced Qwen3-Coder-Next, an ultra-sparse Mixture-of-Experts coding model with 80B total parameters but only 3B active at inference time, delivering up to 10× throughput versus dense equivalents and a 70.6% SWE-Bench score."
tags: ["Qwen", "Alibaba", "OpenSource", "CodingAI", "MoE", "LLM"]
sources:
  - title: "Qwen3-Coder-Next offers vibe coders a powerful open source, ultra-sparse model"
    url: "https://venturebeat.com/technology/qwen3-coder-next-offers-vibe-coders-a-powerful-open-source-ultra-sparse"
  - title: "Qwen3-Coder-Next: Pushing Small Hybrid Models"
    url: "https://qwen.ai/blog?id=qwen3-coder-next"
---

**Summary**: Alibaba released Qwen3-Coder-Next, an open-source coding model that routes each query through just 3B of its 80B parameters, achieving frontier-class coding performance at a fraction of the compute cost.

### Key Facts
- **Architecture**: 80B total / 3B active parameters (ultra-sparse MoE); delivers up to 10× higher throughput than dense models of comparable quality
- **Benchmarks**: 70.6% on SWE-Bench Verified; outperforms Claude Opus 4.5 on secure code generation
- **Context & Language Coverage**: Up to 1M token context window; 370+ programming languages supported
- **License**: Apache 2.0 — free for commercial use and fine-tuning

### Why It Matters
An open-source model that matches or beats closed, proprietary coding models at a fraction of the inference cost significantly lowers the barrier for teams that can't afford frontier API pricing. The ultra-sparse MoE approach — proven viable at this scale — may become the dominant architecture for specialized open-source models in 2026, directly pressuring vendors like GitHub Copilot and Cursor.

### Read More
- [Qwen3-Coder-Next: ultra-sparse open source model](https://venturebeat.com/technology/qwen3-coder-next-offers-vibe-coders-a-powerful-open-source-ultra-sparse) — VentureBeat
- [Qwen3-Coder-Next official blog](https://qwen.ai/blog?id=qwen3-coder-next) — Qwen AI
