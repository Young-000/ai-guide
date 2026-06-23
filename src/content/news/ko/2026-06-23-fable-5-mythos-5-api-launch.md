---
title: "Claude Fable 5, 오늘부터 구독 플랜 무료 종료 — 개발자 API 변경 사항 총정리"
lang: ko
date: 2026-06-23
slug: fable-5-mythos-5-api-launch
summary: "6월 23일부터 Claude Fable 5가 Pro·Max·Team·Enterprise 플랜 무료 사용 기간이 종료되며 크레딧 과금으로 전환된다. 새 거부(refusal) API 동작 등 개발자가 즉시 확인해야 할 변경 사항을 정리했다."
tags: ["Anthropic", "Claude", "Fable 5", "API", "LLM"]
sources:
  - title: "Introducing Claude Fable 5 and Claude Mythos 5"
    url: "https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5"
---

**한 줄 요약**: 6월 9일 출시된 Claude Fable 5의 구독 플랜 무료 포함 기간이 오늘(6월 23일) 종료되며, Anthropic은 새 거부 응답 형식과 Adaptive Thinking 전용 모드 등 API 통합 개발자에게 직결되는 변경 사항을 함께 적용했다.

### 핵심
- **요금 전환**: Pro·Max·Team·Enterprise 플랜에서 오늘부터 Fable 5 사용 시 크레딧 차감 — 입력 100만 토큰당 $10, 출력 100만 토큰당 $50(Mythos Preview 대비 절반 이하)
- **새 API 동작**: 요청 거부 시 HTTP 에러가 아닌 200 OK + `stop_reason: "refusal"` 반환; 거부 전 출력 없으면 비과금, 폴백 재시도 시 프롬프트 캐시 비용 환급
- **컨텍스트**: 기본 100만 토큰, 최대 출력 128K 토큰; Adaptive Thinking 항상 활성 — `thinking: disabled` 옵션 미지원
- **Claude Mythos 5**: Fable 5와 동일 기반 모델에서 안전 분류기 제거 — Project Glasswing 승인 고객 한정 제공(claude-mythos-5)
- **데이터 보존**: 양 모델 모두 30일 보존 정책 적용, 제로 데이터 보존 옵션 없음

### 왜 중요한가
무료 기간 종료는 수백만 구독자에게 즉각적인 요금 변화를 가져오며, `stop_reason: "refusal"` 처리 로직이 없는 API 통합은 예상치 못한 응답 형태를 받게 된다. 개발 팀은 오늘 전에 폴백 파라미터 또는 SDK 미들웨어를 적용해야 한다.

### 더 보기
- [Introducing Claude Fable 5 and Claude Mythos 5](https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5) — Anthropic Docs
