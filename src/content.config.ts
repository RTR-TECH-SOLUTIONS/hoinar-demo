import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

/** Text bilingv. Româna e limba sursă, engleza e obligatorie peste tot. */
const bilingv = z.object({ ro: z.string(), en: z.string() });
const bilingvLista = z.object({ ro: z.array(z.string()), en: z.array(z.string()) });

const colectii = defineCollection({
  loader: file('src/data/colectii.json'),
  schema: z.object({
    nume: bilingv,
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    culoare: z.object({ nume: bilingv, hex: z.string().regex(/^#[0-9a-fA-F]{6}$/) }),
    imagine: z.string(),
    tesatura: bilingv,
    descriere: bilingv,
  }),
});

const produse = defineCollection({
  loader: file('src/data/produse.json'),
  schema: z.object({
    nume: bilingv,
    tip: z.string(),
    tipNume: bilingv,
    colectie: z.string(),
    culoare: bilingv,
    culoareHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    pretRon: z.number().positive(),
    /** Prețul de listă, prezent doar cât timp produsul e la reducere. */
    pretVechiRon: z.number().positive().optional(),
    /** Procentul de reducere, 0 dacă nu e la reducere. */
    reducere: z.number().min(0).max(90),
    rating: z.number().min(1).max(5),
    nrRecenzii: z.number().int().nonnegative(),
    nou: z.boolean(),
    /** Prezent doar pe seturi: prețul componentelor cumpărate separat. */
    pretIntregRon: z.number().positive().optional(),
    /** Prezent doar pe seturi: id-urile produselor incluse. */
    componente: z.array(z.string()).optional(),
    marimi: z.array(z.string()).nonempty(),
    imagini: z.array(z.string()).nonempty(),
    descriere: bilingv,
    caracteristici: bilingvLista,
    stoc: z.number().int().nonnegative(),
    bestseller: z.boolean(),
    segment: z.enum(['talie-mare', 'baieti']).nullable(),
  }),
});

const tipuri = defineCollection({
  loader: file('src/data/tipuri.json'),
  schema: z.object({
    nume: bilingv,
    imagine: z.string(),
    ordine: z.number().int(),
  }),
});

export const collections = { colectii, produse, tipuri };
