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
// adaugam doua piese care NU sunt deja in set, ca sa ajungem la 3
{
  const butoane = set.getByRole('button', { name: /^Adaugă:/ });
  for (let i = 0; i < 2; i++) {
    await butoane.first().click();
    await page.waitForTimeout(250);
  }
}
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
await page.goto(`${BAZA}/finalizare`, { waitUntil: 'networkidle' });
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
// pe desktop bara de cautare e vizibila in centru; pe mobil sta sub iconita
verifica('cautarea e vizibila pe desktop', await page.getByPlaceholder(/Caut/).first().isVisible());
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
await page.getByRole('button', { name: /Șterge|Sterge/ }).first().click();
await page.waitForTimeout(500);
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

// ---------- 14. pagina de categorie: filtre laterale ----------
await page.goto(`${BAZA}/colectii`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const coloane = await page.evaluate(() => {
  // grila care contine DIRECT cardurile, nu invelisul cu bara laterala
  const art = document.querySelector('main article');
  const grila = art?.parentElement;
  return grila && getComputedStyle(grila).display === 'grid'
    ? getComputedStyle(grila).gridTemplateColumns.split(' ').length
    : 0;
});
verifica('grila are trei coloane pe desktop', coloane === 3, `${coloane} coloane`);
verifica('filtrele sunt vizibile lateral, fara clic', await page.locator('#panou-filtre').isVisible());

const pastile = await page.locator('#panou-filtre button span[style*="background"]').count();
verifica('filtrul de culoare are pastile', pastile === 4, `${pastile} pastile`);

const inainteFiltru = await page.locator('main article').count();
await page.locator('#panou-filtre').getByRole('button', { name: /Teracot/ }).click();
await page.waitForTimeout(400);
const dupaFiltru = await page.locator('main article').count();
// o culoare trebuie sa acopere exact un sfert din catalog (patru culori)
verifica(
  'filtrul de culoare reduce lista la o singura culoare',
  dupaFiltru < inainteFiltru && dupaFiltru === inainteFiltru / 4,
  `${inainteFiltru} -> ${dupaFiltru}`,
);

await page.locator('#panou-filtre').getByRole('button', { name: 'XL', exact: true }).click();
await page.waitForTimeout(400);
const cuMarime = await page.locator('main article').count();
verifica('filtrele se combina', cuMarime > 0 && cuMarime < dupaFiltru, `${dupaFiltru} -> ${cuMarime}`);

await page.getByRole('button', { name: /Șterge filtrele|Sterge filtrele/ }).click();
await page.waitForTimeout(400);
verifica('stergerea filtrelor readuce tot', (await page.locator('main article').count()) === inainteFiltru);

// pe mobil filtrele stau sub un buton
await page.setViewportSize({ width: 390, height: 800 });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(700);
verifica('pe mobil panoul e inchis', await page.locator('#panou-filtre').isHidden());
await page.getByRole('button', { name: /Filtreaz/ }).click();
await page.waitForTimeout(300);
verifica('pe mobil butonul deschide filtrele', await page.locator('#panou-filtre').isVisible());
await page.setViewportSize({ width: 1440, height: 900 });

// ---------- 15. constructorul de set arata a magazin ----------
await page.goto(`${BAZA}/produs/ham-canepa-naturala`, { waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, 1200));
await page.waitForTimeout(900);
const setSec = page.locator('section', { hasText: 'Fă-ți setul' }).last();
const randuriSet = await setSec.locator('li img').count();
verifica('setul are un rand cu poza per piesa', randuriSet >= 5, `${randuriSet} randuri`);
const totalInainte = Number(await setSec.locator('[data-total-ron]').getAttribute('data-total-ron'));
await setSec.getByRole('button', { name: /^Adaugă:/ }).first().click();
await page.waitForTimeout(400);
const totalDupa = Number(await setSec.locator('[data-total-ron]').getAttribute('data-total-ron'));
verifica('adaugarea unei piese schimba totalul', totalDupa !== totalInainte, `${totalInainte} -> ${totalDupa}`);
verifica('apare progresul spre pragul urmator',
  /Mai adaug/.test(await setSec.innerText()) || /−10%/.test(await setSec.innerText()));
const previzualizare = await setSec.locator('aside li img').count();
verifica('fisa arata piesele alese ca imagini', previzualizare >= 2, `${previzualizare} imagini in previzualizare`);

// ---------- 16. dropdownul ramane deschis cand intri in el ----------
await page.goto(`${BAZA}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.hover('[data-mega="hamuri"]');
await page.waitForTimeout(400);
const panouH = page.locator('[data-panou="hamuri"]');
verifica('panoul se deschide la hover', await panouH.isVisible());
// mutam cursorul pe un link DIN panou: inainte se inchidea aici
const linkInPanou = panouH.locator('a').nth(3);
await linkInPanou.hover();
await page.waitForTimeout(500);
verifica('panoul ramane deschis cand treci pe un link din el', await panouH.isVisible());
const caleLink = await linkInPanou.getAttribute('href');
await linkInPanou.click();
await page.waitForLoadState('networkidle');
verifica('linkul din panou chiar navigheaza', page.url().includes(String(caleLink)), page.url());

// ---------- 17. pagina de cos ----------
await page.goto(`${BAZA}/produs/lesa-carou-bruma`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.getByRole('button', { name: '180 cm', exact: true }).click();
await page.getByRole('button', { name: 'Adaugă în coș' }).first().click();
await page.waitForTimeout(500);
await page.goto(`${BAZA}/cos`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
verifica('pagina de cos arata produsul', (await page.locator('main a[href*="lesa-carou-bruma"]').count()) > 0);
await page.getByRole('button', { name: '+', exact: true }).first().click();
await page.waitForTimeout(400);
const dupaPlus = await page.evaluate(() => JSON.parse(localStorage.getItem('hoinar-cos') || '[]')[0]?.cantitate);
verifica('butonul plus creste cantitatea', dupaPlus === 2, `cantitate ${dupaPlus}`);
await page.getByRole('link', { name: /Finalizează comanda/ }).click();
await page.waitForLoadState('networkidle');
verifica('din cos se ajunge la finalizare', page.url().includes('/finalizare'), page.url());

// ---------- 18. pagina de cont ----------
await page.goto(`${BAZA}/cont`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
verifica('contul are doua file', (await page.getByRole('button', { name: /Autentificare|Cont nou/ }).count()) === 2);
await page.getByRole('button', { name: 'Cont nou' }).click();
await page.waitForTimeout(300);
verifica('fila de inregistrare cere numele', (await page.getByLabel('Nume și prenume').count()) > 0);
verifica('pagina spune ca e demonstratie', /Demonstrație/.test(await page.locator('main').innerText()));

// ---------- 19. meniul pe telefon ----------
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BAZA}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const butonMeniu = page.locator('[data-meniu-mobil]');
verifica('butonul de meniu se vede pe telefon', await butonMeniu.isVisible());
const meniuMobil = page.locator('#meniu-mobil');
verifica('meniul e inchis la inceput', await meniuMobil.isHidden());
await butonMeniu.click();
await page.waitForTimeout(400);
const cutie = await meniuMobil.evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight };
});
// panoul trebuie sa acopere tot ecranul; daca ar sta intr-un strabun cu
// backdrop-filter, `fixed` s-ar raporta la acela si cutia ar fi mica
verifica('meniul acopera tot ecranul', cutie.w === cutie.vw && cutie.h > cutie.vh * 0.7, JSON.stringify(cutie));
await page.locator('#meniu-mobil summary', { hasText: 'Hamuri' }).click();
await page.waitForTimeout(350);
verifica('categoria se desface si arata sublinkuri',
  (await page.locator('#meniu-mobil a[href*="/categorie/ham"]').count()) > 1);
await page.locator('#meniu-mobil a[href$="/reduceri"]').first().click();
await page.waitForLoadState('networkidle');
verifica('linkul din meniul mobil navigheaza si inchide meniul',
  page.url().includes('/reduceri') && (await page.locator('#meniu-mobil').isHidden()), page.url());

// bara fixa de adaugare, pe pagina de produs
await page.goto(`${BAZA}/produs/ham-carou-bruma`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const baraJos = page.locator('div.fixed.bottom-0', { hasText: 'Adaugă în coș' }).last();
const seVede = () => baraJos.evaluate((el) => el.getBoundingClientRect().top < window.innerHeight - 10);
// cand butonul principal e pe ecran, bara nu are ce cauta acolo
await page.getByRole('button', { name: 'Adaugă în coș' }).first().scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
const cuButonulPeEcran = await seVede();
// cand butonul a iesit din ecran, bara trebuie sa apara
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
await page.waitForTimeout(700);
const faraButon = await seVede();
verifica('bara apare doar cand butonul principal nu se vede',
  !cuButonulPeEcran && faraButon, `buton vizibil: ${cuButonulPeEcran} · buton ascuns: ${faraButon}`);
await page.setViewportSize({ width: 1440, height: 900 });

// ---------- 20. animatii ----------
await page.goto(`${BAZA}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const numaraDezvaluite = () => page.evaluate(() => {
  const t = [...document.querySelectorAll('[data-apare]')];
  return { total: t.length, vizibile: t.filter((e) => e.dataset.vizibil === 'da').length };
});
// la incarcare nu e nimic dezvaluit: primul bloc animat e sub linia ecranului,
// iar hero-ul nu are voie sa fie animat, trebuie sa apara instant
const laStart = await numaraDezvaluite();
await page.evaluate(() => window.scrollTo(0, 900));
await page.waitForTimeout(900);
const dupaPutin = await numaraDezvaluite();
verifica(
  'blocurile se dezvaluie pe masura ce derulezi',
  laStart.total > 0 && dupaPutin.vizibile > laStart.vizibile,
  `${laStart.vizibile} -> ${dupaPutin.vizibile} din ${laStart.total}`,
);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1400);
const toate = await page.evaluate(() => {
  const t = [...document.querySelectorAll('[data-apare]')];
  return t.filter((e) => e.dataset.vizibil === 'da').length === t.length;
});
verifica('dupa derulare pana jos, toate sunt dezvaluite', toate);

// stergerea din favorite trece printr-o animatie inainte sa dispara
await page.goto(`${BAZA}/produs/zgarda-carou-bruma`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.getByRole('button', { name: /Salveaz/ }).click();
await page.waitForTimeout(300);
await page.goto(`${BAZA}/favorite`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
// dupa golire apar sugestiile, care sunt tot <article>; verificam produsul anume
const tinta = 'zgarda-carou-bruma';
await page.getByRole('button', { name: /Șterge|Sterge/ }).first().click();
await page.waitForTimeout(90);
const iese = await page.locator('main article').first().evaluate((el) => el.className.includes('iese')).catch(() => false);
await page.waitForTimeout(600);
const disparut = (await page.locator(`main a[href*="${tinta}"]`).count()) === 0;
verifica('stergerea din favorite e animata, apoi dispare', iese && disparut, `animat: ${iese} · disparut: ${disparut}`);

// pagina de cont: indicatorul de fila se muta
await page.goto(`${BAZA}/cont`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const pozitieIndicator = () =>
  page.locator('[data-indicator-fila]').evaluate((el) => getComputedStyle(el).transform);
const pozInainte = await pozitieIndicator();
await page.getByRole('button', { name: 'Cont nou' }).click();
await page.waitForTimeout(500);
const pozDupa = await pozitieIndicator();
verifica('indicatorul de fila aluneca', pozInainte !== pozDupa, `${pozInainte} -> ${pozDupa}`);

// ---------- 21. favorite: cumparare directa si sugestii ----------
await page.evaluate(() => { localStorage.removeItem('hoinar-favorite'); localStorage.removeItem('hoinar-cos'); });
await page.goto(`${BAZA}/favorite`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
verifica('favoritele goale propun produse', (await page.locator('main a[href*="/produs/"]').count()) >= 4);

await page.goto(`${BAZA}/produs/ham-carou-bruma`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.getByRole('button', { name: /Salveaz/ }).click();
await page.waitForTimeout(300);
await page.goto(`${BAZA}/favorite`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
verifica('favoritele arata totalul salvat', /produse salvate/.test(await page.locator('main').innerText()));
await page.locator('main select').first().selectOption('L');
await page.getByRole('button', { name: /^Adaugă$/ }).first().click();
await page.waitForTimeout(600);
const dinFavorite = await page.evaluate(() => JSON.parse(localStorage.getItem('hoinar-cos') || '[]'));
verifica('se poate adauga in cos direct din favorite',
  dinFavorite.length === 1 && dinFavorite[0].marime === 'L', JSON.stringify(dinFavorite[0] ?? null));

// ---------- 22. cos gol propune produse ----------
await page.evaluate(() => localStorage.removeItem('hoinar-cos'));
await page.goto(`${BAZA}/cos`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
verifica('cosul gol propune produse', (await page.locator('main a[href*="/produs/"]').count()) >= 4);

// ---------- 23. descrierea sta sub fotografie ----------
await page.goto(`${BAZA}/produs/ham-buline-cacao`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const asezare = await page.evaluate(() => {
  const poza = document.querySelector('[data-principala]');
  const desc = [...document.querySelectorAll('details summary')].find((s) => /Descriere|Description/.test(s.textContent || ''));
  const buton = [...document.querySelectorAll('button')].find((b) => /Adaugă în coș|Add to cart/.test(b.textContent || ''));
  if (!poza || !desc || !buton) return null;
  const p = poza.getBoundingClientRect(), d = desc.getBoundingClientRect(), bt = buton.getBoundingClientRect();
  return { descSubPoza: d.top > p.bottom - 5, descInStanga: d.left < bt.left };
});
verifica('descrierea e sub fotografie, nu langa buton',
  !!asezare && asezare.descSubPoza && asezare.descInStanga, JSON.stringify(asezare));

// ---------- 24. bannerul cu trei caini nu se mai taie ----------
await page.goto(`${BAZA}/`, { waitUntil: 'networkidle' });
await page.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<H;y+=400){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,80));} });
await page.waitForTimeout(1200);
const trio = await page.evaluate(() => {
  const im = [...document.querySelectorAll('img')].find((x) => x.currentSrc.includes('trio'));
  if (!im) return null;
  const r = im.getBoundingClientRect();
  // fara decupare: raportul afisat trebuie sa fie cel al sursei
  return { afisat: +(r.width / r.height).toFixed(2), sursa: +(im.naturalWidth / im.naturalHeight).toFixed(2) };
});
verifica('fotografia cu trei caini nu e decupata',
  !!trio && Math.abs(trio.afisat - trio.sursa) < 0.03, JSON.stringify(trio));

// ---------- 25. produse similare si comutator de culoare ----------
await page.goto(`${BAZA}/produs/ham-buline-cacao`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const pdpBlocuri = await page.evaluate(() => ({
  titluri: [...document.querySelectorAll('main h2')].map((h) => h.textContent?.trim()),
  carduri: document.querySelectorAll('main article').length,
}));
verifica('pagina are trei blocuri de produse similare',
  ['Același model, altă culoare', 'Din aceeași țesătură', 'Se cumpără des împreună']
    .every((x) => pdpBlocuri.titluri.includes(x)),
  pdpBlocuri.titluri.join(' | '));
verifica('sunt destule produse similare', pdpBlocuri.carduri >= 12, `${pdpBlocuri.carduri} carduri`);

const pastileCuloare = page.locator('main a[style*="background"], main span[aria-current="true"]');
verifica('comutatorul de culoare are patru variante',
  (await pastileCuloare.count()) === 4, `${await pastileCuloare.count()} pastile`);
const altaCuloare = page.locator('main a[title]').first();
const caleaAlta = await altaCuloare.getAttribute('href');
await altaCuloare.click();
await page.waitForLoadState('networkidle');
verifica('pastila de culoare duce la acelasi tip in alta culoare',
  page.url().includes('/produs/ham-') && !page.url().includes('buline-cacao'), page.url());

verifica('fara erori JavaScript', eroriConsola.length === 0, eroriConsola.slice(0, 3).join(' | '));

await browser.close();

const picate = rezultate.filter((r) => !r.ok);
for (const r of rezultate) {
  console.log(`${r.ok ? '  OK  ' : ' PICA '} ${r.nume}${r.detaliu ? '  ·  ' + r.detaliu : ''}`);
}
console.log(`\n${rezultate.length - picate.length}/${rezultate.length} au trecut`);
process.exit(picate.length ? 1 : 0);
