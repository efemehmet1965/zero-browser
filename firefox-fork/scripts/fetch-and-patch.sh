#!/usr/bin/env bash
# ZERO cekirdek MVP - adim 1: kaynagi cek + yamalari uygula.
# Ubuntu 22.04'te calistir. Firefox derlemez, sadece hazirlik.
set -euo pipefail

# Script firefox-esr icine cd yaptigi icin repo yolunu EN BASTA mutlakla
FORKDIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"

ESR=140
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

# mozconfig + branding kopyala
cp "$FORKDIR/mozconfig" .mozconfig
rm -rf browser/branding/zero
cp -r browser/branding/official browser/branding/zero
sed -i 's/Firefox/ZERO/g' browser/branding/zero/locales/en-US/brand.ftl browser/branding/zero/locales/en-US/brand.properties 2>/dev/null || true
cp "$FORKDIR/branding/zero/configure.sh" browser/branding/zero/configure.sh 2>/dev/null || true

# React newtab'i derle (VDS'te node gerekir)
if [ ! -f "$FORKDIR/../newtab/dist/index.html" ]; then
  (cd "$FORKDIR/../newtab" && npm install --no-audit --no-fund && npm run build)
fi

# System addon iskeleti (CI ile ayni kalip)
SA="browser/extensions/zero-newtab"
rm -rf "$SA"
mkdir -p "$SA/extension"
cp "$FORKDIR/../extension/manifest.json" "$FORKDIR/../extension/background.js" "$FORKDIR/../extension/newtab-override.js" "$SA/extension/"
cp -r "$FORKDIR/../newtab/dist" "$SA/extension/dist"
cp "$FORKDIR/system-addon/zero-newtab/moz.build" "$FORKDIR/system-addon/zero-newtab/jar.mn" "$SA/"
grep -q '"zero-newtab"' browser/extensions/moz.build || \
  sed -i 's/^    "newtab",$/    "newtab",\n    "zero-newtab",/' browser/extensions/moz.build
grep -q '"zero-newtab"' browser/extensions/moz.build
test -f "$SA/extension/dist/index.html"

# ZERO platform modulu (browser/zero) + derleme kancasi
rm -rf browser/zero
mkdir -p browser/zero
cp "$FORKDIR"/src/browser/zero/*.sys.mjs browser/zero/
cp "$FORKDIR/src/browser/zero/moz.build" browser/zero/
grep -q '"zero"' browser/moz.build || echo 'DIRS += ["zero"]' >> browser/moz.build

# ZERO varsayilan ayarlari (tek seferlik, tekrar calistirmaya dayanikli)
for pref in \
  'pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);' \
  'pref("browser.pocket.enabled", false);' \
  'pref("datareporting.healthreport.uploadEnabled", false);' \
  'pref("app.shield.optoutstudies.enabled", false);' \
  'pref("xpinstall.signatures.required", false);' \
  'pref("zero.mode.active", "standard");' \
  'pref("zero.tabs.position", "left");' \
  'pref("zero.tabs.width", "narrow");' \
  'pref("zero.tabs.hover", true);' \
; do
  key=$(echo "$pref" | sed 's/pref("//; s/",.*//')
  grep -qF "$key" browser/app/profile/firefox.js || echo "$pref // ZERO" >> browser/app/profile/firefox.js
done

echo "HAZIR. Sonraki adim: cd ~/zero-build/firefox-esr && ./mach bootstrap --application-choice browser && ./mach build"
