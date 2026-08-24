import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 950 } })).newPage();
const pregat = async () => {
  await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
  await p.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<H;y+=400){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,100));} window.scrollTo(0,0); });
  await p.waitForTimeout(1600);
};
await p.goto('http://localhost:4390/cont', { waitUntil: 'networkidle' }); await pregat();
await p.screenshot({ path: '/tmp/z-cont.png', clip: { x: 0, y: 140, width: 1440, height: 760 } });
await p.goto('http://localhost:4390/favorite', { waitUntil: 'networkidle' }); await pregat();
await p.screenshot({ path: '/tmp/z-fav.png', clip: { x: 0, y: 140, width: 1440, height: 660 } });
await p.goto('http://localhost:4390/cos', { waitUntil: 'networkidle' }); await pregat();
await p.screenshot({ path: '/tmp/z-cos.png', clip: { x: 0, y: 140, width: 1440, height: 660 } });
// banner
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' }); await pregat();
for (const s of await p.$$('section')) {
  if ((await s.innerText()).includes('Patru țesături')) {
    await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
    await s.screenshot({ path: '/tmp/z-banner.png' }); break;
  }
}
// meniu
await p.hover('[data-mega="lese"]'); await p.waitForTimeout(800);
await p.screenshot({ path: '/tmp/z-meniu.png', clip: { x: 0, y: 0, width: 1440, height: 640 } });
await b.close();
