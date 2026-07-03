#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.."
FAIL=0
step(){ echo "▶ $1"; }; ok(){ echo "  ✅ $1"; }; bad(){ echo "  ❌ $1"; FAIL=1; }

step "type-check"
if npm run type-check --silent 2>&1; then ok "type-check passed"; else bad "type-check failed"; fi

step "lint"
if npm run lint --silent 2>&1; then ok "lint passed"; else bad "lint failed"; fi

step "test"
if npm test 2>&1; then ok "test passed"; else bad "test failed"; fi

step "build"
if npm run build 2>&1; then ok "build passed"; else bad "build failed"; fi

echo
if [ "$FAIL" = "0" ]; then echo "VERIFY: GREEN"; exit 0; else echo "VERIFY: RED"; exit 1; fi
