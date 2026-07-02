---
title: "Anthropic Claude Goes GA on Azure AI Foundry, Powered by NVIDIA GB300 Blackwell Ultra"
lang: en
date: 2026-07-02
slug: claude-azure-blackwell
summary: "Anthropic's Claude models are now generally available on Microsoft Azure AI Foundry as of June 29, running on NVIDIA GB300 Blackwell Ultra GPUs — cutting inference costs by ~50% versus A100 and generating tokens ~40% faster than H100 nodes."
tags: ["Anthropic", "Claude", "Microsoft", "Azure", "NVIDIA", "Infrastructure"]
sources:
  - title: "Claude Meets Blackwell Ultra: Anthropic's Models Now Run on NVIDIA GB300 in Azure"
    url: "https://blogs.nvidia.com/blog/anthropic-nvidia-gb300-blackwell-ultra-microsoft-azure/"
  - title: "Anthropic Claude Launches On Microsoft Azure Foundry"
    url: "https://dataconomy.com/2026/06/30/anthropic-claude-ai-azure-nvidia-blackwell-ultra-gpus/"
---

**Summary**: Anthropic's Claude suite reached general availability on Microsoft Azure AI Foundry on June 29, 2026, backed by NVIDIA GB300 NVL72 systems and Quantum-X800 InfiniBand — delivering a major step-change in price-performance for enterprise AI workloads.

### Key Facts
- **Hardware**: NVIDIA GB300 NVL72 + Quantum-X800 InfiniBand networking; token costs ~50% lower than A100-based infrastructure
- **Speed**: Claude Sonnet generates tokens ~40% faster than H100 nodes, ~15% faster than B200
- **Availability**: Azure East US, West Europe, and Southeast Asia at GA; more regions through Q3 2026
- **Platform position**: Microsoft is now the only cloud offering both OpenAI and Anthropic frontier models on the same platform, bundled with Azure's compliance, security, and governance stack

### Why It Matters
Token cost is often the bottleneck for long-context and agentic workloads — multi-turn agent loops and million-token document analysis that are technically possible become economically impractical at A100 pricing. GB300-backed Azure Foundry makes these workloads genuinely affordable at enterprise scale, while Azure's compliance layer removes a major barrier for regulated industries that couldn't use third-party AI APIs directly.

### Read More
- [Claude Meets Blackwell Ultra: Anthropic's Models Now Run on NVIDIA GB300 in Azure](https://blogs.nvidia.com/blog/anthropic-nvidia-gb300-blackwell-ultra-microsoft-azure/) — NVIDIA Blog
- [Anthropic Claude Launches On Microsoft Azure Foundry](https://dataconomy.com/2026/06/30/anthropic-claude-ai-azure-nvidia-blackwell-ultra-gpus/) — Dataconomy
