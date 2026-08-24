import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 950 } })).newPage();
for (const slug of ['ham-carou-bruma', 'lesa-dungi-sinaia', 'geanta-canepa-naturala']) {
  await p.goto(`http://localhost:4390/produs/${slug}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  await p.getByRole('button', { name: /Salveaz/ }).click();
  await p.waitForTimeout(250);
}
await p.goto('http://localhost:4390/favorite', { waitUntil: 'networkidle' });
await p.evaluate(() => { for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager'; });
await p.waitForTimeout(1600);
await p.screenshot({ path: '/tmp/y-fav.png', clip: { x: 0, y: 130, width: 1440, height: 800 } });
await b.close();
