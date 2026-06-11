#!/usr/bin/env bash
# Format, type-check, and build the Mostro StartOS package.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null)"; then
  ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
fi
cd "$ROOT"

S9PK=false
CHECK_ONLY=false
FORMAT_ONLY=false

usage() {
  cat <<'EOF'
Usage: build-and-format.sh [OPTIONS]

Runs the standard Mostro StartOS build pipeline from the repo root.

Options:
  --s9pk          After JS build, run `make x86` to produce mostro_x86_64.s9pk
  --check-only    Type-check only (npm run check)
  --format-only   Format only (npm run prettier)
  -h, --help      Show this help

Default: npm run prettier → npm run check → npm run build
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --s9pk) S9PK=true; shift ;;
    --check-only) CHECK_ONLY=true; shift ;;
    --format-only) FORMAT_ONLY=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
  esac
done

if ! command -v npm >/dev/null; then
  echo "Error: npm not found. Install Node.js 22." >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "→ Installing dependencies (npm ci)..."
  npm ci
fi

if $FORMAT_ONLY; then
  echo "→ Formatting startos/ (prettier)..."
  npm run prettier
  echo "✅ Format complete."
  exit 0
fi

if $CHECK_ONLY; then
  echo "→ Type-checking (tsc --noEmit)..."
  npm run check
  echo "✅ Type-check passed."
  exit 0
fi

echo "→ Formatting startos/ (prettier)..."
npm run prettier

echo "→ Type-checking (tsc --noEmit)..."
npm run check

echo "→ Building javascript bundle (ncc)..."
npm run build

if $S9PK; then
  if ! command -v start-cli >/dev/null; then
    echo "Error: start-cli not found. Install: curl -fsSL https://start9.com/start-cli/install.sh | sh" >&2
    exit 1
  fi
  echo "→ Packing x86_64 .s9pk (make x86)..."
  make x86
fi

echo "✅ Build pipeline complete."
