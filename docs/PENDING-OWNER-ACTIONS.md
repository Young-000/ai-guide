# Pending Owner Actions — aiwire.news & hottrend.news

> 코드는 전부 대기(스위치 OFF). 아래 항목은 키/토큰/계정을 넣으면 즉시 켜집니다. (2026-06-16 기록)

## 🔴🔴 최우선 (2026-08-02 주간 PM 발견) — GitHub push 자격증명 만료 → 발행이 라이브에 안 올라감

> **증상**: 콘텐츠 엔진은 07-29 복구돼 정상 발화 중(최근 7일 13커밋 생성·커밋 성공)인데, **origin/main 마지막 push가 07-29(`9f8d4b2`)에 멈췄고 로컬 main이 13커밋 앞선 채 갇힘.** 라이브(aiwire.news)에는 07-29 이후 신규 다이제스트가 한 건도 안 올라갔다.
>
> **근본 원인**: `git push origin main`이 `could not read Username for 'https://github.com': Device not configured`로 실패. 이 머신의 GitHub 자격증명이 전부 무효 — (1) `gh auth status` = 토큰 invalid(Young-000), (2) SSH = `Permission denied (publickey)`, (3) osxkeychain에 github.com 항목 없음. `publish-local.sh:88`의 `git push`가 매 크론 실행마다 조용히 실패해도 스크립트가 성공으로 끝난다(로컬 로그는 `✓ written`까지만 초록).
>
> **07-26 기록의 사각지대**: 그때 "cron 발화·생성 ✅"까지만 검증했고 push 단계는 대화형 부모 컨텍스트 덕에 우연히 통과했을 뿐, 크론의 push 자격증명은 한 번도 실측 안 했다. LESSONS 07-29 "라이브가 안 바뀌면 실패"의 세 번째 변종(생성 OK·커밋 OK·**push FAIL**).

| 복구 경로 | 필요 조치 | 비고 |
|---|---|---|
| **옵션 A (권장) — CI로 push 일원화** | GitHub repo secret에 `ANTHROPIC_API_KEY` 등록 → `auto-news.yml`이 생성+커밋+push 전부 러너에서 수행(러너는 `GITHUB_TOKEN` 자동, 로컬 자격증명 불필요) | 로컬 머신 인증에 대한 의존을 영구 제거. 단 API 과금 발생 |
| **옵션 B — 로컬 push 자격증명 복구** | `gh auth login -h github.com`(또는 SSH 키 재등록) 1회 → osxkeychain에 유효 토큰 저장 → 로컬 keyless 크론이 생성+push 완주 | 과금 0(구독 인증 유지), 단 자격증명이 로컬 세션/Keychain에 다시 묶임(만료 재발 위험) |

> ⏳ 이 블로커가 열려 있는 한 야간 사이클이 무엇을 머지해도 라이브 반영 0. **주간 PM(2026-08-02)은 push를 직접 시도했으나 자격증명 부재로 불가 — 순수 오너 조치.** 복구되면 즉시 `git push origin main`으로 갇힌 13커밋이 배포됨.

---

## ✅ 해소됨 (2026-07-26) — 콘텐츠 엔진 정지

> 07-11~19 8일 + 07-24 이후 재차 정지했던 자동 발행이 **로컬 키리스 경로로 복구**됨.

| 항목 | 상태 | 비고 |
|---|---|---|
| 키리스 발행 (대화형) | ✅ 검증됨 | RSS 9/9 피드 수집 → 3/3 기사 쌍 생성 성공. 07-26자 3건 발행 완료 |
| 정기 실행 (cron) | ✅ 등록·발화 확인 | `10 0,5,10,15,20 * * *`. 23:10:00 정각 발화 + RSS 9/9 수집까지 실측. 로그 `~/.claude/logs/ai-guide-publish.log` |
| **🔴 cron용 장기 토큰** | **미발급 — 마지막 관문** | cron 세션에서 claude CLI가 `Not logged in`. 구독 인증이 로그인 세션/Keychain에 묶여 있고, 대화형에서 되는 건 부모 Claude Code 컨텍스트를 상속하기 때문(cron엔 부모가 없음). **`claude setup-token` 1회 실행 → 토큰을 `~/.claude/secrets/teamY/claude-cli.env`에 `CLAUDE_CODE_OAUTH_TOKEN=...`로 저장하면 즉시 동작** (구독 인증이라 API 과금 없음). `publish-local.sh`가 이 파일을 자동 로드하도록 배선 완료 |
| **auto-news CI `ANTHROPIC_API_KEY`** | ⬜ 미등록 (선택) | CI 경로를 쓰려면 필요하지만 **API 과금 발생**. 로컬 키리스로 돌고 있으므로 필수 아님. 워크플로는 이제 키 부재를 첫 단계에서 명시적으로 차단하고 실패 시 이슈를 생성함 |

> ⚠️ **launchd로는 등록하지 말 것** — `~/Desktop` TCC에 막혀 `Operation not permitted`로 즉사한다(실측). crontab은 통과한다. 상세는 `docs/LESSONS.md` 2026-07-26.

---

| 항목 | 상태 | 켜는 법 |
|---|---|---|
| Amplitude 트래킹 | 사장님 세팅 예정 | Amplitude 프로젝트 → API키 → 양 사이트 Vercel env `NEXT_PUBLIC_AMPLITUDE_API_KEY`. tenb 795910은 별개(재사용 금지) |
| 제휴 수익 | 사장님 세팅 예정 | 프로그램 가입 → ID를 `ai-guide/src/lib/affiliateLinks.ts` config에 (`ai-guide/docs/AFFILIATE.md` 참고). null→실제URL로 바꾸면 자동 활성 |
| 자동게시 (X/Threads) | 사장님 세팅 예정 | X API(OAuth1.0a, tweet.write) / Meta Threads 토큰 → cron에서 RSS(`/feed.xml`) 기반 게시. 공유버튼·피드는 이미 완성 |
| **ESP 뉴스레터 발송** ⭐ | **기록(미연결)** | 아래 상세 |
| **AdSense 광고 슬롯** ⭐ | **🔴 슬롯ID 미발급 — 광고 0개 노출** | 스크립트·`ads.txt`(`pub-1379707580934572`)·컴포넌트 전부 배선 완료. `NEXT_PUBLIC_ADSENSE_NEWS_SLOT`/`_CONTENT_SLOT`이 비어 있어 `AdUnit`이 `null`을 반환 중 → **콘솔에서 사이트 승인 확인 + 광고 단위 생성 후 슬롯ID를 Vercel env에 넣으면 즉시 켜짐**. 세 사이트(aiwire·hottrend·flight-trends) 모두 동일 상태 |
| AdFit | 유닛 발급됨, 심사 상태 미확인 | aiwire `DAN-uLUtMizIrJR9mLGg` / hottrend `DAN-XMge0uwr5NZWrSmC` — Vercel prod env에 등록돼 `kakao_ad_area`가 실제 렌더 중. 실제 광고 노출(심사 통과) 여부는 코드로 판별 불가 → 애드핏 관리자에서 매체 상태 확인 필요 |
| **GA4 측정 ID** | 🔴 미설정 (3개 사이트 전부) | `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 어디에도 없어 gtag 미주입. GSC에 클릭이 잡히는데 어느 페이지·쿼리인지 모르는 상태 |

---

## ⭐ ESP (뉴스레터 발송) — 상세 기록

**현재 상태**
- 구독 이메일은 **이미 수집 중**. Supabase **P2** `search_trends.subscribers` (컬럼: `site`('aiwire'|'hottrend'), `email`, `created_at`, unique(site,email)).
- 양 사이트 `/api/subscribe` (POST) → 위 테이블 insert. 구독박스는 "곧 오픈" 안내 유지하며 수집.

**필요한 것**: 실제 발송용 ESP 계정
- **추천 = Resend** (무료 월 3,000건, API 간단, Next.js 친화). 대안: SendGrid / Mailgun / AWS SES.

**연결 시 빌드할 것** (키 주시면 진행)
1. Resend 가입 → API 키 발급 → **도메인 발신 인증**(SPF/DKIM): `aiwire.news`, `hottrend.news` 각각.
2. 발송 파이프라인 (cron):
   - `search_trends.subscribers`에서 `site`별 이메일 조회.
   - aiwire = 최신 AI 다이제스트 / hottrend = 트렌드 브리핑을 **HTML 메일**로 발송.
   - 주기: 예) 매일 아침 or 주간. 발송 로그 + unsubscribe 링크(법적 필수).
3. 구독박스 문구 "곧 오픈" → "구독 완료"로 전환.

**키 주시면**: `RESEND_API_KEY` env + 위 파이프라인 빌드 → 즉시 발송 시작.

---

## 이미 가동 중 (참고)
- aiwire: 5시간마다 뉴스 다이제스트 자동발행 (클라우드 Claude)
- hottrend: 매시간 트렌드 자동수집 (GitHub Actions)
- 둘 다 유료 API 0. 광고 없이 풀 라이브.
