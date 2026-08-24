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
  /** Folosită la afișarea rândului. */
  imagineMica: string;
  /** Trimisă în coș, unde se afișează mai mare. */
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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
      {/* rânduri compacte: se citesc dintr-o privire, spre deosebire de cardurile mari */}
      <ul className="divide-y divide-linie border-y border-linie">
        {piese.map((p) => {
          const bifat = alese.has(p.slug);
          return (
            <li key={p.slug}>
              <div
                className={`flex items-center gap-3.5 py-3 transition-colors duration-200 sm:gap-4 ${
                  bifat ? '' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => comuta(p.slug)}
                  aria-pressed={bifat}
                  aria-label={`${bifat ? t.adaugat : t.adauga1}: ${p.tipNume}`}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-200 active:scale-90 ${
                    bifat ? 'border-ink bg-ink text-crem' : 'border-ciocolata/30 text-ciocolata/50 hover:border-ciocolata'
                  }`}
                >
                  {bifat ? (
                    <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" className="pop fill-none stroke-current" strokeWidth="2.2">
                      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" className="fill-none stroke-current" strokeWidth="2">
                      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                    </svg>
                  )}
                </button>

                <a href={p.url} aria-label={p.tipNume} className="shrink-0 overflow-hidden rounded-[8px] bg-crem">
                  <img
                    src={p.imagineMica}
                    alt=""
                    width={56}
                    height={70}
                    loading="lazy"
                    className="h-[4.4rem] w-14 object-cover transition-transform duration-500 ease-out hover:scale-[1.07]"
                  />
                </a>

                <div className="min-w-0 flex-1">
                  <a href={p.url} className="block truncate text-[0.92rem] transition-colors hover:text-teracota">
                    {p.tipNume}
                  </a>
                  <p className="mt-0.5 flex items-baseline gap-1.5 text-[0.85rem] tabular-nums text-ciocolata/70">
                    {formatPret(p.pretRon, moneda)}
                    {p.pretVechiRon && (
                      <span className="text-[0.76rem] text-ciocolata/40 line-through">
                        {formatPret(p.pretVechiRon, moneda)}
                      </span>
                    )}
                  </p>
                </div>

                {p.marimi.length > 1 && (
                  <select
                    value={marimi[p.slug]}
                    onChange={(e) => setMarimi({ ...marimi, [p.slug]: e.currentTarget.value })}
                    aria-label={`${t.marime} ${p.tipNume}`}
                    className={`shrink-0 rounded-[8px] border bg-crem px-2.5 py-1.5 text-[0.82rem] outline-none transition-colors focus:border-teracota ${
                      bifat ? 'border-linie' : 'border-linie text-ciocolata/45'
                    }`}
                  >
                    {p.marimi.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="lg:sticky lg:top-[calc(var(--header-total)+1.5rem)] lg:self-start">
        <div className="rounded-[12px] border border-linie bg-crem p-5">
          <p className="text-[0.72rem] uppercase tracking-[0.12em] text-ciocolata/55">{t.sumar}</p>

          {/* previzualizarea setului: piesele alese, una peste alta */}
          <div className="mt-4 flex min-h-[3.4rem] items-center">
            {selectate.length === 0 ? (
              <p className="text-[0.85rem] text-ciocolata/50">{t.niciuna}</p>
            ) : (
              <ul className="flex">
                {selectate.slice(0, 4).map((p, i) => (
                  <li key={p.slug} className="apare" style={{ marginLeft: i === 0 ? 0 : '-0.7rem', zIndex: 10 - i, '--pas': `${i * 60}ms` } as any}>
                    <img
                      src={p.imagineMica}
                      alt=""
                      width={44}
                      height={54}
                      className="h-[3.4rem] w-11 rounded-[7px] border-2 border-crem object-cover shadow-[0_2px_8px_-3px_rgba(24,22,19,0.4)]"
                    />
                  </li>
                ))}
                {selectate.length > 4 && (
                  <li className="ml-[-0.7rem] grid h-[3.4rem] w-11 place-items-center rounded-[7px] border-2 border-crem bg-nisip text-[0.8rem] tabular-nums">
                    +{selectate.length - 4}
                  </li>
                )}
              </ul>
            )}
          </div>

          <ul className="mt-4 space-y-1.5 border-t border-linie pt-4">
            {selectate.map((p) => (
              <li key={p.slug} className="flex items-baseline justify-between gap-3 text-[0.85rem]">
                <span className="min-w-0 truncate text-ciocolata/75">
                  {p.tipNume}
                  {p.marimi.length > 1 && <span className="ml-1.5 text-ciocolata/45">{marimi[p.slug]}</span>}
                </span>
                <span className="shrink-0 tabular-nums text-ciocolata/70">{formatPret(p.pretRon, moneda)}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 flex items-baseline justify-between gap-3 border-t border-linie pt-4">
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

          {economie > 0 && (
            <p className="mt-2 text-[0.83rem] text-teracota" role="status" aria-live="polite">
              {t.economie} {formatPret(economie, moneda)} ({Math.round(rata * 100)}%)
            </p>
          )}

          {procUrmator !== null && urmator && (
            <div className="mt-4">
              <div className="h-[4px] w-full overflow-hidden rounded-full bg-nisip">
                <div
                  className="h-full rounded-full bg-camel transition-[width] duration-500 ease-out"
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
            className="mt-5 w-full rounded-[10px] bg-ink px-6 py-3.5 text-[0.93rem] text-crem transition-[background-color,transform] duration-200 hover:bg-ciocolata active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-linie disabled:text-ciocolata/50"
          >
            {t.adauga}
          </button>
          <p className="mt-3 text-[0.78rem] leading-snug text-ciocolata/55">{t.nota}</p>
        </div>
      </aside>
    </div>
  );
}
