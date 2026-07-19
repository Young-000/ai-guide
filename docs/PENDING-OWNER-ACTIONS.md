# Pending Owner Actions — aiwire.news & hottrend.news

> 코드는 전부 대기(스위치 OFF). 아래 항목은 키/토큰/계정을 넣으면 즉시 켜집니다. (2026-06-16 기록)

## 🔴 긴급 (2026-07-19 PM 사이클 발견) — 콘텐츠 엔진 8일간 정지

> 자동 발행이 2026-07-11 이후 완전 정지(최신 기사 07-11자). 발행 백엔드가 **둘 다** 자격증명에 막혀 있어 야간 자율 사이클이 고칠 수 없음 → 오너 조치 필수.

| 항목 | 상태 | 켜는 법 |
|---|---|---|
| **auto-news CI `ANTHROPIC_API_KEY`** | 🔴 부재/만료 | GitHub `Young-000/ai-guide` → Settings → Secrets → Actions → `ANTHROPIC_API_KEY` 등록/갱신. (CI 러너엔 claude CLI 인증 없음 → 이 키가 유일한 CI 발행 경로. 등록 후 `auto-news.yml` 재실행으로 확인) |
| **로컬 keyless 발행용 `claude` CLI 로그인** | 🔴 "Not logged in" | 발행 호스트에서 `claude` 로그인(Claude Code 구독 인증). 이게 되면 `npm run publish:local`(키리스) launchd 크론으로 CI 시크릿 의존 없이 발행 가능(백로그 #1). |

> ⚠️ 둘 중 **하나만** 켜져도 엔진 복구됨. 이번 PM 사이클이 keyless 발행을 시도했으나 CLI 미로그인으로 실패(0건 생성). 코드/파이프라인은 정상 — 순수 자격증명 블로커.

---

| 항목 | 상태 | 켜는 법 |
|---|---|---|
| Amplitude 트래킹 | 사장님 세팅 예정 | Amplitude 프로젝트 → API키 → 양 사이트 Vercel env `NEXT_PUBLIC_AMPLITUDE_API_KEY`. tenb 795910은 별개(재사용 금지) |
| 제휴 수익 | 사장님 세팅 예정 | 프로그램 가입 → ID를 `ai-guide/src/lib/affiliateLinks.ts` config에 (`ai-guide/docs/AFFILIATE.md` 참고). null→실제URL로 바꾸면 자동 활성 |
| 자동게시 (X/Threads) | 사장님 세팅 예정 | X API(OAuth1.0a, tweet.write) / Meta Threads 토큰 → cron에서 RSS(`/feed.xml`) 기반 게시. 공유버튼·피드는 이미 완성 |
| **ESP 뉴스레터 발송** ⭐ | **기록(미연결)** | 아래 상세 |
| AdFit / AdSense 광고 | AdFit 심사 대기 중 | 승인 후 슬롯ID → `NEXT_PUBLIC_ADSENSE_*_SLOT` env. AdUnit 컴포넌트는 대기 |

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
