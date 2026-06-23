---
title: "Anthropic Ships Keyless Auth for Claude API: Workload Identity Federation Now GA"
lang: en
date: 2026-06-23
slug: claude-wif-keyless-auth
summary: "Anthropic's Workload Identity Federation (WIF) is now generally available, letting workloads authenticate to the Claude API with short-lived OIDC tokens instead of static API keys — eliminating a common enterprise security risk."
tags: ["Anthropic", "Claude", "Security", "API", "Authentication", "Enterprise"]
sources:
  - title: "Workload Identity Federation is now generally available on the Claude Platform"
    url: "https://claude.com/blog/workload-identity-federation"
  - title: "Anthropic Workload Identity Federation: What It Gets Right – and What It Still Doesn't Solve"
    url: "https://securityboulevard.com/2026/06/anthropic-workload-identity-federation-what-it-gets-right-and-what-it-still-doesnt-solve/"
---

**Summary**: Anthropic's Workload Identity Federation (WIF) is now generally available, replacing long-lived `sk-ant-*` API keys with short-lived OIDC tokens sourced from enterprise identity providers.

### Key facts
- **Supported identity providers**: AWS IAM, Google Cloud, GitHub Actions, Kubernetes, SPIFFE, Microsoft Entra ID, and Okta — any standards-compliant OIDC issuer
- Tokens expire in **minutes**, not never — no static secrets to store in CI, rotate on a schedule, or worry about leaking
- New **Admin API endpoints** let organizations manage issuers, service accounts, and federation rules programmatically, making this viable at scale
- **API keys remain supported in parallel** — teams can migrate one workload at a time without a hard cutover

### Why it matters
As AI agents move deeper into production workflows, credential management becomes a new attack surface. Static API keys stuffed into environment variables or CI secrets are a well-known failure mode. WIF closes that gap by aligning Claude authentication with the zero-trust posture that enterprise security teams already enforce for cloud workloads. For organizations deploying Claude in automated pipelines, this removes a blocker that previously required compensating controls.

### Read more
- [WIF now GA (official post)](https://claude.com/blog/workload-identity-federation) — Anthropic
- [WIF security analysis](https://securityboulevard.com/2026/06/anthropic-workload-identity-federation-what-it-gets-right-and-what-it-still-doesnt-solve/) — Security Boulevard
