---
title: "Claude Integrates with Apple Foundation Models — Available Across iOS 27, Xcode 27"
lang: en
date: 2026-06-27
slug: claude-apple-foundation-models
summary: "Anthropic released a Swift package integrating Claude into Apple's Foundation Models framework, enabling developers on iOS 27, macOS 27, and all other Apple platforms to route complex queries to Claude alongside the free on-device model."
tags: ["Anthropic", "Claude", "Apple", "iOS27", "Foundation Models", "Xcode"]
sources:
  - title: "Claude support for Apple's Foundation Models framework"
    url: "https://claude.com/blog/claude-for-foundation-models"
  - title: "WWDC 2026: Xcode 27 Routes to Claude and Gemini, Apple Foundation Models Now Free for Smaller Developers"
    url: "https://aitoolsrecap.com/Blog/apple-wwdc-2026-xcode-27-claude-gemini-foundation-models-developers"
  - title: "Apple aids app development with new intelligence frameworks and advanced tools"
    url: "https://www.apple.com/newsroom/2026/06/apple-aids-app-development-with-new-intelligence-frameworks-and-advanced-tools/"
---

**Summary**: Anthropic launched a Swift package that plugs Claude into Apple's revamped Foundation Models framework, giving developers a unified API to blend free on-device inference with Claude's cloud capabilities across all Apple platforms.

### Key Points
- Apple introduced a public `LanguageModel` protocol at WWDC 2026, turning Foundation Models into a single front end for any AI provider — Claude and Gemini ship as first-party integrations
- Supported platforms: iOS 27, iPadOS 27, macOS 27, visionOS 27, watchOS 27
- Developers prototype against the free on-device model and route harder prompts to Claude by swapping a Swift Package Manager dependency — no changes to session logic required
- Xcode 27 also integrates Claude directly for in-IDE code assistance, extending Anthropic's reach into the full Apple development workflow

### Why It Matters
Apple's massive developer ecosystem now functions as a distribution channel for Claude, opening a front Anthropic hasn't owned: AI embedded natively in third-party apps. The hybrid on-device/cloud architecture lets developers balance cost, latency, and capability without rewriting their inference layer — a practical advantage that could accelerate Claude adoption in the App Store economy.

### Further Reading
- [Anthropic Blog Post](https://claude.com/blog/claude-for-foundation-models) — Anthropic
- [AIToolsRecap Coverage](https://aitoolsrecap.com/Blog/apple-wwdc-2026-xcode-27-claude-gemini-foundation-models-developers) — AIToolsRecap
- [Apple Newsroom](https://www.apple.com/newsroom/2026/06/apple-aids-app-development-with-new-intelligence-frameworks-and-advanced-tools/) — Apple
