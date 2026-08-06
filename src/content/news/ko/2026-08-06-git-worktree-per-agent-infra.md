---
title: "Anthropic '에이전트당 git worktree' 권고, 런타임 인프라와 충돌"
lang: ko
date: 2026-08-06
slug: git-worktree-per-agent-infra
summary: "Anthropic이 코딩 에이전트마다 별도 git worktree를 두라고 권하지만, 많은 팀의 기존 런타임 인프라에서는 이 방식이 걸림돌이 된다는 분석이 나왔다."
tags: ["Anthropic", "AI Agents", "DevOps", "Claude Code"]
sources:
  - title: "Anthropic recommends a git worktree per agent. Your runtime infra makes that a problem."
    url: "https://news.google.com/rss/articles/CBMiZEFVX3lxTE5MbTdlYTEzTTEyaHo4YjV2QjJGQ2RkWXdNTkkyYm9zODJKeVNtTUVTRUpjNHgwX3Jmam52OXNPaG1laXVmYlcwbjRvdTNYa0JjSnNUS0s0dUVPNjc0Qm5HcmpzV1o?oc=5"
---

**한 줄 요약**: Anthropic이 권하는 '에이전트마다 별도 git worktree' 패턴이 기존 런타임·CI 인프라와 잘 맞지 않는다는 지적이 제기됐다.

### 핵심
- Anthropic은 여러 코딩 에이전트를 병렬로 돌릴 때 **에이전트마다 독립된 git worktree**를 두어 작업 충돌을 막을 것을 권장한다.
- The New Stack은 이 방식이 하나의 컨테이너·단일 체크아웃을 전제로 짜인 **기존 런타임 인프라와 마찰**을 일으킨다고 분석했다.
- 병렬 에이전트마다 격리된 파일시스템·의존성 환경을 마련하려면 빌드 캐시, 컨테이너 구성, CI 파이프라인 재설계가 필요할 수 있다.

### 왜 중요한가
멀티 에이전트 코딩이 확산되면서 병렬 실행의 격리 방식이 새로운 인프라 과제로 떠오르고 있다. 에이전트 워크플로를 실제 운영에 얹으려는 팀은 도구 권장안과 자사 배포 환경 사이의 간극을 미리 점검할 필요가 있다.

### 더 보기
- [Anthropic recommends a git worktree per agent. Your runtime infra makes that a problem.](https://news.google.com/rss/articles/CBMiZEFVX3lxTE5MbTdlYTEzTTEyaHo4YjV2QjJGQ2RkWXdNTkkyYm9zODJKeVNtTUVTRUpjNHgwX3Jmam52OXNPaG1laXVmYlcwbjRvdTNYa0JjSnNUS0s0dUVPNjc0Qm5HcmpzV1o?oc=5) — The New Stack
