import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await p.goto('http://localhost:4390/produs/ham-buline-cacao', { waitUntil: 'networkidle' });
await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
await p.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<H;y+=400){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,100));} });
await p.waitForTimeout(1500);
const sec = p.locator('section', { hasText: 'Fă-ți setul' }).last();
await sec.scrollIntoViewIfNeeded();
await p.waitForTimeout(800);
await sec.screenshot({ path: '/tmp/s1.png' });
// cu mai multe piese alese
const butoane = sec.getByRole('button', { name: /^Adaugă:/ });
const n = await butoane.count();
for (let i = 0; i < Math.min(3, n); i++) { await butoane.first().click(); await p.waitForTimeout(220); }
await p.waitForTimeout(500);
await sec.screenshot({ path: '/tmp/s2.png' });
const info = await sec.evaluate((el) => ({ h: Math.round(el.getBoundingClientRect().height) }));
console.log('inaltime sectiune:', JSON.stringify(info));
await b.close();
