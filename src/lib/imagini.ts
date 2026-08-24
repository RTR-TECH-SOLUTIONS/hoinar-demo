import type { ImageMetadata } from 'astro';

/**
 * Datele din src/data referă imaginile ca șiruri ("/media/produse/ham.jpg").
 * Aici le legăm de fișierele reale din src/assets, ca Astro să le optimizeze
 * (AVIF/WebP, dimensiuni explicite, anti-CLS). Dacă lipsește una, build-ul
 * cade aici, nu în producție.
 */
const fisiere = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/media/**/*.{jpg,jpeg,png}',
  { eager: true },
);

export function getImagine(cale: string): ImageMetadata {
  const cheie = `/src/assets${cale}`;
  const m = fisiere[cheie];
  if (!m) {
    throw new Error(
      `Imagine lipsă: ${cale}. Caut ${cheie}. Disponibile: ${Object.keys(fisiere).join(', ')}`,
    );
  }
  return m.default;
}
