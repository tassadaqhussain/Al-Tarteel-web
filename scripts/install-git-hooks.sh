#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOKS="${ROOT}/scripts/git-hooks"
chmod +x "${HOOKS}/commit-msg"
git -C "${ROOT}" config core.hooksPath scripts/git-hooks
echo "Git hooks installed (core.hooksPath=scripts/git-hooks)"
