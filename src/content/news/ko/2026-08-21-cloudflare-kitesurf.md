---
title: "Cloudflare, AI 에이전트 전용 브라우저 'Kitesurf' 베타 공개 — Chromium 대비 메모리 1/7"
lang: ko
date: 2026-08-21
slug: cloudflare-kitesurf
summary: "Cloudflare가 AI 에이전트 전용으로 설계한 경량 브라우저 엔진 Kitesurf를 베타로 공개했다. Chromium 기반이 아닌 Rust+WebAssembly로 처음부터 새로 구현해, 일반적인 에이전트 작업에서 메모리를 1/7 수준으로 줄였다."
tags: ["Cloudflare", "AI 에이전트", "브라우저", "인프라", "Rust"]
sources:
  - title: "Cloudflare launches Kitesurf, a browser built for AI agents"
    url: "https://techcrunch.com/2026/08/07/cloudflare-launches-kitesurf-a-browser-built-for-ai-agents/"
  - title: "Introducing Kitesurf, an agent-first browser on Browser Run"
    url: "https://developers.cloudflare.com/changelog/post/2026-08-06-kitesurf/"
---

**한 줄 요약**: Cloudflare가 Chromium 없이 Rust로 새로 만든 AI 에이전트 전용 브라우저 Kitesurf를 베타 공개했다.

### 핵심
- Chromium 대신 Rust·WebAssembly로 HTML 파서, CSS 엔진, JS 실행 환경을 처음부터 구현해 Cloudflare Workers 위에서 구동된다.
- HTML 추출·스크린샷 등 일반적인 에이전트 작업에서 Chromium 대비 메모리 사용량은 약 1/7, CPU는 1/3 수준으로 측정됐다.
- Browser Run의 베타 기능으로 무료 제공; 기존 Puppeteer/Playwright 코드에 `browser=kitesurf` 파라미터만 추가하면 전환 가능하다.
- 구성 요소: Blitz 모듈식 렌더링 엔진, Firefox Stylo CSS 파서, Boa JS 엔진(Rust 기반).

### 왜 중요한가
AI 에이전트가 웹을 탐색하고 데이터를 수집하는 작업에서 Chromium의 높은 메모리 오버헤드는 실제 비용 장벽이다. Kitesurf처럼 에이전트 워크플로에 최적화된 경량 브라우저가 확산되면, 대규모 웹 스크레이핑·자동화 에이전트의 운영 비용이 크게 낮아질 수 있다. Cloudflare의 엣지 인프라와 결합되면 지연 시간도 추가로 줄어든다.

### 더 보기
- [Cloudflare launches Kitesurf, a browser built for AI agents](https://techcrunch.com/2026/08/07/cloudflare-launches-kitesurf-a-browser-built-for-ai-agents/) — TechCrunch
- [Introducing Kitesurf (공식)](https://developers.cloudflare.com/changelog/post/2026-08-06-kitesurf/) — Cloudflare Developers
