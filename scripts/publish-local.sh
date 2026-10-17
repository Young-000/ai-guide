#!/usr/bin/env bash
# Local, API-key-free news publishing cycle for ai-guide.
#
# Replaces the GitHub Actions auto-news cron when no ANTHROPIC_API_KEY is
# available: generation runs through the local `claude` CLI (Claude Code auth).
#
#   fetch RSS → generate (ko+en, keyless) → validate/quarantine per file → build check
#   → commit → push
#
# Failure handling (2026-10-17, after 18 days of silent non-publishing):
#   - Each article file is validated on its own. A bad file (and its translation partner) is
#     moved to src/content/_quarantine/ and the rest publish.
#   - If the build still fails, nothing is published, the run's files are snapshotted to
#     $AI_GUIDE_FAILED_DIR, the tree is restored to clean and the script exits 3.
#   - "Every generation attempt failed" exits 2; "nothing new" exits 0; a generator crash exits 4.
#   - Refuses to run unless the checkout is on main (exit 4, result=wrong-branch).
#   - A fetch/push failure exits 1 with result=push-failed. The commit stays local, and the next
#     run pushes it even when there is nothing new to generate.
#   - Every run appends one line to $AI_GUIDE_STATUS_FILE for the watchdog and the PM cycle.
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

STATUS_FILE="${AI_GUIDE_STATUS_FILE:-$HOME/.claude/logs/ai-guide-publish.status}"
FAILED_DIR="${AI_GUIDE_FAILED_DIR:-$HOME/.claude/state/ai-guide-failed}"
LOG_FILE="${AI_GUIDE_LOG_FILE:-$HOME/.claude/logs/ai-guide-publish.log}"

# One status line per run, written on every exit path. Fields are `key=value`, append-only,
# so readers can split on spaces: ts result generated quarantined built pushed exit.
RESULT="error"; GENERATED=0; QUARANTINED=0; BUILT="no"; PUSHED="no"
BUILD_LOG=""
write_status() {
  local code=$?
  mkdir -p "$(dirname "$STATUS_FILE")" 2>/dev/null || true
  printf 'ts=%s result=%s generated=%s quarantined=%s built=%s pushed=%s exit=%s\n' \
    "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$RESULT" "$GENERATED" "$QUARANTINED" "$BUILT" "$PUSHED" "$code" \
    >> "$STATUS_FILE" 2>/dev/null || true
  # Keep the status file short (last 500 runs).
  if [ -f "$STATUS_FILE" ] && [ "$(wc -l < "$STATUS_FILE")" -gt 500 ]; then
    tail -n 500 "$STATUS_FILE" > "$STATUS_FILE.tmp" 2>/dev/null && mv "$STATUS_FILE.tmp" "$STATUS_FILE" || true
  fi
  if [ -n "$BUILD_LOG" ] && [ -f "$BUILD_LOG" ]; then rm -f "$BUILD_LOG"; fi
}
trap write_status EXIT

# Publishing commits on HEAD but pushes `main`: on any other branch the status line used to say
# "ok / pushed" while nothing reached origin. Refuse up front.
CURRENT_BRANCH="$(git branch --show-current)"
if [ "$CURRENT_BRANCH" != "main" ]; then
  RESULT="wrong-branch"
  echo "✗ checkout is on '${CURRENT_BRANCH:-detached HEAD}', not main — refusing to publish." >&2
  echo "  Switch to main (git switch main) or run from the main checkout." >&2
  exit 4
fi

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
  RESULT="no-auth"
  echo "✗ 생성 백엔드 인증 없음."
  echo "  cron 등 비대화형 실행에는 장기 토큰이 필요합니다:"
  echo "    1) claude setup-token   (대화형으로 1회 발급, 구독 인증 — API 과금 없음)"
  echo "    2) 발급된 토큰을 $CLAUDE_AUTH_ENV 에 CLAUDE_CODE_OAUTH_TOKEN=... 로 저장"
  echo "  (또는 ANTHROPIC_API_KEY를 같은 파일에 넣으면 API 백엔드로 동작 — 과금 발생)"
  exit 1
fi

# Keep the log from growing without bound: runs older than 7 days are gzipped to
# ~/.claude/logs/archive/. The log is trimmed in place, so the cron `>>` redirect stays valid.
# Best effort — a rotation problem must never block publishing.
npm run --silent rotate-log -- --log "$LOG_FILE" --min-bytes 5242880 || true

# 1) Fetch fresh RSS items → scripts/worklist.json
npm run --silent fetch-news

# 2) Generate ko+en digests via the local claude CLI (no ANTHROPIC_API_KEY).
#    `env -u` guarantees the CLI backend even if a key is exported in the shell.
#    generate-news exits 0 = pairs written, 1 = nothing new, 2 = every attempt failed.
#    Telling 1 and 2 apart is the point: the 10/5-10/8 break (claude CLI erroring on every
#    item) used to look like a quiet news day.
GENERATE_EXIT=0
GENERATE_OUT="$(env -u ANTHROPIC_API_KEY npm run --silent generate-news 2>&1)" || GENERATE_EXIT=$?
printf '%s\n' "$GENERATE_OUT"
if [ "$GENERATE_EXIT" = "2" ]; then
  RESULT="generation-failed"
  echo "✗ Generation failed for every item (claude CLI / output errors) — see warnings above."
  exit 2
fi
# Exit 1 only counts as "nothing new" when the generator reached its summary line. A crash that
# happens to exit 1 (module error, uncaught throw) has no summary and must not look like a quiet day.
if [ "$GENERATE_EXIT" = "1" ] && ! grep -q 'article pair(s) written' <<<"$GENERATE_OUT"; then
  GENERATE_EXIT=4
fi
if [ "$GENERATE_EXIT" != "0" ] && [ "$GENERATE_EXIT" != "1" ]; then
  RESULT="generation-error"
  echo "✗ generate-news crashed (exit $GENERATE_EXIT)."
  exit "$GENERATE_EXIT"
fi

# Merge in what the CI publisher pushed, then push. Used after a fresh commit and, when there is
# nothing new, to retry commits an earlier run could not push. Every failure leaves a non-zero
# exit and result=push-failed (or merge-conflict); the commit stays local for the next run.
publish_to_origin() {
  RESULT="push-failed"
  # Integrate whatever the GitHub Actions publisher pushed since we last looked.
  # Both publishers append to scripts/_published.json, so the branches diverge and
  # that one file conflicts every time. Everything else (new article files) merges
  # cleanly. The URL list is a dedupe ledger — the union of both sides is correct.
  if ! git fetch origin main --quiet; then
    echo "✗ git fetch origin main failed — commit stays local, will be pushed next run."
    exit 1
  fi
  if ! git merge-base --is-ancestor origin/main HEAD; then
    echo "▶ origin/main moved ahead (CI publisher) — merging…"
    if ! git merge origin/main --no-edit >/dev/null 2>&1; then
      CONFLICTS="$(git diff --name-only --diff-filter=U)"
      if [ "$CONFLICTS" != "scripts/_published.json" ]; then
        echo "✗ merge conflict outside the published ledger — needs a human:"
        echo "$CONFLICTS"
        git merge --abort
        RESULT="merge-conflict"
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
  #
  # OPS_PREPUSH_JOB_BASE: the workspace pre-push guard lets main move by one commit
  # at a time (squash only — the 2026-09-27 incident). This publisher is the one
  # sanctioned direct-to-main flow and legitimately pushes more: the publish commit
  # plus the merge with the CI publisher, or several publishes after a failed run.
  # Passing the remote tip we just fetched tells the guard "everything above this
  # commit is this job's own output"; the guard logs each use.
  if ! GIT_TERMINAL_PROMPT=0 OPS_PREPUSH_JOB_BASE="$(git rev-parse origin/main)" \
    git -c credential.helper=store push origin main; then
    echo "✗ git push failed — commit stays local, will be pushed next run."
    exit 1
  fi

  # A publish is only done when origin actually moved. "committed" and "pushed"
  # have both lied before — the log stayed green while articles piled up locally.
  BEHIND="$(git rev-list --count origin/main..main)"
  if [ "$BEHIND" != "0" ]; then
    echo "✗ push reported success but origin/main is still ${BEHIND} commit(s) behind."
    exit 1
  fi
  RESULT="ok"; PUSHED="yes"
  echo "✓ pushed — origin/main advanced. Vercel will deploy the new articles."
}

# 3) Did anything change? Includes leftovers from earlier failed runs on purpose: they are
#    validated below like new files. `git status --porcelain` sees untracked files; `git diff`
#    does not (that blind spot once trapped 36 articles locally).
PUBLISH_PATHS=(src/content/news src/content/_quarantine scripts/_published.json)
if [ -z "$(git status --porcelain -- "${PUBLISH_PATHS[@]}")" ]; then
  RESULT="nothing-new"
  echo "ℹ No new articles generated (0 items or all duplicates) — nothing to publish."
  # An earlier run may have committed and then failed to push. Never report that as healthy.
  UNPUSHED="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"
  if [ "$UNPUSHED" != "0" ] && [[ "${NO_PUSH:-0}" != "1" ]] && [[ "${NO_COMMIT:-0}" != "1" ]]; then
    echo "▶ ${UNPUSHED} earlier commit(s) never reached origin — pushing them now."
    publish_to_origin
  fi
  exit 0
fi

# 4) Validate each article file on its own. A bad file (plus its translation partner) is
#    quarantined instead of breaking the build for everyone.
VALIDATE_OUT="$(npm run --silent validate-news)"
printf '%s\n' "$VALIDATE_OUT"
QUARANTINED="$(printf '%s\n' "$VALIDATE_OUT" | sed -n 's/^validate: .*quarantined=\([0-9]*\).*/\1/p' | tail -1)"
QUARANTINED="${QUARANTINED:-0}"

ARTICLE_CHANGES="$(git status --porcelain --untracked-files=all -- src/content/news)"
GENERATED="$(printf '%s\n' "$ARTICLE_CHANGES" | grep -c '^??\|^ M\|^M' || true)"
echo "✓ ${GENERATED} article file(s) to publish, ${QUARANTINED} quarantined."

# 5) Build check — never publish articles that break the site. Output goes to a temp file and
#    only its tail is printed on failure (the old `>/dev/null` hid the cause; printing it all
#    grew the log to 145 MB).
if [ -n "$ARTICLE_CHANGES" ]; then
  echo "▶ build check…"
  BUILD_LOG="$(mktemp "${TMPDIR:-/tmp}/ai-guide-build.XXXXXX")"
  if ! npm run --silent build >"$BUILD_LOG" 2>&1; then
    RESULT="build-failed"
    echo "✗ build failed — last 30 lines:"
    tail -n 30 "$BUILD_LOG"
    # Never leave the tree dirty: snapshot this run's files outside the repo for diagnosis,
    # then restore only the publish paths.
    SNAPSHOT="$FAILED_DIR/$(date '+%Y%m%dT%H%M%S')"
    mkdir -p "$SNAPSHOT"
    git ls-files -z --others --modified --exclude-standard -- "${PUBLISH_PATHS[@]}" \
      | xargs -0 tar -cf "$SNAPSHOT/files.tar" 2>/dev/null || true
    cp "$BUILD_LOG" "$SNAPSHOT/build.log" 2>/dev/null || true
    git clean -fdq -- src/content/news src/content/_quarantine
    # Restore tracked files only (the quarantine dir may not be tracked yet).
    while IFS= read -r -d '' tracked; do
      git checkout -q -- "$tracked"
    done < <(git ls-files -z --modified -- "${PUBLISH_PATHS[@]}")
    echo "✗ restored a clean tree; this run's files are in $SNAPSHOT"
    exit 3
  fi
  BUILT="yes"
  echo "✓ build passed."
else
  echo "ℹ Only quarantine/ledger changes — skipping build."
fi

if [[ "${NO_COMMIT:-0}" == "1" ]]; then
  RESULT="ok"
  echo "NO_COMMIT=1 — leaving changes unstaged. Done."
  exit 0
fi

# 5b) Commit (auto-push hook / Git integration deploys to Vercel).
# Only pass paths that exist: `git add` aborts on an unknown pathspec, and a clean batch has no
# src/content/_quarantine yet (or no longer, once everything was moved back).
ADD_PATHS=()
for publish_path in "${PUBLISH_PATHS[@]}"; do
  if [ -e "$publish_path" ]; then ADD_PATHS+=("$publish_path"); fi
done
git add -A -- "${ADD_PATHS[@]}"
git commit -m "content(news): local digest publish $(date '+%Y-%m-%d')" >/dev/null
echo "✓ committed."

if [[ "${NO_PUSH:-0}" == "1" ]]; then
  RESULT="ok"
  echo "NO_PUSH=1 — not pushing. Done."
  exit 0
fi

# 6) Integrate with the CI publisher and push; fails loudly (non-zero, result=push-failed).
publish_to_origin
