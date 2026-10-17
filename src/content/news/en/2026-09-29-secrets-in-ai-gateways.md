---
title: "Catching Leaked Secrets at the AI Gateway"
lang: en
date: 2026-09-29
slug: secrets-in-ai-gateways
summary: "GitGuardian outlines how to detect leaked API keys and credentials in the prompts and responses passing through an AI gateway."
tags: ["Security", "GenerativeAI", "AIGateway", "GitGuardian", "Secrets"]
sources:
  - title: "Generative AI Security: Catch Secrets in Your AI Gateway"
    url: "https://news.google.com/rss/articles/CBMinwFBVV95cUxONTNlb2c2RW5zVWRrLTN2dlRUTU1rUHdzNHQ4NC13MFVQZGZLQW13TkRxRWFkdmNEd3F2b3pGWHpFRGg0YnhGSlJnQ0R4R18yRXBJYm9oTHpXb2lua05NVnFiZ1RVZnhLVDI5MmpsZFBWSVV6dmFWa29TQjZTN2c0MXhKenRWbnl6ak8yR3o0eEgtdnhVQkRKM0FCZ19jWVU?oc=5"
---

**In one line**: Security firm GitGuardian proposes using the AI gateway as a checkpoint to catch secrets leaking through traffic to and from LLMs.

### Key points
- When developers paste API keys, tokens, or credentials into prompts, those values can be forwarded straight to external LLM providers.
- GitGuardian reportedly argues that scanning for secrets at the **AI gateway** — where every request and response passes — lets teams block leaks from a central point.
- Many organizations already run a gateway for cost control, model routing, and logging, so the pitch is to layer secret detection onto that existing choke point.

### Why it matters
As LLM adoption grows, sensitive data embedded in prompts has emerged as a new leak vector. It signals that secret detection, long focused on code repositories, needs to extend into the AI traffic layer.

### Read more
- [Generative AI Security: Catch Secrets in Your AI Gateway](https://news.google.com/rss/articles/CBMinwFBVV95cUxONTNlb2c2RW5zVWRrLTN2dlRUTU1rUHdzNHQ4NC13MFVQZGZLQW13TkRxRWFkdmNEd3F2b3pGWHpFRGg0YnhGSlJnQ0R4R18yRXBJYm9oTHpXb2lua05NVnFiZ1RVZnhLVDI5MmpsZFBWSVV6dmFWa29TQjZTN2c0MXhKenRWbnl6ak8yR3o0eEgtdnhVQkRKM0FCZ19jWVU?oc=5) — GitGuardian Blog
