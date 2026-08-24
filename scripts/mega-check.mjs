import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.waitForTimeout(900);
await p.hover('[data-mega]');
await p.waitForTimeout(700);
const info = await p.evaluate(() => {
  const m = document.querySelector('.mega');
  const r = m.getBoundingClientRect();
  return { vizibil: getComputedStyle(m).visibility, x: Math.round(r.left), lat: Math.round(r.width), sw: document.documentElement.scrollWidth };
});
console.log('mega:', JSON.stringify(info));
await p.screenshot({ path: '/tmp/mega.png', clip: { x: 0, y: 0, width: 1440, height: 470 } });
await b.close();
