# Pending Owner Actions — aiwire.news & hottrend.news

> 코드는 전부 대기(스위치 OFF). 아래 항목은 키/토큰/계정을 넣으면 즉시 켜집니다. (2026-06-16 기록)

## ✅ 해소됨 (2026-07-26) — 콘텐츠 엔진 정지

> 07-11~19 8일 + 07-24 이후 재차 정지했던 자동 발행이 **로컬 키리스 경로로 복구**됨.

| 항목 | 상태 | 비고 |
|---|---|---|
| 로컬 `claude` CLI 로그인 | ✅ 해결됨 | 07-26 실측 응답 확인. 07-19의 "Not logged in"은 해소된 상태 |
| 키리스 발행 실행 | ✅ 검증됨 | RSS 9/9 피드 수집 → 3/3 기사 쌍 생성 성공. 07-26자 3건 발행 완료 |
| 정기 실행 | ✅ crontab 등록 | `10 0,5,10,15,20 * * *` — 로그 `~/.claude/logs/ai-guide-publish.log` |
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
