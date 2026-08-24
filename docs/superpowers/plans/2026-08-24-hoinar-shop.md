# HOINAR — plan de implementare

> **Sursă:** `docs/superpowers/specs/2026-08-24-hoinar-shop-design.md`

**Goal:** Un magazin online demo, complet navigabil și bilingv, pentru brandul inventat HOINAR
(accesorii de plimbare pentru câini, pe colecții cu print), care să convingă clienta înainte
de contract.

**Architecture:** Astro 5 static, cu produsele în Content Collections tipizate cu Zod ca strat
de date separat de componente. Interactivitatea (coș, filtre, constructor de set, ghid de
mărimi) în insule React punctuale, restul HTML pur. Tot ce ține de date trece prin
`src/lib/catalog.ts`, ca la proiectul real să se schimbe doar acel fișier când sursa devine
Medusa, nu componentele.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS 4, nanostores + `@nanostores/react`,
React 19 (doar pentru insule), Fraunces + DM Sans self-hosted.

## Global Constraints

- Limba implicită română, fără prefix de rută. Engleza pe `/en/`. Tot conținutul tradus.
- Diacritice românești corecte peste tot: ă â î ș ț, cu virgulă dedesubt la ș și ț.
- Paletă: `--crem #F6F1EA`, `--camel #C89B6A`, `--ciocolata #3B2A22`, `--teracota #B5643F`,
  `--ink #191512`. Un singur accent dominant per ecran.
- Titluri Fraunces mixed case. Interzis sans uppercase cu letter-spacing pe titluri de secțiune.
- Radius 10px. Tranziții 150-250ms ease-out. Tot ce se mișcă se oprește la
  `prefers-reduced-motion`.
- Interzis: emoji, gradient-mesh, blob colorat, badge-uri flotante decorative, avatare rotunde
  stock, poze stock cu oameni zâmbind.
- Prețuri sursă în RON. Curs fix 1 EUR = 5,05 RON.
- Prag transport gratuit: 250 lei.
- Fără SEO fin, fără pagini legale, fără plăți reale. Sunt în afara scopului acestei faze.
- Verificare vizuală obligatorie la 360, 768 și 1280 px lățime, plus un ecran scurt
  (1280x720), după fiecare fază care atinge layout-ul.

---

## Faza A — Producție vizuală (Higgsfield)

Se face prima, pentru că designul depinde de fotografie, nu invers.
Buget: 128.57 credite. Imagine 2K = 0.12, video Kling 3.0 pro 5s mut = 8.75.

### Task A1: Hero-ul ca ancoră

**Fișiere:** `public/media/hero/`

- [ ] Generează 4 variante de hero cu Soul 2.0, 16:9, 2K (cost 0.48)
- [ ] Alege varianta cu cea mai bună lumină și cel mai mult spațiu gol pentru text
- [ ] Extrage paleta reală din imaginea aleasă și ajustează tokenii din spec dacă diferă
      vizibil. Fotografia are prioritate, tokenii se aliniază la ea.
- [ ] Salvează originalul plus AVIF și WebP la 1920, 1280 și 720 px lățime

### Task A2: Restul pachetului foto

**Fișiere:** `public/media/categorii/`, `public/media/colectii/`, `public/media/produse/`,
`public/media/lifestyle/`, `public/media/recenzii/`

Toate generate cu aceeași descriere de lumină și paletă ca hero-ul, ca să pară același shooting.

- [ ] 8 tile-uri de categorie (ham, ham Explore, lesă, zgardă, geantă, bandană, halat, medalion)
- [ ] 4 tile-uri de colecție, macro pe material: Carou Brumă, Buline Cacao, Dungi Sinaia,
      Cânepă Naturală
- [ ] 24 poze de produs, câte 6 per colecție, pe fundal crem sau blush
- [ ] 8 lifestyle pentru blocuri editoriale și segmente
- [ ] 5 poze „de la clienți", cadrate mai neglijent, ca să pară UGC real, nu studio
- [ ] Convertește tot în AVIF + WebP, cu dimensiuni explicite notate pentru anti-CLS

Cost estimat: ~49 imagini × 0.12 = ~5.9 credite.

### Task A3: Video

**Fișiere:** `public/media/video/`

- [ ] Video hero 5s, Kling 3.0 pro, `start_image` = hero-ul din A1, mișcare lentă de cameră,
      câinele își mișcă capul. Buget până la 3 încercări (26.25 credite).
- [ ] Video editorial 5s, macro pe cataramă care se închide și pe textura chingii.
      Buget până la 2 încercări (17.5 credite).
- [ ] Export webm + mp4, extrage `poster.jpg` din primul cadru
- [ ] Verifică: `muted autoplay loop playsinline`, sub 2 MB, oprit la `prefers-reduced-motion`

**Verificare fază:** toate fișierele există, toate au AVIF/WebP, paleta e coerentă între ele
când le pui una lângă alta. Dacă două poze par din shooting-uri diferite, se regenerează.

---

## Faza B — Fundație

### Task B1: Scaffold

**Fișiere:** `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/tokens.css`,
`src/styles/global.css`, `public/fonts/`

- [ ] `npm create astro@latest` cu TypeScript strict, apoi adaugă integrarea React și Tailwind 4
- [ ] `git init` și primul commit
- [ ] Descarcă Fraunces și DM Sans, subset latin + latin-ext, pune-le în `public/fonts/`
      cu `@font-face` și `font-display: swap`
- [ ] Scrie `tokens.css` cu paleta, scala de spacing 4/8, radius, scala tipografică cu `clamp()`
- [ ] Configurează i18n în `astro.config.mjs`: `defaultLocale: 'ro'`, `locales: ['ro','en']`,
      `prefixDefaultLocale: false`
- [ ] Verifică: `npm run build` trece, o pagină goală randează cu fonturile corecte
- [ ] Scrie într-o pagină de test textul „Zgardă țesută în București, cusătură întărită" și
      confirmă vizual că ș și ț au virgulă, nu sedilă

### Task B2: Stratul de date

**Fișiere:** `src/content.config.ts`, `src/content/colectii/*.json`, `src/content/produse/*.json`,
`src/lib/catalog.ts`, `src/lib/pret.ts`

- [ ] Definește schema Zod pentru colecție: `slug`, `nume` (ro/en), `descriere` (ro/en),
      `imagine`, `accent`
- [ ] Definește schema Zod pentru produs: `slug`, `nume` (ro/en), `tip`, `colectie`,
      `pretRon`, `marimi[]`, `imagini[]`, `descriere` (ro/en), `caracteristici[]` (ro/en),
      `stoc`, `bestseller`, `segment` ('taliemare' | 'baieti' | null)
- [ ] Scrie datele: 4 colecții, 32 produse, 4 bundle-uri, cu prețurile din spec
- [ ] `src/lib/catalog.ts` expune: `getColectii(lang)`, `getProduse(filtre)`,
      `getProdus(slug, lang)`, `getBestsellers(lang)`, `getProduseDinColectie(slug, lang)`.
      Astea sunt singurele funcții pe care le apelează componentele.
- [ ] `src/lib/pret.ts` expune `formatPret(ron, moneda)` care întoarce „189 lei" sau „37 €"
- [ ] Verifică: un script care apelează `getProduse({})` întoarce 32 de produse, iar
      `formatPret(189,'EUR')` întoarce „37 €"

---

## Faza C — Layout și homepage

### Task C1: Header, footer, comutatoare

**Fișiere:** `src/layouts/Base.astro`, `src/components/Header.astro`,
`src/components/MegaMenu.astro`, `src/components/Footer.astro`,
`src/components/SelectorLimba.tsx`, `src/components/SelectorMoneda.tsx`

- [ ] Header fix, cu variabila `--header-h` folosită ca `padding-top` pe conținut, ca hero-ul
      să nu intre sub el
- [ ] Mega-menu pe categorii, cu coloană de colecții și o poză
- [ ] Bară de anunț: „Transport gratuit peste 250 lei"
- [ ] Footer acordeon pe mobil, coloane pe desktop
- [ ] Selectoarele de limbă și monedă, moneda persistată în `localStorage`
- [ ] Verifică vizual la 360, 768, 1280 și 1280x720: nimic nu se suprapune, mega-menu-ul nu
      iese din ecran, header-ul nu acoperă titlul hero

### Task C2: Homepage

**Fișiere:** `src/pages/index.astro` plus câte o componentă per secțiune în
`src/components/home/`

Secțiunile, în ordinea din spec:

- [ ] `Hero.astro` cu video de fundal, `poster`, titlu serif și două CTA
- [ ] `GrilaCategorii.astro`, 8 tile-uri cu imagine și etichetă
- [ ] `Bestsellers.astro`, 4 produse, badge „Set și economisești" unde e cazul
- [ ] `Editorial.astro`, split cu video macro și copy despre material și testul de rezistență
- [ ] `CaruselColectii.astro`, scroll orizontal, funcțional și cu tastatura
- [ ] `Recenzii.astro`, carusel cu poze de la clienți, fără avatare rotunde stock
- [ ] `Segmente.astro`, două tile-uri: „Pentru câinii mari", „Pentru băieți"
- [ ] `Poveste.astro`
- [ ] `Newsletter.astro`
- [ ] Verifică vizual la toate lățimile, plus screenshot integral

---

## Faza D — Comerț

### Task D1: Coș

**Fișiere:** `src/stores/cos.ts`, `src/components/CosDrawer.tsx`, `src/components/AdaugaInCos.tsx`

- [ ] Store nanostores cu persistență în `localStorage`, cheie `hoinar-cos`
- [ ] Acțiuni: `adauga`, `sterge`, `schimbaCantitate`, `goleste`
- [ ] Derivate: `subtotal`, `numarProduse`, `lipsaPanaLaTransportGratuit`
- [ ] Drawer lateral cu bară de progres spre pragul de 250 lei
- [ ] Verifică: adaugi 2 produse, dai refresh, coșul e intact; la 250 lei bara se completează

### Task D2: Categorie și colecție

**Fișiere:** `src/pages/categorie/[tip].astro`, `src/pages/colectie/[slug].astro`,
`src/components/Filtre.tsx`, `src/components/CardProdus.astro`

- [ ] Filtre client-side: mărime, colecție, interval de preț, doar în stoc
- [ ] Sortare: recomandate, preț crescător, preț descrescător
- [ ] Card de produs cu schimbare de imagine la hover
- [ ] Verifică: filtrarea pe mărimea L întoarce doar produse cu L, contorul e corect

### Task D3: Pagina de produs

**Fișiere:** `src/pages/produs/[slug].astro`, `src/components/Galerie.tsx`,
`src/components/ConstructorSet.tsx`, `src/components/GhidMarimi.tsx`,
`src/components/Acordeon.astro`

- [ ] Galerie cu miniaturi și zoom
- [ ] Selector de mărime cu link către ghid
- [ ] **Constructor de set:** alegi colecția, bifezi ham, lesă, zgardă, geantă, prețul și
      economia se actualizează live, un singur buton adaugă tot în coș
- [ ] **Ghid de mărimi interactiv:** două câmpuri, gât și piept în cm, întoarce mărimea
      recomandată din tabelul produsului
- [ ] Acordeoane: descriere, caracteristici, tabel mărimi, livrare, retur, întrebări frecvente
- [ ] Produse din aceeași colecție
- [ ] Verifică: constructorul cu 4 produse bifate arată economia corectă și adaugă 4 linii
      în coș; ghidul cu gât 38 și piept 55 întoarce mărimea așteptată

### Task D4: Checkout mock

**Fișiere:** `src/pages/cos.astro`, `src/pages/finalizare.astro`,
`src/components/Checkout.tsx`, `src/pages/confirmare.astro`

- [ ] Trei pași: date de livrare, transport (Sameday easybox / FAN / Cargus), plată
      (card / ramburs)
- [ ] Validare de formular reală, mesaje în română
- [ ] Nu procesează nimic. La final generează un număr de comandă local și golește coșul.
- [ ] Verifică: parcurgi fluxul complet, ajungi pe confirmare, coșul e gol

---

## Faza E — Engleză

### Task E1: Traducere completă

**Fișiere:** `src/i18n/ro.json`, `src/i18n/en.json`, `src/lib/i18n.ts`, `src/pages/en/**`

- [ ] Extrage toate șirurile de interfață în fișierele de traducere
- [ ] Traduce numele și descrierile de produs (deja în date din Task B2)
- [ ] Generează rutele `/en/` pentru toate paginile
- [ ] `hreflang` între variante
- [ ] Verifică: navighezi de pe `/produs/ham-carou-bruma` pe versiunea EN și ajungi pe
      produsul corespunzător, nu pe home

---

## Faza F — Verificare finală

### Task F1: Trecere vizuală și de accesibilitate

- [ ] Screenshot pe fiecare pagină la 360, 768, 1280 și 1280x720. Nicio suprapunere,
      niciun scroll orizontal.
- [ ] Toate imaginile au `alt` descriptiv și dimensiuni explicite
- [ ] Focus vizibil pe tot ce e interactiv, navigare completă cu tastatura
- [ ] Contrast AA verificat pe camel pe crem, care e combinația riscantă
- [ ] `prefers-reduced-motion` oprește video-ul și animațiile
- [ ] `npm run build` trece fără erori
- [ ] Trecere anti-AI: parcurgi lista din Global Constraints și scoți orice element pus doar
      ca să arate drăguț

### Task F2: Lista de diferențe față de referință

- [ ] Documentează în README ce face HOINAR mai bine decât Cocopup, ca argument de vânzare
      la pitch: constructor de set, ghid interactiv, tipografie editorială, mișcare
