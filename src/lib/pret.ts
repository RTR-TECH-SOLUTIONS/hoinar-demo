/** Prețurile sursă sunt în RON. Cursul e fix, e demo, nu se ia din API. */
export const CURS_EUR = 5.05;
export const PRAG_TRANSPORT_GRATUIT_RON = 250;

export type Moneda = 'RON' | 'EUR';
export type Limba = 'ro' | 'en';

/** Convertește din RON în moneda cerută, rotunjind la unitate. */
export function converteste(ron: number, moneda: Moneda): number {
  return moneda === 'RON' ? Math.round(ron) : Math.round(ron / CURS_EUR);
}

/**
 * Formatează un preț din RON pentru afișare.
 * RON  -> "189 lei"
 * EUR  -> "37 €"
 */
export function formatPret(ron: number, moneda: Moneda = 'RON'): string {
  const v = converteste(ron, moneda);
  return moneda === 'RON' ? `${v} lei` : `${v} €`;
}

/** Cât mai lipsește până la transport gratuit. 0 dacă pragul e atins. */
export function lipsaPanaLaTransportGratuit(subtotalRon: number): number {
  return Math.max(0, PRAG_TRANSPORT_GRATUIT_RON - subtotalRon);
}
