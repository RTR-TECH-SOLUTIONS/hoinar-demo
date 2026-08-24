import { atom, computed } from 'nanostores';
import { PRAG_TRANSPORT_GRATUIT_RON } from '../lib/pret';

export interface LinieCos {
  slug: string;
  nume: string;
  marime: string;
  pretRon: number;
  imagine: string;
  url: string;
  cantitate: number;
}

const CHEIE = 'hoinar-cos';
const CHEIE_MONEDA = 'hoinar-moneda';

function incarca(): LinieCos[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const brut = localStorage.getItem(CHEIE);
    if (!brut) return [];
    const val = JSON.parse(brut);
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

/**
 * Store-urile pornesc GOALE, identic cu ce randează serverul.
 * Citirea din localStorage se face abia după montare, prin `hidrateaza()`.
 * Dacă am citi la inițializarea modulului, primul render din browser ar
 * diferi de HTML-ul de pe server și React ar arunca eroare de hidratare
 * la orice vizitator care are ceva în coș.
 */
export const cos = atom<LinieCos[]>([]);
export const drawerDeschis = atom(false);
export const moneda = atom<'RON' | 'EUR'>('RON');

let hidratat = false;

export function hidrateaza() {
  if (hidratat || typeof localStorage === 'undefined') return;
  hidratat = true;
  const salvat = incarca();
  if (salvat.length) cos.set(salvat);
  const m = localStorage.getItem(CHEIE_MONEDA);
  if (m === 'RON' || m === 'EUR') moneda.set(m);
}

cos.subscribe((val) => {
  // Nu scriem înainte de hidratare, altfel valoarea inițială goală
  // ar șterge coșul salvat.
  if (!hidratat || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CHEIE, JSON.stringify(val));
  } catch {
    /* quota plină sau mod privat: coșul rămâne doar în memorie */
  }
});

moneda.subscribe((val) => {
  if (!hidratat || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CHEIE_MONEDA, val);
  } catch {
    /* idem */
  }
});

/** O linie e identificată de perechea produs + mărime. */
function aceeasiLinie(a: LinieCos, slug: string, marime: string) {
  return a.slug === slug && a.marime === marime;
}

export function adauga(linie: Omit<LinieCos, 'cantitate'>, cantitate = 1) {
  const curent = cos.get();
  const idx = curent.findIndex((l) => aceeasiLinie(l, linie.slug, linie.marime));
  if (idx >= 0) {
    const copie = [...curent];
    copie[idx] = { ...copie[idx], cantitate: copie[idx].cantitate + cantitate };
    cos.set(copie);
  } else {
    cos.set([...curent, { ...linie, cantitate }]);
  }
}

export function adaugaMulte(linii: Array<Omit<LinieCos, 'cantitate'>>) {
  for (const l of linii) adauga(l, 1);
}

export function schimbaCantitate(slug: string, marime: string, cantitate: number) {
  if (cantitate <= 0) return sterge(slug, marime);
  cos.set(cos.get().map((l) => (aceeasiLinie(l, slug, marime) ? { ...l, cantitate } : l)));
}

export function sterge(slug: string, marime: string) {
  cos.set(cos.get().filter((l) => !aceeasiLinie(l, slug, marime)));
}

export function goleste() {
  cos.set([]);
}

export const subtotalRon = computed(cos, (linii) =>
  linii.reduce((s, l) => s + l.pretRon * l.cantitate, 0),
);

export const numarProduse = computed(cos, (linii) =>
  linii.reduce((s, l) => s + l.cantitate, 0),
);

export const lipsaTransport = computed(subtotalRon, (s) =>
  Math.max(0, PRAG_TRANSPORT_GRATUIT_RON - s),
);
