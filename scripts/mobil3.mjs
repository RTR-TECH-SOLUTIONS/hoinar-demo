import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.waitForTimeout(900);
await p.locator('[data-meniu-mobil]').click();
await p.waitForTimeout(500);
const info = await p.evaluate(() => {
  const m = document.getElementById('meniu-mobil');
  const r = m.getBoundingClientRect();
  return { ascuns: m.hidden, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight };
});
console.log('meniu:', JSON.stringify(info));
await p.screenshot({ path: '/tmp/m3-meniu.png' });
await p.locator('summary', { hasText: 'Hamuri' }).click();
await p.waitForTimeout(500);
await p.screenshot({ path: '/tmp/m3-meniu2.png' });
await b.close();
