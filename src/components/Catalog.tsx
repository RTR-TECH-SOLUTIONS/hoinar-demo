import { useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import { moneda as monedaStore } from '../stores/cos';
import { useMontat } from '../lib/useMontat';
import { formatPret } from '../lib/pret';

export interface ProdusCard {
  slug: string;
  nume: string;
  tip: string;
  colectie: string;
  pretRon: number;
  pretVechiRon?: number;
  reducere: number;
  rating: number;
  nrRecenzii: number;
  nou: boolean;
  pretIntregRon?: number;
  economieRon: number;
  esteSet: boolean;
  marimi: string[];
  stoc: number;
  bestseller: boolean;
  url: string;
  img1: string;
  img2: string;
}

interface Optiune { slug: string; nume: string }

interface Props {
  produse: ProdusCard[];
  colectii: Optiune[];
  tipuri: Optiune[];
  marimi: string[];
  ascunde?: ('colectie' | 'tip')[];
  t: Record<string, string>;
}

type Sortare = 'recomandate' | 'crescator' | 'descrescator';

export default function Catalog({ produse, colectii, tipuri, marimi, ascunde = [], t }: Props) {
  const montat = useMontat();
  const monedaVal = useStore(monedaStore);
  const moneda = montat ? monedaVal : 'RON';
  const [colectie, setColectie] = useState<string | null>(null);
  const [tip, setTip] = useState<string | null>(null);
  const [marime, setMarime] = useState<string | null>(null);
  const [doarStoc, setDoarStoc] = useState(false);
  const [doarReduse, setDoarReduse] = useState(false);
  const [sortare, setSortare] = useState<Sortare>('recomandate');
  const [panouDeschis, setPanouDeschis] = useState(false);

  const numarFiltre = [colectie, tip, marime, doarStoc || null, doarReduse || null].filter(Boolean).length;
  const areFiltru = numarFiltre > 0;

  const lista = useMemo(() => {
    let l = produse.filter(
      (p) =>
        (!doarReduse || p.reducere > 0) &&
        (!colectie || p.colectie === colectie) &&
        (!tip || p.tip === tip) &&
        (!marime || p.marimi.includes(marime)) &&
        (!doarStoc || p.stoc > 0),
    );
    if (sortare === 'crescator') l = [...l].sort((a, b) => a.pretRon - b.pretRon);
    else if (sortare === 'descrescator') l = [...l].sort((a, b) => b.pretRon - a.pretRon);
    else l = [...l].sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
    return l;
  }, [produse, colectie, tip, marime, doarStoc, doarReduse, sortare]);

  function Grup({
    titlu,
    optiuni,
    valoare,
    seteaza,
  }: {
    titlu: string;
    optiuni: Optiune[];
    valoare: string | null;
    seteaza: (v: string | null) => void;
  }) {
    return (
      <div>
        <h3 className="font-[family-name:var(--font-sans)] text-[0.8rem] font-normal text-ciocolata/60">
          {titlu}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {optiuni.map((o) => {
            const activ = valoare === o.slug;
            return (
              <button
                key={o.slug}
                type="button"
                aria-pressed={activ}
                onClick={() => seteaza(activ ? null : o.slug)}
                className={`rounded-[8px] border px-3 py-1.5 text-[0.83rem] transition-colors ${
                  activ ? 'border-ink bg-ink text-crem' : 'border-linie hover:border-ciocolata'
                }`}
              >
                {o.nume}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
      <aside className="lg:sticky lg:top-[calc(var(--header-total)+1.5rem)] lg:self-start">
        <button
          type="button"
          onClick={() => setPanouDeschis((v) => !v)}
          aria-expanded={panouDeschis}
          aria-controls="panou-filtre"
          className="flex w-full items-center justify-between rounded-[10px] border border-linie px-4 py-3 text-[0.9rem] lg:hidden"
        >
          <span>
            {t.titlu}
            {numarFiltre > 0 && (
              <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[0.72rem] text-crem tabular-nums">
                {numarFiltre}
              </span>
            )}
          </span>
          <span aria-hidden="true" className={`text-[1.05rem] leading-none text-ciocolata/50 transition-transform duration-200 ${panouDeschis ? 'rotate-45' : ''}`}>
            +
          </span>
        </button>

        <div
          id="panou-filtre"
          className={`space-y-6 ${panouDeschis ? 'mt-5' : 'hidden'} lg:mt-0 lg:block`}
        >
          {!ascunde.includes('tip') && (
            <Grup titlu={t.tip} optiuni={tipuri} valoare={tip} seteaza={setTip} />
          )}
          {!ascunde.includes('colectie') && (
            <Grup titlu={t.colectie} optiuni={colectii} valoare={colectie} seteaza={setColectie} />
          )}
          <Grup
            titlu={t.marime}
            optiuni={marimi.map((m) => ({ slug: m, nume: m }))}
            valoare={marime}
            seteaza={setMarime}
          />
          <div className="space-y-2.5">
            <label className="flex cursor-pointer items-center gap-2.5 text-[0.85rem]">
              <input
                type="checkbox"
                checked={doarReduse}
                onChange={(e) => setDoarReduse(e.currentTarget.checked)}
                className="h-[1.05rem] w-[1.05rem] cursor-pointer accent-[#a15c3a]"
              />
              <span className="text-teracota">{t.doarReduceri}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-[0.85rem]">
              <input
                type="checkbox"
                checked={doarStoc}
                onChange={(e) => setDoarStoc(e.currentTarget.checked)}
                className="h-[1.05rem] w-[1.05rem] cursor-pointer accent-[#181613]"
              />
              {t.inStoc}
            </label>
          </div>
          {areFiltru && (
            <button
              type="button"
              onClick={() => {
                setColectie(null);
                setTip(null);
                setMarime(null);
                setDoarStoc(false);
                setDoarReduse(false);
              }}
              className="text-[0.83rem] underline underline-offset-4 hover:text-teracota"
            >
              {t.sterge}
            </button>
          )}
        </div>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-linie pb-4">
          <p className="text-[0.85rem] text-ciocolata/65" role="status" aria-live="polite">
            {lista.length} {t.rezultate}
          </p>
          <label className="flex items-center gap-2 text-[0.85rem]">
            <span className="text-ciocolata/65">{t.sortare}</span>
            <select
              value={sortare}
              onChange={(e) => setSortare(e.currentTarget.value as Sortare)}
              className="cursor-pointer rounded-[8px] border border-linie bg-crem px-2.5 py-1.5 outline-none focus:border-teracota"
            >
              <option value="recomandate">{t.recomandate}</option>
              <option value="crescator">{t.pretCresc}</option>
              <option value="descrescator">{t.pretDesc}</option>
            </select>
          </label>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-3">
          {lista.map((p) => (
            <article key={p.slug} className="group">
              <a href={p.url} className="block">
                <div className="relative overflow-hidden rounded-[10px] bg-nisip">
                  <img
                    src={p.img1}
                    alt={p.nume}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition-opacity duration-300 ease-out group-hover:opacity-0"
                  />
                  <img
                    src={p.img2}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 aspect-[3/4] w-full object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                  />
                  <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
                    <div className="flex flex-col items-start gap-1.5">
                      {p.reducere > 0 && (
                        <span className="rounded-[6px] bg-teracota px-2 py-1 text-[0.72rem] font-medium leading-none text-crem tabular-nums">
                          −{p.reducere}%
                        </span>
                      )}
                      {p.esteSet && (
                        <span className="rounded-[6px] bg-ink px-2 py-1 text-[0.72rem] leading-none text-crem">
                          {t.set}
                        </span>
                      )}
                      {p.nou && p.reducere === 0 && (
                        <span className="rounded-[6px] bg-ciocolata px-2 py-1 text-[0.72rem] leading-none text-crem">
                          {t.nou}
                        </span>
                      )}
                    </div>
                    {p.stoc > 0 && p.stoc <= 6 && (
                      <span className="rounded-[6px] bg-crem/95 px-2 py-1 text-[0.72rem] leading-none text-teracota tabular-nums">
                        {t.ultimele} {p.stoc}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="flex items-center gap-[1px]" role="img" aria-label={`${p.rating} / 5`}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <svg key={i} width="11" height="11" viewBox="0 0 12 12" aria-hidden="true" className={i < Math.round(p.rating) ? 'fill-camel' : 'fill-linie'}>
                        <path d="M6 0.6l1.6 3.4 3.7.5-2.7 2.6.7 3.7L6 9.05 2.7 10.8l.7-3.7L.7 4.5l3.7-.5z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[0.75rem] tabular-nums text-ciocolata/55">({p.nrRecenzii})</span>
                </div>
                <h3 className="mt-1.5 text-[0.92rem] leading-snug">{p.nume}</h3>
                <p className="mt-1 flex flex-wrap items-baseline gap-2 text-[0.92rem] tabular-nums">
                  <span className={p.pretVechiRon ? 'font-medium text-teracota' : 'text-ciocolata'}>
                    {formatPret(p.pretRon, moneda)}
                  </span>
                  {p.pretVechiRon && (
                    <span className="text-[0.82rem] text-ciocolata/45 line-through">
                      {formatPret(p.pretVechiRon, moneda)}
                    </span>
                  )}
                </p>
              </a>
            </article>
          ))}
        </div>

        {lista.length === 0 && (
          <p className="py-16 text-center text-ciocolata/65">{t.nimic}</p>
        )}
      </div>
    </div>
  );
}
