---
title: "DeepSeek V4-Flash-0731: Retrained Build Outscores Its Own Pro on All Nine Agent Benchmarks"
lang: en
date: 2026-08-08
slug: deepseek-v4-flash-0731
summary: "DeepSeek released V4-Flash-0731 on July 31, 2026 — same 284B/13B MoE architecture as Flash-Preview, but with post-training rebuilt from scratch. The result: Flash pricing with benchmark scores that beat DeepSeek's own flagship V4-Pro-Preview across all nine agent and coding tasks."
tags: ["DeepSeek", "LLM", "agent", "coding", "benchmark"]
sources:
  - title: "DeepSeek Upgrades DeepSeek-V4-Flash-0731 with Major Agentic and Coding Gains"
    url: "https://www.marktechpost.com/2026/07/31/deepseek-upgrades-deepseek-v4-flash-0731-with-major-agentic-and-coding-gains/"
  - title: "DeepSeek Retrained V4-Flash Beats Its Flagship Pro on Nine Agent Benchmarks"
    url: "https://www.techtimes.com/articles/322513/20260731/deepseek-retrained-v4-flash-beats-its-flagship-pro-nine-agent-benchmarks.htm"
  - title: "DeepSeek-V4-Flash Goes Official: Agent Benchmarks Beat V4-Pro-Preview"
    url: "https://deepseek.ai/blog/deepseek-v4-flash-ga-agent-benchmarks"
---

**Summary**: DeepSeek rebuilt only the post-training stage of V4-Flash, leaving the 284B/13B MoE architecture untouched — and the retrained model now outperforms V4-Pro-Preview on every agent and coding benchmark the company published.

### Key Points
- **Model specs**: 284B total / 13B active MoE, 1M-token context window — identical to Flash-Preview; only post-training changed
- **Benchmark highlights**: Terminal Bench 2.1 **82.7** (up from 61.8), DeepSWE **54.4** (up from 7.3), NL2Repo **54.2** (up from 39.4), Cybergym **76.7** (up from 38.7), DSBench-Hard **59.6** (up from 25.8)
- **Pricing advantage**: Flash-tier cost, Pro-level (or better) performance on agentic workloads
- **Caveat**: agent benchmarks are highly sensitive to the evaluation harness; scores should be treated as vendor-reported until independently reproduced

### Why It Matters
The V4-Flash-0731 numbers show that post-training alone can produce dramatic capability jumps — no architecture changes, no additional parameters. The DeepSWE score leaping from 7.3 to 54.4 is a standout: it signals a genuine step-change in software-engineering agent capability at flash pricing. Teams running cost-sensitive coding or agentic pipelines have a new option worth evaluating.

### Read More
- [DeepSeek official blog: V4-Flash GA](https://deepseek.ai/blog/deepseek-v4-flash-ga-agent-benchmarks) — DeepSeek
- [MarkTechPost in-depth](https://www.marktechpost.com/2026/07/31/deepseek-upgrades-deepseek-v4-flash-0731-with-major-agentic-and-coding-gains/) — MarkTechPost
