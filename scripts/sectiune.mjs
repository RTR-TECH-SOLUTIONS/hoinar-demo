import { chromium } from 'playwright';
const [caleaPagina, textCautat, iesire] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(`http://localhost:4390${caleaPagina}`, { waitUntil: 'networkidle' });
await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
for (const s of await p.$$('section')) {
  if ((await s.innerText()).includes(textCautat)) {
    await s.scrollIntoViewIfNeeded();
    await p.waitForTimeout(1400);
    await s.screenshot({ path: iesire });
    console.log('capturat:', iesire);
    break;
  }
}
await b.close();
