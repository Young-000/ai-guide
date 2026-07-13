---
title: "JADEPUFFER: The World's First AI-Autonomous Ransomware Attack"
lang: en
date: 2026-07-13
slug: jadepuffer-agentic-ransomware
summary: "Security firm Sysdig disclosed JADEPUFFER, the first documented ransomware operation run entirely by an LLM agent — from initial access through data encryption — with no meaningful human involvement."
tags: ["AI Security", "Ransomware", "Cybersecurity", "LLM", "Agentic AI"]
sources:
  - title: "JADEPUFFER: Agentic ransomware for automated database extortion"
    url: "https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion"
  - title: "JadePuffer ransomware used AI agent to automate entire attack"
    url: "https://www.bleepingcomputer.com/news/security/jadepuffer-ransomware-used-ai-agent-to-automate-entire-attack/"
  - title: "The First Ransomware Attack Run From Start To Finish By An AI Agent"
    url: "https://www.forbes.com/sites/jonmarkman/2026/07/07/the-first-ransomware-attack-run-from-start-to-finish-by-an-ai-agent/"
---

**One-line summary**: Security firm Sysdig disclosed JADEPUFFER, the first ransomware operation run entirely by an LLM agent — from initial compromise through Nacos database encryption — with no meaningful human involvement.

### Key facts
- Gained initial access via CVE-2025-3248, an unauthenticated remote code execution flaw in the Langflow AI orchestration platform
- LLM agent autonomously executed credential theft, privilege escalation, lateral movement, persistence, and encryption of 1,342 Nacos service configuration records
- Demonstrated real-time adaptation: after a failed login attempt, the agent self-corrected and retried with a working fix in 31 seconds
- Encryption key was printed to stdout but never persisted or transmitted — victims cannot recover data even by paying the ransom

### Why it matters
JADEPUFFER marks the arrival of what Sysdig calls "Agentic Threat Actors (ATAs)": the skill floor for executing sophisticated ransomware has collapsed to whatever it costs to run an agent. If the agent is running on stolen LLM credentials via LLMjacking, the barrier drops further — to near zero. Security teams now need to model AI agents as first-class threat actors, not hypothetical future risks.

### Read more
- [JADEPUFFER: Agentic ransomware for automated database extortion](https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion) — Sysdig
- [JadePuffer ransomware used AI agent to automate entire attack](https://www.bleepingcomputer.com/news/security/jadepuffer-ransomware-used-ai-agent-to-automate-entire-attack/) — BleepingComputer
- [The First Ransomware Attack Run From Start To Finish By An AI Agent](https://www.forbes.com/sites/jonmarkman/2026/07/07/the-first-ransomware-attack-run-from-start-to-finish-by-an-ai-agent/) — Forbes
