---
title: "'Agentjacking' Attack Uses Fake Bug Reports to Hijack AI Coding Agents"
lang: en
date: 2026-06-21
slug: agentjacking-coding-agent-security
summary: "Security firm Tenet Security disclosed 'Agentjacking,' a technique that weaponizes public Sentry DSNs to inject crafted error events, tricking AI coding agents into executing attacker-controlled code with developer-level privileges."
tags: ["Security", "AI Agents", "Sentry", "Developer Tools", "Vulnerability"]
sources:
  - title: "Agentjacking Attack Tricks AI Coding Agents Into Running Malicious Code"
    url: "https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html"
  - title: "Agentjacking: a fake bug report can hijack your AI coding agent"
    url: "https://thenextweb.com/news/agentjacking-ai-coding-agents-sentry"
---

**Summary**: A new class of attack called Agentjacking exploits the implicit trust AI coding agents place in error monitoring data — no system breach required.

### Key Facts
- Disclosed by Tenet Security on June 3, 2026; attackers use **publicly accessible Sentry DSNs** to inject malicious instructions into error event payloads
- When a developer asks their AI agent to fix a reported error, the agent treats the payload as a trusted directive and **executes attacker code with the developer's own privileges**
- Researchers found **2,388 organizations exposed** using only public APIs; over 100 agents acted on injected commands in controlled tests, including Fortune 100 firms
- Data at risk: environment variables, Git credentials, private repository URLs

### Why It Matters
Agentjacking doesn't exploit a software vulnerability — it exploits the **AI agent's trust model**. Sentry has added a content filter, but the underlying problem remains: agents that treat unvetted external output as commands are structurally vulnerable. Developers using Cursor, GitHub Copilot, or similar tools with Sentry integrations should audit their configuration now. Tenet has released a mitigation tool called Agent-JackStop.

### Read More
- [Agentjacking Attack Tricks AI Coding Agents](https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html) — The Hacker News
- [Agentjacking: a fake bug report can hijack your AI coding agent](https://thenextweb.com/news/agentjacking-ai-coding-agents-sentry) — The Next Web
