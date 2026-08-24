import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
const pregat = async () => {
  await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
  await p.evaluate(async () => { const H = document.body.scrollHeight;
    for (let y=0;y<H;y+=400){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,110));} window.scrollTo(0,0); });
  await p.waitForTimeout(1800);
};
await p.goto('http://localhost:4390/colectii', { waitUntil: 'networkidle' }); await pregat();
await p.screenshot({ path: '/tmp/v-cat.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } });
await p.goto('http://localhost:4390/produs/ham-canepa-naturala', { waitUntil: 'networkidle' }); await pregat();
for (const s of await p.$$('section')) {
  if ((await s.innerText()).includes('Fă-ți setul')) {
    await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(1000);
    await s.screenshot({ path: '/tmp/v-set.png' }); break;
  }
}
await b.close();
