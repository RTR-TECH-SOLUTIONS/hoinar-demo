import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  cos, subtotalRon, lipsaTransport, schimbaCantitate, sterge,
  moneda as monedaStore,
} from '../stores/cos';
import { useMontat } from '../lib/useMontat';
import { formatPret, PRAG_TRANSPORT_GRATUIT_RON } from '../lib/pret';

interface Props {
  t: Record<string, string>;
  urlFinalizare: string;
  urlMagazin: string;
  imagineGol: string;
  sugestii: Array<{ slug: string; nume: string; pretRon: number; pretVechiRon?: number; reducere: number; img: string; url: string }>;
}

export default function CosPagina({ t, urlFinalizare, urlMagazin, imagineGol, sugestii }: Props) {
  const montat = useMontat();
  const liniiStore = useStore(cos);
  const subtotalStore = useStore(subtotalRon);
  const lipsaStore = useStore(lipsaTransport);
  const monedaVal = useStore(monedaStore);

  const linii = montat ? liniiStore : [];
  const subtotal = montat ? subtotalStore : 0;
  const lipsa = montat ? lipsaStore : PRAG_TRANSPORT_GRATUIT_RON;
  const moneda = montat ? monedaVal : 'RON';

  const [iesind, setIesind] = useState<Set<string>>(new Set());
  const [pulsat, setPulsat] = useState<string | null>(null);
  const [totalPulsat, setTotalPulsat] = useState(false);
  const ceasuri = useRef<number[]>([]);
  const subtotalAnterior = useRef(subtotal);

  useEffect(() => () => ceasuri.current.forEach((c) => window.clearTimeout(c)), []);

  // când subtotalul se schimbă, îl facem să pulseze o clipă
  useEffect(() => {
    if (!montat || subtotal === subtotalAnterior.current) return;
    subtotalAnterior.current = subtotal;
    setTotalPulsat(true);
    ceasuri.current.push(window.setTimeout(() => setTotalPulsat(false), 340));
  }, [subtotal, montat]);

  const cheie = (slug: string, marime: string) => `${slug}|${marime}`;

  function schimba(slug: string, marime: string, cantitate: number) {
    if (cantitate <= 0) return scoate(slug, marime);
    schimbaCantitate(slug, marime, cantitate);
    setPulsat(cheie(slug, marime));
    ceasuri.current.push(window.setTimeout(() => setPulsat(null), 340));
  }

  /** Ștergem din store abia după animația de ieșire. */
  function scoate(slug: string, marime: string) {
    const k = cheie(slug, marime);
    setIesind((s) => new Set(s).add(k));
    ceasuri.current.push(
      window.setTimeout(() => {
        sterge(slug, marime);
        setIesind((s) => {
          const c = new Set(s);
          c.delete(k);
          return c;
        });
      }, 240),
    );
  }

  if (!montat) return <div className="min-h-[18rem]" />;

  if (linii.length === 0) {
    return (
      <div>
        <div className="apare overflow-hidden rounded-[14px] border border-linie">
        <div className="grid items-stretch md:grid-cols-[1.1fr_1fr]">
          <img src={imagineGol} alt="" className="h-full min-h-[15rem] w-full object-cover md:min-h-[22rem]" />
          <div className="flex flex-col justify-center bg-nisip p-8 text-center md:p-10 md:text-left">
            <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"
              className="mx-auto fill-none stroke-camel [animation:puls-blând_2.6s_ease-in-out_infinite] md:mx-0" strokeWidth="1.2">
              <path d="M3 5h2.2l2.1 10.2h10.4L20 8H6.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9.5" cy="19" r="1.3" />
              <circle cx="16.5" cy="19" r="1.3" />
            </svg>
            <p className="mt-4 text-[1.15rem]">{t.gol}</p>
            <p className="mt-2 max-w-[34ch] text-[0.9rem] leading-relaxed text-ciocolata/70">{t.golText}</p>
            <a href={urlMagazin}
              className="mt-6 inline-block w-fit self-center rounded-[10px] bg-ink px-7 py-3.5 text-[0.92rem] text-crem transition-[background-color,transform] duration-200 hover:bg-ciocolata active:scale-[0.97] md:self-start">
              {t.inapoiMagazin}
            </a>
          </div>
        </div>
        </div>

        {sugestii.length > 0 && (
          <section className="mt-[var(--sectiune-strans)]">
            <h2 className="apare text-[1.35rem]" style={{ '--pas': '120ms' } as any}>{t.sugestii}</h2>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4">
              {sugestii.map((p, i) => (
                <a key={p.slug} href={p.url} className="apare group block" style={{ '--pas': `${200 + i * 70}ms` } as any}>
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
                  <p className="mt-1 flex items-baseline gap-2 text-[0.9rem] tabular-nums">
                    <span className={p.pretVechiRon ? 'text-teracota' : ''}>{formatPret(p.pretRon, moneda)}</span>
                    {p.pretVechiRon && (
                      <span className="text-[0.8rem] text-ciocolata/45 line-through">{formatPret(p.pretVechiRon, moneda)}</span>
                    )}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const progres = Math.min(100, (subtotal / PRAG_TRANSPORT_GRATUIT_RON) * 100);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
      <div>
        <ul className="divide-y divide-linie border-y border-linie">
          {linii.map((l, i) => {
            const k = cheie(l.slug, l.marime);
            return (
              <li
                key={k}
                className={`group flex gap-4 rounded-[10px] px-2 py-5 transition-colors duration-200 hover:bg-nisip/45 sm:gap-6 ${iesind.has(k) ? 'iese' : 'apare'}`}
                style={{ '--pas': `${i * 70}ms` } as any}
              >
                <a href={l.url} className="shrink-0 overflow-hidden rounded-[8px]">
                  <img src={l.imagine} alt="" width={96} height={120}
                    className="h-[7.5rem] w-24 object-cover transition-transform duration-500 ease-out hover:scale-[1.06]" />
                </a>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <a href={l.url} className="block text-[0.95rem] leading-snug transition-colors hover:text-teracota">{l.nume}</a>
                      <p className="mt-1 text-[0.83rem] text-ciocolata/60">{t.marime}: {l.marime}</p>
                    </div>
                    <p className={`shrink-0 text-[0.95rem] tabular-nums ${pulsat === k ? 'pop text-teracota' : ''}`}>
                      {formatPret(l.pretRon * l.cantitate, moneda)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                    <div className="inline-flex items-center rounded-[8px] border border-linie">
                      <button type="button" aria-label="-" onClick={() => schimba(l.slug, l.marime, l.cantitate - 1)}
                        className="px-3 py-1.5 text-[1rem] leading-none transition-[color,transform] duration-150 hover:text-teracota active:scale-90">−</button>
                      <span className={`min-w-7 text-center text-[0.88rem] tabular-nums ${pulsat === k ? 'pop' : ''}`}>{l.cantitate}</span>
                      <button type="button" aria-label="+" onClick={() => schimba(l.slug, l.marime, l.cantitate + 1)}
                        className="px-3 py-1.5 text-[1rem] leading-none transition-[color,transform] duration-150 hover:text-teracota active:scale-90">+</button>
                    </div>
                    <button type="button" onClick={() => scoate(l.slug, l.marime)}
                      className="text-[0.83rem] text-ciocolata/60 underline underline-offset-4 transition-colors duration-200 hover:text-teracota">
                      {t.sterge}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <a href={urlMagazin} className="apare mt-6 inline-block text-[0.88rem] underline underline-offset-4 transition-colors hover:text-teracota"
          style={{ '--pas': `${linii.length * 70 + 80}ms` } as any}>
          {t.continua}
        </a>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-total)+1.5rem)] lg:self-start">
        <div className="apare rounded-[12px] border border-linie bg-nisip p-5" style={{ '--pas': '120ms' } as any}>
          <h2 className="text-[1.15rem]">{t.sumar}</h2>

          <div className="mt-4 border-b border-linie pb-4">
            <p className={`text-[0.83rem] transition-colors duration-300 ${lipsa > 0 ? 'text-ciocolata/70' : 'text-teracota'}`}>
              {lipsa > 0 ? t.lipsa.replace('{x}', formatPret(lipsa, moneda)) : t.atins}
            </p>
            <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-crem">
              <div
                className="h-full rounded-full bg-teracota transition-[width] duration-500 ease-out"
                style={{
                  width: `${progres}%`,
                  backgroundImage:
                    lipsa === 0
                      ? 'linear-gradient(90deg, #A15C3A 25%, #C59663 50%, #A15C3A 75%)'
                      : undefined,
                  backgroundSize: lipsa === 0 ? '200% 100%' : undefined,
                  animation: lipsa === 0 ? 'licăr 2.2s linear infinite' : undefined,
                }}
              />
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-ciocolata/70">{t.subtotal}</dt>
              <dd className="tabular-nums">{formatPret(subtotal, moneda)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ciocolata/70">{t.transport}</dt>
              <dd className={`tabular-nums transition-colors duration-300 ${lipsa === 0 ? 'text-teracota' : ''}`}>
                {lipsa > 0 ? t.laFinal : t.gratuit}
              </dd>
            </div>
            <div className="flex justify-between border-t border-linie pt-3 text-[1.05rem]">
              <dt>{t.total}</dt>
              <dd className={`tabular-nums ${totalPulsat ? 'pop text-teracota' : ''}`}>{formatPret(subtotal, moneda)}</dd>
            </div>
          </dl>

          <a href={urlFinalizare}
            className="mt-5 block rounded-[10px] bg-ink px-6 py-3.5 text-center text-[0.93rem] text-crem transition-[background-color,transform] duration-200 hover:bg-ciocolata active:scale-[0.98]">
            {t.cumpara}
          </a>

          <ul className="mt-5 space-y-2 text-[0.8rem] text-ciocolata/65">
            {[t.avantaj1, t.avantaj2, t.avantaj3].map((a, i) => (
              <li key={a} className="apare-x flex items-start gap-2" style={{ '--pas': `${260 + i * 90}ms` } as any}>
                <span aria-hidden="true" className="mt-[0.55em] h-[3px] w-[10px] shrink-0 bg-camel" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
