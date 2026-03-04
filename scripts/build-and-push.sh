#!/usr/bin/env bash
set -euo pipefail

BRANCH="${BRANCH:-dev}"
BASE_BRANCH="${BASE_BRANCH:-main}"
BUILD_CMD="${BUILD_CMD:-npm run build}"

# Load .env if present
if [[ -f ".env" ]]; then
  # shellcheck disable=SC1091
  source .env || true
fi

# Ensure we’re in a git repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "❌ Not inside a git repo."
  exit 1
}

# Ensure origin exists
git remote get-url origin >/dev/null 2>&1 || {
  echo "❌ No 'origin' remote set. Run setup-repo.sh first."
  exit 1
}

# Avoid rebasing with a dirty working tree (safer)
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Working tree has uncommitted changes. Commit/stash first."
  exit 1
fi

# Ensure branch exists locally and checkout
git checkout -B "$BRANCH" >/dev/null 2>&1 || git checkout "$BRANCH"

# Fetch + rebase on remote branch if it exists
git fetch origin >/dev/null 2>&1 || true
if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  echo "ℹ️  Rebasing on origin/$BRANCH ..."
  git pull --rebase origin "$BRANCH"
else
  echo "ℹ️  origin/$BRANCH does not exist yet; skipping rebase."
fi

# Run build
echo "🏗️  Running build: $BUILD_CMD"
eval "$BUILD_CMD"

# Commit build output if changes exist
if git diff --quiet && git diff --cached --quiet; then
  echo "ℹ️  No changes to commit after build."
else
  git add -A
  COMMIT_MSG="${COMMIT_MSG:-"chore(build): build output $(date -u +'%Y-%m-%dT%H:%M:%SZ')"}"
  git commit -m "$COMMIT_MSG"
  echo "✅ Committed: $COMMIT_MSG"
fi

# Push
echo "🚀 Pushing to origin/$BRANCH ..."
git push -u origin "$BRANCH"

# Optional PR creation via gh
if command -v gh >/dev/null 2>&1; then
  PR_TITLE="${PR_TITLE:-"Build update"}"
  PR_BODY="${PR_BODY:-"Automated build + push from npm script."}"

  if gh pr view "$BRANCH" --json url >/dev/null 2>&1; then
    echo "ℹ️  PR already exists for $BRANCH"
  else
    PR_URL=$(gh pr create \
      --base "$BASE_BRANCH" \
      --head "$BRANCH" \
      --title "$PR_TITLE" \
      --body "$PR_BODY" 2>/dev/null || true)

    if [[ -n "$PR_URL" ]]; then
      echo "✅ PR created:"
      echo "$PR_URL"
    else
      echo "ℹ️ PR creation skipped or failed."
    fi
  fi
else
  echo "ℹ️  gh not found; skipping PR creation."
fi

echo "✅ Done."