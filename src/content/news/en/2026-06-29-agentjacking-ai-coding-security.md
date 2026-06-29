---
title: "'Agentjacking' Disclosed: New Attack Class Hijacks AI Coding Agents at 85% Success Rate"
lang: en
date: 2026-06-29
slug: agentjacking-ai-coding-security
summary: "Security researchers disclosed a new attack class called 'Agentjacking' that exploits AI coding agents by embedding markdown injection inside fake error reports. Tests showed an 85% exploitation rate, with 2,388 organizations potentially exposed through connected error-tracking platforms."
tags: ["AI security", "agentic AI", "cybersecurity", "markdown injection", "AI coding"]
sources:
  - title: "Agentjacking attack tricks AI coding agents"
    url: "https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html"
  - title: "Agentjacking: AI coding agents and Sentry"
    url: "https://thenextweb.com/news/agentjacking-ai-coding-agents-sentry"
---

**Summary**: Researchers disclosed 'Agentjacking,' a novel attack that manipulates AI coding agents by hiding malicious instructions inside fake error reports as markdown injection — achieving an 85% exploitation rate in testing.

### Key Facts
- **Attack vector**: Adversary crafts fake error reports containing **markdown injection** — AI coding agents parse these as legitimate debugging guidance and execute embedded commands
- **Exploitation rate**: **85% success** in controlled research tests
- **Blast radius**: **2,388 organizations** potentially exposed, primarily through integrations with error-tracking platforms (e.g. Sentry)
- No code modification required — attack weaponizes the agent's own reasoning against it

### Why It Matters
As AI coding agents gain access to terminals, repositories, and CI pipelines, a single successful hijack can enable credential theft, malicious code injection, or supply chain compromise. Agentjacking is notable because it doesn't exploit a software bug — it exploits the agent's core design: trusting context fed from integrated tools. Development teams should treat external inputs (error reports, issue trackers, pull request comments) as untrusted and apply sandboxing or content validation before they reach an agent.

### Read More
- [Agentjacking attack tricks AI coding agents](https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html) — The Hacker News
- [Agentjacking explained via Sentry vector](https://thenextweb.com/news/agentjacking-ai-coding-agents-sentry) — The Next Web
