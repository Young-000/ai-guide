---
title: "Meta Launches Muse Code: A Terminal Coding Agent Backed by New Muse Spark 1.2 Model"
lang: en
date: 2026-08-06
slug: meta-muse-code-launch
summary: "Meta entered the AI coding agent market on August 5 with Muse Code (beta), a terminal-based tool powered by the new Muse Spark 1.2 model. It runs persistent async background agents throughout a session and ships with a 1-million-token context window."
tags: ["Meta", "coding agent", "Muse Code", "Muse Spark", "LLM"]
sources:
  - title: "Meta debuts first AI coding agent to take on Anthropic and OpenAI"
    url: "https://www.cnbc.com/2026/08/05/meta-debuts-muse-code-to-take-on-anthropic-and-openai-.html"
  - title: "Meta enters the AI coding wars with Muse Spark 1.2 and Muse Code"
    url: "https://venturebeat.com/orchestration/meta-enters-the-ai-coding-wars-with-muse-spark-1-2-and-muse-code-with-persistent-async-background-agents"
  - title: "Introducing Muse Code and Muse Spark 1.2"
    url: "https://research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2"
---

**Summary**: Meta has entered the coding agent race alongside Anthropic and OpenAI, releasing Muse Code in beta — a terminal-based tool that plans, writes, and validates code across large repositories within a single persistent session.

### Key Facts
- **Muse Code**: Free beta available on macOS and Linux via `curl -fsSL https://dev.meta.ai/install.sh | bash`. It manages fleets of async background agents that persist for the entire session rather than spawning per task — reducing context loss on long development workflows.
- **Muse Spark 1.2**: A coding-focused model co-trained with the Muse Code harness itself, featuring a 1-million-token context window and reported gains in code generation, complex debugging, and large-codebase navigation.
- **Local audit log**: Every model call, tool execution, approval, and edit is recorded in a local append-only event log, enabling replay-exact restarts after interruptions.
- **API access**: Muse Spark 1.2 is also available via the Meta Model API for developers and enterprise customers, with expanded global availability.

### Why It Matters
Muse Code's arrival brings a credible third competitor into a market previously split between Anthropic's Claude Code and OpenAI's Codex. Meta's architectural bet on session-persistent agents — rather than per-task spawning — is a meaningful design choice for long-horizon engineering tasks. With major AI labs now all fielding terminal coding agents, 2026 is shaping up as the year this category becomes table stakes for AI platforms.

### Further Reading
- [CNBC report](https://www.cnbc.com/2026/08/05/meta-debuts-muse-code-to-take-on-anthropic-and-openai-.html) — CNBC
- [VentureBeat technical breakdown](https://venturebeat.com/orchestration/meta-enters-the-ai-coding-wars-with-muse-spark-1-2-and-muse-code-with-persistent-async-background-agents) — VentureBeat
