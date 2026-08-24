/** Tabelul de mărimi. Valorile sunt în centimetri, inclusiv la ambele capete. */
export interface RandMarime {
  marime: string;
  gat: [number, number];
  piept: [number, number];
  exemplu: { ro: string; en: string };
}

export const TABEL: RandMarime[] = [
  { marime: 'XS', gat: [22, 28], piept: [32, 40], exemplu: { ro: 'Chihuahua, Yorkshire', en: 'Chihuahua, Yorkshire' } },
  { marime: 'S', gat: [26, 34], piept: [38, 48], exemplu: { ro: 'Bichon, Jack Russell', en: 'Bichon, Jack Russell' } },
  { marime: 'M', gat: [32, 42], piept: [46, 58], exemplu: { ro: 'Cocker, Beagle', en: 'Cocker, Beagle' } },
  { marime: 'L', gat: [40, 52], piept: [56, 72], exemplu: { ro: 'Labrador, Border Collie', en: 'Labrador, Border Collie' } },
  { marime: 'XL', gat: [50, 62], piept: [70, 88], exemplu: { ro: 'Ciobănesc german, Boxer', en: 'German Shepherd, Boxer' } },
  { marime: 'XXL', gat: [60, 72], piept: [86, 104], exemplu: { ro: 'Ciobănesc de Bucovina, Rottweiler', en: 'Bucovina Shepherd, Rottweiler' } },
];

/**
 * Alege mărimea din măsurători. Pieptul decide, gâtul departajează.
 * Întoarce null dacă e sub prima mărime, 'peste' dacă depășește ultima.
 */
export function recomanda(gat: number, piept: number): string | 'peste' | null {
  if (!Number.isFinite(gat) || !Number.isFinite(piept) || gat <= 0 || piept <= 0) return null;

  const ultim = TABEL[TABEL.length - 1];
  if (piept > ultim.piept[1] || gat > ultim.gat[1]) return 'peste';

  // prima mărime care cuprinde pieptul; dacă gâtul nu încape, urcăm o treaptă
  for (let i = 0; i < TABEL.length; i++) {
    const r = TABEL[i];
    if (piept <= r.piept[1]) {
      if (gat > r.gat[1] && i + 1 < TABEL.length) return TABEL[i + 1].marime;
      return r.marime;
    }
  }
  return 'peste';
}

/** Reduceri pe număr de piese din aceeași țesătură. */
export function reducereSet(numarPiese: number): number {
  if (numarPiese >= 4) return 0.15;
  if (numarPiese === 3) return 0.1;
  if (numarPiese === 2) return 0.05;
  return 0;
}
