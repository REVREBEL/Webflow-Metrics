#!/usr/bin/env bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi
set -euo pipefail

# -------------------------
# helpers
# -------------------------
prompt() {
  local var_name="$1"
  local msg="$2"
  local secret="${3:-false}"
  local value=""

  if [[ "${secret}" == "true" ]]; then
    read -r -s -p "${msg}: " value
    echo
  else
    read -r -p "${msg}: " value
  fi

  [[ -n "${value}" ]] || { echo "❌ ${var_name} cannot be empty"; exit 1; }
  printf -v "${var_name}" "%s" "${value}"
}

write_env_kv() {
  local key="$1"
  local val="$2"
  local env_file="${3:-./.env}"
  touch "${env_file}"
  # remove any existing key
  grep -v "^${key}=" "${env_file}" > "${env_file}.tmp" || true
  mv "${env_file}.tmp" "${env_file}"
  echo "${key}=\"${val}\"" >> "${env_file}"
}

ensure_line_in_file() {
  local line="$1"
  local file="$2"
  touch "${file}"
  grep -qxF "${line}" "${file}" || echo "${line}" >> "${file}"
}

ensure_gitignore_entries() {
  ensure_line_in_file ".env" ".gitignore"
  ensure_line_in_file "webflow.json" ".gitignore"
  ensure_line_in_file "lost+found/" ".gitignore"
}

ensure_package_json_scripts() {
  if [[ ! -f "package.json" ]]; then
    echo "ℹ️  package.json not found. Creating a minimal one."
    cat > package.json <<'EOF'
{
  "name": "revrebel-project",
  "private": true,
  "scripts": {}
}
EOF
  fi

  node - <<'NODE'
const fs = require('fs');
const path = 'package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));

pkg.scripts = pkg.scripts || {};

pkg.scripts["setup:repo"] = "bash scripts/setup-repo.sh";
pkg.scripts["build:push"] = "bash scripts/build-and-push.sh";
pkg.scripts["build:docs"] = "node ./scripts/build-master-doc.mjs";
pkg.scripts["sync:main"] = "bash scripts/sync-main-to-dev.sh";
pkg.scripts["cleanup"] =
  "rm -rf /tmp/* /var/tmp/* /root/.npm /root/.cache /root/.local /app/lost+found/* /app/dist 2>/dev/null || true && echo 'Cleanup complete!' && df -h / | tail -1";

fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
console.log("✅ Updated package.json scripts: setup:repo, build:push, build:docs, sync:main, cleanup");
NODE
}

# -------------------------
# SSH setup (creates ~/.ssh + key + agent + config)
# -------------------------
ensure_ssh_ready() {
  local home_dir="${HOME:-}"
  if [[ -z "${home_dir}" ]]; then
    home_dir="$(cd ~ && pwd)"
  fi

  local ssh_dir="${home_dir}/.ssh"
  if [[ ! -d "${ssh_dir}" ]]; then
    echo "ℹ️  SSH directory not found. Creating ${ssh_dir} ..."
    mkdir -p "${ssh_dir}"
  fi
  chmod 700 "${ssh_dir}"

  # Use a named key to avoid clobbering user's defaults
  local key_path="${ssh_dir}/githubkey"
  local pub_path="${ssh_dir}/githubkey.pub"
  local ssh_cfg="${ssh_dir}/config"

  if [[ ! -f "${key_path}" || ! -f "${pub_path}" ]]; then
    echo "🔐 No SSH key found. Generating ed25519..."
    ssh-keygen -t ed25519 -C "${GIT_USER_EMAIL:-}" -f "${key_path}" -N ""
  fi

  if [[ ! -f "${key_path}" || ! -f "${pub_path}" ]]; then
    echo "❌ SSH key generation did not produce expected files:"
    echo "   ${key_path}"
    echo "   ${pub_path}"
    exit 1
  fi

  chmod 600 "${key_path}"
  chmod 644 "${pub_path}"

  # Ensure ssh-agent exists
  if [[ -z "${SSH_AUTH_SOCK:-}" ]]; then
    eval "$(ssh-agent -s)" >/dev/null
  fi

  # Add key to agent (best-effort)
  ssh-add "${key_path}" >/dev/null 2>&1 || true

  # Pin GitHub to this key so git doesn't guess wrong keys
  touch "${ssh_cfg}"
  chmod 600 "${ssh_cfg}"

  if ! grep -q "Host github.com" "${ssh_cfg}"; then
    cat >> "${ssh_cfg}" <<EOF

Host github.com
  HostName github.com
  User git
  IdentityFile ${key_path}
  IdentitiesOnly yes
EOF
  else
    # If there's already a github.com host block, we won't try to rewrite it.
    :
  fi

  echo "✅ SSH ready. Add this key to GitHub if needed:"
  echo "--------------------------------------------------"
  cat "${pub_path}"
  echo "--------------------------------------------------"
}

# -------------------------
# load .env (if present)
# -------------------------
if [[ -f "./.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "./.env"
  set +a
fi

: "${GITHUB_OWNER:=REVREBEL}"
: "${GIT_USER_NAME:=}"
: "${GIT_USER_EMAIL:=}"
: "${GITHUB_ACCESS_TOKEN:=}"

# -------------------------
# collect identity (store in .env for future runs)
# -------------------------
if [[ -z "${GIT_USER_NAME}" ]]; then
  prompt GIT_USER_NAME "Git user.name (e.g., RR-Gary-Stringham)"
  write_env_kv "GIT_USER_NAME" "${GIT_USER_NAME}" "./.env"
fi

if [[ -z "${GIT_USER_EMAIL}" ]]; then
  prompt GIT_USER_EMAIL "Git user.email (e.g., gary@revrebel.io)"
  write_env_kv "GIT_USER_EMAIL" "${GIT_USER_EMAIL}" "./.env"
fi

git config --global user.name "${GIT_USER_NAME}"
git config --global user.email "${GIT_USER_EMAIL}"

# -------------------------
# init git repo if needed
# -------------------------
if [[ ! -d ".git" ]]; then
  git init
  echo "✅ Initialized git repo"
fi

# -------------------------
# patch package.json scripts
# -------------------------
ensure_package_json_scripts

# -------------------------
# repo name
# -------------------------
prompt REPO_NAME "Enter repo name (e.g., guestbook-form)"

# -------------------------
# interactive: create repo now?
# -------------------------
echo
read -r -p "Create GitHub repository now? (y/n): " CREATE_REPO

REPO_VISIBILITY="private"
if [[ "${CREATE_REPO}" =~ ^[Yy]$ ]]; then
  echo
  echo "Select repository visibility:"
  echo "  1) Private (default)"
  echo "  2) Public"
  read -r -p "Choose 1 or 2: " VISIBILITY_CHOICE
  if [[ "${VISIBILITY_CHOICE}" == "2" ]]; then
    REPO_VISIBILITY="public"
  fi

  echo "Creating GitHub repo ${GITHUB_OWNER}/${REPO_NAME} (${REPO_VISIBILITY})..."

  if command -v gh >/dev/null 2>&1; then
    # gh must already be authenticated (gh auth login)
    if [[ "${REPO_VISIBILITY}" == "public" ]]; then
      gh repo create "${GITHUB_OWNER}/${REPO_NAME}" --public --confirm >/dev/null
    else
      gh repo create "${GITHUB_OWNER}/${REPO_NAME}" --private --confirm >/dev/null
    fi
    echo "✅ Repo created via GitHub CLI (gh)"
  else
    # Fallback to API (requires token)
    if [[ -z "${GITHUB_ACCESS_TOKEN:-}" ]]; then
      prompt GITHUB_ACCESS_TOKEN "GitHub access token required to create repo via API. Enter token" true
      write_env_kv "GITHUB_ACCESS_TOKEN" "${GITHUB_ACCESS_TOKEN}" "./.env"
    fi

    private_json="true"
    [[ "${REPO_VISIBILITY}" == "public" ]] && private_json="false"

    # Create in org: POST /orgs/{org}/repos
    curl -fsSL -X POST "https://api.github.com/orgs/${GITHUB_OWNER}/repos" \
      -H "Authorization: Bearer ${GITHUB_ACCESS_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -d "{\"name\":\"${REPO_NAME}\",\"private\":${private_json}}" >/dev/null

    echo "✅ Repo created via GitHub API"
  fi
else
  echo "ℹ️ Skipping repository creation."
fi

# -------------------------
# choose auth + set origin
# -------------------------
echo
echo "Choose GitHub auth method for 'origin':"
echo "  1) SSH (recommended)"
echo "  2) HTTPS + token via git credential store (no token in URL)"
echo "  3) GitHub CLI (gh)"
read -r -p "Select 1/2/3: " AUTH_CHOICE

REMOTE_URL=""
case "${AUTH_CHOICE}" in
  1)
    ensure_ssh_ready
    REMOTE_URL="git@github.com:${GITHUB_OWNER}/${REPO_NAME}.git"
    ;;
  2)
    if [[ -z "${GITHUB_ACCESS_TOKEN:-}" ]]; then
      prompt GITHUB_ACCESS_TOKEN "Enter GitHub access token" true
      write_env_kv "GITHUB_ACCESS_TOKEN" "${GITHUB_ACCESS_TOKEN}" "./.env"
    fi

    # Keep remote clean (no token in URL)
    REMOTE_URL="https://github.com/${GITHUB_OWNER}/${REPO_NAME}.git"

    # Persist creds for github.com so git stops prompting
    git config --global credential.helper store
    printf "protocol=https\nhost=github.com\nusername=x-access-token\npassword=%s\n\n" \
      "${GITHUB_ACCESS_TOKEN}" | git credential approve
    ;;
  3)
    command -v gh >/dev/null 2>&1 || { echo "❌ gh not installed"; exit 1; }
    echo "ℹ️  Ensure you're logged in: gh auth login"
    REMOTE_URL="https://github.com/${GITHUB_OWNER}/${REPO_NAME}.git"
    ;;
  *)
    echo "❌ Invalid selection."
    exit 1
    ;;
esac

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "${REMOTE_URL}"
  echo "✅ Updated origin: ${REMOTE_URL}"
else
  git remote add origin "${REMOTE_URL}"
  echo "✅ Added origin: ${REMOTE_URL}"
fi

# -------------------------
# ensure dev branch
# -------------------------
git checkout -B dev >/dev/null 2>&1 || true
git branch -M dev
echo "✅ Ensured branch is dev"

# -------------------------
# gitignore + initial commit
# -------------------------
ensure_gitignore_entries
echo "✅ Updated .gitignore (.env, webflow.json, lost+found/)"

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git add -A
  git commit -m "chore: initial commit" >/dev/null 2>&1 || true
  echo "✅ Created initial commit"
else
  echo "ℹ️  Repo already has commits; skipping initial commit"
fi

# -------------------------
# If remote main exists, connect histories now to avoid unrelated-history PRs.
# -------------------------
git fetch origin >/dev/null 2>&1 || true
if git show-ref --verify --quiet "refs/remotes/origin/main"; then
  if git merge-base HEAD "origin/main" >/dev/null 2>&1; then
    echo "✅ Local history already related to origin/main"
  else
    echo "ℹ️  origin/main exists but has unrelated history. Creating a bridge merge..."
    if git merge --allow-unrelated-histories -X ours --no-edit origin/main; then
      echo "✅ Histories connected (dev is now related to origin/main)"
    else
      echo "❌ Could not auto-merge unrelated histories."
      echo "   Resolve conflicts, commit, and run setup again."
      exit 1
    fi
  fi
else
  echo "ℹ️  origin/main does not exist yet; first push will create it."
fi

# -------------------------
# Option B: push BOTH branches initially so they’re in sync
# - pushes dev
# - pushes main to the same commit (from dev)
# - does NOT auto-merge anything
# -------------------------
echo
read -r -p "Push initial commit to both dev and main now? (y/n): " PUSH_BOTH

if [[ "${PUSH_BOTH}" =~ ^[Yy]$ ]]; then
  echo "🚀 Pushing dev..."
  git push -u origin dev

  echo "🚀 Creating/updating main to match dev..."
  git push -u origin dev:main

  echo "✅ Remote branches dev and main are now in sync (same commit)."
else
  echo "ℹ️ Skipping initial push. You can push later with:"
  echo "  git push -u origin dev"
  echo "  git push -u origin dev:main"
fi

# -------------------------
# Optional: create PR dev → main (NO auto-merge)
# Note: If dev and main are identical, GitHub has nothing to compare and PR creation will fail.
# We attempt it and fall back gracefully.
# -------------------------
echo
read -r -p "Create a PR from dev → main now (no auto-merge)? (y/n): " CREATE_PR

if [[ "${CREATE_PR}" =~ ^[Yy]$ ]]; then
  if command -v gh >/dev/null 2>&1; then
    # Attempt PR creation; if there's no diff, gh will error — we don't fail the script.
    PR_TITLE="${PR_TITLE:-"Init: dev → main"}"
    PR_BODY="${PR_BODY:-"Initial repository setup. No auto-merge."}"

    if gh pr view --head dev >/dev/null 2>&1; then
      echo "ℹ️  PR already exists for dev"
    else
      if gh pr create --base main --head dev --title "${PR_TITLE}" --body "${PR_BODY}"; then
        echo "✅ PR created (no auto-merge)."
      else
        echo "ℹ️  Could not create PR (likely dev and main are identical)."
        echo "   Make a change on dev and run: gh pr create --base main --head dev"
      fi
    fi
  else
    echo "ℹ️  gh not found; cannot auto-create PR."
    echo "   Install gh or create PR in GitHub UI: dev → main"
  fi
else
  echo "ℹ️ Skipping PR creation."
fi

echo
echo "🎉 Setup complete."
echo "Next commands:"
echo "  npm run build:docs"
echo "  npm run build:push"
echo "  npm run sync:main"
echo "  npm run cleanup"
