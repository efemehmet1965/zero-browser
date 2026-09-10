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
pref("browser.startup.homepage", "about:newtab");
pref("browser.newtabpage.enabled", true);
pref("zero.newtab.url", "about:newtab");
pref("browser.pocket.enabled", false);
pref("datareporting.healthreport.uploadEnabled", false);
pref("app.shield.optoutstudies.enabled", false);
pref("xpinstall.signatures.required", false);
pref("ui.systemUsesDarkTheme", 1);
// ZERO gizlilik durusu: eve telefon acan kanallar kapali.
// (Guvenlik kapatilmaz: safebrowsing ve guncelleme URL'lerine dokunulmaz.)
pref("app.normandy.enabled", false);
pref("browser.crashReports.unsubmittedCheck.enabled", false);
pref("breakpad.reportURL", "");
pref("browser.newtabpage.activity-stream.showSponsored", false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
pref("browser.urlbar.suggest.quicksuggest.sponsored", false);
pref("extensions.htmlaboutaddons.recommendations.enabled", false);
pref("browser.discovery.enabled", false);
pref("datareporting.policy.dataSubmissionEnabled", false);
pref("network.prefetch-next", false);
pref("zero.mode.active", "standard");
pref("zero.tabs.position", "left");
pref("zero.tabs.width", "narrow");
pref("zero.tabs.hover", true);
EOF
fi

echo "== redirector yamasi (kaynak) =="
RED_FILE=$(find "$ESR/browser" "$ESR/toolkit" -name AboutNewTabRedirector.sys.mjs 2>/dev/null | head -n 1)
test -n "$RED_FILE" || { echo "HATA: redirector dosyasi agacta yok"; exit 1; }
grep -q "zero-newtab/index.html" "$RED_FILE" || { echo "HATA: redirector ZERO yamasi uygulanmamis ($RED_FILE)"; exit 1; }
echo "redirector yamasi OK ($RED_FILE)"

echo "== gizlilik prefs (kaynak) =="
for key in app.normandy.enabled breakpad.reportURL quicksuggest.sponsored browser.discovery.enabled network.prefetch-next; do
  grep -qF "$key" "$ESR/browser/app/profile/firefox.js" || { echo "HATA: gizlilik pref eksik: $key"; exit 1; }
done
echo "gizlilik prefs OK"

echo "== bootstrap + build + package =="
cd "$ESR"
# NOT: ESR128 bootstrap --no-interactive kabul etmez; stdin kapali calisir.
./mach bootstrap --application-choice browser < /dev/null
./mach build || ./mach build
test -f obj-zero/dist/bin/zero.exe || test -f obj-zero/dist/bin/firefox.exe || { echo "HATA: zero.exe/firefox.exe uretilmedi"; exit 1; }
./mach package
echo "== system addon dogrulama (omni.ja) =="
python3 -c "import glob,zipfile; cs=glob.glob('obj-zero/dist/**/omni.ja', recursive=True); print('omni:',cs); assert cs,'omni.ja bulunamadi'; names=[n for c in cs for n in zipfile.ZipFile(c).namelist()]; req=['builtin-addons/zero-newtab/dist/index.html','zero-newtab/index.html','ZeroMode.sys.mjs','ZeroChrome.sys.mjs','ZeroPrefs.sys.mjs','zero-chrome.js','zero-chrome.css']; [print(r,'->',bool([n for n in names if r in n])) or __import__('sys').exit(f'pakette yok: '+r) for r in req if not [n for n in names if r in n]]; print('omni dogrulama OK')"
echo "BUILD OK"
