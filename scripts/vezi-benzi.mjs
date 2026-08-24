import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.evaluate(async () => { const H = document.body.scrollHeight;
  for (let y = 0; y < H; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 110)); } });
await p.waitForTimeout(2500);
const secs = await p.$$('section');
let i = 0;
for (const s of secs) {
  const are = await s.evaluate((el) => !!el.querySelector('video'));
  if (!are) continue;
  await s.scrollIntoViewIfNeeded();
  await p.waitForTimeout(900);
  await s.screenshot({ path: `/tmp/banda-${i}.png` });
  console.log(`banda-${i}`, (await s.innerText()).replace(/\n/g, ' ').slice(0, 50));
  i++;
}
await b.close();
