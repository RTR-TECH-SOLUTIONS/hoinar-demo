# -*- coding: utf-8 -*-
"""Generează src/data/colectii.json și src/data/produse.json.
Copy-ul e scris pe tip de produs si pe colectie, ca sa fie specific,
nu generic. Combinatia tip x colectie da 32 de produse."""
import json, io, os

COLECTII = [
    {
        "id": "carou-bruma",
        "nume": {"ro": "Carou Brumă", "en": "Frost Check"},
        "accent": "#8A6A45",
        "imagine": "/media/colectii/carou-bruma.jpg",
        "tesatura": {
            "ro": "Bumbac țesut în carouri camel și ciocolată, 320 g/mp.",
            "en": "Cotton woven in camel and chocolate check, 320 gsm.",
        },
        "descriere": {
            "ro": "Caroul care a pornit brandul. Firul e vopsit înainte de țesere, așa că modelul nu se decolorează la spălare, se estompează uniform.",
            "en": "The check the brand started with. The yarn is dyed before weaving, so the pattern does not bleach out in the wash, it fades evenly.",
        },
    },
    {
        "id": "buline-cacao",
        "nume": {"ro": "Buline Cacao", "en": "Cocoa Dot"},
        "accent": "#4A3728",
        "imagine": "/media/colectii/buline-cacao.jpg",
        "tesatura": {
            "ro": "Bumbac crem cu buline ciocolată imprimate cu pigment, 300 g/mp.",
            "en": "Cream cotton with pigment-printed chocolate dots, 300 gsm.",
        },
        "descriere": {
            "ro": "Buline de 6 mm, imprimate cu pigment pe bumbac spălat în prealabil. Bumbacul e prespălat, deci nu intră la apă după prima spălare.",
            "en": "Six-millimetre dots, pigment-printed on pre-washed cotton. The cotton is pre-shrunk, so it will not pull in after the first wash.",
        },
    },
    {
        "id": "dungi-sinaia",
        "nume": {"ro": "Dungi Sinaia", "en": "Sinaia Stripe"},
        "accent": "#A15C3A",
        "imagine": "/media/colectii/dungi-sinaia.jpg",
        "tesatura": {
            "ro": "Bumbac cu dungi teracotă și crem, țesute nu imprimate, 340 g/mp.",
            "en": "Cotton with terracotta and cream stripes, woven rather than printed, 340 gsm.",
        },
        "descriere": {
            "ro": "Dungile sunt țesute, nu imprimate, deci se văd la fel pe ambele fețe. Culoarea vine din pătura de munte, nu dintr-un catalog de tendințe.",
            "en": "The stripes are woven, not printed, so they read the same on both faces. The colour comes from a mountain blanket, not a trend deck.",
        },
    },
    {
        "id": "canepa-naturala",
        "nume": {"ro": "Cânepă Naturală", "en": "Natural Hemp"},
        "accent": "#9A8A6E",
        "imagine": "/media/colectii/canepa-naturala.jpg",
        "tesatura": {
            "ro": "Cânepă nevopsită cu bumbac, 380 g/mp, se înmoaie la fiecare spălare.",
            "en": "Undyed hemp with cotton, 380 gsm, softens with every wash.",
        },
        "descriere": {
            "ro": "Fără vopsea și fără imprimeu. Cânepa e aspră la început și se înmoaie după trei sau patru spălări, ca o cămașă bună de in.",
            "en": "No dye and no print. Hemp starts out coarse and softens after three or four washes, like a good linen shirt.",
        },
    },
]

TIPURI = [
    {
        "id": "ham",
        "nume": {"ro": "Ham reglabil", "en": "Adjustable Harness"},
        "pret": 189,
        "marimi": ["XS", "S", "M", "L", "XL"],
        "imagine": "/media/produse/ham.jpg",
        "descriere": {
            "ro": "Ham cu intrare pe cap, cu două puncte de reglaj și cataramă de siguranță. Chinga interioară e căptușită cu neopren de 4 mm, ca să nu frece la subraț. Inelul D e dublu și cusut în X pe patru rânduri.",
            "en": "Step-in harness with two adjustment points and a safety buckle. The inner webbing is lined with 4 mm neoprene so it will not chafe under the leg. The D-ring is doubled and cross-stitched over four rows.",
        },
        "caracteristici": {
            "ro": ["Două puncte de reglaj", "Căptușeală neopren 4 mm", "Inel D dublu, cusut în X", "Cataramă cu blocare", "Se spală la 30 de grade"],
            "en": ["Two adjustment points", "4 mm neoprene lining", "Double D-ring, cross-stitched", "Locking buckle", "Machine wash at 30 degrees"],
        },
    },
    {
        "id": "ham-explore",
        "nume": {"ro": "Ham Explore", "en": "Explore Harness"},
        "pret": 249,
        "marimi": ["S", "M", "L", "XL", "XXL"],
        "imagine": "/media/produse/ham-explore.jpg",
        "descriere": {
            "ro": "Ham pentru câini de talie mare, cu mâner de control cusut pe spate și trei puncte de reglaj. Inel frontal pentru dresaj, inel dorsal pentru plimbare. Chinga a fost testată la tracțiune până la 187 kg.",
            "en": "Harness for larger dogs, with a control handle stitched across the back and three adjustment points. Front ring for training, back ring for walking. The webbing was pull-tested to 187 kg.",
        },
        "caracteristici": {
            "ro": ["Mâner de control pe spate", "Trei puncte de reglaj", "Inel frontal și inel dorsal", "Chingă testată la 187 kg", "Bandă reflectorizantă pe tot conturul"],
            "en": ["Control handle across the back", "Three adjustment points", "Front and back rings", "Webbing pull-tested to 187 kg", "Reflective trim all round"],
        },
    },
    {
        "id": "lesa",
        "nume": {"ro": "Lesă", "en": "Lead"},
        "pret": 139,
        "marimi": ["120 cm", "180 cm"],
        "imagine": "/media/produse/lesa.jpg",
        "descriere": {
            "ro": "Lesă cu carabină din alamă masivă și mâner căptușit cu piele tăbăcită vegetal. Are un inel mobil pe chingă, pentru saci sau chei, ca să nu ții nimic în mână.",
            "en": "Lead with a solid brass trigger clip and a handle lined in vegetable-tanned leather. A floating ring on the webbing takes bags or keys, so your hands stay free.",
        },
        "caracteristici": {
            "ro": ["Carabină din alamă masivă", "Mâner căptușit cu piele", "Inel mobil pentru saci sau chei", "Cusătură întărită la ambele capete", "Se spală la 30 de grade"],
            "en": ["Solid brass trigger clip", "Leather-lined handle", "Floating ring for bags or keys", "Reinforced stitching at both ends", "Machine wash at 30 degrees"],
        },
    },
    {
        "id": "zgarda",
        "nume": {"ro": "Zgardă", "en": "Collar"},
        "pret": 119,
        "marimi": ["S", "M", "L"],
        "imagine": "/media/produse/zgarda.jpg",
        "descriere": {
            "ro": "Zgardă cu cataramă din alamă și inel D sudat, nu doar îndoit. Marginile sunt tivite dublu, ca să nu se destrame la spălare.",
            "en": "Collar with a brass buckle and a welded D-ring, not merely bent closed. The edges are double-hemmed so they will not fray in the wash.",
        },
        "caracteristici": {
            "ro": ["Cataramă din alamă", "Inel D sudat", "Margini tivite dublu", "Șapte găuri de reglaj", "Se spală la 30 de grade"],
            "en": ["Brass buckle", "Welded D-ring", "Double-hemmed edges", "Seven adjustment holes", "Machine wash at 30 degrees"],
        },
    },
    {
        "id": "geanta",
        "nume": {"ro": "Geantă de plimbare", "en": "Walking Bag"},
        "pret": 239,
        "marimi": ["Mărime unică"],
        "imagine": "/media/produse/geanta.jpg",
        "descriere": {
            "ro": "Geantă crossbody cu buzunar căptușit pentru recompense, compartiment separat pentru saci și fermoar din alamă. Cureaua se reglează de la 90 la 140 cm, deci se poartă și pe umăr, și pe diagonală.",
            "en": "Crossbody bag with a lined treat pocket, a separate bag compartment and a brass zip. The strap adjusts from 90 to 140 cm, so it works on the shoulder or across the body.",
        },
        "caracteristici": {
            "ro": ["Buzunar căptușit pentru recompense", "Compartiment separat pentru saci", "Fermoar din alamă", "Curea reglabilă 90-140 cm", "Interior impermeabil, se șterge"],
            "en": ["Lined treat pocket", "Separate bag compartment", "Brass zip", "Strap adjusts 90-140 cm", "Wipe-clean waterproof lining"],
        },
    },
    {
        "id": "bandana",
        "nume": {"ro": "Bandană", "en": "Bandana"},
        "pret": 69,
        "marimi": ["S", "M", "L"],
        "imagine": "/media/produse/bandana.jpg",
        "descriere": {
            "ro": "Bandană cu trecere pentru zgardă, deci nu se leagă la gât și nu alunecă. Bumbacul e prespălat și se calcă ușor.",
            "en": "Bandana with a collar slot, so nothing ties at the neck and nothing slips. The cotton is pre-washed and presses easily.",
        },
        "caracteristici": {
            "ro": ["Trecere pentru zgardă, fără noduri", "Bumbac prespălat", "Tiv dublu pe toate laturile", "Se calcă ușor", "Se spală la 30 de grade"],
            "en": ["Collar slot, no knots", "Pre-washed cotton", "Double hem on all sides", "Presses easily", "Machine wash at 30 degrees"],
        },
    },
    {
        "id": "halat",
        "nume": {"ro": "Halat de uscare", "en": "Drying Robe"},
        "pret": 279,
        "marimi": ["XS", "S", "M", "L", "XL"],
        "imagine": "/media/produse/halat.jpg",
        "descriere": {
            "ro": "Halat din microfibră cu absorbție mare, cu glugă și chingă pe burtă. Usucă un câine de talie medie în aproximativ 15 minute, fără să-l freci cu prosopul.",
            "en": "High-absorbency microfibre robe with a hood and a belly strap. It dries a medium dog in about fifteen minutes, with no towel rubbing.",
        },
        "caracteristici": {
            "ro": ["Microfibră de 400 g/mp", "Glugă și chingă pe burtă", "Usucă în circa 15 minute", "Se usucă singur pe umeraș", "Se spală la 30 de grade, fără balsam"],
            "en": ["400 gsm microfibre", "Hood and belly strap", "Dries in about fifteen minutes", "Drip-dries on a hanger", "Machine wash at 30 degrees, no softener"],
        },
    },
    {
        "id": "medalion",
        "nume": {"ro": "Medalion gravat", "en": "Engraved Tag"},
        "pret": 79,
        "marimi": ["25 mm", "32 mm"],
        "imagine": "/media/produse/medalion.jpg",
        "descriere": {
            "ro": "Medalion din alamă masivă, gravat cu laser pe ambele fețe. Numele pe față, două numere de telefon pe spate. Vine cu inel dublu, care nu se desface din zgardă.",
            "en": "Solid brass tag, laser-engraved on both faces. Name on the front, two phone numbers on the back. Comes with a double ring that will not work loose from the collar.",
        },
        "caracteristici": {
            "ro": ["Alamă masivă, nu placată", "Gravură laser pe ambele fețe", "Până la 24 de caractere pe față", "Inel dublu inclus", "Se livrează în 48 de ore"],
            "en": ["Solid brass, not plated", "Laser-engraved on both faces", "Up to 24 characters on the front", "Double ring included", "Ships within 48 hours"],
        },
    },
]

# ce produs e bestseller si ce segment acopera
BESTSELLERS = {("ham", "carou-bruma"), ("geanta", "carou-bruma"), ("ham-explore", "carou-bruma"), ("ham", "buline-cacao")}
SEGMENT = {"ham-explore": "talie-mare"}
STOC = {0: 14, 1: 9, 2: 21, 3: 6, 4: 17, 5: 3, 6: 11, 7: 25}

LIFESTYLE = [f"/media/lifestyle/{i:02d}.jpg" for i in range(1, 12)]


# Ce e la reducere si cat. Cheia e (tip, colectie). Reducerile sunt puse
# deliberat pe produse care se vad des, ca oferta sa fie vizibila pe home.
REDUCERI = {
    ("ham", "buline-cacao"): 25,
    ("ham", "dungi-sinaia"): 20,
    ("ham-explore", "canepa-naturala"): 30,
    ("lesa", "dungi-sinaia"): 20,
    ("lesa", "canepa-naturala"): 15,
    ("zgarda", "buline-cacao"): 25,
    ("geanta", "dungi-sinaia"): 20,
    ("geanta", "canepa-naturala"): 30,
    ("bandana", "carou-bruma"): 30,
    ("bandana", "dungi-sinaia"): 25,
    ("halat", "buline-cacao"): 20,
    ("medalion", "canepa-naturala"): 15,
}

NOUTATI = {("ham", "canepa-naturala"), ("bandana", "canepa-naturala"),
           ("zgarda", "dungi-sinaia"), ("halat", "dungi-sinaia")}

# rating si numar de recenzii, fixe ca sa nu se schimbe la fiecare build
RATINGURI = [4.9, 4.7, 5.0, 4.8, 4.6, 4.9, 4.8, 5.0, 4.7, 4.9, 4.5, 4.8]
RECENZII_NR = [214, 87, 342, 156, 63, 198, 121, 276, 94, 183, 47, 231]


def comercial(tip_id, col_id, pret, n):
    """Intoarce campurile comerciale pentru un produs."""
    proc = REDUCERI.get((tip_id, col_id))
    d = {
        "rating": RATINGURI[n % len(RATINGURI)],
        "nrRecenzii": RECENZII_NR[n % len(RECENZII_NR)],
        "nou": (tip_id, col_id) in NOUTATI,
        "reducere": proc or 0,
    }
    if proc:
        # pretul afisat scade, cel vechi ramane cel de lista
        d["pretVechiRon"] = pret
        d["pretRon"] = int(round(pret * (100 - proc) / 100))
    else:
        d["pretRon"] = pret
    return d

def imagine_produs(tip, col):
    """Fiecare produs isi are poza in tesatura lui. Daca varianta nu exista
    inca pe disc, cade inapoi pe poza generica a tipului, ca build-ul sa treaca."""
    cale = f"/media/produse/{tip['id']}-{col['id']}.jpg"
    if os.path.exists("src/assets" + cale):
        return cale
    return tip["imagine"]


produse = []
n = 0
for col in COLECTII:
    for t in TIPURI:
        slug = f"{t['id']}-{col['id']}"
        produse.append({
            "id": slug,
            "nume": {
                "ro": f"{t['nume']['ro']} {col['nume']['ro']}",
                "en": f"{col['nume']['en']} {t['nume']['en']}",
            },
            "tip": t["id"],
            "tipNume": t["nume"],
            "colectie": col["id"],
            **comercial(t["id"], col["id"], t["pret"], n),
            "marimi": t["marimi"],
            "imagini": [imagine_produs(t, col), col["imagine"], LIFESTYLE[n % len(LIFESTYLE)]],
            "descriere": {
                "ro": f"{t['descriere']['ro']} {col['tesatura']['ro']}",
                "en": f"{t['descriere']['en']} {col['tesatura']['en']}",
            },
            "caracteristici": t["caracteristici"],
            "stoc": STOC[n % 8],
            "bestseller": (t["id"], col["id"]) in BESTSELLERS,
            "segment": SEGMENT.get(t["id"]),
        })
        n += 1

# bundle-uri: unul per colectie, ham + lesa + zgarda
PRET_BUNDLE = 339
for col in COLECTII:
    componente = ["ham", "lesa", "zgarda"]
    intreg = sum(t["pret"] for t in TIPURI if t["id"] in componente)
    produse.append({
        "id": f"set-{col['id']}",
        "nume": {
            "ro": f"Set complet {col['nume']['ro']}",
            "en": f"{col['nume']['en']} Full Set",
        },
        "tip": "set",
        "tipNume": {"ro": "Set complet", "en": "Full Set"},
        "colectie": col["id"],
        "pretRon": PRET_BUNDLE,
        "pretIntregRon": intreg,
        "componente": [f"{c}-{col['id']}" for c in componente],
        "marimi": ["XS", "S", "M", "L", "XL"],
        "imagini": [
            imagine_produs(next(t for t in TIPURI if t["id"] == "ham"), col),
            col["imagine"],
            imagine_produs(next(t for t in TIPURI if t["id"] == "lesa"), col),
        ],
        "descriere": {
            "ro": f"Ham reglabil, lesă și zgardă din aceeași țesătură, cumpărate împreună. {col['tesatura']['ro']} Economisești {intreg - PRET_BUNDLE} lei față de prețul separat.",
            "en": f"Adjustable harness, lead and collar in the same cloth, bought together. {col['tesatura']['en']} You save {intreg - PRET_BUNDLE} lei against buying separately.",
        },
        "caracteristici": {
            "ro": ["Ham reglabil, lesă și zgardă", "Aceeași țesătură pe toate trei", f"Economisești {intreg - PRET_BUNDLE} lei", "Se livrează într-o singură cutie"],
            "en": ["Adjustable harness, lead and collar", "The same cloth across all three", f"You save {intreg - PRET_BUNDLE} lei", "Ships in a single box"],
        },
        "stoc": 8,
        "bestseller": col["id"] in ("carou-bruma", "dungi-sinaia"),
        "segment": None,
        "rating": 4.9,
        "nrRecenzii": 128,
        "nou": False,
        "reducere": int(round((intreg - PRET_BUNDLE) / intreg * 100)),
        "pretVechiRon": intreg,
    })

os.makedirs("src/data", exist_ok=True)
io.open("src/data/colectii.json", "w", encoding="utf-8").write(
    json.dumps(COLECTII, ensure_ascii=False, indent=2))
io.open("src/data/produse.json", "w", encoding="utf-8").write(
    json.dumps(produse, ensure_ascii=False, indent=2))
# ordinea din TIPURI e cea comerciala; o salvam explicit, altfel
# incarcatorul de fisiere le intoarce alfabetic
io.open("src/data/tipuri.json", "w", encoding="utf-8").write(
    json.dumps([{**{k: v for k, v in t.items() if k in ("id", "nume", "imagine")}, "ordine": i}
                for i, t in enumerate(TIPURI)],
               ensure_ascii=False, indent=2))
print(f"colectii: {len(COLECTII)}  tipuri: {len(TIPURI)}  produse: {len(produse)}")
