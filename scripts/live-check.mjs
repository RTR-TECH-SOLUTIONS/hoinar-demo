import { chromium } from 'playwright';
const BAZA = 'https://rtr-tech-solutions.github.io/hoinar-demo';
const PAGINI = ['/', '/colectii', '/produs/ham-carou-bruma', '/reduceri', '/cos', '/cont', '/favorite', '/en/'];
const b = await chromium.launch();
const rezultate = [];
for (const [nume, w, h] of [['mobil', 390, 844], ['desktop', 1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const rele = [];
  p.on('response', (r) => { if (r.status() >= 400) rele.push(`${r.status()} ${r.url().replace(BAZA, '')}`); });
  for (const cale of PAGINI) {
    await p.goto(BAZA + cale, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { const H = document.body.scrollHeight;
      for (let y = 0; y < H; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 140)); } });
    await p.waitForTimeout(900);
  }
  rezultate.push([nume, rele]);
  await ctx.close();
}
await b.close();
for (const [nume, rele] of rezultate) {
  console.log(`${nume}: ${rele.length ? [...new Set(rele)].join(' | ') : 'toate resursele au raspuns 200'}`);
}
