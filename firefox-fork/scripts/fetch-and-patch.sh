#!/usr/bin/env bash
# ZERO cekirdek MVP - adim 1: kaynagi cek + yamalari uygula.
# Ubuntu 22.04'te calistir. Firefox derlemez, sadece hazirlik.
set -euo pipefail

ESR=128
WORK="$HOME/zero-build"

sudo apt update && sudo apt install -y python3 mercurial nodejs git curl
pip3 install --user mercurial 2>/dev/null || true

mkdir -p "$WORK" && cd "$WORK"
if [ ! -d firefox-esr ]; then
  hg clone https://hg.mozilla.org/releases/mozilla-esr$ESR firefox-esr
fi
cd firefox-esr

# Bu repo firefox-fork/patches/*.patch dosyarini uygular
PATCHDIR="$(cd "$(dirname "$0")/../patches" && pwd)"
for p in "$PATCHDIR"/*.patch; do
  [ -f "$p" ] || continue
  echo ">> uygulaniyor: $(basename "$p")"
  hg import --no-commit "$p" || patch -p1 < "$p"
done

# mozconfig + branding + newtab build'i kopyala
cp "$(dirname "$0")/../mozconfig" .mozconfig
mkdir -p browser/branding/zero
cp -r "$(dirname "$0")/../branding/zero/"* browser/branding/zero/

echo "HAZIR. Sonraki adim: ./scripts/build.sh (ayni klasorden degil, firefox-esr icinden ./mach build)"
