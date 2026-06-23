---
title: "Claude Fable 5 Exits Free Plans Today — API Breaking Changes Developers Must Handle"
lang: en
date: 2026-06-23
slug: fable-5-mythos-5-api-launch
summary: "Claude Fable 5 leaves included subscription tiers on June 23 and shifts to usage-based billing. Developers also face a new refusal response type and an always-on Adaptive Thinking mode that break assumptions built for older Claude models."
tags: ["Anthropic", "Claude", "Fable 5", "API", "LLM"]
sources:
  - title: "Introducing Claude Fable 5 and Claude Mythos 5"
    url: "https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5"
---

**Summary**: Claude Fable 5, launched June 9, ends its complimentary window in Pro, Max, Team, and seat-based Enterprise plans today—billed at API rates going forward—while carrying two API-level changes that require code updates for any existing integration.

### Key Facts
- **Billing change**: Usage now draws from credits at $10/M input and $50/M output tokens — less than half the price of Claude Mythos Preview; refused requests that produce no output are not charged
- **New response type**: Declined requests return HTTP 200 with `stop_reason: "refusal"`, not an error; Anthropic offers a server-side `fallbacks` parameter (beta) and SDK middleware for automatic retry with fallback credit covering prompt-cache costs
- **Thinking mode**: Adaptive Thinking is always on — `thinking: {"type": "disabled"}` is not supported; raw chain-of-thought is never exposed, only a summary or omitted block
- **Claude Mythos 5** (`claude-mythos-5`): Same model, safety classifiers removed, limited to Project Glasswing approved customers; successor to Claude Mythos Preview
- **Context**: 1M-token default window, up to 128K output tokens; 30-day data retention, no zero-retention option

### Why It Matters
The grace period ending is an immediate cost event for millions of subscribers and a code-level breaking change for integrations that treat all non-200 responses as failures. Teams migrating from Opus 4.8 also need to rework thinking-block handling since raw reasoning is no longer returned. At current pricing, Fable 5 positions Anthropic to compete directly with GPT-5.5 on cost-per-token at frontier capability.

### Read More
- [Introducing Claude Fable 5 and Claude Mythos 5](https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5) — Anthropic Docs
