#!/usr/bin/env bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi
set -euo pipefail

DEV_BRANCH="${DEV_BRANCH:-dev}"
MAIN_BRANCH="${MAIN_BRANCH:-main}"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "❌ Not inside a git repo."
  exit 1
}

git remote get-url origin >/dev/null 2>&1 || {
  echo "❌ No 'origin' remote set."
  exit 1
}

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Working tree has uncommitted changes. Commit/stash first."
  exit 1
fi

git fetch origin >/dev/null 2>&1
git checkout -B "$DEV_BRANCH" >/dev/null 2>&1 || git checkout "$DEV_BRANCH"

if git show-ref --verify --quiet "refs/remotes/origin/$DEV_BRANCH"; then
  git pull --rebase origin "$DEV_BRANCH"
fi

if ! git show-ref --verify --quiet "refs/remotes/origin/$MAIN_BRANCH"; then
  echo "ℹ️  origin/$MAIN_BRANCH does not exist yet; nothing to sync."
  exit 0
fi

if git merge-base --is-ancestor "origin/$MAIN_BRANCH" HEAD; then
  echo "✅ $DEV_BRANCH already includes origin/$MAIN_BRANCH."
else
  git merge --no-edit "origin/$MAIN_BRANCH"
  echo "✅ Merged origin/$MAIN_BRANCH into $DEV_BRANCH."
fi

git push -u origin "$DEV_BRANCH"
echo "✅ Synced and pushed $DEV_BRANCH."
