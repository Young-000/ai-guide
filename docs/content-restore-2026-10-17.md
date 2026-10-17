# Content restore 2026-10-17 — quarantine and dedupe manifest

The publisher produced 218 article pairs (436 files) between 2026-09-28 and 2026-10-17 that never went live, because three malformed files broke `next build` (see `docs/LESSONS.md`, 2026-10-17).

Nothing was deleted. Files that are not published sit under `src/content/_quarantine/` and can be restored by moving them back to `src/content/news/<lang>/`.

## Malformed (3 pairs, 6 files)

Each `ko` file has two `url:` lines inside one `sources:` entry (YAML duplicated mapping key). The `en` partner is valid but is quarantined with it so the ko/en pair never splits. To repair: delete the extra `url:` line and move both files back.

| Pair | Files |
|---|---|
| `2026-09-28-anthropic-29trn-valuation` | `_quarantine/ko/2026-09-28-anthropic-29trn-valuation.md`, `_quarantine/en/2026-09-28-anthropic-29trn-valuation.md` |
| `2026-09-29-openai-cancels-model-safety` | `_quarantine/ko/2026-09-29-openai-cancels-model-safety.md`, `_quarantine/en/2026-09-29-openai-cancels-model-safety.md` |
| `2026-09-29-openai-model-bypasses-safeguards` | `_quarantine/ko/2026-09-29-openai-model-bypasses-safeguards.md`, `_quarantine/en/2026-09-29-openai-model-bypasses-safeguards.md` |

## Duplicates (same story, different feed item)

Rule: pairs about the same event and actor, dated within 4 days, whose English title + slug tokens overlap (Jaccard >= 0.3, then confirmed by reading the titles). In each cluster the pair with the longest combined body is kept (earliest date on a tie); the rest are moved to `src/content/_quarantine/duplicate/`. Related but distinct events (for example two different state attorneys general, a first and a second Brockman donation) are not merged.

| Cluster | Kept | Moved to duplicate/ |
|---|---|---|
| FTC opens probe into OpenAI and Anthropic | `2026-09-30-ftc-ai-risk-investigation` | `2026-09-30-ftc-probes-openai-anthropic-safety`, `2026-10-01-ftc-investigation-anthropic-openai`, `2026-10-03-ftc-probe-openai-anthropic` |
| OpenAI shelves/holds a new model over safety | `2026-09-29-openai-shelves-model-authorization` | `2026-09-29-openai-holds-model-safety`, `2026-09-29-openai-shelves-model-safety` |
| False homicide tip to Philadelphia police linked to Anthropic AI | `2026-10-12-philadelphia-police-false-ai-tip` | `2026-10-09-anthropic-ai-false-police-tip`, `2026-10-10-ai-false-murder-tip-philadelphia`, `2026-10-10-claude-false-homicide-tip-philadelphia`, `2026-10-11-claude-fake-homicide-tip-philadelphia`, `2026-10-10-anthropic-ai-false-murder-tip`, `2026-10-11-anthropic-model-fake-murder-tip`, `2026-10-11-anthropic-test-false-homicide-tip`, `2026-10-10-anthropic-ai-false-police-report`, `2026-10-10-ai-false-homicide-tip-philadelphia` |
| Lawsuits say OpenAI race to win hurt people | `2026-10-15-openai-lawsuits-ai-race-harm` | `2026-10-15-openai-new-lawsuits-ai-race` |
| Anthropic $100M to train 10,000 AI engineers | `2026-10-03-anthropic-100m-engineer-training` | `2026-10-03-anthropic-100m-ai-engineer-training` |
| OpenAI employee arrested over a listening/recording device | `2026-10-14-openai-engineer-spyware-arrest` | `2026-10-13-fbi-arrests-former-openai-employee`, `2026-10-14-openai-employee-recording-device-arrest`, `2026-10-14-openai-engineer-recorder-arrest`, `2026-10-14-openai-spy-device-charge` |
| Anthropic warns AI could self-replicate across IoT devices | `2026-10-13-anthropic-ai-self-replication-risk` | `2026-10-13-anthropic-ai-self-replication-iot`, `2026-10-13-anthropic-warns-ai-worms` |
| OpenAI and Meta agents and public trust | `2026-10-01-openai-meta-ai-agents-trust` | `2026-10-02-openai-meta-agents-public-trust`, `2026-10-02-openai-meta-agents-trust-gap` |
| Anthropic asks court to rehear Pentagon blacklisting appeal | `2026-10-14-anthropic-pentagon-blacklist-rehearing` | `2026-10-14-anthropic-pentagon-rehearing-request` |
| OpenAI safety staffer resigns, criticises culture | `2026-10-04-openai-safety-employee-quits` | `2026-10-03-openai-safety-lead-resigns`, `2026-10-03-openai-safety-leader-quits`, `2026-10-03-openai-safety-employee-quits-alarm` |
| Ex-OpenAI safety staffer urges nuclear-style safety layers | `2026-10-04-ai-safety-nuclear-layers` | `2026-10-04-openai-safety-staffer-nuclear-plants` |
| OpenAI sued over children data / child safety | `2026-10-16-openai-sued-child-safety-data` | `2026-10-15-openai-children-data-lawsuit` |
| OpenAI unveils 'Dots' agent at DevDay | `2026-10-01-openai-dots-agentic-ai` | `2026-09-30-openai-devday-2026-dots` |
| OpenAI model StarCraft cheating claim | `2026-10-05-gpt6-starcraft-cheating-claim` | `2026-10-04-openai-model-starcraft-cheating` |

Totals: 218 pairs generated, 3 malformed, 32 duplicates, 183 published.

Ledger: `scripts/_published.json` gains the 218 source URLs of this batch (all of them, including quarantined ones, so the same feed items are not regenerated).
