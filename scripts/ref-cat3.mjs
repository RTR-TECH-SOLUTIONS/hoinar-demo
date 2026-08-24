import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await p.goto('https://cocopuplondon.com/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(4000);
const linkuri = await p.evaluate(() => [...document.querySelectorAll('a[href*="/collections/"]')]
  .map((a) => a.getAttribute('href')).filter((h) => h && !h.includes('?')).slice(0, 12));
console.log('colectii gasite:', [...new Set(linkuri)].slice(0, 8));
const tinta = [...new Set(linkuri)].find((h) => /harness|robe|bag/i.test(h)) || linkuri[0];
if (tinta) {
  await p.goto('https://cocopuplondon.com' + tinta, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4500);
  for (const sel of ['button:has-text("Got it")', 'button[aria-label*="lose" i]']) {
    try { const el = await p.$(sel); if (el) await el.click({ timeout: 600 }); } catch {}
  }
  await p.evaluate(async () => { for (let y=0;y<1800;y+=350){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,150));} window.scrollTo(0,0); });
  await p.waitForTimeout(1500);
  console.log('capturat', tinta, '| h1:', await p.evaluate(() => document.querySelector('h1')?.innerText?.trim()));
  await p.screenshot({ path: '/tmp/ref-cat.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } });
}
await b.close();
