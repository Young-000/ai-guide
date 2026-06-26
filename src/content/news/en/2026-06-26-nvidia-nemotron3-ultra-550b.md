---
title: "NVIDIA Open-Sources Nemotron 3 Ultra 550B — Top US Open-Weights Model with 1M-Token Context and Commercial License"
lang: en
date: 2026-06-26
slug: nvidia-nemotron3-ultra-550b
summary: "NVIDIA released Nemotron 3 Ultra, a 550B-parameter open-weights MoE model that ranks #1 among US open-weights models on Artificial Analysis's Intelligence Index, featuring a native 1M-token context window and full release of weights, training data, and recipes under a permissive commercial license."
tags: ["NVIDIA", "Nemotron", "open weights", "MoE", "LLM", "open source"]
sources:
  - title: "NVIDIA AI Releases Nemotron 3 Ultra: An Open 550B MoE Hybrid Mamba-Transformer"
    url: "https://www.marktechpost.com/2026/06/04/nvidia-ai-releases-nemotron-3-ultra-an-open-550b-mixture-of-experts-hybrid-mamba-transformer-for-long-running-agents/"
  - title: "Nemotron 3 Ultra announced: high-speed, leading US open weights intelligence"
    url: "https://artificialanalysis.ai/articles/nvidia-nemotron-3-ultra-launch-announced"
  - title: "NVIDIA Nemotron 3 Ultra: 550B Open Reasoning Model Live"
    url: "https://www.digitalapplied.com/blog/nvidia-nemotron-3-ultra-550b-open-reasoning-model-2026"
---

**One-line summary**: NVIDIA open-sourced Nemotron 3 Ultra, a 550B-parameter (55B active) hybrid Mamba-Transformer MoE model built for long-horizon agentic tasks — the strongest US open-weights release to date by benchmark intelligence score.

### Key facts
- Architecture: 550B total / 55B active parameters; interleaved Mamba-2, MoE, and selective Attention layers (LatentMoE design)
- Context: 1 million tokens natively
- Throughput: 300+ tokens/second
- License: Linux Foundation OpenMDW-1.1 (commercially permissive)
- Score: 48 on Artificial Analysis Intelligence Index — #1 among US open-weights, behind China's Kimi K2.6 at 54
- Ships with 4 checkpoints (NVFP4, BF16 instruct, BF16 base, GenRM) plus training data and recipes
- Available June 4 on Hugging Face, OpenRouter, and NVIDIA NIM

### Why it matters
With Meta's Llama release cadence slowing, NVIDIA is staking a direct claim in the open-weights ecosystem — not just as chip supplier but as model provider. Nemotron 3 Ultra beats other US open models by a wide margin on agent workloads, but the gap with China's open frontier (Kimi K2.6, GLM-5) signals that US open-source still trails internationally, keeping the competitive pressure high.

### Read more
- [NVIDIA AI Releases Nemotron 3 Ultra: Open 550B MoE Hybrid](https://www.marktechpost.com/2026/06/04/nvidia-ai-releases-nemotron-3-ultra-an-open-550b-mixture-of-experts-hybrid-mamba-transformer-for-long-running-agents/) — MarkTechPost
- [Nemotron 3 Ultra: high-speed, leading US open weights intelligence](https://artificialanalysis.ai/articles/nvidia-nemotron-3-ultra-launch-announced) — Artificial Analysis
