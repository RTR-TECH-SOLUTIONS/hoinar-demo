import fs from 'node:fs';
import path from 'node:path';

/** Verifică fiecare link intern din build: să existe pagina la care trimite. */
const RAD = './dist';
const html = [];
(function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const cale = path.join(dir, f.name);
    if (f.isDirectory()) scan(cale);
    else if (f.name.endsWith('.html')) html.push(cale);
  }
})(RAD);

const exista = (href) => {
  // slash-ul final trebuie tăiat, altfel `p + '.html'` devine `404/.html`
  const curat = href.split('#')[0].split('?')[0].replace(/\/+$/, '');
  if (!curat) return fs.existsSync(path.join(RAD, 'index.html'));
  const p = path.join(RAD, curat);
  return fs.existsSync(p + '.html') || fs.existsSync(path.join(p, 'index.html'));
};

const rupte = new Map();
for (const f of html) {
  const continut = fs.readFileSync(f, 'utf8');
  for (const m of continut.matchAll(/href="(\/[^"]*)"/g)) {
    const href = m[1];
    if (href.startsWith('//') || href.startsWith('/_astro') || href.startsWith('/media') || /\.(svg|png|jpg|webp|ico|css|js|xml|txt|mp4|webm)$/.test(href)) continue;
    if (!exista(href)) {
      if (!rupte.has(href)) rupte.set(href, new Set());
      rupte.get(href).add(path.relative(RAD, f));
    }
  }
}

console.log(`${html.length} pagini scanate.`);
if (rupte.size === 0) console.log('Niciun link intern rupt.');
else {
  console.log(`${rupte.size} linkuri rupte:\n`);
  for (const [href, unde] of rupte) {
    console.log(`  ${href}`);
    console.log(`    din: ${[...unde].slice(0, 3).join(', ')}${unde.size > 3 ? ` (+${unde.size - 3})` : ''}`);
  }
  process.exit(1);
}
