// newtab-override.js — content script injected into dist/index.html.
// Runs alongside the React bundle. Handles the `zero://newtab` address-bar
// spoof for the MVP demo (real protocol handler ships in Phase 2).
(function () {
  try {
    window.history.replaceState(null, '', '#zero://newtab');
  } catch (e) {
    /* non-fatal on moz-extension:// */
  }
  document.title = 'New Tab — ZERO';
})();
