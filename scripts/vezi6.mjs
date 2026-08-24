import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 980 } })).newPage();
const pregat = async () => {
  await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
  await p.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<H;y+=400){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,100));} window.scrollTo(0,0); });
  await p.waitForTimeout(1700);
};
// banner nou pe home
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' }); await pregat();
for (const s of await p.$$('section')) {
  if ((await s.innerText()).includes('Patru țesături')) {
    await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
    await s.screenshot({ path: '/tmp/w-trio.png' }); break;
  }
}
// pdp: acordeoanele sub poza
await p.goto('http://localhost:4390/produs/ham-buline-cacao', { waitUntil: 'networkidle' }); await pregat();
await p.evaluate(() => window.scrollTo(0, 500));
await p.waitForTimeout(700);
await p.screenshot({ path: '/tmp/w-pdp.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
// cont
await p.goto('http://localhost:4390/cont', { waitUntil: 'networkidle' }); await pregat();
await p.evaluate(() => window.scrollTo(0, 700));
await p.waitForTimeout(900);
await p.screenshot({ path: '/tmp/w-cont.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
// favorite gol
await p.goto('http://localhost:4390/favorite', { waitUntil: 'networkidle' }); await pregat();
await p.screenshot({ path: '/tmp/w-fav.png', clip: { x: 0, y: 130, width: 1440, height: 850 } });
await b.close();
