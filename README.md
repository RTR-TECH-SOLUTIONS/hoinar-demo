# HOINAR — demo de magazin online

Demo de prezentare pentru o clientă care vinde accesorii de plimbare pentru câini.
Brandul, produsele, fotografiile și textele sunt inventate pentru pitch.

**Live:** https://rtr-tech-solutions.github.io/hoinar-demo/

## Ce e înăuntru

- **Astro 7 + React 19 + Tailwind 4**, build static, 110 pagini
- **Bilingv** RO (implicit) și EN pe `/en/`, cu selector de monedă RON / EUR
- **32 de produse**: 7 tipuri × 4 țesături, plus 4 seturi complete
- Coș real cu persistență în browser, checkout mock în 3 pași
- Constructor de set cu reducere pe număr de piese
- Ghid de mărimi interactiv, favorite, căutare cu sugestii
- Filtre laterale pe culoare, mărime, tip și preț, cu numărătoare per opțiune

## Comenzi

```bash
npm install
npm run dev        # dezvoltare
npm run build      # build în dist/
npm run preview    # servește build-ul
```

## Verificări

Rulează cu preview-ul pornit. `BAZA` trebuie să includă calea de bază.

```bash
npm run build && npx astro preview --port 4390 &

node scripts/chei.mjs                                        # traduceri: duplicate, chei lipsă
node scripts/linkuri.mjs                                     # linkuri interne rupte
BAZA=http://localhost:4390/hoinar-demo node scripts/audit.mjs      # accesibilitate, meta, imagini
BAZA=http://localhost:4390/hoinar-demo node scripts/verifica.mjs   # layout pe 4 ecrane
BAZA=http://localhost:4390/hoinar-demo node scripts/test-flux.mjs  # 83 de teste de flux
```

Fiecare a prins bug-uri reale: chei de traducere suprascrise tăcut, un 404
englezesc care lipsea, dropdownuri care se închideau singure, imagini tăiate.

## Ce NU e făcut, fiind demo

Fără research SEO, fără banner cookie sau pagini legale, fără ANPC/SOL, fără
plăți reale, fără integrare de curier, fără admin. Toate intră la proiectul
real, după semnare.

## Cum crește în proiect real

Datele stau în `src/data/*.json`, tipizate cu Zod în `src/content.config.ts`,
și se citesc **doar** prin `src/lib/catalog.ts`. Când sursa devine un motor de
comerț (Medusa), se rescrie acel fișier; componentele rămân neatinse. Astro
trece pe `output: 'server'` pentru catalog și produs, restul rămâne static.

## Generarea catalogului

```bash
python3 scripts/genereaza-catalog.py    # rescrie src/data/*.json
```
