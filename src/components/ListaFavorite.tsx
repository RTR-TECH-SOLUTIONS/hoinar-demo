import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { favorite, comutaFavorit, hidrateazaFavorite } from '../stores/favorite';
import { adauga, drawerDeschis, moneda as monedaStore } from '../stores/cos';
import { formatPret } from '../lib/pret';

export interface ItemFavorit {
  slug: string;
  nume: string;
  tipNume: string;
  pretRon: number;
  pretVechiRon?: number;
  reducere: number;
  marimi: string[];
  img: string;
  imgCos: string;
  url: string;
}

interface Props {
  toate: ItemFavorit[];
  sugestii: ItemFavorit[];
  imagineGol: string;
  t: Record<string, string>;
}

export default function ListaFavorite({ toate, sugestii, imagineGol, t }: Props) {
  const [montat, setMontat] = useState(false);
  const [iesind, setIesind] = useState<Set<string>>(new Set());
  const [marimi, setMarimi] = useState<Record<string, string>>({});
  const [adaugat, setAdaugat] = useState<string | null>(null);
  const ceasuri = useRef<number[]>([]);

  useEffect(() => {
    hidrateazaFavorite();
    setMontat(true);
    return () => ceasuri.current.forEach((c) => window.clearTimeout(c));
  }, []);

  const slugs = useStore(favorite);
  const monedaVal = useStore(monedaStore);
  const moneda = montat ? monedaVal : 'RON';
  const lista = montat ? toate.filter((p) => slugs.includes(p.slug)) : [];

  const total = lista.reduce((s, p) => s + p.pretRon, 0);
  const economie = lista.reduce((s, p) => s + ((p.pretVechiRon ?? p.pretRon) - p.pretRon), 0);

  function scoate(slug: string) {
    setIesind((s) => new Set(s).add(slug));
    ceasuri.current.push(
      window.setTimeout(() => {
        comutaFavorit(slug);
        setIesind((s) => { const c = new Set(s); c.delete(slug); return c; });
      }, 240),
    );
  }

  function inCos(p: ItemFavorit) {
    adauga({
      slug: p.slug,
      nume: p.nume,
      marime: marimi[p.slug] ?? p.marimi[0],
      pretRon: p.pretRon,
      imagine: p.imgCos,
      url: p.url,
    });
    setAdaugat(p.slug);
    ceasuri.current.push(window.setTimeout(() => setAdaugat(null), 1200));
  }

  function toateInCos() {
    for (const p of lista) {
      adauga({
        slug: p.slug, nume: p.nume, marime: marimi[p.slug] ?? p.marimi[0],
        pretRon: p.pretRon, imagine: p.imgCos, url: p.url,
      });
    }
    drawerDeschis.set(true);
  }

  if (!montat) return <div className="min-h-[20rem]" />;

  /* ---------- gol ---------- */
  if (lista.length === 0) {
    return (
      <div>
        <div className="apare overflow-hidden rounded-[14px] border border-linie">
          <div className="grid items-stretch md:grid-cols-[1.1fr_1fr]">
            <img src={imagineGol} alt="" className="h-full min-h-[15rem] w-full object-cover md:min-h-[24rem]" />
            <div className="flex flex-col justify-center bg-nisip p-8 text-center md:p-10 md:text-left">
              <svg viewBox="0 0 20 18" width="34" height="34" aria-hidden="true"
                className="mx-auto fill-none stroke-camel [animation:puls-blând_2.6s_ease-in-out_infinite] md:mx-0" strokeWidth="1.2">
                <path d="M10 16.5S1.6 11.4 1.6 6.2A4.2 4.2 0 0 1 10 4.3a4.2 4.2 0 0 1 8.4 1.9c0 5.2-8.4 10.3-8.4 10.3Z" strokeLinejoin="round" />
              </svg>
              <p className="mt-4 text-[1.2rem]">{t.gol}</p>
              <p className="mt-2 max-w-[36ch] text-[0.9rem] leading-relaxed text-ciocolata/70">{t.golText}</p>
            </div>
          </div>
        </div>

        {sugestii.length > 0 && (
          <section className="mt-[var(--sectiune-strans)]">
            <h2 className="apare text-[1.35rem]" style={{ '--pas': '120ms' } as any}>{t.sugestii}</h2>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4">
              {sugestii.map((p, i) => (
                <article key={p.slug} className="apare group" style={{ '--pas': `${200 + i * 70}ms` } as any}>
                  <a href={p.url} className="block">
                    <div className="relative overflow-hidden rounded-[10px] bg-nisip">
                      <img src={p.img} alt={p.nume} loading="lazy"
                        className="aspect-[3/4] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                      {p.reducere > 0 && (
                        <span className="absolute left-2.5 top-2.5 rounded-[6px] bg-teracota px-2 py-1 text-[0.72rem] leading-none text-crem tabular-nums">
                          −{p.reducere}%
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-[0.9rem] leading-snug">{p.nume}</h3>
                    <p className="mt-1 text-[0.9rem] tabular-nums">{formatPret(p.pretRon, moneda)}</p>
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  /* ---------- cu produse ---------- */
  return (
    <div>
      <div className="apare mb-7 flex flex-wrap items-center justify-between gap-4 border-y border-linie py-4">
        <p className="text-[0.9rem]" role="status" aria-live="polite">
          {t.numarate.replace('{n}', String(lista.length))}
          <span className="ml-2 tabular-nums text-ciocolata/60">· {formatPret(total, moneda)}</span>
          {economie > 0 && (
            <span className="ml-2 tabular-nums text-teracota">
              {t.economie} {formatPret(economie, moneda)}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={toateInCos}
          className="rounded-[10px] bg-ink px-5 py-2.5 text-[0.87rem] text-crem transition-[background-color,transform] duration-200 hover:bg-ciocolata active:scale-[0.97]"
        >
          {t.toateInCos}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {lista.map((p, i) => (
          <article
            key={p.slug}
            className={`group flex flex-col ${iesind.has(p.slug) ? 'iese' : 'apare'}`}
            style={{ '--pas': `${i * 60}ms` } as any}
          >
            <div className="relative overflow-hidden rounded-[10px] bg-nisip">
              <a href={p.url} className="block">
                <img src={p.img} alt={p.nume} loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
              </a>
              {p.reducere > 0 && (
                <span className="absolute left-2.5 top-2.5 rounded-[6px] bg-teracota px-2 py-1 text-[0.72rem] leading-none text-crem tabular-nums">
                  −{p.reducere}%
                </span>
              )}
              <button
                type="button"
                onClick={() => scoate(p.slug)}
                aria-label={t.sterge}
                className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-crem/92 transition-[transform,background-color] duration-200 hover:bg-crem active:scale-90"
              >
                <svg viewBox="0 0 20 18" width="15" height="15" aria-hidden="true" className="fill-teracota stroke-teracota" strokeWidth="1.4">
                  <path d="M10 16.5S1.6 11.4 1.6 6.2A4.2 4.2 0 0 1 10 4.3a4.2 4.2 0 0 1 8.4 1.9c0 5.2-8.4 10.3-8.4 10.3Z" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <a href={p.url} className="mt-3 block">
              <h2 className="text-[0.92rem] leading-snug">{p.nume}</h2>
              <p className="mt-1 flex items-baseline gap-2 text-[0.92rem] tabular-nums">
                <span className={p.pretVechiRon ? 'text-teracota' : ''}>{formatPret(p.pretRon, moneda)}</span>
                {p.pretVechiRon && (
                  <span className="text-[0.82rem] text-ciocolata/45 line-through">{formatPret(p.pretVechiRon, moneda)}</span>
                )}
              </p>
            </a>

            <div className="mt-auto flex gap-2 pt-3">
              {p.marimi.length > 1 && (
                <select
                  value={marimi[p.slug] ?? p.marimi[0]}
                  onChange={(e) => setMarimi({ ...marimi, [p.slug]: e.currentTarget.value })}
                  aria-label={`${t.marime} ${p.tipNume}`}
                  className="shrink-0 rounded-[8px] border border-linie bg-crem px-2 py-2 text-[0.8rem] outline-none focus:border-teracota"
                >
                  {p.marimi.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
              <button
                type="button"
                onClick={() => inCos(p)}
                className={`min-w-0 flex-1 rounded-[8px] border px-3 py-2 text-[0.83rem] transition-colors duration-200 ${
                  adaugat === p.slug
                    ? 'border-teracota bg-teracota text-crem'
                    : 'border-ciocolata/25 hover:border-ciocolata'
                }`}
              >
                {adaugat === p.slug ? t.adaugat : t.adauga}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
