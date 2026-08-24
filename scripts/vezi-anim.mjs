import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

// cont: filele si starea butonului
await p.goto('http://localhost:4390/cont', { waitUntil: 'networkidle' });
await p.waitForTimeout(1100);
await p.screenshot({ path: '/tmp/a-cont1.png', clip: { x: 0, y: 200, width: 1280, height: 560 } });
await p.getByRole('button', { name: 'Cont nou' }).click();
await p.waitForTimeout(700);
await p.screenshot({ path: '/tmp/a-cont2.png', clip: { x: 0, y: 200, width: 1280, height: 560 } });

// cos cu produse
await p.goto('http://localhost:4390/produs/ham-carou-bruma', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
await p.getByRole('button', { name: 'M', exact: true }).click();
await p.getByRole('button', { name: 'Adaugă în coș' }).first().click();
await p.waitForTimeout(500);
await p.goto('http://localhost:4390/produs/lesa-dungi-sinaia', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
await p.getByRole('button', { name: '180 cm', exact: true }).click();
await p.getByRole('button', { name: 'Adaugă în coș' }).first().click();
await p.waitForTimeout(500);
await p.goto('http://localhost:4390/cos', { waitUntil: 'networkidle' });
await p.waitForTimeout(1400);
await p.screenshot({ path: '/tmp/a-cos.png', clip: { x: 0, y: 180, width: 1280, height: 620 } });

// favorite
await p.goto('http://localhost:4390/produs/geanta-carou-bruma', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
await p.getByRole('button', { name: /Salveaz/ }).click();
await p.waitForTimeout(300);
await p.goto('http://localhost:4390/produs/zgarda-dungi-sinaia', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
await p.getByRole('button', { name: /Salveaz/ }).click();
await p.waitForTimeout(400);
await p.goto('http://localhost:4390/favorite', { waitUntil: 'networkidle' });
await p.waitForTimeout(1400);
await p.screenshot({ path: '/tmp/a-fav.png', clip: { x: 0, y: 180, width: 1280, height: 620 } });
await b.close();
