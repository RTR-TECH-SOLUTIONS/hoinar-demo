import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:4390/', { waitUntil: 'networkidle' });
await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
await p.waitForTimeout(1500);
for (const s of await p.$$('section')) {
  const al = await s.getAttribute('aria-label');
  if (al === 'Categorii') {
    await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
    await s.screenshot({ path: '/tmp/strip.png' });
    console.log('strip capturat, inaltime', (await s.boundingBox()).height);
  }
}
await b.close();
