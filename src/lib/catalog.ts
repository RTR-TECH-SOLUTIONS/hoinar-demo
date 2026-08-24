import { getCollection, getEntry } from 'astro:content';
import type { Limba } from './pret';

/**
 * Singurul strat prin care componentele ating datele.
 * Când sursa devine Medusa la proiectul real, se rescrie doar fișierul ăsta;
 * componentele rămân neatinse.
 */

export interface Produs {
  slug: string;
  nume: string;
  tip: string;
  tipNume: string;
  colectie: string;
  pretRon: number;
  pretIntregRon?: number;
  componente?: string[];
  marimi: string[];
  imagini: string[];
  descriere: string;
  caracteristici: string[];
  stoc: number;
  bestseller: boolean;
  segment: 'talie-mare' | 'baieti' | null;
  esteSet: boolean;
  economieRon: number;
}

export interface Colectie {
  slug: string;
  nume: string;
  accent: string;
  imagine: string;
  tesatura: string;
  descriere: string;
}

export interface Tip {
  slug: string;
  nume: string;
  imagine: string;
}

export interface Filtre {
  colectie?: string;
  tip?: string;
  marime?: string;
  pretMaxRon?: number;
  doarInStoc?: boolean;
  segment?: 'talie-mare' | 'baieti';
}

export type Sortare = 'recomandate' | 'pret-crescator' | 'pret-descrescator';

function laProdus(entry: { id: string; data: any }, lang: Limba): Produs {
  const d = entry.data;
  const esteSet = d.tip === 'set';
  return {
    slug: entry.id,
    nume: d.nume[lang],
    tip: d.tip,
    tipNume: d.tipNume[lang],
    colectie: d.colectie,
    pretRon: d.pretRon,
    pretIntregRon: d.pretIntregRon,
    componente: d.componente,
    marimi: d.marimi,
    imagini: d.imagini,
    descriere: d.descriere[lang],
    caracteristici: d.caracteristici[lang],
    stoc: d.stoc,
    bestseller: d.bestseller,
    segment: d.segment,
    esteSet,
    economieRon: d.pretIntregRon ? d.pretIntregRon - d.pretRon : 0,
  };
}

export async function getColectii(lang: Limba): Promise<Colectie[]> {
  const raw = await getCollection('colectii');
  return raw.map((e) => ({
    slug: e.id,
    nume: e.data.nume[lang],
    accent: e.data.accent,
    imagine: e.data.imagine,
    tesatura: e.data.tesatura[lang],
    descriere: e.data.descriere[lang],
  }));
}

export async function getColectie(slug: string, lang: Limba): Promise<Colectie | undefined> {
  const e = await getEntry('colectii', slug);
  if (!e) return undefined;
  return {
    slug: e.id,
    nume: e.data.nume[lang],
    accent: e.data.accent,
    imagine: e.data.imagine,
    tesatura: e.data.tesatura[lang],
    descriere: e.data.descriere[lang],
  };
}

export async function getTipuri(lang: Limba): Promise<Tip[]> {
  const raw = await getCollection('tipuri');
  return raw.map((e) => ({ slug: e.id, nume: e.data.nume[lang], imagine: e.data.imagine }));
}

export async function getProduse(
  lang: Limba,
  filtre: Filtre = {},
  sortare: Sortare = 'recomandate',
): Promise<Produs[]> {
  const raw = await getCollection('produse');
  let lista = raw.map((e) => laProdus(e, lang));

  if (filtre.colectie) lista = lista.filter((p) => p.colectie === filtre.colectie);
  if (filtre.tip) lista = lista.filter((p) => p.tip === filtre.tip);
  if (filtre.marime) lista = lista.filter((p) => p.marimi.includes(filtre.marime!));
  if (filtre.pretMaxRon != null) lista = lista.filter((p) => p.pretRon <= filtre.pretMaxRon!);
  if (filtre.doarInStoc) lista = lista.filter((p) => p.stoc > 0);
  if (filtre.segment) lista = lista.filter((p) => p.segment === filtre.segment);

  if (sortare === 'pret-crescator') lista.sort((a, b) => a.pretRon - b.pretRon);
  else if (sortare === 'pret-descrescator') lista.sort((a, b) => b.pretRon - a.pretRon);
  else lista.sort((a, b) => Number(b.bestseller) - Number(a.bestseller));

  return lista;
}

export async function getProdus(slug: string, lang: Limba): Promise<Produs | undefined> {
  const e = await getEntry('produse', slug);
  return e ? laProdus(e, lang) : undefined;
}

export async function getBestsellers(lang: Limba, limita = 4): Promise<Produs[]> {
  const lista = await getProduse(lang, {});
  return lista.filter((p) => p.bestseller).slice(0, limita);
}

export async function getProduseDinColectie(colectie: string, lang: Limba): Promise<Produs[]> {
  return getProduse(lang, { colectie });
}

/** Produsele dintr-o colecție care pot intra într-un set, fără setul în sine. */
export async function getComponenteSet(colectie: string, lang: Limba): Promise<Produs[]> {
  const lista = await getProduse(lang, { colectie });
  return lista.filter((p) => !p.esteSet);
}
