#!/usr/bin/env bash
# ZERO Windows CI derleme betigi — MozillaBuild bash icinde calisir.
# Kullanim: ci-windows-build.sh "<workspace>"
#   workspace ornegi: D:/a/zero-browser/zero-browser (msys D:/ yolunu anlar)
set -euo pipefail

WS="$1"
ESR="$WS/firefox-esr"
ZERO="$WS/zero"

echo "== mozconfig =="
cp "$ZERO/firefox-fork/mozconfig-windows" "$ESR/.mozconfig"

echo "== branding (official -> zero) =="
test -f "$ESR/browser/branding/official/brand.properties" || { echo "HATA: official branding yok"; ls "$ESR/browser/branding"; exit 1; }
rm -rf "$ESR/browser/branding/zero"
mkdir -p "$ESR/browser/branding/zero"
cp "$ESR/browser/branding/official/"* "$ESR/browser/branding/zero/"
sed -i 's/Firefox/ZERO/g' "$ESR/browser/branding/zero/brand.properties" "$ESR/browser/branding/zero/brand.dtd" "$ESR/browser/branding/zero/brand.ftl"
grep -q ZERO "$ESR/browser/branding/zero/brand.properties"

echo "== prefs =="
if ! grep -q "ZERO defaults" "$ESR/browser/app/profile/firefox.js"; then
cat >> "$ESR/browser/app/profile/firefox.js" <<'EOF'
// ZERO defaults (MVP)
pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
pref("browser.pocket.enabled", false);
pref("datareporting.healthreport.uploadEnabled", false);
pref("app.shield.optoutstudies.enabled", false);
pref("xpinstall.signatures.required", false);
EOF
fi

echo "== bootstrap + build + package =="
cd "$ESR"
./mach bootstrap --no-interactive --application-choice browser
./mach build
test -f obj-zero/dist/bin/firefox.exe || { echo "HATA: firefox.exe uretilmedi"; exit 1; }
./mach package
echo "BUILD OK"
