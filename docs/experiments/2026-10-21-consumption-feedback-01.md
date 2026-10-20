> 기준: METRICS.md v2026-10-19

# Consumption feedback 01: repair the decision input before changing production

Status: implementation verified; independent review found no blockers, final committed-head receipt pending. No publication or automation enabled.
Outcome owner: program-01. Implementer: eng-01. Independent reviewer: qa-01 (separate integration_review assignment).
Request: Young authorized audit improvements; program-01 requested one bounded improvement inside ai-guide's existing revenue objective. Slack: not used, per assignment. This record holds the request, evidence, decision, change, verification, and review handoff.

## Baseline and source

`docs/metrics/2026-10-20.md` reports `humans7d=2531`, `outclicks7d=0`, average 362 from `npm run funnel`. It omits row-level source output and cannot be reconstructed as aiwire-only from that file. Preserve it as historical evidence; do not treat it as a comparable conversion baseline.

At 2026-10-21 00:55 KST (2026-10-20 15:55 UTC), a read-only check of production `search_trends.v_revenue_funnel` for **site=aiwire**, `day >= 2026-10-14 AND day < 2026-10-21`, ordered by day, returned all seven rows:

| KST day | Recorded human visits | Bot visits | Stored outclicks |
| --- | ---: | ---: | ---: |
| 2026-10-14 | 1238 | 82 | 0 |
| 2026-10-15 | 139 | 73 | 0 |
| 2026-10-16 | 148 | 79 | 0 |
| 2026-10-17 | 285 | 96 | 0 |
| 2026-10-18 | 142 | 127 | 0 |
| 2026-10-19 | 266 | 117 | 0 |
| 2026-10-20 | 414 | 101 | 0 |
| Total | 2632 | 675 | 0 |

Existing `humans` is a database view field. The underlying `site_visits` table contains aggregated visit counts, not visitor identifiers. These numbers are **not evidence of unique people**, and no METRICS definition is changed by this repair. Do not label their quotient a measured unique-user funnel or confirmed revenue. The unexplained 10-14 spike remains unverified, not assumed organic growth.

Completeness checks (same window):

- `site_visits`: tenant filter `site=aiwire`, ordered by `(day, hour_kst, source, medium, is_bot)`, 500-row `.range()` pages to exhaustion: **335 rows**. Sum of non-bot `visits`: **2632**. No rows with `source=coupang` or `source=tool`, bot or non-bot. Human source totals: `direct/none=2606`, `direct/unknown=2`, `bing/organic=6`, `google/organic=5`, `duckduckgo/organic=8`, `app.cloudsek.com/referral=2`, `ecosia.org/referral=1`, `google/cpc=1`, `yahoo/organic=1`.
- `page_views_human`: ordered by `(day,path)`, 500-row range pages to exhaustion: **1567 rows**, sum `count=1610`. This is a separate UA-filtered path-hit counter, not a visitor count and not additive with `humans`.
- Highest observed article path: `/news/anthropic-claude-enzyme-discovery`, **7 hits**. Next path `/news/topic/Z.ai` has 5. Seven hits is an exploratory signal, not a statistically demonstrated winning topic. The denominator is neither unique readers nor completion.

## First confirmed broken stage and decision

**First confirmed failure: measurement → decision.** The old `funnel` script queried a shared view without a tenant filter, used a UTC lower date, had no upper date, and printed a seven-day label while including extra days and today's partial bucket. On the check above it printed aiwire **and hottrend**, 2026-10-13 through 10-21, combined total **3028**. The old daily-revenue-target sentence also repeated an unconfirmed working target from NORTHSTAR. It is removed from the report; no target is invented in its place.

**Zero stored outclicks is confirmed; zero real clicks or zero click-to-revenue conversion is not.** Code inspection shows `OutclickLink` and `OutboundToolLink` build `source=coupang/tool` beacons to `/api/visit`; the route fixes `p_site=aiwire` and invokes `record_site_visit`. This proves the intended code path, not browser-to-production delivery. `navigator.sendBeacon` is optional, its return value is ignored, and the API ignores RPC error objects. No live self-click or test write was sent. No delivery-loss claim is established.

Existing monetization constraints remain: 17 affiliate configurations have null URLs; Coupang's existing 728×90 banner is hidden below `sm` and only appears after Korean content; ad earnings require network-console evidence. No impression/exposure measurement exists for the banner. Do not diagnose offer rejection, mobile conversion, or content quality from the zero alone.

Decision: repair this existing report's scope and completeness first, and use the small observed article signal to prepare the next editorial instruction. This avoids producing more summaries from an untrustworthy aggregate and stays inside the current objective. No UI, metric definition, bot rule, schema, affiliate account, or publication workflow changes.

## Change

- Report only `site=aiwire`, in exactly N **completed KST days**, `[since, until)`; print the explicit interval and source.
- Read ordered range pages until exhausted; a query error aborts instead of printing partial totals.
- Keep missing days distinct from zero rows; withhold the average if a day is absent.
- Retain database-defined fields while labeling them as recorded visits and outclicks, not unique people or earnings.
- Preserve the existing Korean total/average protocol consumed by `~/.claude/scripts/team/metrics-snapshot.py`, only when all days are observed. Those legacy labels retain their historical names; the adjacent source/scope text explains that the values are recorded visits. The consumer must not receive a complete-looking baseline from missing days.
- Keep the existing `npm run funnel` entrypoint. No new dashboard, scheduler, unattended loop, or generation service.

## Next production instruction and comparison

Owner handoff: program-01 → editorial owner. **Round 1 direction check by Young is pending. Rounds 1, 2, and 3 each require a CEO direction check before production proceeds; do not auto-advance.** This repair does not activate a loop.

After the direction check, prepare **one revision of the already consumed article** `src/content/news/ko/2026-09-24-anthropic-claude-enzyme-discovery.md`, plus its existing English counterpart. Material: what the scientific claim establishes, what evidence supports it, and what still requires independent validation. Compare the existing overlapping CRISPR/enzyme articles before writing. Verify primary evidence before adding facts; do not repeat another single-source digest or claim the scientific discovery is verified. Preserve the existing slug for a before/after path comparison. Use the existing bilingual content format and `news-validate`/product verify review workflow. This is an instruction for a reviewed draft; public publication remains separately gated.

Before a public draft decision, validate one desktop and one mobile outbound interaction **against a local/mock endpoint**, including beacon queued/false/unavailable and RPC-error cases. Do not send partner self-clicks or test production visit rows. If this demonstrates delivery loss, repair that first; do not label the current zero an offer failure. Obtain aiwire-only confirmed earnings separately from network consoles; do not infer them from this report.

Next measurement: on the next manual PM collection, run `npm run funnel -- --days 7`, save the explicit completed KST window, row output, missing-day status, and confirmed-earnings source in Git. For the editorial revision, record publication time only after separately authorized publication, collect the same path-hit source in the preceding and following seven completed KST days, and compare raw counts with source/window/sample limits. Record no result while unpublished or without a full observation window. Clicks and revenue require their own source evidence; a change in page hits alone cannot establish revenue improvement. Retain/revise/stop is a CEO-reviewed decision for these first three rounds.

## Verification and peer handoff

- Baseline on origin/main `9cf7e4e`: 62 suites, 413 tests passed; one snapshot passed.
- Test first: 10 focused assertions failed for the missing behavior, then passed after the minimal implementation. Coverage includes UTC→KST rollover, exact completed window, tenant isolation, invalid input, absent versus zero days, page exhaustion, and later-page failures.
- CLI integration (two cases: complete and incomplete windows) uses a local HTTP stub to verify the real Supabase request's tenant, date, ordering and range and that incomplete measurement withholds averages.
- Corrected read-only production report: 2026-10-14 through 10-20, humans=2632, outclicks=0, average recorded visits=376, all seven days present.
- Final full product verification: `bash scripts/verify.sh` exit 0, **VERIFY: GREEN**. Type-check passed; lint reported no warnings/errors; 64 suites / 425 tests / 1 snapshot passed; production build generated 6025 pages. Log: `/tmp/ai-guide-funnel-final-verify.log`. Existing runtime/build notices (Node localStorage flag, edge-runtime/static-generation, Supabase edge import and Browserslist age) remain outside this change.
- Independent qa-01 review: no blockers on the frozen working diff; independently repeated 12 focused tests. Additional local-HTTP probes drove the actual CLI through 1001 rows (offsets 0/500/1000), and a second-page HTTP 400: exit 1, empty stdout, named query error, no partial totals. No live requests/writes in these probes. Code review PASS is bound to `5ae4d4e707d65bb56af3e2e919ac5b12b4af76e2`; the final documentation receipt still needs the integrator's exact-head check.
- Remote artifact: [PR #37](https://github.com/Young-000/ai-guide/pull/37), branch `codex/ai-guide-funnel-feedback-20261021`. Verified implementation commit: `5ae4d4e707d65bb56af3e2e919ac5b12b4af76e2`. This follow-up receipt changes this document only.
- Independent review artifact (HQ repository, delivered separately by program-01): `docs/team-work/2026-10-21-operating-improvements/ai-guide-independent-review.md`.
- Integrator owns review of the final SHA, merge decision and remote merge evidence; eng-01 will not merge its own output. Publication and the next editorial round remain pending Young's direction check. No merge claim.


## CI follow-up: Node 20 read-only initialization

Remote CI blocked merge of the initially reviewed head: Node 20.20.2 has no enabled native WebSocket, and the full Supabase client initializes Realtime even for this HTTP-only report. The original local verification used Node 25.2.1 and did not expose that initialization failure. The two real CLI cases were reproduced failing under the actual Node 20.20.2 binary; no test was skipped and the workflow version is unchanged.

The CLI now initializes Supabase's standalone `PostgrestClient` for the same REST endpoint, service-key headers, and `search_trends` schema. Its already locked version 2.108.2 is declared as a direct runtime dependency; no new package version or WebSocket transport is introduced. The query chain and report definitions are unchanged. The CLI fixture always disables native WebSocket and asserts the GET path, apikey/Bearer headers, schema header, and zero WebSocket upgrades, so a newer local Node cannot mask a recurrence.

Actual Node 20.20.2 and Node 25.2.1 each pass the 12 focused assertions, including the no-native-WebSocket CLI cases. Full `bash scripts/verify.sh` under the actual Node 20.20.2 PATH: exit 0, **VERIFY: GREEN**, type-check and lint clean, 64 suites / 425 tests / 1 snapshot passed, 6025-page production build passed. Evidence: `/tmp/ai-guide-postgrest-node20-full.log`. qa-01 independently repeated Node 20 focused tests and the 1001-row, second-page-error, schema/auth/GET and no-WebSocket checks with no blocker. Final frozen-head review and refreshed remote CI remain the integrator's promotion prerequisites; earlier code PASS alone does not authorize merging this changed head.
