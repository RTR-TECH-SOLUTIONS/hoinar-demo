import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
const sus = await p.evaluate(() => {
  const h = document.querySelector('header');
  return { header: Math.round(h.getBoundingClientRect().height), top: Math.round(h.getBoundingClientRect().top) };
});
console.log('header desfasurat:', JSON.stringify(sus));
await p.screenshot({ path: '/tmp/hdr-sus.png', clip: { x: 0, y: 0, width: 1440, height: 340 } });
await p.evaluate(() => window.scrollTo(0, 600));
await p.waitForTimeout(600);
const jos = await p.evaluate(() => {
  const h = document.querySelector('header');
  return { header: Math.round(h.getBoundingClientRect().height), strans: h.dataset.strans };
});
console.log('header strans:', JSON.stringify(jos));
await p.screenshot({ path: '/tmp/hdr-jos.png', clip: { x: 0, y: 0, width: 1440, height: 200 } });
await b.close();
