import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import { moneda as monedaStore } from '../stores/cos';
import { useMontat } from '../lib/useMontat';
import { formatPret } from '../lib/pret';

export interface ProdusCard {
  slug: string;
  nume: string;
  tip: string;
  colectie: string;
  culoare: string;
  culoareHex: string;
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

interface Optiune { slug: string; nume: string; hex?: string }

interface Props {
  produse: ProdusCard[];
  culori: Optiune[];
  tipuri: Optiune[];
  marimi: string[];
  ascunde?: ('culoare' | 'tip')[];
  t: Record<string, string>;
}

type Sortare = 'recomandate' | 'crescator' | 'descrescator';

const INTERVALE = [
  { slug: 'sub-100', min: 0, max: 99 },
  { slug: '100-200', min: 100, max: 200 },
  { slug: '200-300', min: 200, max: 300 },
  { slug: 'peste-300', min: 300, max: Infinity },
];

export default function Catalog({ produse, culori, tipuri, marimi, ascunde = [], t }: Props) {
  const montat = useMontat();
  const monedaVal = useStore(monedaStore);
  const moneda = montat ? monedaVal : 'RON';

  const [culoare, setCuloare] = useState<string | null>(null);
  const [tip, setTip] = useState<string | null>(null);
  const [marime, setMarime] = useState<string | null>(null);
  const [interval, setInterval_] = useState<string | null>(null);
  const [doarStoc, setDoarStoc] = useState(false);
  const [doarReduse, setDoarReduse] = useState(false);
  const [sortare, setSortare] = useState<Sortare>('recomandate');
  const [panouMobil, setPanouMobil] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get('colectie') ?? q.get('culoare');
    const ti = q.get('tip');
    const m = q.get('marime');
    if (c) setCuloare(c);
    if (ti) setTip(ti);
    if (m) setMarime(m);
    if (q.get('reduceri') === '1') setDoarReduse(true);
  }, []);

  const filtre = { culoare, tip, marime, interval, doarStoc, doarReduse };
  const numarFiltre = [culoare, tip, marime, interval, doarStoc || null, doarReduse || null].filter(Boolean).length;

  /** Aplică toate filtrele, opțional sărind peste unul (pentru numărătoare). */
  function aplica(p: ProdusCard, sari?: keyof typeof filtre) {
    if (sari !== 'culoare' && culoare && p.colectie !== culoare) return false;
    if (sari !== 'tip' && tip && p.tip !== tip) return false;
    if (sari !== 'marime' && marime && !p.marimi.includes(marime)) return false;
    if (sari !== 'interval' && interval) {
      const iv = INTERVALE.find((x) => x.slug === interval)!;
      if (p.pretRon < iv.min || p.pretRon > iv.max) return false;
    }
    if (sari !== 'doarStoc' && doarStoc && p.stoc <= 0) return false;
    if (sari !== 'doarReduse' && doarReduse && p.reducere === 0) return false;
    return true;
  }

  const lista = useMemo(() => {
    let l = produse.filter((p) => aplica(p));
    if (sortare === 'crescator') l = [...l].sort((a, b) => a.pretRon - b.pretRon);
    else if (sortare === 'descrescator') l = [...l].sort((a, b) => b.pretRon - a.pretRon);
    else l = [...l].sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
    return l;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produse, culoare, tip, marime, interval, doarStoc, doarReduse, sortare]);

  const numara = (faceta: keyof typeof filtre, test: (p: ProdusCard) => boolean) =>
    produse.filter((p) => aplica(p, faceta) && test(p)).length;

  function reseteaza() {
    setCuloare(null);
    setTip(null);
    setMarime(null);
    setInterval_(null);
    setDoarStoc(false);
    setDoarReduse(false);
  }

  const Titlu = ({ children }: { children: any }) => (
    <h3 className="text-[0.72rem] uppercase tracking-[0.12em] text-ciocolata/55">{children}</h3>
  );

  const Rand = ({
    activ, la, eticheta, nr, pastila,
  }: { activ: boolean; la: () => void; eticheta: string; nr: number; pastila?: string }) => (
    <li>
      <button
        type="button"
        onClick={la}
        aria-pressed={activ}
        disabled={nr === 0 && !activ}
        className={`flex w-full items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-left text-[0.87rem] transition-colors ${
          activ ? 'bg-ink text-crem' : 'hover:bg-nisip/70 disabled:opacity-35 disabled:hover:bg-transparent'
        }`}
      >
        {pastila && (
          <span
            aria-hidden="true"
            className={`inline-block h-[1.05rem] w-[1.05rem] shrink-0 rounded-full ring-1 ${activ ? 'ring-crem/60' : 'ring-linie'}`}
            style={{ background: pastila }}
          />
        )}
        <span className="min-w-0 flex-1 truncate">{eticheta}</span>
        <span className={`text-[0.76rem] tabular-nums ${activ ? 'text-crem/65' : 'text-ciocolata/45'}`}>{nr}</span>
      </button>
    </li>
  );

  const filtreBloc = (
    <div className="space-y-7">
      {!ascunde.includes('culoare') && (
        <div>
          <Titlu>{t.culoare}</Titlu>
          <ul className="mt-2 space-y-0.5">
            {culori.map((c) => (
              <Rand
                key={c.slug}
                activ={culoare === c.slug}
                la={() => setCuloare(culoare === c.slug ? null : c.slug)}
                eticheta={c.nume}
                pastila={c.hex}
                nr={numara('culoare', (p) => p.colectie === c.slug)}
              />
            ))}
          </ul>
        </div>
      )}

      <div>
        <Titlu>{t.marime}</Titlu>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {marimi.map((m) => {
            const activ = marime === m;
            const nr = numara('marime', (p) => p.marimi.includes(m));
            return (
              <button
                key={m}
                type="button"
                aria-pressed={activ}
                disabled={nr === 0 && !activ}
                onClick={() => setMarime(activ ? null : m)}
                className={`min-w-[2.75rem] rounded-[8px] border px-2.5 py-1.5 text-[0.83rem] transition-colors ${
                  activ ? 'border-ink bg-ink text-crem' : 'border-linie bg-crem hover:border-ciocolata disabled:opacity-35'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {!ascunde.includes('tip') && (
        <div>
          <Titlu>{t.tip}</Titlu>
          <ul className="mt-2 space-y-0.5">
            {tipuri.map((x) => (
              <Rand
                key={x.slug}
                activ={tip === x.slug}
                la={() => setTip(tip === x.slug ? null : x.slug)}
                eticheta={x.nume}
                nr={numara('tip', (p) => p.tip === x.slug)}
              />
            ))}
          </ul>
        </div>
      )}

      <div>
        <Titlu>{t.pret}</Titlu>
        <ul className="mt-2 space-y-0.5">
          {INTERVALE.map((iv) => (
            <Rand
              key={iv.slug}
              activ={interval === iv.slug}
              la={() => setInterval_(interval === iv.slug ? null : iv.slug)}
              eticheta={
                iv.max === Infinity
                  ? `${t.peste} ${formatPret(iv.min, moneda)}`
                  : iv.min === 0
                    ? `${t.sub} ${formatPret(iv.max + 1, moneda)}`
                    : `${formatPret(iv.min, moneda)} – ${formatPret(iv.max, moneda)}`
              }
              nr={numara('interval', (p) => p.pretRon >= iv.min && p.pretRon <= iv.max)}
            />
          ))}
        </ul>
      </div>

      <div className="space-y-2.5 border-t border-linie pt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-[0.87rem]">
          <input type="checkbox" checked={doarReduse} onChange={(e) => setDoarReduse(e.currentTarget.checked)}
            className="h-[1.05rem] w-[1.05rem] cursor-pointer accent-[#a15c3a]" />
          <span className="text-teracota">{t.doarReduceri}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-[0.87rem]">
          <input type="checkbox" checked={doarStoc} onChange={(e) => setDoarStoc(e.currentTarget.checked)}
            className="h-[1.05rem] w-[1.05rem] cursor-pointer accent-[#181613]" />
          {t.inStoc}
        </label>
      </div>

      {numarFiltre > 0 && (
        <button type="button" onClick={reseteaza}
          className="text-[0.83rem] underline underline-offset-4 hover:text-teracota">
          {t.sterge}
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-12">
      <aside className="lg:sticky lg:top-[calc(var(--header-total)+1.5rem)] lg:self-start">
        <button
          type="button"
          onClick={() => setPanouMobil((v) => !v)}
          aria-expanded={panouMobil}
          aria-controls="panou-filtre"
          className="flex w-full items-center justify-between rounded-[10px] border border-linie px-4 py-3 text-[0.9rem] lg:hidden"
        >
          <span className="inline-flex items-center gap-2.5">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="fill-none stroke-current" strokeWidth="1.5">
              <path d="M2 4h12M4 8h8M6.5 12h3" strokeLinecap="round" />
            </svg>
            {t.titlu}
            {numarFiltre > 0 && (
              <span className="inline-grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-ink px-1 text-[0.68rem] leading-none text-crem tabular-nums">
                {numarFiltre}
              </span>
            )}
          </span>
          <span aria-hidden="true" className={`text-[1.05rem] leading-none text-ciocolata/50 transition-transform duration-200 ${panouMobil ? 'rotate-45' : ''}`}>+</span>
        </button>

        <div id="panou-filtre" className={`${panouMobil ? 'mt-6' : 'hidden'} lg:mt-0 lg:block`}>
          <p className="mb-5 hidden text-[0.8rem] uppercase tracking-[0.12em] text-ciocolata lg:block">{t.titlu}</p>
          {filtreBloc}
        </div>
      </aside>

      <div>
        <div className="flex items-center justify-between gap-4 border-b border-linie pb-4">
          <p className="text-[0.85rem] text-ciocolata/65" role="status" aria-live="polite">
            {lista.length} {t.rezultate}
          </p>
          <label className="flex items-center gap-2 text-[0.85rem]">
            <span className="sr-only sm:not-sr-only sm:text-ciocolata/65">{t.sortare}</span>
            <select
              value={sortare}
              onChange={(e) => setSortare(e.currentTarget.value as Sortare)}
              className="cursor-pointer rounded-[8px] border border-linie bg-crem px-2.5 py-2 outline-none focus:border-teracota"
            >
              <option value="recomandate">{t.recomandate}</option>
              <option value="crescator">{t.pretCresc}</option>
              <option value="descrescator">{t.pretDesc}</option>
            </select>
          </label>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
          {lista.map((p) => (
            <article key={p.slug} className="group">
              <a href={p.url} className="block">
                <div className="relative overflow-hidden rounded-[10px] bg-nisip">
                  <img src={p.img1} alt={p.nume} loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition-opacity duration-300 ease-out group-hover:opacity-0" />
                  <img src={p.img2} alt="" loading="lazy"
                    className="absolute inset-0 aspect-[3/4] w-full object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
                    <div className="flex flex-col items-start gap-1.5">
                      {p.reducere > 0 && (
                        <span className="rounded-[6px] bg-teracota px-2 py-1 text-[0.72rem] font-medium leading-none text-crem tabular-nums">
                          −{p.reducere}%
                        </span>
                      )}
                      {p.esteSet && <span className="rounded-[6px] bg-ink px-2 py-1 text-[0.72rem] leading-none text-crem">{t.set}</span>}
                      {p.nou && p.reducere === 0 && (
                        <span className="rounded-[6px] bg-ciocolata px-2 py-1 text-[0.72rem] leading-none text-crem">{t.nou}</span>
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
                      <svg key={i} width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"
                        className={i < Math.round(p.rating) ? 'fill-camel' : 'fill-linie'}>
                        <path d="M6 0.6l1.6 3.4 3.7.5-2.7 2.6.7 3.7L6 9.05 2.7 10.8l.7-3.7L.7 4.5l3.7-.5z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[0.75rem] tabular-nums text-ciocolata/55">({p.nrRecenzii})</span>
                </div>
                <h3 className="mt-1.5 text-[0.92rem] leading-snug">{p.nume}</h3>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="flex flex-wrap items-baseline gap-2 text-[0.92rem] tabular-nums">
                    <span className={p.pretVechiRon ? 'font-medium text-teracota' : 'text-ciocolata'}>
                      {formatPret(p.pretRon, moneda)}
                    </span>
                    {p.pretVechiRon && (
                      <span className="text-[0.82rem] text-ciocolata/45 line-through">
                        {formatPret(p.pretVechiRon, moneda)}
                      </span>
                    )}
                  </p>
                  <span
                    aria-label={p.culoare}
                    title={p.culoare}
                    className="inline-block h-[0.85rem] w-[0.85rem] shrink-0 rounded-full ring-1 ring-linie"
                    style={{ background: p.culoareHex }}
                  />
                </div>
              </a>
            </article>
          ))}
        </div>

        {lista.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-ciocolata/65">{t.nimic}</p>
            <button type="button" onClick={reseteaza}
              className="mt-4 text-[0.87rem] underline underline-offset-4 hover:text-teracota">
              {t.sterge}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
