---
title: "DeepSeek V4-Flash-0731 Official Release: Beats Its Own Pro Model on 9 Agent Benchmarks"
lang: en
date: "2026-08-02"
slug: deepseek-v4-flash-0731
summary: "DeepSeek officially released V4-Flash-0731 on July 31, 2026. The retrained model outperforms the company's flagship Pro-Preview across all nine published agent and coding benchmarks at just $0.14 per million input tokens."
tags: ["DeepSeek", "LLM", "Model Release", "AI Agents", "Open Source"]
sources:
  - title: "DeepSeek Retrained V4-Flash Beats Its Flagship Pro on Nine Agent Benchmarks"
    url: "https://www.techtimes.com/articles/322513/20260731/deepseek-retrained-v4-flash-beats-its-flagship-pro-nine-agent-benchmarks.htm"
  - title: "DeepSeek V4 Flash: Benchmarks, Pricing & Verdict"
    url: "https://www.cosmicjs.com/blog/deepseek-v4-flash-benchmarks-pricing"
---

**Summary**: DeepSeek moved V4-Flash from preview to official release on July 31, shipping under the identifier DeepSeek-V4-Flash-0731. The same 284B/13B MoE architecture was re-post-trained, and the result beats the company's own Pro-Preview on every agent and coding benchmark published.

### Key Facts
- **Benchmark sweep**: Terminal Bench 2.1 score of 82.7 vs. Pro-Preview's 72.1. DeepSWE jumped from 7.3 to 54.4; DSBench-FullStack from 37.0 to 68.7.
- **Zero migration cost**: The `deepseek-v4-flash` API endpoint is unchanged — existing integrations get the upgrade automatically.
- **Pricing**: $0.14/M input tokens (cache miss), $0.003/M on cache hits, $0.28/M output — unusually cheap for frontier-class agent performance.
- **Caveat**: As of July 31, no independent lab had reproduced these figures; all numbers are vendor-reported.

### Why It Matters
When a Flash-tier model outperforms its own Pro flagship on agentic tasks, the cost-performance calculus for large-scale deployments shifts again. DeepSeek is making it increasingly hard to justify frontier-model pricing for coding and agent workloads — a pattern that is forcing price cuts across the industry.

### Read More
- [TechTimes Benchmark Analysis](https://www.techtimes.com/articles/322513/20260731/deepseek-retrained-v4-flash-beats-its-flagship-pro-nine-agent-benchmarks.htm) — TechTimes
- [Benchmarks & Pricing Summary](https://www.cosmicjs.com/blog/deepseek-v4-flash-benchmarks-pricing) — CosmicJS
