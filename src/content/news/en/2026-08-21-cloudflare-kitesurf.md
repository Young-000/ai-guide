---
title: "Cloudflare Launches Kitesurf: An Agent-First Browser With 1/7th Chromium's Memory"
lang: en
date: 2026-08-21
slug: cloudflare-kitesurf
summary: "Cloudflare has released Kitesurf in beta — a browser engine built from scratch in Rust and WebAssembly for AI agents rather than humans, using roughly one-seventh the memory and one-third the CPU of Chromium for common agentic tasks."
tags: ["Cloudflare", "AI Agents", "Browser", "Infrastructure", "Rust"]
sources:
  - title: "Cloudflare launches Kitesurf, a browser built for AI agents"
    url: "https://techcrunch.com/2026/08/07/cloudflare-launches-kitesurf-a-browser-built-for-ai-agents/"
  - title: "Introducing Kitesurf, an agent-first browser on Browser Run"
    url: "https://developers.cloudflare.com/changelog/post/2026-08-06-kitesurf/"
---

**In one line**: Cloudflare has open-beta'd Kitesurf, a non-Chromium browser engine purpose-built for AI agents, running on Cloudflare Workers with dramatically lower resource overhead.

### Key points
- Built entirely in Rust and WebAssembly — no Chromium — using the Blitz rendering engine, Firefox's Stylo CSS parser, and the Boa JS engine.
- Memory consumption for HTML extraction and screenshots is approximately 1/7th of Chromium; CPU usage is roughly 1/3.
- Available now as a free beta feature of Cloudflare Browser Run; switching requires only adding `browser=kitesurf` to existing Puppeteer or Playwright code.
- Runs inside Cloudflare Workers as V8 isolates, meaning agents spin up near the edge rather than in a central region.

### Why it matters
Chromium's resource overhead has been a real cost barrier for AI agents doing large-scale web research and automation. A purpose-built, lightweight browser engine running at the edge could meaningfully reduce the compute bill for agentic workflows — and lower latency for agents that need to browse as part of multi-step tasks. If Kitesurf matures, it may become the de facto runtime for web-browsing agents the way Playwright became for testing.

### Read more
- [Cloudflare launches Kitesurf, a browser built for AI agents](https://techcrunch.com/2026/08/07/cloudflare-launches-kitesurf-a-browser-built-for-ai-agents/) — TechCrunch
- [Introducing Kitesurf (official)](https://developers.cloudflare.com/changelog/post/2026-08-06-kitesurf/) — Cloudflare Developers
