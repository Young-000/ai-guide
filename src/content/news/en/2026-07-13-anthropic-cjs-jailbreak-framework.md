---
title: "Anthropic Proposes Five-Tier Industry Standard for Rating AI Jailbreak Severity"
lang: en
date: 2026-07-13
slug: anthropic-cjs-jailbreak-framework
summary: "Anthropic, alongside Amazon, Microsoft, and Google, released the Cyber Jailbreak Severity (CJS) framework — a five-tier scale for quantifying how dangerous an AI jailbreak actually is, introduced alongside Claude Fable 5's post-suspension safety update."
tags: ["Anthropic", "Safety", "Jailbreak", "LLM", "Cybersecurity"]
sources:
  - title: "More details on Fable 5's cyber safeguards and our jailbreak framework"
    url: "https://www.anthropic.com/news/fable-safeguards-jailbreak-framework"
  - title: "Anthropic Details Claude Fable 5 Cybersecurity Safeguards and Jailbreak Framework"
    url: "https://cybersecuritynews.com/anthropic-claude-fable-5-cybersecurity/"
---

**Summary**: Anthropic published the Cyber Jailbreak Severity (CJS) framework — a five-tier, exponential scale co-developed with Amazon, Microsoft, and Google to standardize how dangerous an AI jailbreak is rated.

### Key Points
- Five tiers from CJS-0 (Informational) to CJS-4 (Critical); each step represents exponentially greater risk than the last
- Severity is scored across four axes: capability gain, breadth of harm, ease of weaponization, and discoverability
- Scope is limited to cybersecurity jailbreaks; non-cyber misuse (e.g., system-prompt extraction) is explicitly excluded
- Released alongside a new Claude Fable 5 safety classifier that Anthropic says blocks over 99% of attempts replicating the June jailbreak that triggered a 19-day US export-control suspension

### Why It Matters
Until now, there has been no shared vocabulary for comparing jailbreak incidents across the AI industry. If adopted, CJS gives companies, regulators, and security researchers a common scale — analogous to CVSS scores in traditional cybersecurity — to communicate incident severity and set consistent remediation thresholds.

### Read More
- [Anthropic official post](https://www.anthropic.com/news/fable-safeguards-jailbreak-framework) — Anthropic
- [Deep dive analysis](https://cybersecuritynews.com/anthropic-claude-fable-5-cybersecurity/) — CybersecurityNews
