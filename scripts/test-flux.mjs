import { chromium } from 'playwright';

const BAZA = process.env.BAZA ?? 'http://localhost:4380';
const rezultate = [];
const verifica = (nume, conditie, detaliu = '') =>
  rezultate.push({ nume, ok: !!conditie, detaliu });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const eroriConsola = [];
page.on('pageerror', (e) => eroriConsola.push(String(e)));

// ---------- 1. adaugare in cos de pe pagina de produs ----------
await page.goto(`${BAZA}/produs/ham-carou-bruma`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'M', exact: true }).click();
await page.getByRole('button', { name: 'Adaugă în coș' }).click();
await page.waitForTimeout(500);

const drawer = page.getByRole('dialog', { name: 'Coșul tău' });
verifica('drawerul se deschide dupa adaugare', await drawer.isVisible());
verifica('coșul arata 1 produs', (await page.getByRole('button', { name: /Coș \(1\)/ }).count()) > 0);
verifica('linia din cos are marimea M', (await drawer.getByText('M', { exact: true }).count()) > 0);

// ---------- 2. persistenta ----------
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const dupaReload = await page.evaluate(() => JSON.parse(localStorage.getItem('hoinar-cos') || '[]'));
verifica('coșul supravietuieste la refresh', dupaReload.length === 1, JSON.stringify(dupaReload[0]?.slug));

// ---------- 3. bara de transport gratuit ----------
await page.evaluate(() => localStorage.setItem('hoinar-cos', '[]'));
await page.goto(`${BAZA}/produs/set-carou-bruma`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'M', exact: true }).click();
await page.getByRole('button', { name: 'Adaugă în coș' }).click();
await page.waitForTimeout(400);
const textPrag = await page.getByRole('dialog').innerText();
verifica('setul de 339 lei declanseaza transport gratuit', /transport gratuit/i.test(textPrag), textPrag.split('\n')[1]);

// ---------- 4. constructorul de set ----------
await page.evaluate(() => localStorage.setItem('hoinar-cos', '[]'));
await page.goto(`${BAZA}/produs/ham-carou-bruma`, { waitUntil: 'networkidle' });
await page.getByRole('heading', { name: 'Fă-ți setul' }).scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const set = page.locator('section', { hasText: 'Fă-ți setul' }).last();
// bifam doua piese care NU sunt deja preselectate, ca sa ajungem la 3
{
  const boxuri = set.locator('input[type=checkbox]');
  const total = await boxuri.count();
  let adaugate = 0;
  for (let i = 0; i < total && adaugate < 2; i++) {
    const b = boxuri.nth(i);
    if (!(await b.isChecked())) { await b.check(); adaugate++; }
  }
}
await page.waitForTimeout(200);
const textSet = await set.innerText();
verifica('constructorul arata economia la 3 piese', /Economisești/.test(textSet) && /10%/.test(textSet), textSet.match(/Economisești[^\n]*/)?.[0]);
const totalAfisat = Number(await set.locator('[data-total-ron]').getAttribute('data-total-ron'));
await set.getByRole('button', { name: 'Adaugă setul în coș' }).click();
await page.waitForTimeout(500);
const liniiSet = await page.evaluate(() => JSON.parse(localStorage.getItem('hoinar-cos') || '[]'));
verifica('constructorul adauga 3 linii', liniiSet.length === 3, `${liniiSet.length} linii`);
const totalSet = liniiSet.reduce((s, l) => s + l.pretRon * l.cantitate, 0);
// invariantul care conteaza: ce arata constructorul e exact ce ajunge in cos
verifica(
  'totalul din constructor ajunge identic in cos',
  Math.abs(totalSet - totalAfisat) <= liniiSet.length,
  `cos ${totalSet} lei / afisat ${totalAfisat} lei`,
);

// ---------- 5. checkout ----------
await page.goto(`${BAZA}/cos`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const campuri = {
  'Nume și prenume': 'Mario Rotaru',
  Email: 'mario@exemplu.ro',
  Telefon: '0721000000',
  'Stradă și număr': 'Str. Icoanei 42',
  Oraș: 'București',
  Județ: 'București',
  'Cod poștal': '020451',
};
// validare: incearca sa continui gol
await page.getByRole('button', { name: 'Continuă' }).click();
await page.waitForTimeout(200);
verifica('validarea opreste formularul gol', (await page.getByText('Completează câmpul.').count()) > 0);

for (const [eticheta, val] of Object.entries(campuri)) {
  await page.getByLabel(eticheta, { exact: true }).fill(val);
}
await page.getByRole('button', { name: 'Continuă' }).click();
await page.waitForTimeout(300);
verifica('pasul 2 arata curierii', (await page.getByText('Sameday easybox').count()) > 0);
await page.getByRole('button', { name: 'Continuă' }).click();
await page.waitForTimeout(300);
verifica('pasul 3 arata rambursul', (await page.getByText('Ramburs la livrare').count()) > 0);
await page.getByRole('button', { name: 'Trimite comanda' }).click();
await page.waitForTimeout(500);
const textFinal = await page.locator('main').innerText();
verifica('confirmarea arata numarul de comanda', /HN-\d{5}/.test(textFinal), textFinal.match(/HN-\d{5}/)?.[0]);
const cosDupa = await page.evaluate(() => JSON.parse(localStorage.getItem('hoinar-cos') || '[]'));
verifica('coșul se goleste dupa comanda', cosDupa.length === 0);

// ---------- 6. ghidul de marimi ----------
await page.goto(`${BAZA}/ghid-marimi`, { waitUntil: 'networkidle' });
await page.getByLabel('Circumferința gâtului (cm)').fill('38');
await page.getByLabel('Circumferința pieptului (cm)').fill('55');
await page.getByRole('button', { name: 'Află mărimea' }).click();
await page.waitForTimeout(200);
const ghid = await page.getByRole('status').innerText();
verifica('ghidul recomanda M pentru 38/55', /\bM\b/.test(ghid), ghid.replace(/\n/g, ' '));
await page.getByLabel('Circumferința gâtului (cm)').fill('80');
await page.getByLabel('Circumferința pieptului (cm)').fill('120');
await page.getByRole('button', { name: 'Află mărimea' }).click();
await page.waitForTimeout(200);
verifica('ghidul semnaleaza masurile peste tabel', /Peste mărimile noastre/.test(await page.getByRole('status').innerText()));

// ---------- 7. moneda ----------
await page.goto(`${BAZA}/produs/ham-carou-bruma`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.locator('select').first().selectOption('EUR');
await page.waitForTimeout(300);
await page.getByRole('button', { name: 'M', exact: true }).click();
await page.getByRole('button', { name: 'Adaugă în coș' }).click();
await page.waitForTimeout(400);
const textDrawer = await page.getByRole('dialog').innerText();
verifica('coșul afiseaza euro dupa comutare', /€/.test(textDrawer), textDrawer.match(/[\d.,]+\s*€/)?.[0]);

// ---------- 8. comutarea de limba pastreaza pagina ----------
await page.goto(`${BAZA}/produs/ham-carou-bruma`, { waitUntil: 'networkidle' });
await page.getByRole('link', { name: 'EN', exact: true }).first().click();
await page.waitForLoadState('networkidle');
verifica('EN duce la acelasi produs', page.url().endsWith('/en/produs/ham-carou-bruma'), page.url());

verifica('fara erori JavaScript', eroriConsola.length === 0, eroriConsola.slice(0, 3).join(' | '));

await browser.close();

const picate = rezultate.filter((r) => !r.ok);
for (const r of rezultate) {
  console.log(`${r.ok ? '  OK  ' : ' PICA '} ${r.nume}${r.detaliu ? '  ·  ' + r.detaliu : ''}`);
}
console.log(`\n${rezultate.length - picate.length}/${rezultate.length} au trecut`);
process.exit(picate.length ? 1 : 0);
