import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);
for (const slug of ['hamuri', 'lese']) {
  await p.hover(`[data-mega="${slug}"]`);
  await p.waitForTimeout(800);
  const info = await p.evaluate((s) => {
    const m = document.querySelector(`[data-panou="${s}"]`);
    const r = m.getBoundingClientRect();
    return { vizibil: getComputedStyle(m).visibility, x: Math.round(r.left), lat: Math.round(r.width), h: Math.round(r.height), sw: document.documentElement.scrollWidth };
  }, slug);
  console.log(slug, JSON.stringify(info));
  await p.screenshot({ path: `/tmp/meniu-${slug}.png`, clip: { x: 0, y: 0, width: 1440, height: Math.min(999, 210 + info.h) } });
}
// banda de categorii sub hero
await p.evaluate(() => window.scrollTo(0, document.querySelector('section:nth-of-type(2)')?.offsetTop ?? 700));
await p.waitForTimeout(900);
await p.screenshot({ path: '/tmp/strip.png', clip: { x: 0, y: 200, width: 1440, height: 260 } });
await b.close();
