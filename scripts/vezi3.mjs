import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
const pregat = async () => {
  await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
  await p.evaluate(async () => { const H = document.body.scrollHeight;
    for (let y=0;y<H;y+=400){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,110));} window.scrollTo(0,0); });
  await p.waitForTimeout(1600);
};
await p.goto('http://localhost:4390/produs/ham-carou-bruma', { waitUntil: 'networkidle' }); await pregat();
await p.screenshot({ path: '/tmp/n-pdp.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } });
await p.goto('http://localhost:4390/categorie/ham', { waitUntil: 'networkidle' }); await pregat();
await p.screenshot({ path: '/tmp/n-cat.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } });
await p.goto('http://localhost:4390/colectii', { waitUntil: 'networkidle' }); await pregat();
await p.screenshot({ path: '/tmp/n-toate.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } });
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' }); await pregat();
for (const s of await p.$$('section')) {
  if ((await s.getAttribute('aria-label')) === 'Categorii') {
    await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
    await p.screenshot({ path: '/tmp/n-strip.png', clip: { x: 0, y: 200, width: 1440, height: 420 } });
  }
}
await b.close();
