# Pending Owner Actions — aiwire.news & hottrend.news

> 코드는 전부 대기(스위치 OFF). 아래 항목은 키/토큰/계정을 넣으면 즉시 켜집니다. (2026-06-16 기록)

## 🔴🔴 최우선 (2026-09-26) — 제휴 가입 1건이면 수익이 켜진다

> **배경**: 목표는 "DAU당 일간 수익 1원". 현재 수익 **0원**이고, 광고 두 경로가 모두 막혀 있다.
> - AdSense: `data-ad-status="unfilled"`. 콘솔은 9/12부터 "준비 중", 지적사항 칸은 비어 있음
> - AdFit: 승인·작동하지만 **카카오 하우스 광고**로만 채워짐 = 외부 광고주 재고 없음
> - 둘 다 원인이 같다 — **광고주는 사람에게 입찰한다.** 하루 6,000뷰의 상위 경로가 전부 목록 페이지(크롤러)
>
> **그런데 광고 승인을 기다릴 필요가 없는 경로가 이미 구축돼 있다.**
> `src/lib/affiliateLinks.ts` 에 17개 프로그램이 배선돼 있고 **전부 `affiliateUrl: null`** 이다.
> 가입해서 URL 하나만 주시면 그 줄만 바꿔 바로 켜진다 (빌드 후 `rel="sponsored"` + 고지문 자동).

| 우선순위 | 프로그램 | 가입 | 조건 |
|---|---|---|---|
| 1 | **Canva / Canva AI** | https://www.canva.com/affiliates/ | Impact 플랫폼, **36% 커미션** |
| 2 | **Grammarly** | https://www.grammarly.com/affiliates | CJ, 무료가입 $0.20 + 유료 $20 |
| 3 | **Notion / Notion AI** | https://www.notion.com/affiliates | Impact 플랫폼 |
| 4 | Cursor | https://cursor.sh/partners | 직접 이메일 |
| — | ChatGPT·Claude·Gemini·Midjourney | 공개 프로그램 없음 (2026-06 기준) | |

> **왜 이게 광고보다 빠른가**: Canva 연 $120 플랜의 36% ≈ 전환당 $43. 사람 100명/일 ×
> 도구 클릭 2% × 전환 2% ≈ 하루 2,300원 → **DAU당 23원**. 목표(1원)의 20배다.
> 광고는 승인·재고가 외부 결정이지만 제휴는 가입 즉시 열린다.
>
> ⚠️ **가입(계정 생성)은 오너만 가능합니다** — 에이전트는 계정 생성·비밀번호 입력을 하지 않습니다.
>
> **가입 후 하실 일**: 받은 URL을 알려주시면 `affiliateLinks.ts` 의 해당 줄에 넣습니다. 끝입니다.

## 🔴 같은 날 함께 상신 (2026-09-26)

| 항목 | 무엇이 필요한가 | 왜 |
|---|---|---|
| **`/trends`·`/compare` 내용 갱신** | 사실 확인 후 데이터 교체 | 두 페이지가 **2026-06-16 에 멈춰 있다**. `compare.json` 의 Claude 가 `Opus 4.8 / Sonnet 4.6` 으로 낡았는데, ChatGPT·Gemini 의 현재 버전은 제가 확인할 수 없어 **한쪽만 갱신하면 비교가 불공정해진다** — 지어내지 않고 남겨 둡니다. 심사자가 보는 페이지라 우선순위가 있습니다 |
| **쿠팡 모바일 배너** | 파트너스 콘솔에서 320×100(또는 300×250) 배너 발급 | 지금 배너는 728×90 고정이다. URL 의 w/h 를 바꿔 요청해도 같은 이미지가 온다(실측). 375px 화면에서 높이 38px 이 되어 읽을 수 없어 **모바일에서는 내려 두었다** — 배너를 주시면 즉시 되살립니다 |
| **카카오 AdFit 콘솔** | 오너 로그인 | 외부 광고가 왜 안 붙는지는 콘솔에서만 보인다. 매체 심사 상태·정책 경고 확인 |
| **AdSense 심사** | 오너 판단 | 9/12부터 2주째 "준비 중". 문의할지 더 기다릴지 |
| **네이버 검색광고 API 키** | 오너 가입(무료·광고비 없음) | hottrend.news 글감을 검색량으로 고르기 위함. 도구는 완성·대기 |

> ✅ **해소 (2026-09-26)**: 아래 09-20 항목의 "미들웨어 UA 봇 필터"는 구현·배포됐습니다.
> `page_views` 는 총 트래픽으로 남기고, 봇을 거른 `page_views_human` 과 유입원
> `site_visits`(세 사이트 공통)를 신설했습니다. 내일부터 `v_daily_human_visits` 로
> 사람 수가 나옵니다 — SUNSET/성장 판정의 분모가 생겼습니다.

## 🔴🔴 최우선 (2026-09-20 재상신) — 야간 dev 사이클이 백로그를 지속 소비하지 않음 (08-16 항목 재발)

> **업데이트(2026-09-20)**: 08-16 상신 후 **08-23~30에 딱 한 번 소비됨**(`a0bf89c`/`79b6eae` `feat(analytics)` 트래픽 카운터). 그러나 **09-06 이후 다시 소비 0** — 최근 7일 커밋 = `chore(cycle)` 35 + `content(news)` 29, feature/dev 0. dev 커밋 마지막이 09-06(`711ae60`, 백로그 외 푸터). 08-30 리필 7개 중 09-06 이후 붙은 것 0. `chore(cycle)`는 PROGRESS.md 자동 정리만 커밋할 뿐 백로그를 구현하지 않는다.
>
> **함의**: 소비가 **한 번 붙었다가 다시 멈추는** 패턴 — 08-23 소비는 지속이 아니라 일시적 예외였다. 이번 주 최우선 리필(미들웨어 UA 봇 필터)은 측정 신뢰도를 여는 메타 블로커라, 이게 안 붙으면 SUNSET/성장 판정 자체가 계속 불가능하다.
>
> **오너 확인 요청**: `VENTURE_DOMAINS=teamY` 야간 사이클이 ai-guide를 **매일** 대상에 넣는지(08-23만 예외적으로 돌았는지) / `feature/auto-*` 잔여 브랜치가 skip을 유발하는지(07-26 LESSONS 사례) / `scripts/verify.sh` 존재·GREEN 여부. PM은 08-16 LESSONS 원칙("소비 0이면 대신 구현하지 말고 파이프라인을 상신")을 따라 이번 주 봇 필터를 **직접 구현하지 않고** 최우선 리필로만 올렸다.

> **증상(08-16 원문)**: `docs/backlog.md` 미완 30여 개, 그중 트래픽 카운터는 5주 연속 이월. 최근 7일 커밋이 전부 `content(news)` 발행뿐 — feature/dev 커밋 0. 즉 리필은 매주 되는데 구현이 한 번도 안 붙는다.

> ✅ **해소 확인 (2026-08-16)**: 아래 08-02 push 자격증명 블로커는 이번 주 실측으로 해결 확인됨 — `git rev-list --count origin/main..main`=0, `origin/main == local`(ceec439). 08-09 `~/.git-credentials` store 수정이 유지되고 있다. 라이브 반영 정상(7일 176 콘텐츠 파일 발행). 아래 항목은 이력 보존용.

## 🟢 해소됨 (2026-08-02 주간 PM 발견) — GitHub push 자격증명 만료 → 발행이 라이브에 안 올라감

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
