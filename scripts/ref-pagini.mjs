import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();

async function inchidePopup() {
  for (const sel of ['button[aria-label*="lose" i]', 'button:has-text("Got it")', '[id*="close" i]']) {
    try { const el = await p.$(sel); if (el) { await el.click({ timeout: 700 }); await p.waitForTimeout(300); } } catch {}
  }
}

console.log('=== PDP referinta ===');
await p.goto('https://cocopuplondon.com/products/explore-harness-pup-plaid', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(5000); await inchidePopup(); await p.waitForTimeout(800);
const pdp = await p.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')]
    .map((im) => ({ w: Math.round(im.getBoundingClientRect().width), h: Math.round(im.getBoundingClientRect().height), src: im.currentSrc.split('/').pop()?.slice(0,26) }))
    .filter((x) => x.w > 120).slice(0, 8);
  return { imgs, inaltimePagina: document.body.scrollHeight, ecran: innerWidth };
});
console.log(JSON.stringify(pdp, null, 1));
await p.screenshot({ path: '/tmp/ref-pdp.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } });

console.log('\n=== CATEGORIE referinta ===');
await p.goto('https://cocopuplondon.com/collections/dog-harnesses', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(5000); await inchidePopup();
await p.evaluate(async () => { for (let y=0;y<2200;y+=400){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,150));} window.scrollTo(0,0); });
await p.waitForTimeout(1500);
const cat = await p.evaluate(() => {
  const carduri = [...document.querySelectorAll('[class*="product"], li')].filter((el) => el.querySelector('img') && el.querySelector('a'));
  const prim = carduri.find((c) => c.getBoundingClientRect().width > 150);
  const r = prim?.getBoundingClientRect();
  return {
    cardLatime: r ? Math.round(r.width) : null,
    cardInaltime: r ? Math.round(r.height) : null,
    titlu: document.querySelector('h1')?.innerText?.slice(0, 40),
    textSus: document.body.innerText.replace(/\s+/g,' ').slice(0, 420),
  };
});
console.log(JSON.stringify(cat, null, 1));
await p.screenshot({ path: '/tmp/ref-cat.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } });
await b.close();
