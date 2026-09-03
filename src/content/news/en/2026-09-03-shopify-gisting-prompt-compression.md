---
title: "Shopify Adopts Gisting to Compress LLM System Prompts into Learned Tokens"
lang: en
date: 2026-09-03
slug: shopify-gisting-prompt-compression
summary: "Shopify has applied a technique called Gisting that compresses long LLM system prompts into a few learned tokens, aiming to cut token costs and latency, according to InfoQ."
tags: ["LLM", "Shopify", "Prompt Optimization", "Inference Cost"]
sources:
  - title: "Shopify Introduces Gisting: Compressing LLM System Prompts into Learned Tokens"
    url: "https://news.google.com/rss/articles/CBMidkFVX3lxTFB1Nll0ZHBnSzdEV3BRMlJ6X0lJelUzT2hRUV91YThKeTB3eTFzUXhKR3h2OFB3Rjhqc1NCa3VMUkZ6TXF6bl9zQnRRQ1l3NWRjWWltMDRpMnNxcmZsanp4MjFrSzc4WTk4ekFqS0V0N0xpVGpIRkE?oc=5"
---

**In one line**: Shopify is reported to have adopted Gisting, a technique that compresses long, repeated system prompts into a handful of learned "gist" tokens.

### Key points
- Gisting replaces a fixed system prompt with a small set of learned tokens, so the full instruction text doesn't have to be sent with every request.
- Shopify applied it to production LLM workloads with the goal of reducing input token counts and lowering inference cost and latency, according to InfoQ.
- The underlying idea builds on prior research suggesting repeated instructions can be compressed without significantly degrading model output quality.

### Why it matters
Longer system prompts mean the same token cost is paid on every request. For companies running LLMs at scale, prompt compression can be a practical optimization that directly improves cost and speed.

### Read more
- [Shopify Introduces Gisting: Compressing LLM System Prompts into Learned Tokens](https://news.google.com/rss/articles/CBMidkFVX3lxTFB1Nll0ZHBnSzdEV3BRMlJ6X0lJelUzT2hRUV91YThKeTB3eTFzUXhKR3h2OFB3Rjhqc1NCa3VMUkZ6TXF6bl9zQnRRQ1l3NWRjWWltMDRpMnNxcmZsanp4MjFrSzc4WTk4ekFqS0V0N0xpVGpIRkE?oc=5) — InfoQ
