# ai-guide 자동발행 — 생성 지침 (스케줄된 Claude가 매 실행마다 따름)

> 목표: **"진짜 뉴스채널 대신 볼 수 있을 만큼 간결한 AI/LLM 뉴스 다이제스트"**를 한국어+영어로 발행한다.
> 독자가 이 사이트만 보면 오늘의 AI 소식을 5분 안에 파악할 수 있어야 한다. 긴 기사 ✗, 스캔되는 브리핑 ✓.

## 실행 절차 (매 5시간)
1. `npm run fetch-news` 실행 → `scripts/worklist.json` 생성(신규 항목).
2. worklist가 비었으면 → `src/content/_backlog.json`(에버그린 주제)에서 1개, 그것도 없으면 이번 회차 skip.
3. worklist 상위 **최대 3건**만 처리(품질·토큰 관리).
4. 각 항목 → 아래 포맷으로 **ko + en 한 쌍** 마크다운 작성:
   - `src/content/news/ko/YYYY-MM-DD-<slug>.md`
   - `src/content/news/en/YYYY-MM-DD-<slug>.md`
   - `slug`은 영어 kebab-case, 양언어 동일.
5. 처리한 원문 URL을 `scripts/_published.json`의 `urls`에 추가(중복 방지 상태).
6. `git add src/content/news scripts/_published.json` → 커밋 `feat(news): N개 다이제스트 발행` → `git push origin main`.
   - main은 Vercel git 연결됨 → 푸시 시 자동 배포.

## frontmatter 계약 (Phase 1 로더와 일치 — 반드시 준수)
```yaml
---
title: "<간결한 헤드라인 (원문 복붙 금지, 재작성)>"
lang: ko            # 또는 en
date: <YYYY-MM-DD>
slug: <kebab-slug>  # 양언어 동일
summary: "<1~2문장 요약 (meta description)>"
tags: ["LLM", "OpenAI", ...]
sources:
  - title: "<원문 제목>"
    url: "<원문 URL>"
---
```

## 본문 포맷 (★핵심 — 다이제스트, 줄글 금지)
~150~300단어. 다음 구조:
```markdown
**한 줄 요약**: <무슨 일인지 1문장>

### 핵심
- <불렛 2~4개: 사실 위주, 숫자/이름 포함>

### 왜 중요한가
<1~2문장: 맥락·영향. 독자가 "그래서?"에 답이 되게>

### 더 보기
- [원문 제목](url) — 출처명
```

## 품질·정책 가드 (AdSense / 저작권)
- **원문 복붙 절대 금지.** 반드시 자기 문장으로 재작성 + 맥락 한 줄 추가(value-add).
- 출처 명시 링크 필수. 원문 전문 복제 ✗, 요약+해설+링크 ✓.
- 사실 확인: 불확실하면 단정 금지("~로 알려졌다" 톤).
- 한국어판/영어판 둘 다 작성(한쪽 누락 시 그 항목 발행 보류).
- 같은 사건 중복 발행 금지(`_published.json` + 기존 slug 확인).

## 톤
- 한국어: 간결한 개조식, 군더더기 없는 뉴스 톤.
- 영어: concise, neutral newswire tone.
- 과장·낚시 제목 금지. 정확하고 스캔 가능하게.
