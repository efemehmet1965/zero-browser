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

echo "== branding kontrol (PowerShell adiminda hazirlanir) =="
test -d "$ESR/browser/branding/zero" || { echo "HATA: zero branding yok"; exit 1; }
grep -rq ZERO "$ESR/browser/branding/zero/locales/en-US/brand.properties" 2>/dev/null || echo "uyari: brand.properties ZERO icermiyor (devam)"

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
# NOT: ESR128 bootstrap --no-interactive kabul etmez; stdin kapali calisir.
./mach bootstrap --application-choice browser < /dev/null
./mach build
test -f obj-zero/dist/bin/zero.exe || test -f obj-zero/dist/bin/firefox.exe || { echo "HATA: zero.exe/firefox.exe uretilmedi"; exit 1; }
./mach package
echo "== system addon dogrulama (omni.ja) =="
python3 -c "import glob,zipfile; cs=glob.glob('obj-zero/dist/**/omni.ja', recursive=True); print('omni:',cs); assert cs,'omni.ja bulunamadi'; hit=[(c,n) for c in cs for n in zipfile.ZipFile(c).namelist() if 'builtin-addons/zero-newtab/dist/index.html' in n]; assert hit,f'system addon pakette yok'; print('system addon OK:',hit[0])"
echo "BUILD OK"
