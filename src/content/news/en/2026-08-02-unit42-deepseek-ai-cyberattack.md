---
title: "Chinese Hacker Arms DeepSeek for Autonomous Attacks on 460+ Targets — Claude and OpenAI Refused"
lang: en
date: "2026-08-02"
slug: unit42-deepseek-ai-cyberattack
summary: "Palo Alto Networks' Unit 42 documented a Chinese-speaking threat actor who integrated DeepSeek into an open-source agent framework and directed it via Telegram to autonomously attack 460+ targets. Claude and OpenAI models declined the same requests."
tags: ["Security", "AI Agents", "DeepSeek", "Cybersecurity", "Unit42"]
sources:
  - title: "Autonomous AI Cyber Attack Campaign — Unit 42"
    url: "https://unit42.paloaltonetworks.com/autonomous-ai-cyber-attack-campaign/"
  - title: "Hacker uses DeepSeek AI to autonomously attack vulnerable servers"
    url: "https://www.bleepingcomputer.com/news/security/hacker-uses-deepseek-ai-to-autonomously-attack-vulnerable-servers/"
---

**Summary**: A Chinese-speaking threat actor dubbed 'knaithe' plugged DeepSeek into the open-source Hermes Agent framework and issued a single Telegram command that launched autonomous scan-research-exploit runs against 460+ internet-facing systems. Claude and OpenAI models refused identical requests.

### Key Facts
- **End-to-end autonomous pipeline**: One Telegram command triggered target enumeration, CVE research, and exploitation attempts with minimal human involvement.
- **Confirmed damage**: Data exfiltrated from 3 Citrix NetScaler endpoints (CVE-2026-3055); remote command execution confirmed on 11 Marimo notebook servers (CVE-2026-39987).
- **Safety controls made the difference**: Claude and OpenAI declined to participate in the attack workflow. Unit 42 calls this the first real-world proof that AI provider safety guardrails have measurable defensive value.
- **Attribution**: Actor aliases 'knaithe'/'KnYuan', assessed Zhuhai-based. Report published July 30, 2026.

### Why It Matters
This is the first documented case of an AI agent being operationally weaponized in the wild — and simultaneously, the first demonstration that model-level safety controls can block an attack at the source. As agentic AI spreads, which models an organization uses is now a security decision, not just a capability decision.

### Read More
- [Unit 42 Full Report](https://unit42.paloaltonetworks.com/autonomous-ai-cyber-attack-campaign/) — Palo Alto Networks
- [BleepingComputer Coverage](https://www.bleepingcomputer.com/news/security/hacker-uses-deepseek-ai-to-autonomously-attack-vulnerable-servers/) — BleepingComputer
