import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { favorite, comutaFavorit, hidrateazaFavorite } from '../stores/favorite';
import { moneda as monedaStore } from '../stores/cos';
import { formatPret } from '../lib/pret';

interface Item {
  slug: string;
  nume: string;
  pretRon: number;
  pretVechiRon?: number;
  reducere: number;
  img: string;
  url: string;
}

interface Props {
  toate: Item[];
  gol: string;
  golText: string;
  inapoi: string;
  urlMagazin: string;
  sterge: string;
  numarate: string;
  imagineGol: string;
}

export default function ListaFavorite({ toate, gol, golText, inapoi, urlMagazin, sterge, numarate, imagineGol }: Props) {
  const [montat, setMontat] = useState(false);
  const [iesind, setIesind] = useState<Set<string>>(new Set());
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

  /** Scoatem din listă abia după ce s-a terminat animația de ieșire. */
  function scoate(slug: string) {
    setIesind((s) => new Set(s).add(slug));
    ceasuri.current.push(
      window.setTimeout(() => {
        comutaFavorit(slug);
        setIesind((s) => {
          const c = new Set(s);
          c.delete(slug);
          return c;
        });
      }, 240),
    );
  }

  if (!montat) return <div className="min-h-[18rem]" />;

  if (lista.length === 0) {
    return (
      <div className="apare overflow-hidden rounded-[14px] border border-linie">
        <div className="grid items-stretch md:grid-cols-[1.1fr_1fr]">
          <img src={imagineGol} alt="" className="h-full min-h-[15rem] w-full object-cover md:min-h-[22rem]" />
          <div className="flex flex-col justify-center bg-nisip p-8 text-center md:p-10 md:text-left">
            <svg viewBox="0 0 20 18" width="34" height="34" aria-hidden="true"
              className="mx-auto fill-none stroke-camel [animation:puls-blând_2.6s_ease-in-out_infinite] md:mx-0" strokeWidth="1.2">
              <path d="M10 16.5S1.6 11.4 1.6 6.2A4.2 4.2 0 0 1 10 4.3a4.2 4.2 0 0 1 8.4 1.9c0 5.2-8.4 10.3-8.4 10.3Z" strokeLinejoin="round" />
            </svg>
            <p className="mt-4 text-[1.15rem]">{gol}</p>
            <p className="mt-2 max-w-[34ch] text-[0.9rem] leading-relaxed text-ciocolata/70">{golText}</p>
            <a href={urlMagazin}
              className="mt-6 inline-block w-fit self-center rounded-[10px] bg-ink px-7 py-3.5 text-[0.92rem] text-crem transition-[background-color,transform] duration-200 hover:bg-ciocolata active:scale-[0.97] md:self-start">
              {inapoi}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="apare mb-6 text-[0.87rem] text-ciocolata/60" role="status" aria-live="polite">
        {numarate.replace('{n}', String(lista.length))}
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {lista.map((p, i) => (
          <article
            key={p.slug}
            className={`group ${iesind.has(p.slug) ? 'iese' : 'apare'}`}
            style={{ '--pas': `${i * 60}ms` } as any}
          >
            <a href={p.url} className="block">
              <div className="relative overflow-hidden rounded-[10px] bg-nisip">
                <img
                  src={p.img}
                  alt={p.nume}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                {p.reducere > 0 && (
                  <span className="absolute left-2.5 top-2.5 rounded-[6px] bg-teracota px-2 py-1 text-[0.72rem] leading-none text-crem tabular-nums">
                    −{p.reducere}%
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-[0.92rem] leading-snug">{p.nume}</h2>
              <p className="mt-1 flex items-baseline gap-2 text-[0.92rem] tabular-nums">
                <span className={p.pretVechiRon ? 'text-teracota' : ''}>{formatPret(p.pretRon, moneda)}</span>
                {p.pretVechiRon && (
                  <span className="text-[0.82rem] text-ciocolata/45 line-through">{formatPret(p.pretVechiRon, moneda)}</span>
                )}
              </p>
            </a>
            <button
              type="button"
              onClick={() => scoate(p.slug)}
              className="mt-2 inline-flex items-center gap-1.5 text-[0.78rem] text-ciocolata/55 transition-colors duration-200 hover:text-teracota"
            >
              <svg viewBox="0 0 20 18" width="13" height="13" aria-hidden="true" className="fill-teracota stroke-teracota" strokeWidth="1.4">
                <path d="M10 16.5S1.6 11.4 1.6 6.2A4.2 4.2 0 0 1 10 4.3a4.2 4.2 0 0 1 8.4 1.9c0 5.2-8.4 10.3-8.4 10.3Z" strokeLinejoin="round" />
              </svg>
              {sterge}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
