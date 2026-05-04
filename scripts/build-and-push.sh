#!/usr/bin/env bash
set -euo pipefail

BRANCH="${BRANCH:-dev}"
BASE_BRANCH="${BASE_BRANCH:-main}"
BUILD_CMD="${BUILD_CMD:-npm run build}"

MAX_PR_FILES_CHANGED="${MAX_PR_FILES_CHANGED:-50}"
MAX_PR_LINES_CHANGED="${MAX_PR_LINES_CHANGED:-1500}"

SYNC_WITH_MAIN="${SYNC_WITH_MAIN:-true}"

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
git checkout -B "${BRANCH}" >/dev/null 2>&1 || git checkout "${BRANCH}"

# Fetch + rebase on remote branch if it exists
git fetch origin >/dev/null 2>&1 || true
if git show-ref --verify --quiet "refs/remotes/origin/${BRANCH}"; then
  echo "ℹ️  Rebasing on origin/${BRANCH} ..."
  git pull --rebase origin "${BRANCH}"
else
  echo "ℹ️  origin/${BRANCH} does not exist yet; skipping rebase."
fi

# Pull main back into dev so new AI edits start from latest merged code.
if [[ "${SYNC_WITH_MAIN}" == "true" ]] && git show-ref --verify --quiet "refs/remotes/origin/${BASE_BRANCH}"; then
  echo "🔄 Syncing origin/${BASE_BRANCH} into ${BRANCH} ..."
  if git merge-base --is-ancestor "origin/${BASE_BRANCH}" HEAD; then
    echo "ℹ️  ${BRANCH} already contains origin/${BASE_BRANCH}."
  else
    git merge --no-edit "origin/${BASE_BRANCH}"
    echo "✅ Synced ${BRANCH} with origin/${BASE_BRANCH}."
  fi
fi

# Run build
echo "🏗️  Running build: ${BUILD_CMD}"
eval "${BUILD_CMD}"

# Commit build output if changes exist
if git diff --quiet && git diff --cached --quiet; then
  echo "ℹ️  No changes to commit after build."
else
  git add -A
  COMMIT_MSG="${COMMIT_MSG:-chore(build): build output $(date -u +'%Y-%m-%dT%H:%M:%SZ')}"
  git commit -m "${COMMIT_MSG}"
  echo "✅ Committed: ${COMMIT_MSG}"
fi

# PR size guardrail (AI review friendly): compare branch delta against base branch.
if git show-ref --verify --quiet "refs/remotes/origin/${BASE_BRANCH}"; then
  PR_FILES_CHANGED=$(git diff --name-only "origin/${BASE_BRANCH}...HEAD" | wc -l | tr -d ' ')
  PR_LINES_CHANGED=$(git diff --numstat "origin/${BASE_BRANCH}...HEAD" | awk '{add+=$1; del+=$2} END {print add+del+0}')

  if [[ "${PR_FILES_CHANGED}" -gt "${MAX_PR_FILES_CHANGED}" || "${PR_LINES_CHANGED}" -gt "${MAX_PR_LINES_CHANGED}" ]]; then
    echo "❌ Refusing to push: PR would be too large for effective AI review."
    echo "   PR files changed: ${PR_FILES_CHANGED} (max ${MAX_PR_FILES_CHANGED})"
    echo "   PR lines changed: ${PR_LINES_CHANGED} (max ${MAX_PR_LINES_CHANGED})"
    echo
    echo "Tips:"
    echo "  - Split this into smaller commits/PRs"
    echo "  - Keep generated artifacts out of commits when possible"
    echo "  - Push focused feature slices"
    exit 1
  fi
else
  echo "ℹ️  origin/${BASE_BRANCH} not found; skipping PR size guardrail."
fi

# Push
echo "🚀 Pushing to origin/${BRANCH} ..."
git push -u origin "${BRANCH}"

# Optional PR creation via gh
if command -v gh >/dev/null 2>&1; then
  PR_TITLE="${PR_TITLE:-"Build update"}"
  PR_BODY="${PR_BODY:-"Automated build + push from npm script."}"

  if gh pr view "${BRANCH}" --json url >/dev/null 2>&1; then
    echo "ℹ️  PR already exists for ${BRANCH}"
  else
    if ! git merge-base HEAD "origin/${BASE_BRANCH}" >/dev/null 2>&1; then
      echo "❌ ${BRANCH} and ${BASE_BRANCH} do not share history. Run setup-repo.sh to bridge histories."
      exit 1
    fi
    PR_URL=$(gh pr create \
      --base "${BASE_BRANCH}" \
      --head "${BRANCH}" \
      --title "${PR_TITLE}" \
      --body "${PR_BODY}" 2>/dev/null || true)

    if [[ -n "${PR_URL}" ]]; then
      echo "✅ PR created:"
      echo "${PR_URL}"
    else
      echo "ℹ️ PR creation skipped or failed."
    fi
  fi
else
  echo "ℹ️  gh not found; skipping PR creation."
fi

echo "✅ Done."
