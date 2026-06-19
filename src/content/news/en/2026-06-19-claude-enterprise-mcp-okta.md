---
title: "Claude Enterprise Launches Zero-Touch MCP Connector Provisioning via Okta"
lang: en
date: 2026-06-19
slug: claude-enterprise-mcp-okta
summary: "Anthropic released enterprise-managed MCP connector authorization for Claude Team and Enterprise plans. Admins provision connectors once via Okta; employees get automatic access to Asana, Atlassian, Figma, and more on first login — no extra OAuth steps."
tags: ["Anthropic", "Claude", "Enterprise", "MCP", "Okta", "Security", "IdentityManagement"]
sources:
  - title: "Centrally manage authorization for MCP connectors"
    url: "https://claude.com/blog/enterprise-managed-auth"
  - title: "Okta becomes a featured identity provider for Claude Enterprise"
    url: "https://www.okta.com/en-ca/newsroom/press-releases/okta-becomes-a-featured-identity-provider-powering-secure-ai-agent-connections-for-claude-enterprise/"
---

**Summary**: Anthropic shipped a beta of centralized MCP connector authorization for Claude Enterprise, letting IT admins provision org-wide tool access through Okta so employees inherit connections automatically on first login.

### Key Facts
- **How it works**: Admins set up connectors in their Okta IdP once; employees get auto-provisioned access scoped to their existing IdP groups and roles — no manual OAuth per user
- **Launch connectors**: Asana, Atlassian, Canva, Figma, Granola, Linear, Supabase in beta; Slack coming soon
- **Scope**: Applies uniformly across Claude chat, Claude Code, and Claude Cowork on Team and Enterprise plans
- **Security controls**: Admins can require connectors to only ever authenticate through the IdP, cleanly separating work and personal accounts; Ramp deployed this to 2,000 employees with zero extra steps

### Why It Matters
The biggest friction in rolling out AI agents at enterprise scale isn't model capability — it's connecting agents to the right tools under the right security policy. By tying MCP authorization to an existing identity provider, Anthropic removes the per-user OAuth bottleneck and brings AI tool access under the same governance model IT already manages. This lowers the barrier for large-scale Claude automation deployments and sets a new baseline expectation for enterprise AI platforms.

### Read More
- [Centrally manage authorization for MCP connectors](https://claude.com/blog/enterprise-managed-auth) — Claude Official Blog
- [Okta becomes featured identity provider for Claude Enterprise](https://www.okta.com/en-ca/newsroom/press-releases/okta-becomes-a-featured-identity-provider-powering-secure-ai-agent-connections-for-claude-enterprise/) — Okta Newsroom
