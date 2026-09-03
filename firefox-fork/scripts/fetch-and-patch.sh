#!/usr/bin/env bash
# ZERO cekirdek MVP - adim 1: kaynagi cek + yamalari uygula.
# Ubuntu 22.04'te calistir. Firefox derlemez, sadece hazirlik.
set -euo pipefail

# Script firefox-esr icine cd yaptigi icin repo yolunu EN BASTA mutlakla
FORKDIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"

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
PATCHDIR="$FORKDIR/patches"
for p in "$PATCHDIR"/*.patch; do
  [ -f "$p" ] || continue
  # Henüz gerçek patch yoksa (taslak/doküman dosyası) sessizce geç
  if ! grep -q '^diff --git\|^--- ' "$p" 2>/dev/null; then
    echo ">> atlaniyor (taslak): $(basename "$p")"
    continue
  fi
  echo ">> uygulaniyor: $(basename "$p")"
  hg import --no-commit "$p" || patch -p1 < "$p"
done

# mozconfig + branding + newtab build'i kopyala
cp "$FORKDIR/mozconfig" .mozconfig
mkdir -p browser/branding/zero
cp -r "$FORKDIR/branding/zero/"* browser/branding/zero/

echo "HAZIR. Sonraki adim: ./scripts/build.sh (ayni klasorden degil, firefox-esr icinden ./mach build)"
