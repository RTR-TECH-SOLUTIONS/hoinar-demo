import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
for (const cale of ['/collections/harnesses', '/collections/dog-harness', '/collections/all', '/collections/bestsellers']) {
  const r = await p.goto('https://cocopuplondon.com' + cale, { waitUntil: 'domcontentloaded' }).catch(() => null);
  await p.waitForTimeout(3500);
  const h1 = await p.evaluate(() => document.querySelector('h1')?.innerText?.trim());
  console.log(cale, '->', p.url().replace('https://cocopuplondon.com',''), '| h1:', h1);
  if (h1 && !/COCOPUP LONDON/i.test(h1)) {
    for (const sel of ['button:has-text("Got it")', 'button[aria-label*="lose" i]']) {
      try { const el = await p.$(sel); if (el) await el.click({ timeout: 600 }); } catch {}
    }
    await p.evaluate(async () => { for (let y=0;y<1600;y+=350){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,140));} window.scrollTo(0,0); });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: '/tmp/ref-cat.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } });
    const info = await p.evaluate(() => {
      const im = [...document.querySelectorAll('img')].map((x)=>({w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)})).filter(x=>x.w>150).slice(0,4);
      return { imagini: im, text: document.body.innerText.replace(/\s+/g,' ').slice(0,300) };
    });
    console.log(JSON.stringify(info, null, 1));
    break;
  }
}
await b.close();
