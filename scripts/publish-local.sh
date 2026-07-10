#!/usr/bin/env bash
# Local, API-key-free news publishing cycle for ai-guide.
#
# Replaces the GitHub Actions auto-news cron when no ANTHROPIC_API_KEY is
# available: generation runs through the local `claude` CLI (Claude Code auth).
#
#   fetch RSS → generate (ko+en, keyless) → build check → commit → push
#
# Usage:
#   bash scripts/publish-local.sh            # full cycle, commit + push new articles
#   NO_PUSH=1 bash scripts/publish-local.sh  # commit but do not push
#   NO_COMMIT=1 bash scripts/publish-local.sh # generate only, leave changes unstaged
#
# Schedule locally with cron/launchd, e.g. every 5h:
#   0 */5 * * * cd <repo> && bash scripts/publish-local.sh >> /tmp/ai-guide-publish.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
echo "▶ ai-guide local publish — $(date '+%Y-%m-%d %H:%M:%S')"

# 1) Fetch fresh RSS items → scripts/worklist.json
npm run --silent fetch-news

# 2) Generate ko+en digests via the local claude CLI (no ANTHROPIC_API_KEY).
#    `env -u` guarantees the CLI backend even if a key is exported in the shell.
if ! env -u ANTHROPIC_API_KEY npm run --silent generate-news; then
  echo "ℹ No new articles generated (0 items or all duplicates) — nothing to publish."
  exit 0
fi

# 3) Did any article files actually change?
if git diff --quiet --exit-code -- src/content/news; then
  echo "ℹ No article file changes — nothing to commit."
  exit 0
fi

NEW_COUNT="$(git status --porcelain -- src/content/news | grep -c '^??\|^ M\|^M' || true)"
echo "✓ ${NEW_COUNT} article file(s) changed."

# 4) Build check — never publish articles that break the site.
echo "▶ build check…"
npm run --silent build >/dev/null
echo "✓ build passed."

if [[ "${NO_COMMIT:-0}" == "1" ]]; then
  echo "NO_COMMIT=1 — leaving changes unstaged. Done."
  exit 0
fi

# 5) Commit (auto-push hook / Git integration deploys to Vercel).
git add src/content/news scripts/_published.json
git commit -m "content(news): local digest publish $(date '+%Y-%m-%d')" >/dev/null
echo "✓ committed."

if [[ "${NO_PUSH:-0}" == "1" ]]; then
  echo "NO_PUSH=1 — not pushing. Done."
  exit 0
fi

git push origin main
echo "✓ pushed — Vercel will deploy the new articles."
