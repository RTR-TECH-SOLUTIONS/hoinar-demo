# HOINAR — magazin online de accesorii pentru câini

**Data:** 2026-08-24
**Fază:** preview de pitch (înainte de contract)
**Referință dată de client:** https://cocopuplondon.com/

---

## 1. Context și obiectiv

Clienta vrea un magazin online de accesorii proprii pentru câini, organizate pe colecții
cu print, în spiritul Cocopup London. Piața principală este România, dar vrea să vândă și
în afară.

Nu are încă produse fotografiate, nume de brand sau conținut. Tot materialul vizual și
textual din acest demo este generat, cu scopul de a arăta cum ar arăta brandul ei dacă
ar exista. Demoul se prezintă înainte de contract.

**Criteriu de succes:** clienta se uită la site și îl percepe ca pe un brand real, nu ca
pe un template. Trebuie să bată vizual atât referința, cât și tot ce există în piața RO.

## 2. Analiza referinței (Cocopup London)

Cocopup nu este un petshop. Este un brand DTC de lifestyle cu catalog mic și marjă mare,
care vinde accesorii de plimbare grupate pe colecții cu print.

Mecanismele lor comerciale, în ordinea importanței:

1. **Colecția, nu produsul.** Clientul cumpără un print (Pup Plaid, Cotswold Check), apoi
   ia ham + lesă + zgardă + geantă în același print. Ăsta e motorul de valoare a coșului.
2. **Bundle & Save**, cu badge direct pe cardul de produs în grila de bestsellers.
3. **Art direction unitar.** Neutre calde: crem, camel, ciocolată, teracotă, blush. Produs
   pe fundal pastel plus lifestyle real pe stradă. Zero stock generic cu oameni zâmbind.
4. **Dovadă socială pe tot parcursul:** carusel de recenzii cu poze de la clienți, logo-uri
   de presă (Times, Vogue, Tatler, Glamour), Trustpilot, indicator de stoc redus.
5. **Segmentare pe intenție:** „For the Big Dogs", „For the Boys", Cococat.

Preț de referință, afișat în lei pentru vizitatori din RO: ham 188 lei, ham Explore 251 lei,
bundle ham + lesă + zgardă 339 lei, bundle geantă 239 lei.

**Slăbiciunile lor,** care sunt oportunitatea noastră: este o temă Shopify personalizată.
Tipografia e sans uppercase peste tot, ritmul secțiunilor e plat, mișcare zero, ghidul de
mărimi e un tabel static.

## 3. Analiza pieței RO

Verificate: PetMart, PetMax, Maxi-Pet, Zooplus, PetPlaza, Cattitude, MegaPet.

Toate sunt magazine de catalog mare, orientate pe preț: hrană plus accesorii, promoții,
branduri, filtre. Structura tipică include bară de anunț cu „Transport gratuit peste 199 lei",
tile-uri „Pentru cine cumperi azi?", grile de promoții și logo-uri de branduri.

**Concluzia care contează: în România nu există un echivalent DTC de tipul Cocopup.** Există
un gol de piață. Prin urmare nu copiem structura petshop-urilor RO. Luăm modelul Cocopup și
adăugăm peste el obligatoriile RO.

**Obligatoriile RO** (vizibile în demo, funcționale la proiectul real): plata ramburs, prag
de transport gratuit afișat, retur în 14 zile, telefon vizibil, curieri locali
(Sameday easybox, FAN, Cargus). ANPC și SOL intră la proiectul real.

## 4. Brand

**Nume:** HOINAR. În română înseamnă cel care hoinărește, deci trimite direct la plimbare,
care este chiar categoria de produs. Scurt, se citește ușor și de un vorbitor de engleză.

**Poziționare:** accesorii de plimbare croite în România, pe colecții cu print.
Nu petshop, nu hrană.

**Ton:** specific și concret, nu lăudăros. „Chingă din bumbac dublat, cataramă testată la
187 kg" în loc de „calitate premium pentru prietenul tău".

## 5. Direcția vizuală

Neutre calde, print-driven. Spiritul Cocopup, ridicat cu tipografie editorială.

### Paletă (tokens CSS)

Paleta nu este inventată. Este derivată programatic din fotografia hero generată, prin
eșantionare pe zone de material (zidul de ocru, chinga hamului, lesa de piele, piatra cubică).
Toate tonurile din fotografie stau pe nuanța 26-40 grade, adică exact familia camel-ciocolată.
Extragerea brută ieșea prea desaturată, pentru că scena e în umbră, așa că nuanța vine din
fotografie, iar saturația e ridicată pe accente ca să existe un accent real.

| Token | Hex | Sursă în fotografie | Rol |
|---|---|---|---|
| `--crem` | `#F7F4F0` | zid de ocru, luminat | fundal principal |
| `--nisip` | `#EBE2D8` | zid de ocru | suprafețe secundare, carduri |
| `--camel` | `#C59663` | chinga hamului | suprafețe, text pe fundal închis |
| `--teracota` | `#A15C3A` | lesa de piele | accent, linkuri, preț redus |
| `--ciocolata` | `#3B2E23` | chinga hamului, umbră | text pe fundal deschis |
| `--ink` | `#181613` | piatră cubică, umbră | butoane, contrast maxim |

**Contrast verificat (WCAG AA):**

| Combinație | Raport | Verdict |
|---|---|---|
| ciocolată pe crem | 11.96 | trece |
| ink pe crem | 16.47 | trece |
| crem pe ink | 16.47 | trece |
| ciocolată pe nisip | 10.25 | trece |
| teracotă pe crem | 4.66 | trece |
| camel pe ink | 6.81 | trece |
| **camel pe crem** | **2.42** | **pică** |

**Regulă obligatorie:** camel nu se folosește niciodată ca text pe fundal deschis. Este
culoare de suprafață și de detaliu, sau text pe fundal închis. Accentul de text este teracota.

Un singur accent dominant per ecran. Restul neutre.

### Tipografie

- **Titluri:** Fraunces (serif editorial variabil), mixed case. Nu sans uppercase, care e
  exact ce face referința.
- **Body:** DM Sans, line-height 1.6.
- Ambele au Latin Extended, deci ș și ț cu virgulă dedesubt sunt corecte. Se verifică vizual.
- Scale cu `clamp()`, `font-display: swap`, self-hosted (fără request la Google).

### Detalii

Radius 10px, nu pill. Umbre subtile stratificate. Tranziții 150-250ms `ease-out`.
Entrance discret, oprit la `prefers-reduced-motion`.

## 6. Arhitectură tehnică

**Stack:** Astro 5 + TypeScript, Tailwind peste tokens CSS.

**Date:** produsele și colecțiile în Content Collections tipizate cu Zod, nu hardcodate în
pagini. Motivul: la proiectul real sursa de date se schimbă din fișiere în API Medusa, iar
componentele rămân neatinse.

**i18n:** rutare nativă Astro. `/` română (implicit, fără prefix), `/en/` engleză. Tot
conținutul tradus, inclusiv produsele. Selector de limbă și de monedă (RON / EUR) în header
și în footer, care schimbă efectiv prețurile afișate. Curs fix în config: 1 EUR = 5,05 RON,
cu rotunjire la finalul unității. Prețurile sursă sunt în RON.

**Coș:** nanostores + persistență în `localStorage`, drawer lateral. Funcțional real:
adaugă, modifică cantitate, șterge, calculează subtotal și pragul de transport gratuit.

**Checkout:** mock în 3 pași (date livrare, transport, plată). Afișează metodele RO
(card, ramburs) dar nu procesează nimic. La final, pagină de confirmare cu număr de comandă
generat local.

**Filtre:** pe pagina de categorie, client-side, pe mărime, colecție, preț, disponibilitate.

**Build:** static. Deploy oriunde pentru pitch.

**Cale de creștere spre proiectul real:** același Astro trece pe `output: 'server'` cu adapter
Node, catalogul și produsul devin SSR ca să apară instant la modificări din admin, restul
paginilor rămân statice. Motor de comerț Medusa self-hosted în Coolify pe VPS. Frontendul
nu se rescrie, se schimbă doar stratul de date.

## 7. Catalog demo

### Colecții

| Colecție | Caracter |
|---|---|
| Carou Brumă | carou maro-camel, semnătura brandului |
| Buline Cacao | buline ciocolată pe crem |
| Dungi Sinaia | dungi teracotă, registru montan |
| Cânepă Naturală | neutru, fără print, materialul la vedere |

### Tipuri de produs

Ham reglabil, Ham Explore (talie mare, mâner de control), Lesă, Zgardă, Geantă de plimbare,
Bandană, Halat de uscare, Medalion gravat.

Aproximativ 32 SKU plus 4 bundle-uri de colecție.

### Prețuri (aliniate la referință, convertite la piața RO)

Ham reglabil 189 lei · Ham Explore 249 lei · Lesă 139 lei · Zgardă 119 lei ·
Geantă de plimbare 239 lei · Bandană 69 lei · Halat de uscare 279 lei · Medalion gravat 79 lei.
Bundle de colecție (ham + lesă + zgardă) 339 lei, cu economia afișată explicit.

Prag de transport gratuit: 250 lei.

## 8. Pagini

Home · Colecție · Categorie cu filtre · Produs · Coș · Checkout mock (3 pași) · Confirmare ·
Povestea noastră · Ghid de mărimi · Livrare & Retur · Contact · 404.

Toate în ambele limbi.

## 9. Structura homepage

1. Bară de anunț: transport gratuit peste 250 lei
2. Header cu nav pe categorii, mega-menu pe colecții, căutare, cont, coș
3. Hero video cu titlu serif și două CTA
4. Grilă de 8 tile-uri de categorie, imagine plus etichetă
5. Bestsellers 4-up, cu badge „Set și economisești"
6. Bloc editorial split: materialul și testul de rezistență
7. Carusel de colecții
8. Recenzii cu poze de la clienți
9. Două tile-uri de segment: „Pentru câinii mari" / „Pentru băieți"
10. Povestea noastră
11. Newsletter
12. Footer acordeon, cu selector de limbă și monedă

## 10. Structura paginii de produs

Galerie cu miniaturi și zoom · titlu, preț, stoc · selector de mărime cu link către ghid ·
cantitate · adaugă în coș · **constructor de set** · descriere narativă · listă de
caracteristici · tabel de mărimi în cm · patru blocuri de beneficii · acordeoane livrare și
retur · întrebări frecvente · produse din aceeași colecție.

## 11. Ce facem mai bine decât referința

1. **Constructor de set.** Alegi colecția, apoi compui ham + lesă + zgardă + geantă într-un
   singur ecran, cu preț actualizat live și economia afișată. Referința oferă doar bundle-uri
   predefinite. Este momentul de impact la pitch și motorul real de valoare a coșului.
2. **Tipografie editorială** în loc de sans uppercase peste tot.
3. **Ghid de mărimi interactiv.** Introduci circumferința gâtului și a pieptului, primești
   mărimea recomandată. Referința are tabel static. În RO nu are nimeni asta.
4. **Ritm și mișcare.** Secțiuni cu înălțimi variate, imagini care intră discret, hover pe
   carduri care schimbă fotografia.

## 12. Reguli anti-AI aplicate

Zero emoji. Zero gradient-mesh sau blob colorat. Zero badge-uri flotante decorative. Zero
avatare rotunde stock la testimoniale. Zero etichete uppercase cu letter-spacing deasupra
secțiunilor. Un singur accent de culoare, restul neutre. Fotografie de produs pe fundal real,
nu pe alb steril. Copy specific cu detaliu de proces. Diacritice corecte peste tot. Butoane
cu radius 10px, nu pill. Secțiuni puține și încrezătoare.

## 13. Plan de producție vizuală (Higgsfield)

Costuri verificate prin preflight, nu estimate:

| Tip | Model | Cost |
|---|---|---|
| Imagine 2K | Soul 2.0 | 0.12 credite |
| Video 5s mut, 16:9 | Kling 3.0 std | 7.5 credite |
| Video 5s mut, 16:9 | Kling 3.0 pro | 8.75 credite |

Buget disponibil la momentul scrierii: 28.57 credite, plan Plus.

**Alocare:**
- ~50 de imagini (hero, 8 tile-uri categorie, 4 tile-uri colecție, ~24 poze produs,
  ~8 lifestyle, ~5 recenzii): ~6 credite
- Video hero 5s, Kling 3.0 pro, pornit din poza hero ca `start_image`: 8.75 credite
- Video secundar, macro pe cataramă și material, pentru blocul editorial: 8.75 credite
- Tampon pentru refaceri: ~5 credite

**Regula de coerență:** se generează întâi hero-ul. Acesta devine referința de paletă, lumină
și material pentru tot restul. Nu se generează 50 de imagini independente, pentru că nu ar
semăna între ele și s-ar vedea imediat că sunt generate.

**Video:** `muted autoplay loop playsinline`, `poster` din cadrul hero ca fallback anti-CLS,
webm plus mp4, oprit la `prefers-reduced-motion`.

## 14. În afara scopului acestei faze

Nu se face acum, intră la proiectul real după semnare: research SEO RO și keyworduri, on-page
și local SEO, banner cookie/GDPR, pagini Termeni și Confidențialitate și Politica de cookies,
badge ANPC și SOL, credit „made by RTR" în footer, plăți reale (Stripe plus Netopia),
integrare curier, admin editabil, deploy pe VPS + Coolify.
