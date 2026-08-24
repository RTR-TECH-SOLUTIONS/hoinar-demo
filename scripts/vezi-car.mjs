import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await p.goto('http://localhost:4390/produs/zgarda-canepa-naturala', { waitUntil: 'networkidle' });
await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
await p.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<H;y+=400){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,90));} });
await p.waitForTimeout(1600);
const sec = p.locator('[data-carusel]').first();
await sec.scrollIntoViewIfNeeded();
await p.waitForTimeout(700);
await sec.screenshot({ path: '/tmp/c1.png' });
const st = await sec.evaluate((el) => {
  const pista = el.querySelector('[data-pista]');
  const inapoi = el.querySelector('[data-inapoi]');
  const inainte = el.querySelector('[data-inainte]');
  const sageti = el.querySelector('[data-sageti]');
  return { sagetiVizibile: !sageti.hidden, inapoiDezactivat: inapoi.disabled, inainteDezactivat: inainte.disabled,
           latimePista: Math.round(pista.getBoundingClientRect().width), scroll: pista.scrollWidth };
});
console.log('inainte de clic:', JSON.stringify(st));
await sec.locator('[data-inainte]').click();
await p.waitForTimeout(900);
const st2 = await sec.evaluate((el) => {
  const pista = el.querySelector('[data-pista]');
  return { scrollLeft: Math.round(pista.scrollLeft), inapoiDezactivat: el.querySelector('[data-inapoi]').disabled };
});
console.log('dupa clic:', JSON.stringify(st2));
await sec.screenshot({ path: '/tmp/c2.png' });
// navbarul nou
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(500);
await p.screenshot({ path: '/tmp/c-nav.png', clip: { x: 0, y: 0, width: 1440, height: 200 } });
await b.close();
