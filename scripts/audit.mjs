import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BAZA = process.env.BAZA ?? 'http://localhost:4390';
const PAGINI = [
  '/', '/colectii', '/categorie/ham', '/colectie/dungi-sinaia', '/produs/ham-carou-bruma',
  '/reduceri', '/cos', '/finalizare', '/favorite', '/cont', '/ghid-marimi',
  '/poveste', '/livrare-retur', '/contact', '/en/', '/en/produs/ham-carou-bruma',
];

const probleme = [];
const adauga = (pagina, tip, detaliu) => probleme.push({ pagina, tip, detaliu });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

for (const cale of PAGINI) {
  await page.goto(BAZA + cale, { waitUntil: 'networkidle' });
  await page.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
  await page.evaluate(async () => {
    const H = document.body.scrollHeight;
    for (let y = 0; y < H; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);

  const r = await page.evaluate(() => {
    const out = { fara: [], meta: {}, titluri: [], greleImagini: [] };

    for (const el of document.querySelectorAll('button, a')) {
      const nume = (el.getAttribute('aria-label') || el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      if (!nume && r.width > 0 && r.height > 0) {
        out.fara.push(`${el.tagName.toLowerCase()} fără nume accesibil`);
      }
    }
    for (const el of document.querySelectorAll('input, select, textarea')) {
      const id = el.id;
      const areEticheta =
        el.getAttribute('aria-label') ||
        (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
        el.closest('label');
      if (!areEticheta) out.fara.push(`${el.tagName.toLowerCase()}#${id || '?'} fără etichetă`);
    }

    out.meta = {
      lang: document.documentElement.lang,
      titlu: document.title,
      descriere: document.querySelector('meta[name=description]')?.content ?? null,
      h1: document.querySelectorAll('h1').length,
      hreflang: document.querySelectorAll('link[rel=alternate][hreflang]').length,
    };

    let ultim = 0;
    for (const h of document.querySelectorAll('h1,h2,h3,h4')) {
      const n = +h.tagName[1];
      if (ultim && n > ultim + 1) out.titluri.push(`salt de la h${ultim} la h${n}: ${h.textContent?.trim().slice(0, 30)}`);
      ultim = n;
    }

    for (const im of document.querySelectorAll('img')) {
      const r = im.getBoundingClientRect();
      // 2x e norma pe ecrane retina; semnalăm doar risipa reală
      if (im.naturalWidth > r.width * 2.8 && r.width > 40) {
        out.greleImagini.push(`${im.currentSrc.split('/').pop()?.slice(0, 30)}: ${im.naturalWidth}px pentru ${Math.round(r.width)}px`);
      }
    }
    return out;
  });

  for (const f of [...new Set(r.fara)]) adauga(cale, 'accesibilitate', f);
  if (!r.meta.titlu) adauga(cale, 'meta', 'fără <title>');
  if (!r.meta.descriere) adauga(cale, 'meta', 'fără meta description');
  if (r.meta.h1 !== 1) adauga(cale, 'meta', `${r.meta.h1} elemente h1`);
  if (r.meta.hreflang !== 2) adauga(cale, 'meta', `${r.meta.hreflang} legături hreflang`);
  if (!r.meta.lang) adauga(cale, 'meta', 'fără atribut lang');
  for (const t of r.titluri.slice(0, 2)) adauga(cale, 'ierarhie titluri', t);
  for (const g of [...new Set(r.greleImagini)].slice(0, 2)) adauga(cale, 'imagine prea mare', g);
}

await browser.close();

// conținut rămas nefinalizat
const dist = './dist';
// doar cuvinte care chiar semnalează conținut nefinalizat; `[[` apare
// în props-urile serializate ale insulelor, deci ar da fals pozitiv
const suspecte = /(lorem ipsum|\bTODO\b|\bFIXME\b|placeholder|Textul aici|Lorem)/i;
(function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const c = path.join(dir, f.name);
    if (f.isDirectory()) scan(c);
    else if (f.name.endsWith('.html')) {
      // doar textul vizibil: fără scripturi, stiluri și atribute
      const text = fs.readFileSync(c, 'utf8')
        .replace(/<script[\s\S]*?<\/script>/g, '')
        .replace(/<style[\s\S]*?<\/style>/g, '')
        .replace(/<[^>]+>/g, ' ');
      const m = text.match(suspecte);
      if (m) adauga(path.relative(dist, c), 'conținut', `text suspect: ${m[0]}`);
    }
  }
})(dist);

// greutatea build-ului
const marimi = [];
(function scanA(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const c = path.join(dir, f.name);
    if (f.isDirectory()) scanA(c);
    else marimi.push([c, fs.statSync(c).size]);
  }
})(dist);
const total = marimi.reduce((s, [, n]) => s + n, 0);
const celeMari = marimi.sort((a, b) => b[1] - a[1]).slice(0, 3);

console.log(`Build: ${(total / 1048576).toFixed(1)} MB, ${marimi.length} fișiere.`);
console.log('Cele mai mari:');
for (const [f, n] of celeMari) console.log(`  ${(n / 1024).toFixed(0)} KB  ${path.relative(dist, f)}`);

if (probleme.length === 0) {
  console.log(`\n${PAGINI.length} pagini auditate. Nicio problemă.`);
} else {
  console.log(`\n${probleme.length} probleme:\n`);
  const peTip = {};
  for (const p of probleme) (peTip[p.tip] ??= []).push(p);
  for (const [tip, lista] of Object.entries(peTip)) {
    console.log(`  ${tip} (${lista.length}):`);
    for (const p of lista.slice(0, 6)) console.log(`    ${p.pagina} — ${p.detaliu}`);
    if (lista.length > 6) console.log(`    ... încă ${lista.length - 6}`);
  }
  process.exit(1);
}
