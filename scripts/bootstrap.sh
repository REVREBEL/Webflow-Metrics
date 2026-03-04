#!/usr/bin/env bash
set -euo pipefail

# Example 
# GIST_RAW_BASE="https://gist.githubusercontent.com/USERNAME/abcdef123456/raw"

GIST_RAW_BASE="https://gist.github.com/RR-Gary-Stringham/39f83f6750685566f7ec83a583482cac/raw"

: "${GIST_RAW_BASE:?Set GIST_RAW_BASE to your gist raw base URL}"

mkdir -p scripts

fetch() {
  local name="$1"
  local url="${GIST_RAW_BASE}/${name}"
  echo "⬇️  $name"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "scripts/${name}"
  else
    wget -qO "scripts/${name}" "$url"
  fi
}

fetch "setup-repo.sh"
fetch "build-and-push.sh"
fetch "build-master-doc.mjs"

chmod +x scripts/setup-repo.sh scripts/build-and-push.sh

echo "✅ Installed scripts. Running setup..."
bash scripts/setup-repo.sh
