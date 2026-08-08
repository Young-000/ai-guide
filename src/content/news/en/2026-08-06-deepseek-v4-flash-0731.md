---
title: "DeepSeek V4-Flash 0731 Beats Its Own Flagship on Every Agent Benchmark"
lang: en
date: 2026-08-06
slug: deepseek-v4-flash-0731
summary: "DeepSeek released V4-Flash-0731 on July 31, a retrained 284B MoE model that surpasses V4-Pro-Preview on all nine agentic benchmarks — including a 645% jump on DeepSWE — while keeping the price unchanged at $0.14/M input tokens."
tags: ["DeepSeek", "open-source", "agentic AI", "benchmarks", "LLM"]
sources:
  - title: "DeepSeek Retrained V4-Flash Beats Its Flagship Pro on Nine Agent Benchmarks"
    url: "https://www.techtimes.com/articles/322513/20260731/deepseek-retrained-v4-flash-beats-its-flagship-pro-nine-agent-benchmarks.htm"
  - title: "DeepSeek Upgrades DeepSeek-V4-Flash-0731 with Major Agentic and Coding Gains"
    url: "https://www.marktechpost.com/2026/07/31/deepseek-upgrades-deepseek-v4-flash-0731-with-major-agentic-and-coding-gains/"
  - title: "DeepSeek-V4-Flash Goes Official: Agent Benchmarks Beat V4-Pro-Preview"
    url: "https://deepseek.ai/blog/deepseek-v4-flash-ga-agent-benchmarks"
---

**Summary**: DeepSeek's V4-Flash-0731 is a complete post-training redo of its budget model — same architecture, same price, dramatically better performance — and it now outperforms the company's own flagship V4-Pro-Preview across nine agentic evaluations.

### Key Facts
- **Performance leap**: Terminal Bench 2.1 score of 82.7 vs. 72.1 for V4-Pro-Preview; DeepSWE jumped from 7.3 (flash preview) to 54.4, a 645% gain.
- **Same price**: $0.14 per million input tokens — unchanged from the previous Flash Preview, making this a free performance upgrade for existing API users.
- **Speed**: 115.9 tokens/sec output, well above average for open-weight models of comparable size; TTFT of 1.34 seconds.
- **Architecture**: 284B parameter MoE model. Only post-training (reinforcement learning, alignment) was redone; the model structure is identical to Flash Preview.

### Why It Matters
V4-Flash-0731 demonstrates that targeted post-training investment can outperform raw parameter scaling for agentic tasks — a budget model beating a larger flagship. For engineering teams running cost-sensitive AI workloads, this is a meaningful price-performance inflection point, and it adds pressure on US labs to close the efficiency gap at the lower price tier.

### Further Reading
- [TechTimes benchmark report](https://www.techtimes.com/articles/322513/20260731/deepseek-retrained-v4-flash-beats-its-flagship-pro-nine-agent-benchmarks.htm) — TechTimes
- [DeepSeek official blog](https://deepseek.ai/blog/deepseek-v4-flash-ga-agent-benchmarks) — DeepSeek
