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

# 0) 비대화형(cron) 실행용 인증 로드.
#    claude CLI의 구독 인증은 로그인 세션/Keychain에 묶여 있어 cron에서는
#    "Not logged in"으로 실패한다(실측 2026-07-26). 대화형 셸에서 동작하는 이유는
#    부모 Claude Code 프로세스의 컨텍스트를 상속하기 때문이고, cron엔 그 부모가 없다.
#    → `claude setup-token`으로 발급한 장기 토큰을 아래 파일에 넣어두면 cron에서도 돈다.
CLAUDE_AUTH_ENV="$HOME/.claude/secrets/teamY/claude-cli.env"
if [ -f "$CLAUDE_AUTH_ENV" ]; then
  # shellcheck disable=SC1090
  set -a; . "$CLAUDE_AUTH_ENV"; set +a
fi

# 대화형 컨텍스트 밖인데 토큰도 없으면, RSS만 긁고 생성에서 전부 실패하는 헛도는
# 실행이 된다. 원인을 첫 줄에서 못박고 끝낸다.
if [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ] && [ -z "${ANTHROPIC_API_KEY:-}" ] && [ -z "${CLAUDECODE:-}" ]; then
  echo "✗ 생성 백엔드 인증 없음."
  echo "  cron 등 비대화형 실행에는 장기 토큰이 필요합니다:"
  echo "    1) claude setup-token   (대화형으로 1회 발급, 구독 인증 — API 과금 없음)"
  echo "    2) 발급된 토큰을 $CLAUDE_AUTH_ENV 에 CLAUDE_CODE_OAUTH_TOKEN=... 로 저장"
  echo "  (또는 ANTHROPIC_API_KEY를 같은 파일에 넣으면 API 백엔드로 동작 — 과금 발생)"
  exit 1
fi

# 1) Fetch fresh RSS items → scripts/worklist.json
npm run --silent fetch-news

# 2) Generate ko+en digests via the local claude CLI (no ANTHROPIC_API_KEY).
#    `env -u` guarantees the CLI backend even if a key is exported in the shell.
if ! env -u ANTHROPIC_API_KEY npm run --silent generate-news; then
  echo "ℹ No new articles generated (0 items or all duplicates) — nothing to publish."
  exit 0
fi

# 3) Did any article files actually change?
#    `git diff`는 tracked 파일의 수정만 본다 — 새로 생성된 기사는 untracked라
#    항상 "변경 없음"으로 판정돼 매 실행이 여기서 조용히 종료됐다(실측: 크론
#    13회 전부 실행·생성 성공했는데 push 0회, 기사 36개가 로컬에 갇힘).
#    untracked를 포함하는 `git status --porcelain`으로 판정한다.
ARTICLE_CHANGES="$(git status --porcelain -- src/content/news)"
if [ -z "$ARTICLE_CHANGES" ]; then
  echo "ℹ No article file changes — nothing to commit."
  exit 0
fi

NEW_COUNT="$(printf '%s\n' "$ARTICLE_CHANGES" | grep -c '^??\|^ M\|^M' || true)"
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

# 6) Integrate whatever the GitHub Actions publisher pushed since we last looked.
#    Both publishers append to scripts/_published.json, so the branches diverge and
#    that one file conflicts every time. Everything else (new article files) merges
#    cleanly. The URL list is a dedupe ledger — the union of both sides is correct.
git fetch origin main --quiet
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "▶ origin/main moved ahead (CI publisher) — merging…"
  if ! git merge origin/main --no-edit >/dev/null 2>&1; then
    CONFLICTS="$(git diff --name-only --diff-filter=U)"
    if [ "$CONFLICTS" != "scripts/_published.json" ]; then
      echo "✗ merge conflict outside the published ledger — needs a human:"
      echo "$CONFLICTS"
      git merge --abort
      exit 1
    fi
    node -e '
      const fs = require("fs");
      const { execFileSync } = require("child_process");
      const side = (stage) =>
        JSON.parse(execFileSync("git", ["show", `:${stage}:scripts/_published.json`], { encoding: "utf8" }));
      const ours = side(2);
      const theirs = side(3);
      const merged = { ...theirs, ...ours, urls: [...new Set([...theirs.urls, ...ours.urls])] };
      fs.writeFileSync("scripts/_published.json", JSON.stringify(merged, null, 2) + "\n");
      console.error(`  ledger merged: ${ours.urls.length} + ${theirs.urls.length} → ${merged.urls.length} URLs`);
    '
    git add scripts/_published.json
    git commit --no-edit >/dev/null
  fi
  echo "✓ merged origin/main."
fi

# `store` is spelled out here rather than left to config: the global helper is
# osxkeychain, which returns nothing under cron (no GUI session to unlock the
# keychain). That single gap silently trapped 41 publishes locally between 07-27
# and 08-09. GIT_TERMINAL_PROMPT=0 makes a missing credential fail loudly instead
# of hanging on a username prompt no one is there to answer.
GIT_TERMINAL_PROMPT=0 git -c credential.helper=store push origin main

# 7) A publish is only done when origin actually moved. "committed" and "pushed"
#    have both lied before — the log stayed green while articles piled up locally.
BEHIND="$(git rev-list --count origin/main..main)"
if [ "$BEHIND" != "0" ]; then
  echo "✗ push reported success but origin/main is still ${BEHIND} commit(s) behind."
  exit 1
fi
echo "✓ pushed — origin/main advanced. Vercel will deploy the new articles."
