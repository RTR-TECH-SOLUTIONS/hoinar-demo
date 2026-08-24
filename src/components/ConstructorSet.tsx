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
        // reducerea se aplică proporțional pe fiecare linie, ca subtotalul din coș să fie corect
        pretRon: Math.round(p.pretRon * (1 - rata)),
        imagine: p.imagine,
        url: p.url,
      })),
    );
    drawerDeschis.set(true);
  }

  return (
    <section className="rounded-[14px] border border-linie bg-nisip p-5 sm:p-7">
      <h2 className="text-[1.5rem]">{t.titlu}</h2>
      <p className="mt-2 max-w-[52ch] text-[0.9rem] leading-relaxed text-ciocolata/75">{t.text}</p>

      <ul className="mt-6 divide-y divide-linie">
        {piese.map((p) => {
          const bifat = alese.has(p.slug);
          return (
            <li key={p.slug} className="py-3">
              <div className="flex items-center gap-3.5">
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
                  width={44}
                  height={58}
                  loading="lazy"
                  className="h-[3.6rem] w-11 shrink-0 rounded-[6px] object-cover"
                />
                <label htmlFor={`set-${p.slug}`} className="min-w-0 flex-1 cursor-pointer">
                  <span className="block text-[0.92rem] leading-snug">{p.tipNume}</span>
                  <span className="block text-[0.82rem] tabular-nums text-ciocolata/65">
                    {formatPret(p.pretRon, moneda)}
                  </span>
                </label>
                {bifat && p.marimi.length > 1 && (
                  <select
                    value={marimi[p.slug]}
                    onChange={(e) => setMarimi({ ...marimi, [p.slug]: e.currentTarget.value })}
                    aria-label={`${t.marime} ${p.tipNume}`}
                    className="shrink-0 rounded-[8px] border border-linie bg-crem px-2.5 py-1.5 text-[0.85rem] outline-none focus:border-teracota"
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

      <div className="mt-5 border-t border-linie pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[0.9rem]">
            {t.total}
            <span className="ml-2 text-ciocolata/60">
              ({selectate.length} {selectate.length === 1 ? t.piesa : t.piese})
            </span>
          </span>
          <span className="flex items-baseline gap-2.5">
            {economie > 0 && (
              <span className="text-[0.9rem] tabular-nums text-ciocolata/45 line-through">
                {formatPret(intreg, moneda)}
              </span>
            )}
            <span
              data-total-ron={total}
              className="font-[family-name:var(--font-serif)] text-[1.6rem] leading-none tabular-nums"
            >
              {formatPret(total, moneda)}
            </span>
          </span>
        </div>

        <p
          className={`mt-2 text-[0.85rem] ${economie > 0 ? 'text-teracota' : 'text-ciocolata/55'}`}
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
      </div>
    </section>
  );
}
