#!/usr/bin/env bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi
set -euo pipefail

BRANCH="${BRANCH:-dev}"
BASE_BRANCH="${BASE_BRANCH:-main}"

# Optional PR creation via gh
if command -v gh >/dev/null 2>&1; then
  PR_TITLE="${PR_TITLE}:-Build update"
  PR_BODY="${PR_BODY}:-Automated build + push from npm script."

  git fetch origin >/dev/null 2>&1 || true
  if ! git show-ref --verify --quiet "refs/remotes/origin/${BASE_BRANCH}"; then
    echo "❌ origin/${BASE_BRANCH} not found. Push or create it first."
    exit 1
  fi

  if ! git merge-base HEAD "origin/${BASE_BRANCH}" >/dev/null 2>&1; then
    echo "❌ ${BRANCH} and ${BASE_BRANCH} do not share history."
    echo "   Run setup-repo.sh and choose the history bridge step."
    exit 1
  fi

  if gh pr view "${BRANCH}" --json url >/dev/null 2>&1; then
    echo "ℹ️  PR already exists for ${BRANCH}"
  else
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

echo "✅ PR Created."
