import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto('http://localhost:4390/produs/ham-buline-cacao', { waitUntil: 'networkidle' });
await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
await p.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<H;y+=400){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,90));} });
await p.waitForTimeout(1400);
const sec = p.locator('section', { hasText: 'Fă-ți setul' }).last();
const bt = sec.getByRole('button', { name: /^Adaugă:/ });
for (let i = 0; i < 2; i++) { await bt.first().click(); await p.waitForTimeout(200); }
await sec.scrollIntoViewIfNeeded();
await p.waitForTimeout(700);
await sec.screenshot({ path: '/tmp/set-mob.png' });
await b.close();
