#!/usr/bin/env bash
set -euo pipefail

# ---------- helpers ----------
prompt() {
  local var_name="$1"
  local msg="$2"
  local secret="${3:-false}"
  local value=""

  if [[ "$secret" == "true" ]]; then
    read -r -s -p "${msg}: " value
    echo
  else
    read -r -p "${msg}: " value
  fi

  [[ -n "$value" ]] || { echo "❌ $var_name cannot be empty"; exit 1; }
  printf -v "$var_name" "%s" "$value"
}

write_env_kv() {
  local key="$1"
  local val="$2"
  local env_file="${3:-./.env}"
  touch "$env_file"
  grep -v "^${key}=" "$env_file" > "${env_file}.tmp" || true
  mv "${env_file}.tmp" "$env_file"
  echo "${key}=\"${val}\"" >> "$env_file"
}

ensure_line_in_file() {
  local line="$1"
  local file="$2"
  touch "$file"
  grep -qxF "$line" "$file" || echo "$line" >> "$file"
}

ensure_gitignore_entries() {
  ensure_line_in_file ".env" ".gitignore"
  ensure_line_in_file "webflow.json" ".gitignore"
  ensure_line_in_file "lost+found/" ".gitignore"
}

ensure_ssh_ready() {
  mkdir -p "${HOME}/.ssh"
  chmod 700 "${HOME}/.ssh"

  if [[ ! -f "${HOME}/.ssh/githubkey" || ! -f "${HOME}/.ssh/githubkey.pub" ]]; then
    echo "🔐 No SSH key found. Generating ed25519..."
    ssh-keygen -t ed25519 -C "${GIT_USER_EMAIL:-gary@revrebel.io}" -f "${HOME}/.ssh/githubkey" -N ""
  fi

  chmod 600 "${HOME}/.ssh/githubkey"
  chmod 644 "${HOME}/.ssh/githubkey.pub"

  if [[ -z "${SSH_AUTH_SOCK:-}" ]]; then
    eval "$(ssh-agent -s)" >/dev/null
  fi
  ssh-add "${HOME}/.ssh/githubkey" >/dev/null || true

  echo "✅ SSH ready. Add this key to GitHub if needed:"
  echo "--------------------------------------------------"
  cat "${HOME}/.ssh/githubkey.pub"
  echo "--------------------------------------------------"
}

# ---------- load .env ----------
if [[ -f "./.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "./.env"
  set +a
fi

# ---------- require/prompt env vars ----------
: "${GITHUB_OWNER:=REVREBEL}"

if [[ -z "${GIT_USER_NAME:-}" ]]; then
  prompt GIT_USER_NAME "Git user.name (e.g., RR-Gary-Stringham)"
  write_env_kv "GIT_USER_NAME" "$GIT_USER_NAME" "./.env"
fi
if [[ -z "${GIT_USER_EMAIL:-}" ]]; then
  prompt GIT_USER_EMAIL "Git user.email (e.g., gary@revrebel.io)"
  write_env_kv "GIT_USER_EMAIL" "$GIT_USER_EMAIL" "./.env"
fi

git config --global user.name "$GIT_USER_NAME"
git config --global user.email "$GIT_USER_EMAIL"

# ---------- init repo if needed ----------
if [[ ! -d ".git" ]]; then
  git init
  echo "✅ Initialized git repo"
fi

# ---------- package.json patcher ----------
ensure_package_json_scripts() {
  if [[ ! -f "package.json" ]]; then
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
pkg.scripts["cleanup"] =
  "rm -rf /tmp/* /var/tmp/* /root/.npm /root/.cache /root/.local /app/lost+found/* /app/dist 2>/dev/null || true && echo 'Cleanup complete!' && df -h / | tail -1";

fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
console.log("✅ Updated package.json scripts: setup:repo, build:push, build:docs, cleanup");
NODE
}

ensure_package_json_scripts

# ---------- choose auth + set origin ----------
prompt REPO_NAME "Enter repo name (e.g., guestbook-form)"

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
      write_env_kv "GITHUB_ACCESS_TOKEN" "$GITHUB_ACCESS_TOKEN" "./.env"
    fi

    REMOTE_URL="https://github.com/${GITHUB_OWNER}/${REPO_NAME}.git"

    git config --global credential.helper store
    printf "protocol=https\nhost=github.com\nusername=x-access-token\npassword=%s\n\n" \
      "$GITHUB_ACCESS_TOKEN" | git credential approve
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
  git remote set-url origin "$REMOTE_URL"
  echo "✅ Updated origin: $REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
  echo "✅ Added origin: $REMOTE_URL"
fi

# ---------- ensure dev branch ----------
git checkout -B dev >/dev/null 2>&1 || true
git branch -M dev
echo "✅ Ensured branch is dev"

# ---------- gitignore + initial commit ----------
ensure_gitignore_entries
echo "✅ Updated .gitignore (.env, webflow.json, lost+found/)"

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git add -A
  git commit -m "chore: initial commit" >/dev/null 2>&1 || true
  echo "✅ Created initial commit"
else
  echo "ℹ️  Repo already has commits; skipping initial commit"
fi

echo
echo "🎉 Setup complete."
echo "Next commands:"
echo "  npm run build:docs"
echo "  npm run build:push"
echo "  npm run cleanup"