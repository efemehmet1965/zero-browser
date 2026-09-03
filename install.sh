#!/usr/bin/env bash
# ZERO MVP installer (macOS/Linux). Mirrors install.ps1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
NEWTAB="$ROOT/newtab"
EXT="$ROOT/extension"
CHROME="$ROOT/chrome"

echo "== ZERO MVP install =="
if [ ! -d "$NEWTAB/node_modules" ]; then
  echo "[1/3] npm install…"
  npm --prefix "$NEWTAB" install
fi
echo "[2/3] npm run build…"
npm --prefix "$NEWTAB" run build

echo "[3/3] staging extension + chrome/"
rm -rf "$EXT/dist"
cp -r "$NEWTAB/dist" "$EXT/dist"
echo "[ok] staged extension dist -> $EXT/dist"

# Best-effort profile detection
PROFILE_DIR=""
if [ "$(uname)" = "Darwin" ]; then
  PROFILE_DIR="$HOME/Library/Application Support/Firefox/Profiles"
else
  PROFILE_DIR="$HOME/.mozilla/firefox"
fi
PROFILE="$(ls -d "$PROFILE_DIR"/*.default* 2>/dev/null | head -n1 || true)"
if [ -z "$PROFILE" ]; then
  echo "WARNING: no Firefox profile found under $PROFILE_DIR — run Firefox once, then re-run."
else
  mkdir -p "$PROFILE/chrome"
  cp "$CHROME/userChrome.css" "$PROFILE/chrome/userChrome.css"
  cp "$CHROME/userContent.css" "$PROFILE/chrome/userContent.css"
  echo "[ok] chrome/ -> $PROFILE/chrome"
fi

cat <<EOF

Next (3-step demo):
  1. about:config -> toolkit.legacyUserProfileCustomizations.stylesheets = true
  2. Restart Firefox
  3. about:debugging -> This Firefox -> Load Temporary Add-on -> $EXT/manifest.json
EOF
