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
await page.getByRole('link', { name: /^(EN|English)$/ }).first().click();
await page.waitForLoadState('networkidle');
verifica(
  'EN duce la acelasi produs',
  /\/en\/produs\/ham-carou-bruma\/?$/.test(page.url()),
  page.url(),
);

// ---------- 9. cautarea ----------
await page.goto(`${BAZA}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
// cautarea sta in spatele iconitei, ca la referinta
await page.locator('[data-cauta-comuta]').click();
await page.waitForTimeout(400);
verifica('iconita deschide panoul de cautare', await page.getByPlaceholder(/Caut/).first().isVisible());
await page.getByPlaceholder(/Caut/).first().fill('bandana carou');
await page.waitForTimeout(400);
const sugestii = page.locator('#cauta').locator('xpath=../..').locator('a[href*="/produs/"]');
const nrSugestii = await sugestii.count();
verifica('cautarea gaseste produsul fara diacritice', nrSugestii > 0, `${nrSugestii} sugestii`);
if (nrSugestii > 0) {
  const primaCale = await sugestii.first().getAttribute('href');
  verifica('prima sugestie e bandana carou', String(primaCale).includes('bandana-carou-bruma'), String(primaCale));
}
await page.getByPlaceholder(/Caut/).first().fill('xyzq');
await page.waitForTimeout(300);
verifica('cautarea spune cand nu gaseste nimic', (await page.getByText(/Nimic gasit|Nimic găsit/).count()) > 0);

// ---------- 10. favorite ----------
await page.evaluate(() => localStorage.removeItem('hoinar-favorite'));
await page.goto(`${BAZA}/produs/lesa-dungi-sinaia`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.getByRole('button', { name: /Salveaz/ }).click();
await page.waitForTimeout(300);
verifica('inima salveaza produsul', (await page.getByRole('button', { name: /Salvat la favorite/ }).count()) > 0);
await page.goto(`${BAZA}/favorite`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
verifica(
  'pagina de favorite arata produsul salvat',
  (await page.locator('main a[href*="lesa-dungi-sinaia"]').count()) > 0,
);
await page.locator('main button', { hasText: /Șterge|Sterge/ }).first().click();
await page.waitForTimeout(300);
verifica('se poate scoate din favorite', (await page.locator('main a[href*="lesa-dungi-sinaia"]').count()) === 0);

// ---------- 11. mega-meniu ----------
await page.goto(`${BAZA}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.hover('[data-mega="hamuri"]');
await page.waitForTimeout(500);
const panouHamuri = page.locator('[data-panou="hamuri"]');
verifica('meniul Hamuri se deschide', await panouHamuri.isVisible());
verifica('panoul are cinci coloane', (await panouHamuri.locator('> div > div').count()) === 5);
const latPanou = await panouHamuri.evaluate((el) => ({ x: el.getBoundingClientRect().left, w: el.getBoundingClientRect().width, vw: window.innerWidth }));
verifica('panoul nu iese din ecran', latPanou.x >= 0 && latPanou.w <= latPanou.vw + 1, JSON.stringify(latPanou));
await page.hover('[data-mega="lese"]');
await page.waitForTimeout(500);
verifica('trecerea pe alt meniu comuta panoul',
  (await page.locator('[data-panou="lese"]').isVisible()) && !(await panouHamuri.isVisible()));

// ---------- 12. filtre din URL ----------
await page.goto(`${BAZA}/categorie/ham?colectie=dungi-sinaia`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const textFiltrat = await page.locator('main').innerText();
const nrCarduri = await page.locator('main a[href*="/produs/"]').count();
verifica('linkul din meniu aplica filtrul de tesatura', nrCarduri === 1 && /Dungi Sinaia/.test(textFiltrat), `${nrCarduri} carduri`);

await page.goto(`${BAZA}/categorie/ham?marime=XXL`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
verifica('filtrul de marime din URL se aplica',
  /0 produse/.test(await page.locator('main').innerText()), 'ham reglabil nu are XXL');

// ---------- 13. galeria de produs ----------
await page.goto(`${BAZA}/produs/ham-carou-bruma`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const dimGalerie = await page.evaluate(() => {
  const im = document.querySelector('[data-principala]');
  const r = im.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height), articol: Math.round(document.querySelector('article').getBoundingClientRect().height) };
});
verifica('imaginea principala are dimensiune rezonabila', dimGalerie.h > 300 && dimGalerie.h < 700, JSON.stringify(dimGalerie));
const miniaturi = await page.locator('article button img').count();
verifica('galeria are exact cate o miniatura per imagine', miniaturi === 3, `${miniaturi} miniaturi`);
const inainte = await page.locator('[data-principala]').getAttribute('src');
await page.locator('article button img').nth(1).click();
await page.waitForTimeout(300);
const dupa = await page.locator('[data-principala]').getAttribute('src');
verifica('miniatura schimba imaginea principala', inainte !== dupa, `${String(inainte).split('/').pop()} -> ${String(dupa).split('/').pop()}`);

// ---------- 14. pagina de categorie ----------
await page.goto(`${BAZA}/categorie/ham`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const coloane = await page.evaluate(() => {
  const grila = [...document.querySelectorAll('main div')].find((d) => getComputedStyle(d).display === 'grid' && d.querySelectorAll('article').length > 2);
  return grila ? getComputedStyle(grila).gridTemplateColumns.split(' ').length : 0;
});
verifica('grila de categorie are patru coloane', coloane === 4, `${coloane} coloane`);
const panou = page.locator('#panou-filtre');
verifica('panoul de filtre e inchis la inceput', await panou.isHidden());
await page.getByRole('button', { name: /Filtreaz/ }).click();
await page.waitForTimeout(300);
verifica('butonul Filtreaza deschide panoul', await panou.isVisible());

verifica('fara erori JavaScript', eroriConsola.length === 0, eroriConsola.slice(0, 3).join(' | '));

await browser.close();

const picate = rezultate.filter((r) => !r.ok);
for (const r of rezultate) {
  console.log(`${r.ok ? '  OK  ' : ' PICA '} ${r.nume}${r.detaliu ? '  ·  ' + r.detaliu : ''}`);
}
console.log(`\n${rezultate.length - picate.length}/${rezultate.length} au trecut`);
process.exit(picate.length ? 1 : 0);
