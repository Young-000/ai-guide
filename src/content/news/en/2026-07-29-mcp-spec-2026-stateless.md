---
title: "MCP's Biggest-Ever Spec Update Goes Stateless, Hardens Enterprise Auth"
lang: en
date: 2026-07-29
slug: mcp-spec-2026-stateless
summary: "The Model Context Protocol's 2026-07-28 specification, released under the Agentic AI Foundation, removes all session state from the protocol layer and adds mandatory per-request headers — the largest change since MCP launched."
tags: ["MCP", "AI agents", "open source", "LLM", "authentication", "standards"]
sources:
  - title: "MCP just got its biggest update ever — here's what changes for AI agents"
    url: "https://venturebeat.com/infrastructure/mcp-just-got-its-biggest-update-ever-heres-what-changes-for-ai-agents"
  - title: "MCP gets an enterprise makeover"
    url: "https://www.theregister.com/ai-and-ml/2026/07/29/mcp-gets-an-enterprise-makeover/"
  - title: "The 2026-07-28 Specification"
    url: "https://blog.modelcontextprotocol.io/posts/2026-07-28/"
---

**Summary**: The Agentic AI Foundation shipped the MCP 2026-07-28 specification on July 28, making the protocol fully stateless and mandating per-request headers — a foundational shift that enables horizontal scaling of MCP servers and closes an OAuth security gap.

### Key Facts
- **Session model removed**: six Specification Enhancement Proposals (SEPs) collectively eliminate the `initialize/initialized` handshake; MCP no longer tracks state at the protocol layer
- **Per-request headers required**: every call must include `MCP-Protocol-Version`, `Mcp-Method`, and `Mcp-Name` — any server instance can now handle any request, enabling standard load balancing
- **SEP-2468**: adds mandatory `iss` (issuer) validation in OAuth authorization responses, blocking OAuth Mixup Attacks
- Governing body: Agentic AI Foundation (Linux Foundation directed fund) with Anthropic, OpenAI, Google, Microsoft, and Block as platinum members

### Why It Matters
Removing sticky sessions lets teams deploy MCP servers behind standard load balancers and scale them like any other stateless microservice — a practical blocker for enterprise adoption that is now resolved. With all major AI labs in the governance structure, MCP's trajectory toward becoming the default AI-tool connectivity standard looks increasingly assured.

### Read More
- [MCP just got its biggest update ever](https://venturebeat.com/infrastructure/mcp-just-got-its-biggest-update-ever-heres-what-changes-for-ai-agents) — VentureBeat
- [The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/) — MCP Official Blog
