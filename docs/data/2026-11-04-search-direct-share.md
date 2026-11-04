## Data Report: 일간 측정 기록에 검색 리퍼러 방문·direct 비율 추가

> 기준: METRICS.md v2026-10-22 · 대상 site=aiwire · 완료된 KST 7일 [2026-10-28, 2026-11-04)

### Summary
사람 방문 1,892 중 검색엔진에서 온 방문은 23(1.2%), direct 는 98.7% 다. 이제 이 두 숫자가 매일 `docs/metrics/<날짜>.md` 에 남는다 — 방문 총량이 늘어도 검색 독자가 늘었는지 바로 구분할 수 있다.

### 정의 (재정의 아님)
| 줄 | 정의 | SOURCE |
|---|---|---|
| `검색 리퍼러 방문 7일` | `site_visits` 사람 방문(`is_bot=false`, 아웃클릭 source `coupang`·`tool` 제외) 중 `medium='organic'` 합. organic 은 `src/lib/referrer.ts` 가 검색엔진 리퍼러(google·bing·duckduckgo·yahoo·naver·daum·perplexity·chatgpt)에 붙이는 값 | `search_trends.site_visits` |
| `direct 비율 7일 %` | 같은 사람 방문 중 `source='direct'` ÷ 사람 방문 (반올림 전 비율로 계산, 소수 1자리) | `search_trends.site_visits` |

- METRICS §3 의 정식 "검색 유입"은 **GSC 클릭**이다. 이 줄은 리퍼러 기준이라 이름을 `검색 리퍼러 방문`으로 따로 두었다(앱 내 브라우저·리퍼러 차단은 direct 로 잡힌다).
- 분모는 `v_revenue_funnel.humans` 와 같은 사람 방문이다. 두 조회의 합이 다르면 줄을 쓰지 않는다(`Visit sources withheld`). 7일 중 빠진 날이 있어도 쓰지 않는다.

### Metrics Overview (2026-11-04 실행)
| Metric | 값 |
|---|---|
| 방문 기록 7일 | 1,892 |
| 검색 리퍼러 방문 7일 | 23 (bing 10 · duckduckgo 8 · google 4 · yahoo 1) |
| direct 비율 7일 | 98.7% (1,868) |
| 하루치 2026-11-03 | 사람 310 · 검색 7 · direct 97.4% |

### SQL (재현, 읽기 전용)
```sql
select source, medium, sum(visits) v
from search_trends.site_visits
where site = 'aiwire' and is_bot = false and day >= '2026-10-28' and day < '2026-11-04'
group by 1, 2 order by 3 desc;
-- direct/none 1866 · bing 10 · duckduckgo 8 · google 4 · direct/unknown 2 · yahoo 1 · chatgpt.com/unknown 1 = 1892
```

### 배선
- 출력: `npm run funnel` (`scripts/revenue-funnel.ts`, `formatVisitSourceLines`)
- 기록: claude-ops-scripts `team/metrics-snapshot.py` ai-guide 어댑터가 두 줄을 읽는다(5칸 중 5칸 사용).
- 작성기 미리보기(실데이터, `metrics-snapshot.sh --dry-run --only ai-guide`):
```
- 방문 기록 7일: 1892
- 아웃클릭 7일: 0
- 일평균 방문 기록: 270
- 검색 리퍼러 방문 7일: 23
- direct 비율 7일 %: 98.7
```

### Recommended Actions
- 지금: 사람 숫자를 성과로 읽기 전에 direct 비율부터 본다. 95% 이상이 이어지면 방문 증가는 검색 독자 증가가 아니다.
- 다음: GSC 키가 생기면 GSC 클릭과 이 리퍼러 줄을 나란히 둬 리퍼러 손실 규모를 잰다.
