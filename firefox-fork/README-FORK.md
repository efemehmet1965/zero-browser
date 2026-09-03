# ZERO — Phase 2: real firefox-esr fork plan (STUB, post-demo)

> MVP demo does NOT need this. It runs on stock Firefox via
> `chrome/` + `extension/` + `newtab/dist`. This doc lets 4 devs
> parallelize the real fork right after the demo.

## 0. Goal

Promote the MVP (userChrome + WebExtension + React newtab) into a true
`firefox-esr` fork: `zero://newtab` as a real protocol, the React build as a
system addon, ZERO branding, privacy defaults.

## 1. Fork layout

```text
firefox-esr/                      # upstream checkout (mozilla-esr branch)
  browser/branding/zero/          # <- copy firefox-fork/branding/zero/* here
  browser/extensions/zero-newtab/ # <- copy extension/ + newtab/dist here
  obj-zero/                       # build output (see mozconfig)
```

Copy map:

| This repo | Fork destination |
|---|---|
| `firefox-fork/mozconfig` | `<esr>/.mozconfig` |
| `firefox-fork/branding/zero/zero-prefs.js` | `<esr>/browser/branding/zero/` + `defaults/pref/zero.js` |
| `firefox-fork/branding/zero/policies.json` | `<esr>/browser/branding/zero/` (distribution) |
| `chrome/userChrome.css` | baked into `browser/themes/zero/` (or keep as profile chrome during transition) |
| `extension/` + `newtab/dist/` | `<esr>/browser/extensions/zero-newtab/` as a system addon |

## 2. Register the `zero://` protocol

MVP spoofs it via `history.replaceState('/zero://newtab')`. Real one needs:

1. `AboutNewTab`-style about page:
   - Add `about:zero` / `zero://newtab` module mirroring
     `browser/components/newtab/AboutNewTab.jsm`.
   - Point its document URI at the bundled React `dist/index.html`.
2. `nsIProtocolHandler`:
   - Implement a `zero://` handler (see `netwerk/protocol/about/` as a
     template) that resolves `zero://newtab` → the about page, and
     `zero://workspace/*` → workspace views.
   - Register the contract ID + scheme in `components.conf`.
3. Prefs: set `browser.startup.homepage` + `zero.newtab.url`
   (see `branding/zero/zero-prefs.js`).

Dev A owns the protocol handler; Dev B owns AboutNewTab wiring.

## 3. System addon (newtab UI)

- Copy the built `newtab/dist/` + `extension/manifest.json` into
  `browser/extensions/zero-newtab/`.
- List it in `browser/extensions/moz.build` as a system addon so it ships
  without `about:debugging` sideloading.
- Storage schema stays identical (`workspaces`, `shortcuts`) — `background.js`
  already uses `browser.storage.local`, which survives the move.

## 4. Branding

- Add `browser/branding/zero/` (logo, `configure.sh` brand option,
  `policies.json`, `zero-prefs.js`).
- Build with `ac_add_options --with-branding=browser/branding/zero`.
- Replace `logo.svg` placeholders with final red-cut ZERO mark.

## 5. Build & verify

```sh
cp firefox-fork/mozconfig /path/to/firefox-esr/.mozconfig
cd /path/to/firefox-esr && ./mach build
./mach run --profile /tmp/zero-profile
```

Acceptance: `zero://newtab` loads without spoofing, tabs/sidebar match the
screenshot via compiled theme (no userChrome needed), search/shortcuts/
workspaces persist.

## 6. Who does what (4 devs)

1. Protocol handler (`zero://`) + AboutNewTab.
2. System-addon packaging + storage migration.
3. Theme uplift (userChrome → compiled `browser/themes/zero/`).
4. Branding + prefs + policies + CI build.
