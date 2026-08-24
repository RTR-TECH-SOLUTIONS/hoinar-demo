import { useEffect, useState } from 'react';
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
  inapoi: string;
  urlMagazin: string;
  sterge: string;
}

export default function ListaFavorite({ toate, gol, inapoi, urlMagazin, sterge }: Props) {
  const [montat, setMontat] = useState(false);
  useEffect(() => {
    hidrateazaFavorite();
    setMontat(true);
  }, []);
  const slugs = useStore(favorite);
  const monedaVal = useStore(monedaStore);
  const moneda = montat ? monedaVal : 'RON';
  const lista = montat ? toate.filter((p) => slugs.includes(p.slug)) : [];

  if (!montat) return <div className="min-h-[12rem]" />;

  if (lista.length === 0) {
    return (
      <div className="py-10">
        <p className="text-ciocolata/70">{gol}</p>
        <a href={urlMagazin} className="mt-6 inline-block rounded-[10px] bg-ink px-7 py-3.5 text-[0.92rem] text-crem transition-colors hover:bg-ciocolata">
          {inapoi}
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4">
      {lista.map((p) => (
        <article key={p.slug} className="group">
          <a href={p.url} className="block">
            <div className="relative overflow-hidden rounded-[10px] bg-nisip">
              <img src={p.img} alt={p.nume} loading="lazy" className="aspect-[3/4] w-full object-cover" />
              {p.reducere > 0 && (
                <span className="absolute left-2.5 top-2.5 rounded-[6px] bg-teracota px-2 py-1 text-[0.72rem] leading-none text-crem tabular-nums">
                  −{p.reducere}%
                </span>
              )}
            </div>
            <h2 className="mt-3 text-[0.92rem] leading-snug">{p.nume}</h2>
            <p className="mt-1 flex items-baseline gap-2 text-[0.92rem] tabular-nums">
              <span className={p.pretVechiRon ? 'text-teracota' : ''}>{formatPret(p.pretRon, moneda)}</span>
              {p.pretVechiRon && <span className="text-[0.82rem] text-ciocolata/45 line-through">{formatPret(p.pretVechiRon, moneda)}</span>}
            </p>
          </a>
          <button
            type="button"
            onClick={() => comutaFavorit(p.slug)}
            className="mt-1.5 text-[0.78rem] text-ciocolata/55 underline underline-offset-4 transition-colors hover:text-teracota"
          >
            {sterge}
          </button>
        </article>
      ))}
    </div>
  );
}
