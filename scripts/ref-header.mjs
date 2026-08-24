import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
await p.goto('https://cocopuplondon.com/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(4000);
// inchide ce popup-uri apar
for (const sel of ['button[aria-label*="lose" i]', '[class*="close" i]', 'button:has-text("Got it")']) {
  try { const el = await p.$(sel); if (el) { await el.click({ timeout: 800 }); await p.waitForTimeout(400); } } catch {}
}
await p.waitForTimeout(800);
await p.screenshot({ path: '/tmp/ref-top.png', clip: { x: 0, y: 0, width: 1440, height: 330 } });

const structura = await p.evaluate(() => {
  const h = document.querySelector('header') || document.querySelector('[class*="header"]');
  const linii = [];
  const walk = (el, adanc) => {
    if (adanc > 3 || !el) return;
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      if (r.height < 8 || r.width < 100) continue;
      const txt = (c.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      linii.push(`${'  '.repeat(adanc)}<${c.tagName.toLowerCase()}> h=${Math.round(r.height)} y=${Math.round(r.top)} :: ${txt}`);
      walk(c, adanc + 1);
    }
  };
  walk(h, 0);
  const nav = [...document.querySelectorAll('nav a, header a')]
    .map((a) => (a.innerText || '').replace(/\s+/g, ' ').trim())
    .filter((t) => t && t.length < 30);
  return { linii: linii.slice(0, 26), nav: [...new Set(nav)].slice(0, 30), headerH: h?.getBoundingClientRect().height };
});
console.log('inaltime header:', Math.round(structura.headerH));
console.log('\n--- structura ---');
console.log(structura.linii.join('\n'));
console.log('\n--- linkuri ---');
console.log(structura.nav.join(' | '));
await b.close();
