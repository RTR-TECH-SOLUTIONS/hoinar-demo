import { useState } from 'react';
import { TABEL, recomanda } from '../lib/marimi';

interface Props {
  lang: 'ro' | 'en';
  t: Record<string, string>;
}

export default function GhidMarimi({ lang, t }: Props) {
  const [gat, setGat] = useState('');
  const [piept, setPiept] = useState('');
  const [rezultat, setRezultat] = useState<string | null>(null);

  function calculeaza(e: React.FormEvent) {
    e.preventDefault();
    const r = recomanda(parseFloat(gat.replace(',', '.')), parseFloat(piept.replace(',', '.')));
    setRezultat(r === null ? t.nimic : r === 'peste' ? t.peste : r);
  }

  const eMarime = rezultat !== null && rezultat.length <= 3;

  return (
    <div>
      <form onSubmit={calculeaza} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="text-[0.85rem] text-ciocolata/75">{t.gat}</span>
          <input
            type="number"
            inputMode="decimal"
            min="5"
            max="120"
            step="0.5"
            value={gat}
            onChange={(e) => setGat(e.currentTarget.value)}
            className="mt-1.5 w-full rounded-[8px] border border-linie bg-crem px-3.5 py-3 text-[0.95rem] outline-none focus:border-teracota"
          />
        </label>
        <label className="block">
          <span className="text-[0.85rem] text-ciocolata/75">{t.piept}</span>
          <input
            type="number"
            inputMode="decimal"
            min="10"
            max="160"
            step="0.5"
            value={piept}
            onChange={(e) => setPiept(e.currentTarget.value)}
            className="mt-1.5 w-full rounded-[8px] border border-linie bg-crem px-3.5 py-3 text-[0.95rem] outline-none focus:border-teracota"
          />
        </label>
        <button
          type="submit"
          className="rounded-[10px] bg-ink px-6 py-3 text-[0.9rem] text-crem transition-colors hover:bg-ciocolata"
        >
          {t.calc}
        </button>
      </form>

      {rezultat !== null && (
        <div
          className="mt-5 rounded-[10px] border border-linie bg-nisip px-5 py-4"
          role="status"
          aria-live="polite"
        >
          {eMarime ? (
            <p className="flex flex-wrap items-baseline gap-2">
              <span className="text-[0.9rem] text-ciocolata/75">{t.rezultat}:</span>
              <span className="font-[family-name:var(--font-serif)] text-[1.8rem] leading-none">
                {rezultat}
              </span>
              <span className="text-[0.85rem] text-ciocolata/65">
                {TABEL.find((r) => r.marime === rezultat)?.exemplu[lang]}
              </span>
            </p>
          ) : (
            <p className="text-[0.9rem]">{rezultat}</p>
          )}
        </div>
      )}

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[30rem] border-collapse text-left text-[0.88rem]">
          <thead>
            <tr className="border-b border-linie text-ciocolata/70">
              <th scope="col" className="py-2.5 pr-4 font-normal">{lang === 'ro' ? 'Mărime' : 'Size'}</th>
              <th scope="col" className="py-2.5 pr-4 font-normal">{lang === 'ro' ? 'Gât (cm)' : 'Neck (cm)'}</th>
              <th scope="col" className="py-2.5 pr-4 font-normal">{lang === 'ro' ? 'Piept (cm)' : 'Chest (cm)'}</th>
              <th scope="col" className="py-2.5 font-normal">{lang === 'ro' ? 'Rase orientative' : 'Typical breeds'}</th>
            </tr>
          </thead>
          <tbody>
            {TABEL.map((r) => (
              <tr key={r.marime} className="border-b border-linie/60">
                <td className="py-2.5 pr-4">{r.marime}</td>
                <td className="py-2.5 pr-4 tabular-nums text-ciocolata/80">{r.gat[0]}–{r.gat[1]}</td>
                <td className="py-2.5 pr-4 tabular-nums text-ciocolata/80">{r.piept[0]}–{r.piept[1]}</td>
                <td className="py-2.5 text-ciocolata/70">{r.exemplu[lang]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
