/* ZERO native chrome betigi — browser.xhtml icinde chrome yetkisiyle calisir.
 * Aktif sekme newtab ise pencere kokune zero-newtab="true" koyar;
 * zero-chrome.css buna bakarak native bar'i gizler.
 * (userChrome'daki ayni kural yedek katmandir.)
 */
(function () {
  const NEWTAB = new Set(['about:newtab', 'about:home', 'about:blank']);

  function isZeroNewtab(url) {
    if (!url) {
      return false;
    }
    if (NEWTAB.has(url)) {
      return true;
    }
    return url.includes('zero-newtab') && url.includes('dist/index.html');
  }

  function sync() {
    try {
      const url = window.gBrowser && window.gBrowser.currentURI
        ? window.gBrowser.currentURI.spec
        : '';
      const root = document.documentElement;
      if (isZeroNewtab(url)) {
        root.setAttribute('zero-newtab', 'true');
      } else {
        root.removeAttribute('zero-newtab');
      }
    } catch (e) {
      /* erken yukleme — yoksay */
    }
  }

  function hook() {
    try {
      if (!window.gBrowser) {
        window.setTimeout(hook, 500);
        return;
      }
      sync();
      window.gBrowser.tabContainer.addEventListener('TabSelect', sync);
      window.gBrowser.addTabsProgressListener({
        onLocationChange(aBrowser) {
          if (aBrowser === window.gBrowser.selectedBrowser) {
            sync();
          }
        },
      });
    } catch (e) {
      /* yoksay */
    }
  }

  if (document.readyState === 'complete') {
    hook();
  } else {
    window.addEventListener('load', hook, { once: true });
  }
})();
