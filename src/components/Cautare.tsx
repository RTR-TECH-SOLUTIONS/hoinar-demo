import { useMemo, useRef, useState } from 'react';
import { formatPret } from '../lib/pret';

export interface ItemCautare {
  slug: string;
  nume: string;
  tipNume: string;
  colectieNume: string;
  pretRon: number;
  pretVechiRon?: number;
  img: string;
  url: string;
}

interface Props {
  index: ItemCautare[];
  placeholder: string;
  eticheta: string;
  nimic: string;
  toate: string;
  urlToate: string;
}

/** Normalizează pentru căutare: fără diacritice, litere mici. */
function normal(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ăâ]/g, 'a')
    .replace(/[îi]/g, 'i')
    .replace(/[șş]/g, 's')
    .replace(/[țţ]/g, 't');
}

export default function Cautare({ index, placeholder, eticheta, nimic, toate, urlToate }: Props) {
  const [q, setQ] = useState('');
  const [activ, setActiv] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const cautabil = useMemo(
    () => index.map((it) => ({ it, cheie: normal(`${it.nume} ${it.tipNume} ${it.colectieNume}`) })),
    [index],
  );

  const rezultate = useMemo(() => {
    const t = normal(q.trim());
    if (t.length < 2) return [];
    const cuvinte = t.split(/\s+/);
    return cautabil
      .filter(({ cheie }) => cuvinte.every((c) => cheie.includes(c)))
      .slice(0, 6)
      .map(({ it }) => it);
  }, [q, cautabil]);

  const deschis = activ && q.trim().length >= 2;

  return (
    <div
      ref={container}
      className="relative w-full"
      onBlur={(e) => {
        if (!container.current?.contains(e.relatedTarget as Node)) setActiv(false);
      }}
    >
      <label htmlFor="cauta" className="sr-only">{eticheta}</label>
      <input
        id="cauta"
        type="search"
        value={q}
        placeholder={placeholder}
        onChange={(e) => setQ(e.currentTarget.value)}
        onFocus={() => setActiv(true)}
        autoComplete="off"
        className="w-full rounded-[10px] border border-linie bg-nisip/60 px-4 py-2.5 pl-10 text-[0.88rem] outline-none transition-colors placeholder:text-ciocolata/45 focus:border-ciocolata focus:bg-crem"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 fill-none stroke-ciocolata/50"
        strokeWidth="1.6"
      >
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l4 4" strokeLinecap="round" />
      </svg>

      {deschis && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-[10px] border border-linie bg-crem shadow-[0_18px_40px_-20px_rgba(24,22,19,0.4)]">
          {rezultate.length === 0 ? (
            <p className="px-4 py-5 text-[0.87rem] text-ciocolata/65">{nimic}</p>
          ) : (
            <>
              <ul className="divide-y divide-linie/70">
                {rezultate.map((r) => (
                  <li key={r.slug}>
                    <a href={r.url} className="flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-nisip/60">
                      <img src={r.img} alt="" width={40} height={53} className="h-[3.3rem] w-10 shrink-0 rounded-[6px] object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.87rem]">{r.nume}</span>
                        <span className="block text-[0.78rem] tabular-nums text-ciocolata/60">
                          {formatPret(r.pretRon)}
                          {r.pretVechiRon && (
                            <span className="ml-1.5 text-ciocolata/40 line-through">{formatPret(r.pretVechiRon)}</span>
                          )}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <a href={urlToate} className="block border-t border-linie px-4 py-2.5 text-center text-[0.83rem] text-teracota hover:underline">
                {toate}
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
