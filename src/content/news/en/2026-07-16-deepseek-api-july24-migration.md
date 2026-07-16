---
title: "DeepSeek API Breaking Change: Migrate to deepseek-v4-pro Before July 24"
lang: en
date: 2026-07-16
slug: deepseek-api-july24-migration
summary: "DeepSeek is retiring the deepseek-chat and deepseek-reasoner model identifiers on July 24 at 15:59 UTC. Any production code that calls these endpoints will start returning errors — the fix is a one-line model parameter update."
tags: ["DeepSeek", "API", "Developers", "LLM", "Migration"]
sources:
  - title: "DeepSeek API: Migrate Before July 24 or Integrations Break"
    url: "https://enterprisedna.co/resources/news/deepseek-api-migration-july-24-deadline-2026/"
  - title: "Gemini 3.5 Pro Targets July 17 as DeepSeek's July 24 Deadline Hits Developers Now"
    url: "https://www.techtimes.com/articles/319877/20260708/gemini-35-pro-targets-july-17-deepseeks-july-24-deadline-hits-developers-now.htm"
---

**Summary**: DeepSeek will deprecate the `deepseek-chat` and `deepseek-reasoner` model identifiers on July 24, 2026 at 15:59 UTC. After that timestamp, calls using those names return errors — migration is mandatory, not optional.

### Key Facts
- **Deadline**: July 24, 2026, 15:59 UTC — hard cutoff, no grace period announced
- **Old → new**: replace `deepseek-chat` → `deepseek-v4-pro` or `deepseek-v4-flash`; replace `deepseek-reasoner` → `deepseek-v4-pro`
- Base URL, API key, and request schema are unchanged — one parameter update per call site
- `deepseek-v4-flash` offers lower cost for high-volume workloads; `deepseek-v4-pro` matches full V4 capability

### Why It Matters
Teams running DeepSeek directly in production pipelines — RAG stacks, coding agents, LangChain chains — face a hard outage if they miss the deadline. Unlike most deprecations with a soft fallback window, DeepSeek's switch is immediate. With eight days remaining, teams using the legacy identifiers should treat this as a fire-drill, not a backlog item.

### Read More
- [Migration guide](https://enterprisedna.co/resources/news/deepseek-api-migration-july-24-deadline-2026/) — Enterprise DNA
- [TechTimes coverage](https://www.techtimes.com/articles/319877/20260708/gemini-35-pro-targets-july-17-deepseeks-july-24-deadline-hits-developers-now.htm) — TechTimes
