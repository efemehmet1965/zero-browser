#!/usr/bin/env python3
"""ZERO XPI paketleyici — forward-slash garantili.

Kullanim: make-xpi.py <extension-kaynak-dir> <cikti.xpi>

Neden var: PowerShell Compress-Archive zip girdilerini ters slash ile yazar
(`dist\\index.html`). Firefox override sayfasini (`dist/index.html`) bulamaz,
eklenti aktif olsa bile about:newtab stock'a duser. Bu betik posix ayiraci
kullanir ve CI'da dogrular.
"""
import json
import sys
import zipfile
from pathlib import Path


def main() -> None:
    src = Path(sys.argv[1])
    out = Path(sys.argv[2])
    man_path = src / "manifest.json"
    assert man_path.is_file(), f"manifest yok: {man_path}"
    man = json.loads(man_path.read_text(encoding="utf-8"))
    gid = man.get("browser_specific_settings", {}).get("gecko", {}).get("id", "")
    assert gid, "manifest'te gecko id yok"
    assert out.name == gid + ".xpi", f"id/dosya uyusmazligi: {gid} vs {out.name}"
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted(src.rglob("*")):
            if f.is_file():
                z.write(f, f.relative_to(src).as_posix())
    with zipfile.ZipFile(out) as z:
        names = z.namelist()
        bad = [n for n in names if "\\" in n]
        assert not bad, f"ters slash var: {bad[:5]}"
        assert "manifest.json" in names, "manifest xpi kokunde yok"
        nt = man.get("chrome_url_overrides", {}).get("newtab", "")
        if nt:
            assert nt in names, f"override hedefi xpi'de yok: {nt}"
    print(f"XPI OK: {out} ({len(names)} dosya)")


if __name__ == "__main__":
    main()
