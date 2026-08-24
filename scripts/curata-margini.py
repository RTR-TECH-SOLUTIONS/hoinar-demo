# -*- coding: utf-8 -*-
"""Decupeaza marginile de pelicula (benzi negre cu perforatii, gutiere albe)
pe care Soul 2.0 le deseneaza cand promptul mentioneaza film.
Scaneaza dinspre fiecare margine spre interior si taie randurile/coloanele
care sunt fie foarte inchise, fie aproape pur albe, fie foarte contrastante."""
import sys, os
from PIL import Image, ImageStat

DARK = 72        # sub asta = banda de pelicula
BRIGHT = 248     # peste asta = gutiera alba
MAX_TAIE = 0.22  # nu taia mai mult de 22% dintr-o latura


def linie_de_margine(im, orizontal, idx):
    if orizontal:
        band = im.crop((0, idx, im.width, idx + 1))
    else:
        band = im.crop((idx, 0, idx + 1, im.height))
    st = ImageStat.Stat(band.convert("L"))
    medie = st.mean[0]
    dev = st.stddev[0]
    # banda de pelicula: intunecata, sau alba curata, sau intunecata cu perforatii (dev mare)
    return medie < DARK or medie > BRIGHT or (medie < 110 and dev > 70)


def taie(cale, out):
    im = Image.open(cale).convert("RGB")
    w, h = im.size
    st_, dr_, sus, jos = 0, w, 0, h

    lim_x, lim_y = int(w * MAX_TAIE), int(h * MAX_TAIE)
    while st_ < lim_x and linie_de_margine(im, False, st_):
        st_ += 1
    while dr_ > w - lim_x and linie_de_margine(im, False, dr_ - 1):
        dr_ -= 1
    while sus < lim_y and linie_de_margine(im, True, sus):
        sus += 1
    while jos > h - lim_y and linie_de_margine(im, True, jos - 1):
        jos -= 1

    # margine de siguranta, ca sa nu ramana o dunga de 2px
    pad = 6
    st_, sus = min(st_ + pad, w // 3), min(sus + pad, h // 3)
    dr_, jos = max(dr_ - pad, 2 * w // 3), max(jos - pad, 2 * h // 3)

    dec = im.crop((st_, sus, dr_, jos))
    dec.save(out, quality=95)
    return (w, h), dec.size


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if not f.lower().endswith((".png", ".jpg", ".jpeg")):
            continue
        a, b = taie(os.path.join(src, f), os.path.join(dst, os.path.splitext(f)[0] + ".jpg"))
        marcaj = "  TAIAT" if a != b else ""
        print(f"{f:<28} {a[0]}x{a[1]} -> {b[0]}x{b[1]}{marcaj}")
