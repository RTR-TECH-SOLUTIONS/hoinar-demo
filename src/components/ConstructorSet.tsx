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

  /** Praguri afișate, ca să se vadă ce câștigi dacă mai adaugi o piesă. */
  const praguri = [
    { n: 2, proc: 5 },
    { n: 3, proc: 10 },
    { n: 4, proc: 15 },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
      <div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {piese.map((p) => {
            const bifat = alese.has(p.slug);
            return (
              <li key={p.slug}>
                <div
                  className={`flex h-full items-center gap-3.5 rounded-[10px] border bg-crem p-3 transition-colors ${
                    bifat ? 'border-ciocolata' : 'border-linie hover:border-camel'
                  }`}
                >
                  <input
                    id={`set-${p.slug}`}
                    type="checkbox"
                    checked={bifat}
                    onChange={() => comuta(p.slug)}
                    className="h-[1.15rem] w-[1.15rem] shrink-0 cursor-pointer accent-[#181613]"
                  />
                  <img
                    src={p.imagine}
                    alt=""
                    width={52}
                    height={68}
                    loading="lazy"
                    className="h-[4.25rem] w-[3.25rem] shrink-0 rounded-[6px] object-cover"
                  />
                  <label htmlFor={`set-${p.slug}`} className="min-w-0 flex-1 cursor-pointer">
                    <span className="block text-[0.9rem] leading-snug">{p.tipNume}</span>
                    <span className="mt-0.5 block text-[0.82rem] tabular-nums text-ciocolata/65">
                      {formatPret(p.pretRon, moneda)}
                    </span>
                    {bifat && p.marimi.length > 1 && (
                      <select
                        value={marimi[p.slug]}
                        onChange={(e) => setMarimi({ ...marimi, [p.slug]: e.currentTarget.value })}
                        onClick={(e) => e.preventDefault()}
                        aria-label={`${t.marime} ${p.tipNume}`}
                        className="mt-1.5 rounded-[6px] border border-linie bg-crem px-2 py-1 text-[0.8rem] outline-none focus:border-teracota"
                      >
                        {p.marimi.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    )}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2" aria-hidden="true">
          {praguri.map((pr) => (
            <span
              key={pr.n}
              className={`rounded-[6px] px-2.5 py-1.5 text-[0.78rem] transition-colors ${
                selectate.length >= pr.n ? 'bg-teracota text-crem' : 'bg-crem text-ciocolata/55'
              }`}
            >
              {pr.n}+ {t.piese} · −{pr.proc}%
            </span>
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-total)+1.5rem)] lg:self-start">
        <div className="rounded-[12px] border border-linie bg-crem p-5">
          <p className="text-[0.85rem] text-ciocolata/65">
            {selectate.length} {selectate.length === 1 ? t.piesa : t.piese}
          </p>
          <p className="mt-2 flex items-baseline gap-2.5">
            <span className="font-[family-name:var(--font-serif)] text-[1.85rem] leading-none tabular-nums" data-total-ron={total}>
              {formatPret(total, moneda)}
            </span>
            {economie > 0 && (
              <span className="text-[0.9rem] tabular-nums text-ciocolata/45 line-through">
                {formatPret(intreg, moneda)}
              </span>
            )}
          </p>
          <p
            className={`mt-2 text-[0.85rem] leading-snug ${economie > 0 ? 'text-teracota' : 'text-ciocolata/55'}`}
            role="status"
            aria-live="polite"
          >
            {economie > 0
              ? `${t.economie} ${formatPret(economie, moneda)} (${Math.round(rata * 100)}%)`
              : t.indiciu}
          </p>
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
