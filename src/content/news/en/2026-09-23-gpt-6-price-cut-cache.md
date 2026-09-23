---
title: "OpenAI Halves GPT-6 Token Prices, but Caching May Matter More"
lang: en
date: 2026-09-23
slug: gpt-6-price-cut-cache
summary: "OpenAI cut GPT-6 token prices by half, but an analysis argues prompt caching is the bigger lever for real-world API costs."
tags: ["LLM", "OpenAI", "GPT-6", "Pricing", "PromptCache"]
sources:
  - title: "OpenAI cut GPT-6 token prices in half. The bigger lever may be the cache."
    url: "https://news.google.com/rss/articles/CBMiYEFVX3lxTE5QVzluOGZySDI3YnZSZEF2Z1RkWlpheVhTMVRxLV9FVl9jQWUwNFF4WFFiLS0tdGxkb3lHeWhzeW5Ndi1lYmplcDVwbDg5UmtIa0pVMXU0SVBnM2dkWEdibA?oc=5"
---

**TL;DR**: OpenAI reportedly halved GPT-6 token prices, but an analysis argues prompt caching is the bigger lever on actual API spend.

### Key points
- OpenAI is reported to have cut GPT-6 token pricing to roughly half of its prior rate.
- The New Stack argues that **prompt caching** shapes real bills more than the headline per-token cut.
- Reusing repeated system prompts and long context via the cache bills those cached input tokens at a much lower rate.

### Why it matters
A 50% list-price cut is eye-catching, but for workloads that re-send the same context — agents, RAG — cache hit rate is what drives the monthly bill. The takeaway: audit your caching design before comparing sticker prices.

### Read more
- [OpenAI cut GPT-6 token prices in half. The bigger lever may be the cache.](https://news.google.com/rss/articles/CBMiYEFVX3lxTE5QVzluOGZySDI3YnZSZEF2Z1RkWlpheVhTMVRxLV9FVl9jQWUwNFF4WFFiLS0tdGxkb3lHeWhzeW5Ndi1lYmplcDVwbDg5UmtIa0pVMXU0SVBnM2dkWEdibA?oc=5) — The New Stack
