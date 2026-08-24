import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const rupte = [];
p.on('response', (r) => { if (r.status() >= 400) rupte.push(`${r.status()} ${r.url()}`); });
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.evaluate(async () => { const H = document.body.scrollHeight;
  for (let y = 0; y < H; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } });
await p.waitForTimeout(1500);
const info = await p.evaluate(() => [...document.querySelectorAll('img')].map((im) => ({
  src: im.currentSrc.split('/').pop()?.slice(0, 34),
  natural: `${im.naturalWidth}x${im.naturalHeight}`,
  randat: `${Math.round(im.getBoundingClientRect().width)}x${Math.round(im.getBoundingClientRect().height)}`,
  complet: im.complete,
})).filter((x) => !x.complet || x.natural === '0x0'));
console.log('imagini nereusite:', JSON.stringify(info));
console.log('raspunsuri >=400:', rupte.length ? rupte.slice(0,5) : 'niciunul');
const el = await p.$('section:has(> img) >> nth=0');
const banner = await p.$$('section');
for (const s of banner) {
  const txt = (await s.innerText()).slice(0, 30);
  if (txt.includes('Patru') || txt.includes('Four')) {
    await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
    await s.screenshot({ path: '/tmp/banner.png' });
    console.log('banner capturat');
  }
}
await b.close();
