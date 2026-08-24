import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const p = await ctx.newPage();
const pregat = async () => {
  await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
  await p.evaluate(async () => { const H = document.body.scrollHeight;
    for (let y=0;y<H;y+=500){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,110));} window.scrollTo(0,0); });
  await p.waitForTimeout(1500);
};
const pagini = [['acasa','/'],['categorie','/colectii'],['produs','/produs/ham-carou-bruma'],['cos','/cos'],['cont','/cont']];
for (const [n, cale] of pagini) {
  await p.goto('http://localhost:4390'+cale, { waitUntil: 'networkidle' });
  await pregat();
  await p.screenshot({ path: `/tmp/m-${n}.png` });
}
// meniul deschis
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.waitForTimeout(900);
await p.locator('[data-meniu-mobil]').click();
await p.waitForTimeout(600);
await p.screenshot({ path: '/tmp/m-meniu.png' });
const info = await p.evaluate(() => {
  const b = document.querySelector('[data-meniu-mobil]');
  const m = document.getElementById('meniu-mobil');
  return { butonVizibil: !!b && b.getBoundingClientRect().width > 0, meniuDeschis: m && !m.hidden,
           inaltimeMeniu: m ? Math.round(m.getBoundingClientRect().height) : 0,
           bodyBlocat: document.body.style.overflow };
});
console.log(JSON.stringify(info));
await b.close();
