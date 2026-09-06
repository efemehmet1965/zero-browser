// ZeroChrome.sys.mjs - Zen-tarzı layout yonetimi.
// Newtab aktifken ana pencereye zero-newtab="true" koyar,
// userChrome.css native nav-bar'ı gizler. Normal sayfada kaldırır.
// Konum (fork): browser/zero/ZeroChrome.sys.mjs
// Yukleme: BrowserGlue veya autoconfig'ten importESModule ile bir kez init edilir.

const NEWTAB_URLS = new Set(["about:newtab", "about:home", "about:blank"]);

function isZeroNewtab(url) {
  if (!url) return false;
  if (NEWTAB_URLS.has(url)) return true;
  if (url.includes("zero-newtab") && url.includes("dist/index.html")) return true;
  if (url.includes("moz-extension://") && url.includes("dist/index.html")) return true;
  return false;
}

function updateWindow(win) {
  try {
    if (!win || !win.gBrowser || !win.document) return;
    const url = win.gBrowser.currentURI?.spec || "";
    const root = win.document.documentElement;
    if (isZeroNewtab(url)) root.setAttribute("zero-newtab", "true");
    else root.removeAttribute("zero-newtab");
  } catch {}
}

export function initZeroChrome(win) {
  try {
    updateWindow(win);
    win.gBrowser?.tabContainer?.addEventListener("TabSelect", () => updateWindow(win));
    win.gBrowser?.addTabsProgressListener({
      onLocationChange(aBrowser) {
        if (aBrowser === win.gBrowser.selectedBrowser) updateWindow(win);
      },
    });
  } catch {}
}

export const ZeroChrome = { init: initZeroChrome, isZeroNewtab };
