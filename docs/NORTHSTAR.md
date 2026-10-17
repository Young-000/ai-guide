> 기준: `teamY/METRICS.md` v2026-10-17

# ai-guide (aiwire.news) — NORTHSTAR

> Project: AI news digest + AI tool guide, Korean/English SEO site. Live at https://aiwire.news (Vercel, P2 Supabase `search_trends`).
> Revenue model: ads (AdSense, Kakao AdFit), Coupang Partners banner, affiliate links to AI tools.

## 1차 목표: 수익 발생

> CEO decision 2026-10-17 (METRICS §4): for every project the phase-1 goal is "revenue starts, even tiny".
> Long-term targets stay as 2차 목표 below.

### First revenue event

- **Event**: the first **network-confirmed earnings line > 0 (KRW or USD)** attributable to aiwire.news traffic, from any one of:
  - Kakao AdFit: credited earnings (적립금) > 0 from an external advertiser
  - Google AdSense: earnings > 0 in the aiwire.news report (site-level, not account-total)
  - Coupang Partners or an AI-tool affiliate program: commission in confirmed status (확정), not pending
- **SOURCE of truth**: the ad / affiliate network consoles themselves.
  - AdFit: console report, read daily as `adfit.yesterdayEarnings` by `teamY/deal-shorts/scripts/ad-channels.sh` (cron 11:40, log `deal-shorts/logs/ad-channels-YYYY-MM-DD.log`)
  - AdSense: console earnings report, filtered by site. The `pub-1379707580934572` account is shared with hottrend.news and mystica.world, so account-total is not enough.
  - Coupang Partners / affiliate: partner console commission report (Coupang links carry a sub-id placement tag)
- **Does NOT count**:
  - page views, impressions, ad requests, banner or outbound clicks (`search_trends.v_revenue_funnel.outclicks` is a leading signal, not revenue)
  - AdSense or affiliate "estimated" / pending / unconfirmed earnings
  - house-ad fills (Kakao's own ads) or a fill that earns 0
  - bot traffic, self-clicks, test clicks
  - subscriber count (no monetization on `subscribers` today)
- **Counts only after**: the line is visible in the network console. Payout (bank transfer) is a later milestone, not the phase-1 trigger.

### How it is measured

| What | Command / place | Cadence | Reader |
|---|---|---|---|
| Earnings (AdFit) | `ad-channels.sh` log → `adfit.yesterdayEarnings` | daily 11:40 | cron → main-checklist on change |
| Earnings (AdSense) | AdSense console, site `aiwire.news` | daily (same cron reads approval state only, not earnings) | manual / ad-channels |
| Earnings (Coupang, affiliate) | partner consoles | weekly until first row | owner (no automated read exists; missing piece) |
| Funnel (humans → outclicks) | `npm run funnel` (`scripts/revenue-funnel.ts`) = `search_trends.v_revenue_funnel`, bots excluded | daily / weekly PM cycle | pm-cycle |

- Definitions follow METRICS §2: KST day buckets, bots excluded, no estimates without source and formula, facts by deterministic calculation.
- `outclicks` in the view = `site_visits` rows with source `coupang` or `tool`. Ad-network clicks are not visible to us.
- Not measurable today: GSC clicks/indexing for aiwire.news (METRICS §1: "키 대기"; no aiwire GSC report found in `ops-vault`). GA4 ID unset (PENDING-OWNER-ACTIONS).

### Current gap (dated, sourced)

Where it is stuck: **every stage.** Human traffic is tiny, ad networks do not pay, and no click target exists.

| Stage | Fact | Source / date |
|---|---|---|
| Traffic | Humans 17-148/day for 2026-09-27 to 10-16 (typical 20-45). Bots 58-165/day. **10-14 shows 1,238 humans, unexplained**; do not treat as organic until the source is checked. | `v_revenue_funnel` query, 2026-10-17 |
| Index / search | sitemap.xml lists 2,455 `<loc>` entries. Real indexed count and GSC clicks unknown. | `curl` 2026-10-17; GSC unwired |
| AdSense | **"주의 필요" — reason "가치가 별로 없는 콘텐츠"** (low-value content) since 2026-10-09; before that "준비 중" since 09-12. Page ad slot `data-ad-status` = unfilled. | `ad-channels` logs 09-27 to 10-17 |
| AdFit | Media `ai-news` = approved since 2026-09-28. Page fill = `empty` (was Kakao house ads on 2026-09-26). Yesterday earnings = 0 every day logged. | `ad-channels` logs; `LESSONS.md` 2026-09-26 |
| Coupang banner | Only approved immediate path. 0 outclicks in the 21 days checked. Banner is 728x90 and hidden on mobile. | `v_revenue_funnel`; `PENDING-OWNER-ACTIONS.md` 2026-09-26 |
| Affiliate | **All 17 programs have `affiliateUrl: null`** in `src/lib/affiliateLinks.ts`; no program signed up. | repo, origin/main `cc79897` |
| Payout info | AdSense payout/PIN state for the shared account not verified in this survey. Last note: "지급정보 = 대표 SMS 대기" (trend-radar NORTHSTAR, 2026-09-12). | unverified |

Known cause for the AdSense flag (from 2026-09-26 audit): the other approval criteria passed; remaining gap was **content uniqueness** (body median 785 chars, a one-item foreign-news summary). Page count does not fix this (`LESSONS.md`).

**Next 3 steps**
1. **Affiliate signup, then wire URLs.** Owner signs up for Canva, Grammarly, Notion (links in `PENDING-OWNER-ACTIONS.md`); agent replaces the `null` lines and ships. This is the only path that does not wait on an ad network's decision. GATE: account creation and terms acceptance are owner-only.
2. **Fix the AdSense "low-value content" flag by changing the material.** Add original analysis (not another summary) to the pages humans land on and to `/tools`, `/compare`, `/trends` (frozen at 2026-06-16 data on 09-26; check current state). Re-request review afterwards. GATE: the review request is an external submission, owner approval needed.
3. **Make the funnel visible and give clicks somewhere to go.** (a) Find the source of the 10-14 spike in `site_visits`. (b) Wire GSC for aiwire.news (key is the blocker per METRICS §1) to learn index/click reality. (c) Put the Coupang or affiliate link where the ~30 humans/day actually land (article pages), with the mobile banner from Coupang Partners (GATE: owner issues the banner).

**CEO-gate items**: affiliate/Coupang account creation (owner-only), AdSense re-review request (external submission), any paid-ad spend beyond the budget note below. Nothing here needs money today.

### Ad budget / ROAS note

- KRW 10,000/day is allowed for this project until revenue starts (METRICS §4, 2026-10-17); ROAS is measured but is not a gate before first revenue; ROAS-first priority applies.
- No paid-ad path exists for aiwire.news today (no ad account, creative or campaign in the repo or docs). With 0 outclicks and 0 affiliate URLs, paid traffic would currently land on nothing that earns. Step 1 and step 3 come before any spend.

### Funnel-analysis rule

If there is no revenue, find the broken stage first (traffic → landing → click → conversion). No channel-blame conclusions; improve by changing materials (content, product, offer), not just bids or images.

---

## 2차 목표

### Revenue per human visitor (portfolio north star)

- **Metric**: revenue actions per human visitor (outbound affiliate clicks, later ad revenue) ÷ bot-excluded visitors. Adopted 2026-09-27 (METRICS §2). Traffic and page count are leading indicators.
- **Working target** (`docs/PENDING-OWNER-ACTIONS.md`, 2026-09-26): daily revenue of about KRW 1 per daily human visitor. Source of that number is the PENDING note, not a METRICS entry; confirm with the CEO.
- Leading indicators: human visits (`v_daily_human_visits`), outclick rate (`npm run funnel`), AdSense approval state, indexed pages (GSC, not yet wired).
- Longer-term revenue lines from `docs/PRD.md` (v2.0, 2026-02): affiliate marketing, AdSense, premium content, sponsored listings. The PRD revenue estimates are planning numbers, not measurements.

### Open conflicts and unverified items (flagged, not resolved)

- `CLAUDE.md` says AdSense console detail was empty (2026-09-26); the console now shows "주의 필요 / 가치가 별로 없는 콘텐츠" (since 2026-10-09). `CLAUDE.md` section "수익이 0원인 이유" is stale on this point.
- AdFit: 2026-09-26 docs say house ads fill; logs from 09-27 onward say `empty`. Console `ads.txt` status for aiwire.news flips between "승인됨" and "찾을 수 없음" while the live file returns HTTP 200 with the correct line (checked 2026-10-17). Treat the console field as noisy.
- Subscribers: `docs/backlog.md` (2026-08-16) says 4; `search_trends.subscribers` has 0 rows with `site='aiwire'` on 2026-10-17.
- Median body length (785 chars) and `/trends`, `/compare` staleness come from 2026-09-26; not re-measured here.
- Affiliate commission rates in `PENDING-OWNER-ACTIONS.md` (e.g. Canva 36%) were not verified at the source.
- origin/main's last content publish commit is dated 2026-09-28; the local publishing checkout is dirty and not used for this document.

## 규정 로그

| Date | Rule | By |
|---|---|---|
| 2026-09-27 | North star replaced with revenue actions per human visitor (METRICS §2) | CEO |
| 2026-10-17 | phase-1 goal = revenue starts (CEO) | CEO |
