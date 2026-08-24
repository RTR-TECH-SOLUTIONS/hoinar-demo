import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
// meniu deschis
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
await p.locator('[data-meniu-mobil]').click();
await p.waitForTimeout(500);
await p.locator('summary', { hasText: 'Hamuri' }).click();
await p.waitForTimeout(400);
await p.screenshot({ path: '/tmp/m2-meniu.png' });
// pagina de produs cu bara fixa
await p.goto('http://localhost:4390/produs/ham-carou-bruma', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
await p.evaluate(() => window.scrollTo(0, 1400));
await p.waitForTimeout(800);
const bara = await p.evaluate(() => {
  const el = [...document.querySelectorAll('div')].find((d) => d.className.includes('fixed inset-x-0 bottom-0') && d.textContent?.includes('Adaugă'));
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { vizibila: r.top < window.innerHeight - 10, top: Math.round(r.top), h: Math.round(r.height) };
});
console.log('bara fixa:', JSON.stringify(bara));
await p.screenshot({ path: '/tmp/m2-bara.png' });
// cos cu produse
await p.goto('http://localhost:4390/produs/lesa-carou-bruma', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
await p.getByRole('button', { name: '180 cm', exact: true }).click();
await p.getByRole('button', { name: 'Adaugă în coș' }).first().click();
await p.waitForTimeout(600);
await p.goto('http://localhost:4390/cos', { waitUntil: 'networkidle' });
await p.waitForTimeout(900);
await p.screenshot({ path: '/tmp/m2-cos.png' });
await b.close();
