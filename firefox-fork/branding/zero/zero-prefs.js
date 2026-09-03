// ZERO branding prefs — applied in Phase 2 when we fork firefox-esr.
// Maps to browser/branding/zero/ + defaults/pref/zero.js in the fork.
// MVP demo ignores this file; it exists so 4 devs can parallelize now.

// Identity
pref("app.vendorURL", "https://example.com/zero");
pref("browser.startup.homepage", "zero://newtab");
pref("browser.newtabpage.enabled", true);

// Point AboutNewTab at our React build (bundled as a system addon in Phase 2)
pref("browser.newtabpage.activity-stream.enabled", false);
pref("zero.newtab.url", "zero://newtab");

// Privacy posture: ZERO. Just the web.
pref("privacy.trackingprotection.enabled", true);
pref("browser.search.defaultenginename", "DuckDuckGo");

// Allow legacy userChrome during the hybrid period
pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
