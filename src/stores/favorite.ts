import { atom, computed } from 'nanostores';

const CHEIE = 'hoinar-favorite';
let hidratat = false;

/** Store gol la pornire, ca serverul si prima randare din browser sa coincida. */
export const favorite = atom<string[]>([]);

export function hidrateazaFavorite() {
  if (hidratat || typeof localStorage === 'undefined') return;
  hidratat = true;
  try {
    const brut = localStorage.getItem(CHEIE);
    const val = brut ? JSON.parse(brut) : [];
    if (Array.isArray(val) && val.length) favorite.set(val);
  } catch {
    /* mod privat sau date stricate: pornim gol */
  }
}

favorite.subscribe((val) => {
  if (!hidratat || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CHEIE, JSON.stringify(val));
  } catch {
    /* quota plina */
  }
});

export function comutaFavorit(slug: string) {
  const curent = favorite.get();
  favorite.set(curent.includes(slug) ? curent.filter((s) => s !== slug) : [...curent, slug]);
}

export const numarFavorite = computed(favorite, (l) => l.length);
