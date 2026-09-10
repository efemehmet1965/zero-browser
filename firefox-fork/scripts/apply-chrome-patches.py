#!/usr/bin/env python3
"""ZERO govde yamalari — anchor bazli, surum toleransli XUL/jar duzenleme.

Ne yapar (firefox-esr agaci icinde):
  1. chrome/userChrome.css -> firefox-esr/browser/base/content/zero-chrome.css
     firefox-fork/chrome/zero-chrome.js ->
     firefox-esr/browser/base/content/zero-chrome.js
  2. browser/base/content/browser.xhtml:
     - <head> icine zero-chrome.css <link> ekler (skin linkinden sonra,
       tek-satir degilse <title> oncesine)
     - </head> oncesine zero-chrome.js <script> ekler
  3. browser/base/jar.mn: son `content/browser/...` satirindan sonra
     2 girdi ekler (browser.jar blogu icinde kalir)
  4. ZERO newtab bake: newtab/dist/* ->
     firefox-esr/browser/base/content/zero-newtab/* + jar.mn girdileri
     (chrome://browser/content/zero-newtab/index.html olarak paketlenir)
  5. Redirector yamasi: AboutNewTabRedirector.sys.mjs base `defaultURL`
     ZERO sayfasina doner. Boylece yazilan URL, homepage, first-run ve
     yeni sekmelerin tamami eklenti override yarisina girmeden ZERO acar.
     (Eklenti override'i yedek olarak kalir; ayni UI, iki URL.)

Kullanim: apply-chrome-patches.py "<workspace>"
Idempotent: ekler zaten varsa tekrar eklemez.
Anchor bulunamazsa aday satirlari doker ve exit 1 (fail-fast).

ONEMLI: adim 4 newtab/dist ister. Workflow'da Node kur + newtab derleme
BU betikten ONCE kosmalidir.
"""
import pathlib
import re
import shutil
import sys

WS = pathlib.Path(sys.argv[1])
ESR = WS / "firefox-esr"
ZERO = WS / "zero"

CONTENT = ESR / "browser" / "base" / "content"
XHTML = CONTENT / "browser.xhtml"
JAR = ESR / "browser" / "base" / "jar.mn"

CSS_LINK = '  <link rel="stylesheet" href="chrome://browser/content/zero-chrome.css" />'
JS_TAG = '  <script src="chrome://browser/content/zero-chrome.js"></script>'
JAR_LINES = [
    "        content/browser/zero-chrome.css               (content/zero-chrome.css)",
    "        content/browser/zero-chrome.js                (content/zero-chrome.js)",
]

ZERO_NEWTAB_URL = "chrome://browser/content/zero-newtab/index.html"
ZERO_NEWTAB_DIR = CONTENT / "zero-newtab"
DIST = ZERO / "newtab" / "dist"

REDIRECTOR_CANDIDATES = [
    ESR / "browser" / "components" / "newtab" / "lib" / "AboutNewTabRedirector.sys.mjs",
    ESR / "browser" / "extensions" / "newtab" / "lib" / "AboutNewTabRedirector.sys.mjs",
]


def fail(msg, path=None, hints=()):
    print(f"HATA: {msg}")
    if path is not None:
        print(f"--- {path} aday satirlar ---")
        for h in hints:
            print("   ", h.rstrip())
    sys.exit(1)


def main():
    # 1. dosyalar — TEK KAYNAK: chrome/userChrome.css + fork zero-chrome.js
    sources = {
        "zero-chrome.css": ZERO / "chrome" / "userChrome.css",
        "zero-chrome.js": ZERO / "firefox-fork" / "chrome" / "zero-chrome.js",
    }
    for name, src in sources.items():
        if not src.is_file():
            fail(f"kaynak yok: {src}")
        dst = CONTENT / name
        dst.write_bytes(src.read_bytes())
        print(f"kopyalandi: {name} <- {src.relative_to(ZERO)}")

    # 2. browser.xhtml
    if not XHTML.is_file():
        fail(f"browser.xhtml yok: {XHTML}")
    x = XHTML.read_text(encoding="utf-8")
    if "zero-chrome.css" not in x:
        skin = re.search(r"^.*chrome://browser/skin/.*/>.*$", x, re.M)
        if skin:
            x = x[: skin.end()] + "\n" + CSS_LINK + x[skin.end():]
            print("xhtml: css eklendi (skin sonrasi)")
        else:
            title = re.search(r"^.*<title.*$", x, re.M)
            if not title:
                cands = [ln for ln in x.splitlines() if "<link" in ln or "<title" in ln][:15]
                fail("css anchor bulunamadi (skin linki ve <title> yok)", XHTML, cands)
            x = x[: title.start()] + CSS_LINK + "\n" + x[title.start():]
            print("xhtml: css eklendi (<title> oncesi)")
    else:
        print("xhtml: css zaten var")
    if "zero-chrome.js" not in x:
        head = re.search(r"^.*</head>.*$", x, re.M)
        if not head:
            cands = [ln for ln in x.splitlines() if "<script" in ln or "head" in ln][:15]
            fail("js anchor bulunamadi (</head> yok)", XHTML, cands)
        x = x[: head.start()] + JS_TAG + "\n" + x[head.start():]
        print("xhtml: js eklendi (</head> oncesi)")
    else:
        print("xhtml: js zaten var")
    XHTML.write_text(x, encoding="utf-8")

    # 3. browser/base/jar.mn (zero-chrome girdileri)
    if not JAR.is_file():
        fail(f"jar.mn yok: {JAR}")
    j = JAR.read_text(encoding="utf-8")
    if "zero-chrome.css" not in j:
        matches = list(re.finditer(r"^\s*\*?\s*content/browser/\S+.*$", j, re.M))
        if not matches:
            cands = [ln for ln in j.splitlines() if ln.startswith("content/")][:10]
            fail("jar.mn content anchor bulunamadi", JAR, cands)
        last = matches[-1]
        j = j[: last.end()] + "\n" + "\n".join(JAR_LINES) + j[last.end():]
        print("jar.mn: girdiler eklendi")
    else:
        print("jar.mn: girdiler zaten var")
    JAR.write_text(j, encoding="utf-8")

    # 4. ZERO newtab bake (dist -> content/zero-newtab + jar.mn)
    if not (DIST / "index.html").is_file():
        fail(
            f"newtab dist yok: {DIST}/index.html "
            "(workflow: newtab derleme BU adimdan once kosmali)"
        )
    if ZERO_NEWTAB_DIR.exists():
        shutil.rmtree(ZERO_NEWTAB_DIR)
    shutil.copytree(DIST, ZERO_NEWTAB_DIR)
    baked = sorted(
        p.relative_to(ZERO_NEWTAB_DIR).as_posix()
        for p in ZERO_NEWTAB_DIR.rglob("*")
        if p.is_file()
    )
    print(f"baked: {len(baked)} dosya -> content/zero-newtab/")
    j = JAR.read_text(encoding="utf-8")
    missing = [r for r in baked if f"content/browser/zero-newtab/{r}" not in j]
    if missing:
        anchor = None
        for m in re.finditer(r"^\s*\*?\s*content/browser/\S+.*$", j, re.M):
            anchor = m
        if anchor is None:
            fail("jar.mn newtab anchor bulunamadi", JAR)
        add = [
            f"        content/browser/zero-newtab/{r}               (content/zero-newtab/{r})"
            for r in missing
        ]
        j = j[: anchor.end()] + "\n" + "\n".join(add) + j[anchor.end():]
        JAR.write_text(j, encoding="utf-8")
        print(f"jar.mn: {len(add)} newtab girdisi eklendi")
    else:
        print("jar.mn: newtab girdileri zaten var")

    # 5. Redirector yamasi: defaultURL -> ZERO sayfasi
    red = next((p for p in REDIRECTOR_CANDIDATES if p.is_file()), None)
    if red is None:
        tried = "\n".join(f"   {p.relative_to(ESR)}" for p in REDIRECTOR_CANDIDATES)
        fail(f"redirector bulunamadi, denenenler:\n{tried}")
    t = red.read_text(encoding="utf-8")
    if ZERO_NEWTAB_URL in t:
        print("redirector: ZERO default zaten var")
    else:
        m_get = re.search(r"get defaultURL\(\) \{", t)
        if not m_get:
            cands = [ln for ln in t.splitlines() if "defaultURL" in ln][:10]
            fail("redirector anchor yok (get defaultURL)", red, cands)
        m_ret = re.search(r"return \[", t[m_get.end():])
        if not m_ret:
            fail("redirector anchor yok (return [)", red)
        ret_start = m_get.end() + m_ret.start()
        m_end = re.search(r'\]\.join\(""\);', t[ret_start:])
        if not m_end:
            cands = t[ret_start:ret_start + 600].splitlines()[:12]
            fail("redirector anchor yok (].join)", red, cands)
        ret_end = ret_start + m_end.end()
        patched = (
            "    // ZERO: about:newtab + about:home varsayilani gomulu ZERO sayfasi.\n"
            "    // (Eklenti override yarisina girmez — her profil, her acilista ZERO.)\n"
            f'    return "{ZERO_NEWTAB_URL}";'
        )
        t = t[:ret_start] + patched + t[ret_end:]
        red.write_text(t, encoding="utf-8")
        print(f"redirector: defaultURL yamandi ({red.relative_to(ESR)})")

    print("GOVDE YAMALARI OK")


if __name__ == "__main__":
    main()
