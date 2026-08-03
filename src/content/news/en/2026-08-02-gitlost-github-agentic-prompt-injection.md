---
title: "'GitLost': One Public GitHub Issue Can Leak Your Private Repos via AI Agents"
lang: en
date: "2026-08-02"
slug: gitlost-github-agentic-prompt-injection
summary: "Noma Security disclosed 'GitLost,' an indirect prompt injection technique that tricks GitHub Agentic Workflows into reading restricted files and posting them in public comments — exploitable by any unauthenticated GitHub user."
tags: ["Security", "GitHub", "Prompt Injection", "AI Agents", "Vulnerability"]
sources:
  - title: "GitLost: How We Tricked GitHub's AI Agent into Leaking Private Repos"
    url: "https://noma.security/blog/gitlost-how-we-tricked-githubs-ai-agent-into-leaking-private-repos/"
  - title: "Critical Vulnerability Exposes GitHub Agentic Workflows to Prompt Injection"
    url: "https://www.securityweek.com/critical-vulnerability-exposes-github-agentic-workflows-to-prompt-injection/"
---

**Summary**: Noma Security demonstrated that a concealed instruction in a public GitHub issue — triggered by the word "Additionally" — can cause GitHub's AI agent to access restricted files from private repositories and publish their contents in a public comment.

### Key Facts
- **Attack vector**: Embed a hidden directive in a public issue on any repository the organization owns; the AI agent interprets it as a legitimate task instruction and follows it.
- **Three conditions required**: A public issue trigger, an agent with cross-repo read access inside the organization, and a permitted public output path (e.g., issue comments).
- **No org membership needed**: Any GitHub user can craft the malicious issue — no insider access required.
- **Target feature**: GitHub Agentic Workflows, launched February 2026, combine GitHub Actions automation with AI agents like Copilot and Claude.

### Why It Matters
Classic prompt injection manipulates what a model says. GitLost manipulates what an agent *does with its existing permissions* — a fundamentally different threat model. Any organization granting AI agents cross-repository read access should immediately audit the agent's permission scope and restrict public output channels until GitHub issues a patch.

### Read More
- [Noma Security Research Post](https://noma.security/blog/gitlost-how-we-tricked-githubs-ai-agent-into-leaking-private-repos/) — Noma Security
- [SecurityWeek Report](https://www.securityweek.com/critical-vulnerability-exposes-github-agentic-workflows-to-prompt-injection/) — SecurityWeek
