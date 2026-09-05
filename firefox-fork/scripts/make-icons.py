#!/usr/bin/env python3
"""ZERO ikon seti ureteci — logo.svg'deki halkali Z markasinin raster hali.

Kullanim: python make-icons.py <browser/branding/zero dizini>
Cikti: default{16,32,48,64,128,256}.png + firefox.ico + firefox64.ico
Siyah zemin + beyaz halka + sagda kirmizi kesik (O harfinin kucuk hali).
"""
import os
import sys

from PIL import Image, ImageDraw

RED = (227, 6, 19, 255)
WHITE = (255, 255, 255, 255)
BLACK = (0, 0, 0, 255)


def mark(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=max(2, int(size * 0.18)), fill=BLACK)
    pad = int(size * 0.22)
    w = max(2, int(size * 0.11))
    box = [pad, pad, size - pad, size - pad]
    d.ellipse(box, outline=WHITE, width=w)
    # Kirmizi kesik: dogu yonunde +-15 derece (yon bagimsiz simetrik)
    d.arc(box, start=-15, end=15, fill=RED, width=w + max(1, int(size * 0.015)))
    return img


def main() -> None:
    outdir = sys.argv[1]
    for s in (16, 32, 48, 64, 128, 256):
        mark(s).save(os.path.join(outdir, f"default{s}.png"))
    big = mark(256)
    big.save(
        os.path.join(outdir, "firefox.ico"),
        sizes=[(16, 16), (32, 32), (48, 48), (128, 128), (256, 256)],
    )
    big.save(
        os.path.join(outdir, "firefox64.ico"),
        sizes=[(16, 16), (32, 32), (48, 48), (128, 128), (256, 256)],
    )
    print("ikonlar OK:", outdir)


if __name__ == "__main__":
    main()
