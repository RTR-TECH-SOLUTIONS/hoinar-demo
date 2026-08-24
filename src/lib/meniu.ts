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

  /** Coloana de reduceri arată un produs redus DIN meniul respectiv. */
  const promo = (imagine: string): ColoanaMeniu => ({
    imagine,
    titlu: ro ? 'La reducere' : 'On sale',
    linkuri: [
      { eticheta: ro ? 'Toate reducerile' : 'All reduced', href: u('/reduceri') },
      { eticheta: ro ? 'Seturi complete' : 'Full sets', href: u('/colectii?tip=set') },
      { eticheta: ro ? 'Ghid de mărimi' : 'Size guide', href: u('/ghid-marimi') },
    ],
  });

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
          imagine: '/media/produse/ham-explore-canepa-naturala.jpg',
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
        // ham reglabil Buline Cacao e la −25%
        promo('/media/produse/ham-buline-cacao.jpg'),
      ],
    },
    {
      slug: 'lese',
      eticheta: ro ? 'Lese' : 'Leads',
      href: u('/categorie/lesa'),
      coloane: [
        { imagine: '/media/produse/lesa-carou-bruma.jpg', titlu: numeTip('lesa'), linkuri: peTesaturi('lesa') },
        {
          imagine: '/media/produse/lesa-canepa-naturala.jpg',
          titlu: ro ? 'Lungimi' : 'Lengths',
          linkuri: [
            { eticheta: ro ? 'Lesă 120 cm' : 'Lead 120 cm', href: u('/categorie/lesa?marime=120 cm') },
            { eticheta: ro ? 'Lesă 180 cm' : 'Lead 180 cm', href: u('/categorie/lesa?marime=180 cm') },
          ],
        },
        {
          imagine: '/media/produse/zgarda-carou-bruma.jpg',
          titlu: ro ? 'Se poartă cu' : 'Goes with',
          linkuri: [
            { eticheta: ro ? 'Zgărzi' : 'Collars', href: u('/categorie/zgarda') },
            { eticheta: ro ? 'Hamuri' : 'Harnesses', href: u('/categorie/ham') },
            { eticheta: ro ? 'Seturi complete' : 'Full sets', href: u('/colectii?tip=set') },
          ],
        },
        {
          imagine: '/media/colectii/dungi-sinaia.jpg',
          titlu: ro ? 'Țesături' : 'Cloths',
          linkuri: colectii.map((c) => ({ eticheta: c.nume, href: u(`/colectie/${c.slug}`) })),
        },
        // lesa Dungi Sinaia e la −20%
        promo('/media/produse/lesa-dungi-sinaia.jpg'),
      ],
    },
    {
      slug: 'zgarzi',
      eticheta: ro ? 'Zgărzi' : 'Collars',
      href: u('/categorie/zgarda'),
      coloane: [
        { imagine: '/media/produse/zgarda-dungi-sinaia.jpg', titlu: numeTip('zgarda'), linkuri: peTesaturi('zgarda') },
        {
          imagine: '/media/produse/medalion.jpg',
          titlu: numeTip('medalion'),
          linkuri: [
            { eticheta: ro ? 'Toate medalioanele' : 'All tags', href: u('/categorie/medalion') },
            { eticheta: ro ? 'Rotund 25 mm' : 'Round 25 mm', href: u('/categorie/medalion?marime=25 mm') },
            { eticheta: ro ? 'Rotund 32 mm' : 'Round 32 mm', href: u('/categorie/medalion?marime=32 mm') },
          ],
        },
        {
          imagine: '/media/lifestyle/07.jpg',
          titlu: ro ? 'După mărime' : 'By size',
          linkuri: [
            { eticheta: ro ? 'Gât subțire (S)' : 'Slim neck (S)', href: u('/categorie/zgarda?marime=S') },
            { eticheta: ro ? 'Mediu (M)' : 'Medium (M)', href: u('/categorie/zgarda?marime=M') },
            { eticheta: ro ? 'Gât gros (L)' : 'Thick neck (L)', href: u('/categorie/zgarda?marime=L') },
            { eticheta: ro ? 'Ghid de mărimi' : 'Size guide', href: u('/ghid-marimi') },
          ],
        },
        {
          imagine: '/media/colectii/buline-cacao.jpg',
          titlu: ro ? 'Țesături' : 'Cloths',
          linkuri: colectii.map((c) => ({ eticheta: c.nume, href: u(`/colectie/${c.slug}`) })),
        },
        // zgarda Buline Cacao e la −25%
        promo('/media/produse/zgarda-buline-cacao.jpg'),
      ],
    },
    {
      slug: 'accesorii',
      eticheta: ro ? 'Accesorii' : 'Accessories',
      href: u('/categorie/geanta'),
      coloane: [
        { imagine: '/media/produse/geanta-carou-bruma.jpg', titlu: numeTip('geanta'), linkuri: peTesaturi('geanta') },
        { imagine: '/media/produse/bandana-buline-cacao.jpg', titlu: numeTip('bandana'), linkuri: peTesaturi('bandana') },
        {
          imagine: '/media/produse/medalion.jpg',
          titlu: numeTip('medalion'),
          linkuri: [
            { eticheta: ro ? 'Toate medalioanele' : 'All tags', href: u('/categorie/medalion') },
            { eticheta: ro ? 'Rotund 25 mm' : 'Round 25 mm', href: u('/categorie/medalion?marime=25 mm') },
            { eticheta: ro ? 'Rotund 32 mm' : 'Round 32 mm', href: u('/categorie/medalion?marime=32 mm') },
          ],
        },
        {
          imagine: '/media/colectii/canepa-naturala.jpg',
          titlu: ro ? 'Țesături' : 'Cloths',
          linkuri: colectii.map((c) => ({ eticheta: c.nume, href: u(`/colectie/${c.slug}`) })),
        },
        // geanta Cânepă Naturală e la −30%
        promo('/media/produse/geanta-canepa-naturala.jpg'),
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
        promo('/media/produse/zgarda-buline-cacao.jpg'),
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
