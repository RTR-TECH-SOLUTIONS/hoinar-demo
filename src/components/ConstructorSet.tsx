import { useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import { adaugaMulte, drawerDeschis, moneda as monedaStore } from '../stores/cos';
import { useMontat } from '../lib/useMontat';
import { formatPret } from '../lib/pret';
import { reducereSet } from '../lib/marimi';

export interface PiesaSet {
  slug: string;
  nume: string;
  tipNume: string;
  pretRon: number;
  pretVechiRon?: number;
  imagine: string;
  url: string;
  marimi: string[];
}

interface Props {
  piese: PiesaSet[];
  presel: string[];
  t: Record<string, string>;
}

export default function ConstructorSet({ piese, presel, t }: Props) {
  const montat = useMontat();
  const monedaVal = useStore(monedaStore);
  const moneda = montat ? monedaVal : 'RON';

  const [alese, setAlese] = useState<Set<string>>(new Set(presel));
  const [marimi, setMarimi] = useState<Record<string, string>>(
    Object.fromEntries(piese.map((p) => [p.slug, p.marimi[0]])),
  );

  const selectate = useMemo(() => piese.filter((p) => alese.has(p.slug)), [piese, alese]);
  const intreg = selectate.reduce((s, p) => s + p.pretRon, 0);
  const rata = reducereSet(selectate.length);
  const total = Math.round(intreg * (1 - rata));
  const economie = intreg - total;

  const urmator = [2, 3, 4].find((n) => selectate.length < n);
  const procUrmator = urmator ? Math.round(reducereSet(urmator) * 100) : null;

  function comuta(slug: string) {
    const copie = new Set(alese);
    if (copie.has(slug)) copie.delete(slug);
    else copie.add(slug);
    setAlese(copie);
  }

  function adaugaTot() {
    if (selectate.length === 0) return;
    adaugaMulte(
      selectate.map((p) => ({
        slug: p.slug,
        nume: p.nume,
        marime: marimi[p.slug] ?? p.marimi[0],
        // reducerea se împarte pe fiecare linie, ca subtotalul din coș să fie corect
        pretRon: Math.round(p.pretRon * (1 - rata)),
        imagine: p.imagine,
        url: p.url,
      })),
    );
    drawerDeschis.set(true);
  }

  return (
    <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
      <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        {piese.map((p) => {
          const bifat = alese.has(p.slug);
          return (
            <li key={p.slug}>
              <div
                className={`flex h-full flex-col overflow-hidden rounded-[10px] border bg-crem transition-colors ${
                  bifat ? 'border-ciocolata' : 'border-linie'
                }`}
              >
                <a href={p.url} className="relative block overflow-hidden bg-nisip">
                  <img
                    src={p.imagine}
                    alt={p.tipNume}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-300 ease-out hover:scale-[1.04]"
                  />
                  {bifat && (
                    <span
                      aria-hidden="true"
                      className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-crem"
                    >
                      <svg viewBox="0 0 16 16" width="11" height="11" className="fill-none stroke-current" strokeWidth="2">
                        <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </a>

                <div className="flex flex-1 flex-col p-3">
                  <p className="text-[0.87rem] leading-snug">{p.tipNume}</p>
                  <p className="mt-0.5 flex items-baseline gap-1.5 text-[0.85rem] tabular-nums text-ciocolata/70">
                    {formatPret(p.pretRon, moneda)}
                    {p.pretVechiRon && (
                      <span className="text-[0.76rem] text-ciocolata/40 line-through">
                        {formatPret(p.pretVechiRon, moneda)}
                      </span>
                    )}
                  </p>

                  {p.marimi.length > 1 && (
                    <select
                      value={marimi[p.slug]}
                      onChange={(e) => setMarimi({ ...marimi, [p.slug]: e.currentTarget.value })}
                      aria-label={`${t.marime} ${p.tipNume}`}
                      className={`mt-2.5 w-full rounded-[7px] border border-linie bg-crem px-2 py-1.5 text-[0.8rem] outline-none focus:border-teracota ${
                        bifat ? '' : 'text-ciocolata/45'
                      }`}
                    >
                      {p.marimi.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={() => comuta(p.slug)}
                    aria-pressed={bifat}
                    className={`mt-2.5 w-full rounded-[8px] border px-3 py-2 text-[0.83rem] transition-colors ${
                      bifat
                        ? 'border-ink bg-ink text-crem hover:bg-ciocolata'
                        : 'border-ciocolata/25 hover:border-ciocolata'
                    }`}
                  >
                    {bifat ? t.adaugat : t.adauga1}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="lg:sticky lg:top-[calc(var(--header-total)+1.5rem)] lg:self-start">
        <div className="rounded-[12px] border border-linie bg-crem p-5">
          <p className="text-[0.8rem] uppercase tracking-[0.12em] text-ciocolata/55">{t.sumar}</p>

          <ul className="mt-3 space-y-1.5 border-b border-linie pb-4">
            {selectate.length === 0 ? (
              <li className="text-[0.85rem] text-ciocolata/50">{t.niciuna}</li>
            ) : (
              selectate.map((p) => (
                <li key={p.slug} className="flex items-baseline justify-between gap-3 text-[0.85rem]">
                  <span className="min-w-0 truncate text-ciocolata/75">
                    {p.tipNume}
                    <span className="ml-1.5 text-ciocolata/45">{marimi[p.slug]}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-ciocolata/70">{formatPret(p.pretRon, moneda)}</span>
                </li>
              ))
            )}
          </ul>

          <p className="mt-4 flex items-baseline justify-between gap-3">
            <span className="text-[0.87rem]">{t.total}</span>
            <span className="flex items-baseline gap-2">
              {economie > 0 && (
                <span className="text-[0.85rem] tabular-nums text-ciocolata/40 line-through">
                  {formatPret(intreg, moneda)}
                </span>
              )}
              <span className="font-[family-name:var(--font-serif)] text-[1.7rem] leading-none tabular-nums" data-total-ron={total}>
                {formatPret(total, moneda)}
              </span>
            </span>
          </p>

          <p
            className={`mt-2.5 text-[0.83rem] leading-snug ${economie > 0 ? 'text-teracota' : 'text-ciocolata/55'}`}
            role="status"
            aria-live="polite"
          >
            {economie > 0
              ? `${t.economie} ${formatPret(economie, moneda)} (${Math.round(rata * 100)}%)`
              : t.indiciu}
          </p>

          {procUrmator !== null && urmator && (
            <div className="mt-4">
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-nisip">
                <div
                  className="h-full rounded-full bg-camel transition-[width] duration-300 ease-out"
                  style={{ width: `${Math.min(100, (selectate.length / urmator) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[0.8rem] text-ciocolata/60">
                {t.inca.replace('{n}', String(urmator - selectate.length)).replace('{p}', String(procUrmator))}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={adaugaTot}
            disabled={selectate.length === 0}
            className="mt-5 w-full rounded-[10px] bg-ink px-6 py-3.5 text-[0.93rem] text-crem transition-colors hover:bg-ciocolata disabled:cursor-not-allowed disabled:bg-linie disabled:text-ciocolata/50"
          >
            {t.adauga}
          </button>
          <p className="mt-3 text-[0.78rem] leading-snug text-ciocolata/55">{t.nota}</p>
        </div>
      </aside>
    </div>
  );
}
