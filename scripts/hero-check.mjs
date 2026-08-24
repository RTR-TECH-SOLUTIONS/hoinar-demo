import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
const boxes = await p.evaluate(() => {
  const q = (s) => { const e = document.querySelector(s); if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x0: Math.round(r.left), y0: Math.round(r.top), x1: Math.round(r.right), y1: Math.round(r.bottom), fs: getComputedStyle(e).fontSize }; };
  return { h1: q('section h1'), p: q('section h1 + p'), badge: q('section a[href="/reduceri"]') };
});
console.log(JSON.stringify(boxes));
await p.screenshot({ path: '/tmp/hero-nou.png' });
await b.close();
