# Affiliate Revenue — Setup Guide

## How it works

All affiliate config lives in one file:
`src/lib/affiliateLinks.ts` → `AFFILIATE_CONFIGS` map.

Each entry: `slug → { program, affiliateUrl }`.
- `affiliateUrl: null` — no program yet. Links fall back to the tool's normal URL + UTM params. No disclosure shown.
- `affiliateUrl: "https://..."` — real affiliate URL. Links use `rel="sponsored noopener"`. Disclosure banner renders automatically.

## How to add a real affiliate link

1. Join the program (links below).
2. Get your unique affiliate URL (the program gives you a full URL or a `?ref=xxx` param).
3. Open `src/lib/affiliateLinks.ts`, find the tool slug, replace `null` with your URL:

```ts
cursor: {
  program: 'Cursor Partner Program',
  affiliateUrl: 'https://cursor.sh/?via=YOUR_CODE', // ← paste here
},
```

4. Run `npm run build` — the page will now render `rel="sponsored noopener"` on that link and show the disclosure.

## Optional: generic ref tag

Set `NEXT_PUBLIC_AFFILIATE_REF=aiguide` in Vercel env vars.
This appends `?ref=aiguide` to every non-null affiliate URL (only useful if the program uses a tag param AND you set affiliateUrl to the base URL).

## Programs to join (priority order)

| Tool | Program URL | Notes |
|------|-------------|-------|
| Canva / Canva AI | https://www.canva.com/affiliates/ | Impact platform, 36% commission |
| Grammarly | https://www.grammarly.com/affiliates | CJ Affiliate, $0.20 free + $20 paid |
| Notion / Notion AI | https://www.notion.com/affiliates | Impact platform |
| Cursor | https://cursor.sh/partners | Direct — email partners@cursor.sh |
| ElevenLabs | https://elevenlabs.io/affiliates | Recurring % |
| DeepL | https://www.deepl.com/partner | Contact via site |
| Otter.ai | Impact platform — search for Otter.ai |
| Gamma | https://gamma.app — contact team |
| ChatGPT / OpenAI | No public affiliate program (as of 2026-06) |
| Claude / Anthropic | No public affiliate program (as of 2026-06) |
| Gemini / Google | No public affiliate program (as of 2026-06) |
| Midjourney | No public program (as of 2026-06) |

## Disclosure text (FTC / 공정위 compliant)

Current text (shown on any page with an affiliate link):
> "이 페이지의 일부 링크는 제휴 링크로, 구매 시 일부 수수료를 받을 수 있습니다. 추천은 사용자 경험을 기반으로 하며, 수수료와 무관합니다."

Component: `src/components/AffiliateDisclosure.tsx`.
Pass `show={true}` (or `show={hasAffiliateLinks(slugs)}`) to render it.

## Files changed in this implementation

| File | Change |
|------|--------|
| `src/lib/affiliateLinks.ts` | Added `AFFILIATE_CONFIGS`, `getToolLink`, `hasAffiliateLinks` |
| `src/components/OutboundToolLink.tsx` | Added `isAffiliate` prop → switches `rel` |
| `src/components/AffiliateDisclosure.tsx` | Added `show` prop → conditional render |
| `src/app/tools/[slug]/page.tsx` | Uses `getToolLink`, passes `isAffiliate` |
| `src/app/compare/page.tsx` | Uses `getToolLink`, `hasAffiliateLinks` |
| `src/lib/__tests__/affiliateLinks.test.ts` | Unit tests for helpers |
