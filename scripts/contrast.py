# -*- coding: utf-8 -*-
"""Masoara contrastul real dintr-un screenshot, pe zone date.
Fundalul se ia ca MODUL luminantei de pe partea opusa textului, nu ca percentila:
percentila prinde marginile antialiasate ale literelor si da rezultate false."""
import sys, collections
from PIL import Image


def lum(px):
    def f(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = px
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def raport(a, b):
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def masoara(im, box, lum_text, inset=0):
    x0, y0, x1, y1 = box
    reg = im.crop((x0 + inset, y0 + inset, x1 - inset, y1 - inset))
    pixeli = list(reg.getdata())
    deschis = lum_text > 0.5
    fundal = [lum(p) for p in pixeli if (lum(p) < 0.45) == deschis]
    if not fundal:
        return None
    grup = collections.Counter(round(l, 2) for l in fundal)
    dominant = grup.most_common(1)[0][0]
    return raport(lum_text, dominant), dominant


if __name__ == '__main__':
    CREM = lum((0xF7, 0xF4, 0xF0))
    INK = lum((0x18, 0x16, 0x13))
    im = Image.open(sys.argv[1]).convert('RGB')
    zone = [
        ('H1 hero (60px, text mare)', (44, 507, 611, 636), CREM, 3.0, 0),
        ('Paragraf hero (16px)', (44, 656, 557, 709), CREM, 4.5, 0),
        ('Buton plin, ink pe crem', (44, 741, 193, 795), INK, 4.5, 14),
        ('Buton contur, crem pe foto', (205, 741, 382, 795), CREM, 4.5, 14),
    ]
    for nume, box, tl, prag, ins in zone:
        r = masoara(im, box, tl, ins)
        if r is None:
            print(f'{nume:30} nu am putut separa fundalul')
            continue
        c, fundal = r
        print(f'{nume:30} fundal {fundal:.2f}  contrast {c:5.2f}  prag {prag}  '
              f"{'TRECE' if c >= prag else 'PICA'}")
