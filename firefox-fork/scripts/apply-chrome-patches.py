#!/usr/bin/env python3
"""ZERO govde yamalari — anchor bazli, surum toleransli XUL/jar duzenleme.

Ne yapar (firefox-esr agaci icinde):
  1. firefox-fork/chrome/zero-chrome.{css,js} ->
     firefox-esr/browser/base/content/zero-chrome.{css,js}
  2. browser/base/content/browser.xhtml:
     - browser.css PI satirindan sonra zero-chrome.css PI ekler
     - browser.js script satirindan sonra zero-chrome.js ekler
  3. browser/base/content/jar.mn:
     - son `content/browser/...` satirindan sonra 2 girdi ekler

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

XHTML = ESR / "browser" / "base" / "content" / "browser.xhtml"
JAR = ESR / "browser" / "base" / "content" / "jar.mn"

CSS_PI = '<?xml-stylesheet href="chrome://browser/content/zero-chrome.css" type="text/css"?>'
JS_TAG = '<script src="chrome://browser/content/zero-chrome.js"/>'
JAR_LINES = [
    "content/browser/zero-chrome.css              (zero-chrome.css)",
    "content/browser/zero-chrome.js               (zero-chrome.js)",
]


def fail(msg, path=None, hints=()):
    print(f"HATA: {msg}")
    if path is not None:
        print(f"--- {path} aday satirlar ---")
        for h in hints:
            print("   ", h.rstrip())
    sys.exit(1)


def main():
    # 1. dosyalar — TEK KAYNAK: chrome/userChrome.css (demo ile ayni dosya),
    # zero-chrome.js fork'tan. Ikisi de browser.xhtml'e gomulur.
    sources = {
        "zero-chrome.css": ZERO / "chrome" / "userChrome.css",
        "zero-chrome.js": ZERO / "firefox-fork" / "chrome" / "zero-chrome.js",
    }
    for name, src in sources.items():
        if not src.is_file():
            fail(f"kaynak yok: {src}")
        dst = ESR / "browser" / "base" / "content" / name
        dst.write_bytes(src.read_bytes())
        print(f"kopyalandi: {name} <- {src.relative_to(ZERO)}")

    # 2. browser.xhtml
    if not XHTML.is_file():
        fail(f"browser.xhtml yok: {XHTML}")
    x = XHTML.read_text(encoding="utf-8")
    if "zero-chrome.css" not in x:
        m = re.search(r"^.*xml-stylesheet.*browser/skin/browser\.css.*$", x, re.M)
        if not m:
            cands = [ln for ln in x.splitlines() if "xml-stylesheet" in ln][:10]
            fail("browser.css PI anchor bulunamadi", XHTML, cands)
        x = x[: m.end()] + "\n" + CSS_PI + x[m.end():]
        print("xhtml: css PI eklendi")
    else:
        print("xhtml: css PI zaten var")
    if "zero-chrome.js" not in x:
        m = re.search(r'^.*<script\s+src="chrome://browser/content/browser\.js".*$', x, re.M)
        if not m:
            cands = [ln for ln in x.splitlines() if "browser/content/browser.js" in ln][:10]
            if not cands:
                cands = [ln for ln in x.splitlines() if "<script" in ln][:15]
            fail("browser.js script anchor bulunamadi", XHTML, cands)
        x = x[: m.end()] + "\n" + JS_TAG + x[m.end():]
        print("xhtml: js eklendi")
    else:
        print("xhtml: js zaten var")
    XHTML.write_text(x, encoding="utf-8")

    # 3. jar.mn
    if not JAR.is_file():
        fail(f"jar.mn yok: {JAR}")
    j = JAR.read_text(encoding="utf-8")
    if "zero-chrome.css" not in j:
        matches = list(re.finditer(r"^content/browser/\S+.*$", j, re.M))
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
