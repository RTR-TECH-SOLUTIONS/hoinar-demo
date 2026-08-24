import { chromium } from 'playwright';
import fs from 'node:fs';

const BAZA = process.env.BAZA ?? 'http://localhost:4380';
const IESIRE = process.env.IESIRE ?? './.verificare';
fs.mkdirSync(IESIRE, { recursive: true });

const PAGINI = [
  ['acasa', '/'],
  ['colectii', '/colectii'],
  ['categorie', '/categorie/ham'],
  ['colectie', '/colectie/dungi-sinaia'],
  ['produs', '/produs/ham-carou-bruma'],
  ['cos', '/cos'],
  ['ghid', '/ghid-marimi'],
  ['poveste', '/poveste'],
  ['livrare', '/livrare-retur'],
  ['contact', '/contact'],
  ['en-acasa', '/en/'],
  ['en-produs', '/en/produs/ham-carou-bruma'],
];

const ECRANE = [
  ['mobil', 360, 740],
  ['tableta', 768, 1024],
  ['laptop-scurt', 1280, 720],
  ['desktop', 1440, 900],
];

const browser = await chromium.launch();
const probleme = [];

for (const [numeEcran, w, h] of ECRANE) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const erori = [];
  page.on('console', (m) => { if (m.type() === 'error') erori.push(m.text()); });
  page.on('pageerror', (e) => erori.push(String(e)));

  for (const [nume, cale] of PAGINI) {
    await page.goto(BAZA + cale, { waitUntil: 'networkidle' });
    // Fortam incarcarea imaginilor lazy inainte de screenshot: altfel captura
    // integrala prinde sectiuni goale si nu se poate judeca designul.
    await page.evaluate(() => {
      for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager';
    });
    // declanseaza lazy-loading
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y < H; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
      // asteptam sa se aseze imaginile lazy, altfel screenshot-ul integral
      // prinde sectiuni goale si pare ca lipsesc poze
      await new Promise(r => setTimeout(r, 900));
      // cu termen limita: o imagine care nu se incarca niciodata nu are voie
      // sa blocheze verificarea
      await Promise.race([
        Promise.all([...document.images]
          .filter((im) => !im.complete)
          .map((im) => new Promise((res) => { im.onload = im.onerror = res; }))),
        new Promise((res) => setTimeout(res, 2500)),
      ]);
    });

    const raport = await page.evaluate(() => {
      const out = { overflow: null, sub_header: [], imagini_fara_alt: 0, imagini_fara_dim: 0 };
      const de = document.documentElement;
      if (de.scrollWidth > window.innerWidth + 1) {
        const vinovati = [...document.querySelectorAll('*')]
          .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
          .slice(0, 3)
          .map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''));
        out.overflow = { scrollWidth: de.scrollWidth, innerWidth: window.innerWidth, vinovati };
      }
      // continut ascuns sub header-ul fix
      const header = document.querySelector('header');
      if (header) {
        const hb = header.getBoundingClientRect();
        const main = document.getElementById('continut');
        if (main) {
          for (const el of main.querySelectorAll('h1, h2, button, a.rounded-\\[10px\\]')) {
            const r = el.getBoundingClientRect();
            if (r.height > 0 && r.top < hb.bottom - 2 && r.bottom > hb.top + 2) {
              out.sub_header.push(el.tagName.toLowerCase() + ': ' + (el.textContent || '').trim().slice(0, 30));
            }
          }
        }
      }
      for (const img of document.querySelectorAll('img')) {
        if (!img.hasAttribute('alt')) out.imagini_fara_alt++;
        if (!img.getAttribute('width') && !img.style.aspectRatio && !getComputedStyle(img).aspectRatio) out.imagini_fara_dim++;
      }
      return out;
    });

    if (raport.overflow) probleme.push({ ecran: numeEcran, pagina: nume, tip: 'scroll orizontal', detaliu: raport.overflow });
    if (raport.sub_header.length) probleme.push({ ecran: numeEcran, pagina: nume, tip: 'sub header', detaliu: raport.sub_header });
    if (raport.imagini_fara_alt) probleme.push({ ecran: numeEcran, pagina: nume, tip: 'img fara alt', detaliu: raport.imagini_fara_alt });

    await page.screenshot({ path: `${IESIRE}/${numeEcran}-${nume}.jpg`, type: 'jpeg', quality: 72, fullPage: numeEcran === 'desktop' });
  }
  if (erori.length) probleme.push({ ecran: numeEcran, pagina: '(oricare)', tip: 'erori consola', detaliu: [...new Set(erori)].slice(0, 5) });
  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${IESIRE}/raport.json`, JSON.stringify(probleme, null, 2));
if (!probleme.length) console.log('Fara probleme la scroll orizontal, suprapunere cu header-ul, alt lipsa sau erori de consola.');
else {
  console.log(`${probleme.length} probleme:\n`);
  for (const p of probleme) console.log(`  [${p.ecran}] ${p.pagina} — ${p.tip}: ${JSON.stringify(p.detaliu)}`);
}
