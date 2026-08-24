import { getColectii, getTipuri } from './catalog';
import { url } from './i18n';
import type { Limba } from './pret';

export interface LinkMeniu {
  eticheta: string;
  href: string;
}

export interface ColoanaMeniu {
  imagine: string;
  titlu: string;
  linkuri: LinkMeniu[];
}

export interface ItemMeniu {
  slug: string;
  eticheta: string;
  href: string;
  accent?: boolean;
  coloane?: ColoanaMeniu[];
}

/**
 * Meniul principal, construit din catalog.
 * Fiecare intrare cu `coloane` deschide un panou pe toată lățimea, în tiparul
 * referinței: imagine sus, titlu de coloană, apoi listă de linkuri.
 */
export async function getMeniu(lang: Limba): Promise<ItemMeniu[]> {
  const ro = lang === 'ro';
  const colectii = await getColectii(lang);
  const tipuri = await getTipuri(lang);
  const u = (c: string) => url(lang, c);
  const numeTip = (slug: string) => tipuri.find((t) => t.slug === slug)?.nume ?? slug;

  /** „Toate” plus câte un link per țesătură, pentru un tip de produs. */
  const peTesaturi = (tip: string): LinkMeniu[] => [
    { eticheta: ro ? 'Toate' : 'View all', href: u(`/categorie/${tip}`) },
    ...colectii.map((c) => ({
      eticheta: c.nume,
      href: u(`/categorie/${tip}?colectie=${c.slug}`),
    })),
  ];

  const promoColoana: ColoanaMeniu = {
    imagine: '/media/produse/bandana-carou-bruma.jpg',
    titlu: ro ? 'Reduceri' : 'Sale',
    linkuri: [
      { eticheta: ro ? 'Toate reducerile' : 'All reduced', href: u('/reduceri') },
      { eticheta: ro ? 'Seturi complete' : 'Full sets', href: u('/colectii?tip=set') },
      { eticheta: ro ? 'Ghid de mărimi' : 'Size guide', href: u('/ghid-marimi') },
    ],
  };

  return [
    {
      slug: 'hamuri',
      eticheta: ro ? 'Hamuri' : 'Harnesses',
      href: u('/categorie/ham'),
      coloane: [
        {
          imagine: '/media/produse/ham-carou-bruma.jpg',
          titlu: numeTip('ham'),
          linkuri: peTesaturi('ham'),
        },
        {
          imagine: '/media/produse/ham-explore-dungi-sinaia.jpg',
          titlu: numeTip('ham-explore'),
          linkuri: peTesaturi('ham-explore'),
        },
        {
          imagine: '/media/lifestyle/05.jpg',
          titlu: ro ? 'După talie' : 'By size',
          linkuri: [
            { eticheta: ro ? 'Câini mici (XS-S)' : 'Small dogs (XS-S)', href: u('/categorie/ham?marime=S') },
            { eticheta: ro ? 'Talie medie (M)' : 'Medium (M)', href: u('/categorie/ham?marime=M') },
            { eticheta: ro ? 'Talie mare (L-XL)' : 'Large (L-XL)', href: u('/categorie/ham?marime=L') },
            { eticheta: ro ? 'Foarte mari (XXL)' : 'Extra large (XXL)', href: u('/categorie/ham-explore?marime=XXL') },
            { eticheta: ro ? 'Ghid de mărimi' : 'Size guide', href: u('/ghid-marimi') },
          ],
        },
        {
          imagine: '/media/colectii/carou-bruma.jpg',
          titlu: ro ? 'Țesături' : 'Cloths',
          linkuri: colectii.map((c) => ({ eticheta: c.nume, href: u(`/colectie/${c.slug}`) })),
        },
        promoColoana,
      ],
    },
    {
      slug: 'lese',
      eticheta: ro ? 'Lese & Zgărzi' : 'Leads & Collars',
      href: u('/categorie/lesa'),
      coloane: [
        { imagine: '/media/produse/lesa-carou-bruma.jpg', titlu: numeTip('lesa'), linkuri: peTesaturi('lesa') },
        { imagine: '/media/produse/zgarda-dungi-sinaia.jpg', titlu: numeTip('zgarda'), linkuri: peTesaturi('zgarda') },
        {
          imagine: '/media/produse/medalion.jpg',
          titlu: numeTip('medalion'),
          linkuri: [
            { eticheta: ro ? 'Toate medalioanele' : 'All tags', href: u('/categorie/medalion') },
            { eticheta: ro ? 'Rotund 25 mm' : 'Round 25 mm', href: u('/categorie/medalion?marime=25 cm') },
            { eticheta: ro ? 'Rotund 32 mm' : 'Round 32 mm', href: u('/categorie/medalion?marime=32 cm') },
          ],
        },
        {
          imagine: '/media/lifestyle/06.jpg',
          titlu: ro ? 'Lungimi' : 'Lengths',
          linkuri: [
            { eticheta: ro ? 'Lesă 120 cm' : 'Lead 120 cm', href: u('/categorie/lesa?marime=120 cm') },
            { eticheta: ro ? 'Lesă 180 cm' : 'Lead 180 cm', href: u('/categorie/lesa?marime=180 cm') },
            { eticheta: ro ? 'Seturi complete' : 'Full sets', href: u('/colectii?tip=set') },
          ],
        },
        promoColoana,
      ],
    },
    {
      slug: 'genti',
      eticheta: ro ? 'Genți de plimbare' : 'Walking Bags',
      href: u('/categorie/geanta'),
      coloane: [
        { imagine: '/media/produse/geanta-carou-bruma.jpg', titlu: numeTip('geanta'), linkuri: peTesaturi('geanta') },
        {
          imagine: '/media/banner/atelier.jpg',
          titlu: ro ? 'Seturi' : 'Sets',
          linkuri: colectii.map((c) => ({ eticheta: `${ro ? 'Set' : 'Set'} ${c.nume}`, href: u(`/produs/set-${c.slug}`) })),
        },
        {
          imagine: '/media/ugc/02.jpg',
          titlu: ro ? 'Pentru plimbare' : 'For the walk',
          linkuri: [
            { eticheta: ro ? 'Bandane' : 'Bandanas', href: u('/categorie/bandana') },
            { eticheta: ro ? 'Medalioane' : 'Tags', href: u('/categorie/medalion') },
            { eticheta: ro ? 'Halate de uscare' : 'Drying robes', href: u('/categorie/halat') },
          ],
        },
        {
          imagine: '/media/colectii/dungi-sinaia.jpg',
          titlu: ro ? 'Țesături' : 'Cloths',
          linkuri: colectii.map((c) => ({ eticheta: c.nume, href: u(`/colectie/${c.slug}`) })),
        },
        promoColoana,
      ],
    },
    {
      slug: 'accesorii',
      eticheta: ro ? 'Accesorii' : 'Accessories',
      href: u('/categorie/bandana'),
      coloane: [
        { imagine: '/media/produse/bandana-buline-cacao.jpg', titlu: numeTip('bandana'), linkuri: peTesaturi('bandana') },
        { imagine: '/media/produse/halat.jpg', titlu: numeTip('halat'), linkuri: peTesaturi('halat') },
        {
          imagine: '/media/ugc/04.jpg',
          titlu: ro ? 'Pentru acasă' : 'For home',
          linkuri: [
            { eticheta: ro ? 'Halate de uscare' : 'Drying robes', href: u('/categorie/halat') },
            { eticheta: ro ? 'Medalioane gravate' : 'Engraved tags', href: u('/categorie/medalion') },
            { eticheta: ro ? 'Toate accesoriile' : 'All accessories', href: u('/colectii') },
          ],
        },
        {
          imagine: '/media/colectii/buline-cacao.jpg',
          titlu: ro ? 'Țesături' : 'Cloths',
          linkuri: colectii.map((c) => ({ eticheta: c.nume, href: u(`/colectie/${c.slug}`) })),
        },
        promoColoana,
      ],
    },
    {
      slug: 'colectii',
      eticheta: ro ? 'Colecții' : 'Collections',
      href: u('/colectii'),
      coloane: [
        ...colectii.map((c) => ({
          imagine: c.imagine,
          titlu: c.nume,
          linkuri: [
            { eticheta: ro ? 'Vezi colecția' : 'View collection', href: u(`/colectie/${c.slug}`) },
            { eticheta: ro ? 'Setul complet' : 'The full set', href: u(`/produs/set-${c.slug}`) },
            { eticheta: numeTip('ham'), href: u(`/produs/ham-${c.slug}`) },
            { eticheta: numeTip('lesa'), href: u(`/produs/lesa-${c.slug}`) },
          ],
        })),
        promoColoana,
      ],
    },
    {
      slug: 'reduceri',
      eticheta: ro ? 'Reduceri' : 'Sale',
      href: u('/reduceri'),
      accent: true,
    },
  ];
}
