import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await p.goto('http://localhost:4390/produs/ham-buline-cacao', { waitUntil: 'networkidle' });
await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
await p.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<H;y+=400){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,90));} window.scrollTo(0,0); });
await p.waitForTimeout(1800);
const info = await p.evaluate(() => ({
  inaltime: document.body.scrollHeight,
  sectiuni: [...document.querySelectorAll('h2')].map((h) => h.textContent?.trim()).filter(Boolean),
  carduriTotal: document.querySelectorAll('article').length,
}));
console.log(JSON.stringify(info, null, 1));
// culoarea, langa marimi
await p.screenshot({ path: '/tmp/p-culoare.png', clip: { x: 700, y: 200, width: 740, height: 620 } });
// blocurile de jos
for (const [nume, text] of [['variante','Același model'], ['tesatura','Din aceeași'], ['recom','Se cumpără des']]) {
  for (const s of await p.$$('section')) {
    if ((await s.innerText()).includes(text)) {
      await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
      await s.screenshot({ path: `/tmp/p-${nume}.png` }); break;
    }
  }
}
await b.close();
