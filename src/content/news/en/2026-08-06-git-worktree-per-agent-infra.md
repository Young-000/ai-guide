---
title: "Anthropic's 'One Git Worktree Per Agent' Advice Clashes With Runtime Infra"
lang: en
date: 2026-08-06
slug: git-worktree-per-agent-infra
summary: "Anthropic recommends giving each coding agent its own git worktree, but an analysis argues this pattern conflicts with the runtime infrastructure many teams already run."
tags: ["Anthropic", "AI Agents", "DevOps", "Claude Code"]
sources:
  - title: "Anthropic recommends a git worktree per agent. Your runtime infra makes that a problem."
    url: "https://news.google.com/rss/articles/CBMiZEFVX3lxTE5MbTdlYTEzTTEyaHo4YjV2QjJGQ2RkWXdNTkkyYm9zODJKeVNtTUVTRUpjNHgwX3Jmam52OXNPaG1laXVmYlcwbjRvdTNYa0JjSnNUS0s0dUVPNjc0Qm5HcmpzV1o?oc=5"
---

**In one line**: A report argues that Anthropic's recommended "one git worktree per agent" pattern doesn't sit well with the runtime and CI infrastructure teams already have.

### Key points
- Anthropic recommends giving **each coding agent its own isolated git worktree** to avoid conflicts when running multiple agents in parallel.
- The New Stack argues this collides with **existing runtime infrastructure** built around a single container and a single checkout.
- Providing each parallel agent with an isolated filesystem and dependency environment may require rethinking build caches, container setups, and CI pipelines.

### Why it matters
As multi-agent coding spreads, how to isolate parallel runs is becoming a fresh infrastructure challenge. Teams looking to move agent workflows into production should check the gap between tool recommendations and their own deployment environment early.

### Read more
- [Anthropic recommends a git worktree per agent. Your runtime infra makes that a problem.](https://news.google.com/rss/articles/CBMiZEFVX3lxTE5MbTdlYTEzTTEyaHo4YjV2QjJGQ2RkWXdNTkkyYm9zODJKeVNtTUVTRUpjNHgwX3Jmam52OXNPaG1laXVmYlcwbjRvdTNYa0JjSnNUS0s0dUVPNjc0Qm5HcmpzV1o?oc=5) — The New Stack
