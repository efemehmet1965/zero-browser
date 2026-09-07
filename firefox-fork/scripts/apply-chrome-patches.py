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

Kullanim: apply-chrome-patches.py "<workspace>"
Idempotent: ekler zaten varsa tekrar eklemez.
Anchor bulunamazsa aday satirlari doker ve exit 1 (fail-fast).
"""
import pathlib
import re
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

    # 3. browser/base/jar.mn
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

    print("GOVDE YAMALARI OK")


if __name__ == "__main__":
    main()
