---
title: "NVIDIA Open-Sources NOOA: Build an AI Agent as a Single Python Class"
lang: en
date: 2026-08-08
slug: nvidia-nooa-agent-framework
summary: "NVIDIA released NOOA, an object-oriented Python framework that reduces an AI agent to a single class definition — and claims 82.2% on SWE-bench Verified with GPT-5.5 using half the tokens of prior state-of-the-art."
tags: ["NVIDIA", "agent", "open-source", "Python", "SWE-bench"]
sources:
  - title: "NVIDIA AI Releases NOOA: An Object-Oriented Python Framework"
    url: "https://www.marktechpost.com/2026/08/07/nvidia-ai-releases-nooa-an-object-oriented-python-framework/"
  - title: "Nvidia's NOOA makes an agent one Python class"
    url: "https://thenewstack.io/nvidia-nooa-agent-framework/"
  - title: "NVIDIA Forms 37-Member Open Secure AI Alliance and Open-Sources NOOA Framework"
    url: "https://thehackernews.com/2026/07/nvidia-forms-37-member-open-secure-ai.html"
---

**Summary**: NVIDIA open-sourced NOOA, a framework where one Python class is the entire agent — fields hold state, methods expose capabilities, docstrings serve as prompts, and type annotations define model contracts.

### Key Points
- **Core idea**: one Python class per agent — no separate orchestration layer, scaffolding framework, or prompt templates required
- **Benchmark claim**: 82.2% on SWE-bench Verified (GPT-5.5 backend), beating prior state-of-the-art while using half the tokens and eliminating context compaction
- **Availability**: Apache 2.0, `pip install nooa` (v0.0.8), Python 3.12–3.13; currently classified as alpha / research preview
- **Security caveat**: NVIDIA explicitly warns that NOOA executes LLM-generated Python, which could exfiltrate data or delete files — "not a containment boundary"

### Why It Matters
NOOA challenges the assumption that agent quality lives in the model alone — its benchmark numbers suggest the harness around the model may matter just as much. Paired with the launch of a 37-member Open Secure AI Alliance, NVIDIA is positioning itself as the infrastructure layer for the next wave of agentic software. The alpha label warrants caution; independent benchmark reproduction is needed.

### Read More
- [NVIDIA NOOA overview (MarkTechPost)](https://www.marktechpost.com/2026/08/07/nvidia-ai-releases-nooa-an-object-oriented-python-framework/) — MarkTechPost
- [Nvidia's NOOA: one class, one agent (The New Stack)](https://thenewstack.io/nvidia-nooa-agent-framework/) — The New Stack
