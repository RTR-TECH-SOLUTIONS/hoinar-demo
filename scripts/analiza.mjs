import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

console.log('=== VIDEO: cat se taie ===');
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.evaluate(async () => { const H = document.body.scrollHeight;
  for (let y = 0; y < H; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
await p.waitForTimeout(2500);
const video = await p.evaluate(() => [...document.querySelectorAll('video')].map((v) => {
  const r = v.getBoundingClientRect();
  const arSursa = v.videoWidth / v.videoHeight;
  const arCutie = r.width / r.height;
  // object-fit: cover -> se taie pe axa in care sursa e "prea mare"
  const taiat = arSursa > arCutie
    ? { axa: 'lateral', procent: Math.round((1 - arCutie / arSursa) * 100) }
    : { axa: 'sus/jos', procent: Math.round((1 - arSursa / arCutie) * 100) };
  return {
    sursa: v.currentSrc.split('/').pop(),
    nativ: `${v.videoWidth}x${v.videoHeight}`,
    randat: `${Math.round(r.width)}x${Math.round(r.height)}`,
    arSursa: arSursa.toFixed(2), arCutie: arCutie.toFixed(2), taiat,
  };
}));
console.table(video);

console.log('\n=== PAGINA DE PRODUS: proportii ===');
await p.goto('http://localhost:4390/produs/geanta-canepa-naturala', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
const pdp = await p.evaluate(() => {
  const g = document.querySelectorAll('article img');
  const info = document.querySelector('article > div:last-child');
  const art = document.querySelector('article');
  return {
    inaltimeArticol: Math.round(art.getBoundingClientRect().height),
    inaltimePagina: document.body.scrollHeight,
    imagini: [...g].slice(0, 3).map((im) => {
      const r = im.getBoundingClientRect();
      return `${Math.round(r.width)}x${Math.round(r.height)}`;
    }),
    coloanaInfo: info ? Math.round(info.getBoundingClientRect().width) : null,
    ecran: `${window.innerWidth}x${window.innerHeight}`,
  };
});
console.log(JSON.stringify(pdp, null, 2));
await p.screenshot({ path: '/tmp/pdp-acum.png', fullPage: false });
await b.close();
