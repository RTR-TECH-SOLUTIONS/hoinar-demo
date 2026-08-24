import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:4390/produs/geanta-canepa-naturala', { waitUntil: 'networkidle' });
await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
await p.evaluate(async () => { const H = document.body.scrollHeight;
  for (let y = 0; y < H; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 110)); }
  window.scrollTo(0, 0); });
await p.waitForTimeout(1800);
await p.screenshot({ path: '/tmp/pdp1.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
const set = await p.$('section:has(h2)');
for (const s of await p.$$('section')) {
  if ((await s.innerText()).includes('Fă-ți setul')) {
    await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
    await s.screenshot({ path: '/tmp/pdp2.png' }); break;
  }
}
await b.close();
