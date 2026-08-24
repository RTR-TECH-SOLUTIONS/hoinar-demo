import fs from 'node:fs';

/**
 * Verifică fișierul de traduceri: aceeași cheie nu are voie să apară de două
 * ori în aceeași limbă, pentru că a doua o suprascrie tăcut pe prima.
 * A prins deja `favorite.adauga` folosit și pentru inimă, și pentru butonul
 * de cumpărare din favorite.
 */
const sursa = fs.readFileSync('src/lib/i18n.ts', 'utf8');
const start = { ro: sursa.indexOf('  ro: {'), en: sursa.indexOf('  en: {') };
const bucati = {
  ro: sursa.slice(start.ro, start.en),
  en: sursa.slice(start.en),
};

let rele = 0;
for (const [limba, text] of Object.entries(bucati)) {
  const chei = [...text.matchAll(/^\s+'([a-z]+\.[A-Za-z0-9]+)':/gm)].map((m) => m[1]);
  const vazute = new Map();
  for (const k of chei) vazute.set(k, (vazute.get(k) ?? 0) + 1);
  const dup = [...vazute].filter(([, n]) => n > 1);
  if (dup.length) {
    rele += dup.length;
    console.log(`[${limba}] ${dup.length} chei duplicate:`);
    for (const [k, n] of dup) console.log(`  ${k} (de ${n} ori)`);
  }
}

// și verificăm că cele două limbi au exact aceleași chei
const seturi = Object.fromEntries(
  Object.entries(bucati).map(([l, t]) => [l, new Set([...t.matchAll(/^\s+'([a-z]+\.[A-Za-z0-9]+)':/gm)].map((m) => m[1]))]),
);
const doarRo = [...seturi.ro].filter((k) => !seturi.en.has(k));
const doarEn = [...seturi.en].filter((k) => !seturi.ro.has(k));
if (doarRo.length) { rele += doarRo.length; console.log(`Lipsesc din engleză: ${doarRo.join(', ')}`); }
if (doarEn.length) { rele += doarEn.length; console.log(`Lipsesc din română: ${doarEn.join(', ')}`); }

if (rele === 0) console.log(`Traduceri: ${seturi.ro.size} chei, aceleași în ambele limbi, fără duplicate.`);
else process.exit(1);
