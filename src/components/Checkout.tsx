import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  cos,
  subtotalRon,
  lipsaTransport,
  schimbaCantitate,
  sterge,
  goleste,
  moneda as monedaStore,
} from '../stores/cos';
import { useMontat } from '../lib/useMontat';
import { formatPret } from '../lib/pret';

interface Props {
  t: Record<string, string>;
  urlMagazin: string;
  lang: 'ro' | 'en';
}

type Camp = 'nume' | 'email' | 'telefon' | 'adresa' | 'oras' | 'judet' | 'cod';
const CAMPURI: Camp[] = ['nume', 'email', 'telefon', 'adresa', 'oras', 'judet', 'cod'];

const LIVRARE = [
  { id: 'easybox', pret: 15 },
  { id: 'fan', pret: 20 },
  { id: 'cargus', pret: 18 },
] as const;

export default function Checkout({ t, urlMagazin, lang }: Props) {
  const montat = useMontat();
  const liniiStore = useStore(cos);
  const subtotalStore = useStore(subtotalRon);
  const lipsaStore = useStore(lipsaTransport);
  const monedaVal = useStore(monedaStore);

  const linii = montat ? liniiStore : [];
  const subtotal = montat ? subtotalStore : 0;
  const lipsa = montat ? lipsaStore : 0;
  const moneda = montat ? monedaVal : 'RON';

  const [pas, setPas] = useState(1);
  const [date, setDate] = useState<Record<Camp, string>>({
    nume: '', email: '', telefon: '', adresa: '', oras: '', judet: '', cod: '',
  });
  const [erori, setErori] = useState<Partial<Record<Camp, string>>>({});
  const [livrare, setLivrare] = useState<string>('easybox');
  const [plata, setPlata] = useState<'card' | 'ramburs'>('ramburs');
  const [comanda, setComanda] = useState<string | null>(null);

  const costLivrare = lipsa > 0 ? (LIVRARE.find((l) => l.id === livrare)?.pret ?? 0) : 0;
  const total = subtotal + costLivrare;

  function valideaza(): boolean {
    const e: Partial<Record<Camp, string>> = {};
    for (const c of CAMPURI) if (!date[c].trim()) e[c] = t.obligatoriu;
    if (date.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(date.email)) e.email = t.emailInvalid;
    if (date.telefon.trim() && date.telefon.replace(/\D/g, '').length < 9) e.telefon = t.telefonInvalid;
    setErori(e);
    return Object.keys(e).length === 0;
  }

  function trimite() {
    // Demo: nu se trimite nimic nicăieri. Generăm un număr local și golim coșul.
    const n = `HN-${String(Math.floor(performance.now() * 1000) % 90000 + 10000)}`;
    setComanda(n);
    goleste();
  }

  if (comanda) {
    return (
      <div className="mx-auto max-w-[36rem] py-10 text-center">
        <h1 style={{ fontSize: 'var(--pas-2xl)' }}>{t.gata}</h1>
        <p className="mt-4 leading-relaxed text-ciocolata/75">{t.gataText}</p>
        <p className="mt-7 rounded-[10px] border border-linie bg-nisip px-6 py-5">
          <span className="block text-[0.82rem] text-ciocolata/60">{t.numar}</span>
          <span className="mt-1 block font-[family-name:var(--font-serif)] text-[1.9rem] leading-none tabular-nums">
            {comanda}
          </span>
        </p>
        <a
          href={urlMagazin}
          className="mt-7 inline-block rounded-[10px] bg-ink px-7 py-3.5 text-[0.92rem] text-crem transition-colors hover:bg-ciocolata"
        >
          {t.inapoiMagazin}
        </a>
        <p className="mt-8 text-[0.8rem] text-ciocolata/50">{t.demo}</p>
      </div>
    );
  }

  if (linii.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[1.05rem]">{t.gol}</p>
        <p className="mt-2 text-[0.9rem] text-ciocolata/65">{t.golText}</p>
        <a
          href={urlMagazin}
          className="mt-6 inline-block rounded-[10px] bg-ink px-7 py-3.5 text-[0.92rem] text-crem transition-colors hover:bg-ciocolata"
        >
          {t.inapoiMagazin}
        </a>
      </div>
    );
  }

  // Eroarea sta in afara etichetei si se leaga prin aria-describedby.
  // Daca ar fi inauntru, ar intra in numele accesibil al campului.
  const camp = (c: Camp, tip = 'text', latime = '') => (
    <div className={latime}>
      <label htmlFor={`camp-${c}`} className="block text-[0.85rem] text-ciocolata/75">
        {t[c]}
      </label>
      <input
        id={`camp-${c}`}
        type={tip}
        value={date[c]}
        onChange={(e) => setDate({ ...date, [c]: e.currentTarget.value })}
        aria-invalid={!!erori[c]}
        aria-describedby={erori[c] ? `eroare-${c}` : undefined}
        className={`mt-1.5 w-full rounded-[8px] border bg-crem px-3.5 py-3 text-[0.95rem] outline-none focus:border-teracota ${
          erori[c] ? 'border-teracota' : 'border-linie'
        }`}
      />
      {erori[c] && (
        <span id={`eroare-${c}`} className="mt-1 block text-[0.8rem] text-teracota">
          {erori[c]}
        </span>
      )}
    </div>
  );

  const optiune = (
    id: string,
    titlu: string,
    text: string,
    pret: number | null,
    ales: boolean,
    alege: () => void,
  ) => (
    <button
      key={id}
      type="button"
      onClick={alege}
      aria-pressed={ales}
      className={`flex w-full items-start gap-3.5 rounded-[10px] border px-4 py-3.5 text-left transition-colors ${
        ales ? 'border-ink bg-nisip' : 'border-linie hover:border-ciocolata'
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-1 grid h-[1.05rem] w-[1.05rem] shrink-0 place-items-center rounded-full border ${
          ales ? 'border-ink' : 'border-linie'
        }`}
      >
        {ales && <span className="h-[0.55rem] w-[0.55rem] rounded-full bg-ink" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.93rem]">{titlu}</span>
        <span className="block text-[0.82rem] text-ciocolata/65">{text}</span>
      </span>
      {pret !== null && (
        <span className="shrink-0 text-[0.88rem] tabular-nums">
          {pret === 0 ? t.gratuit : formatPret(pret, moneda)}
        </span>
      )}
    </button>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
      <div>
        <ol className="flex gap-2 text-[0.82rem]">
          {[t.date, t.transport, t.plata].map((eticheta, i) => (
            <li key={eticheta} className="flex items-center gap-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-[0.75rem] tabular-nums ${
                  pas > i ? 'bg-ink text-crem' : 'bg-nisip text-ciocolata/60'
                }`}
              >
                {i + 1}
              </span>
              <span className={pas > i ? '' : 'text-ciocolata/55'}>{eticheta}</span>
              {i < 2 && <span aria-hidden="true" className="mx-1 text-ciocolata/25">·</span>}
            </li>
          ))}
        </ol>

        {pas === 1 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {camp('nume', 'text', 'sm:col-span-2')}
            {camp('email', 'email')}
            {camp('telefon', 'tel')}
            {camp('adresa', 'text', 'sm:col-span-2')}
            {camp('oras')}
            {camp('judet')}
            {camp('cod')}
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => valideaza() && setPas(2)}
                className="w-full rounded-[10px] bg-ink px-6 py-3.5 text-[0.93rem] text-crem transition-colors hover:bg-ciocolata sm:w-auto"
              >
                {t.continua}
              </button>
            </div>
          </div>
        )}

        {pas === 2 && (
          <div className="mt-8 space-y-2.5">
            {LIVRARE.map((l) =>
              optiune(
                l.id,
                t[l.id],
                t[`${l.id}Text`],
                lipsa > 0 ? l.pret : 0,
                livrare === l.id,
                () => setLivrare(l.id),
              ),
            )}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setPas(1)}
                className="rounded-[10px] border border-linie px-6 py-3.5 text-[0.93rem] transition-colors hover:border-ciocolata"
              >
                {t.inapoi}
              </button>
              <button
                type="button"
                onClick={() => setPas(3)}
                className="flex-1 rounded-[10px] bg-ink px-6 py-3.5 text-[0.93rem] text-crem transition-colors hover:bg-ciocolata sm:flex-none"
              >
                {t.continua}
              </button>
            </div>
          </div>
        )}

        {pas === 3 && (
          <div className="mt-8 space-y-2.5">
            {optiune('ramburs', t.ramburs, t.rambursText, null, plata === 'ramburs', () => setPlata('ramburs'))}
            {optiune('card', t.card, t.cardText, null, plata === 'card', () => setPlata('card'))}
            <p className="pt-2 text-[0.8rem] text-ciocolata/55">{t.demo}</p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPas(2)}
                className="rounded-[10px] border border-linie px-6 py-3.5 text-[0.93rem] transition-colors hover:border-ciocolata"
              >
                {t.inapoi}
              </button>
              <button
                type="button"
                onClick={trimite}
                className="flex-1 rounded-[10px] bg-ink px-6 py-3.5 text-[0.93rem] text-crem transition-colors hover:bg-ciocolata"
              >
                {t.plaseaza}
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <div className="rounded-[14px] border border-linie bg-nisip p-5">
          <h2 className="text-[1.15rem]">{t.sumar}</h2>
          <ul className="mt-4 divide-y divide-linie">
            {linii.map((l) => (
              <li key={`${l.slug}-${l.marime}`} className="flex gap-3 py-3">
                <img src={l.imagine} alt="" width={48} height={64} className="h-16 w-12 shrink-0 rounded-[6px] object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.87rem] leading-snug">{l.nume}</p>
                  <p className="text-[0.78rem] text-ciocolata/60">
                    {l.marime} · {l.cantitate} {t.bucata}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => schimbaCantitate(l.slug, l.marime, l.cantitate - 1)}
                      className="text-[0.75rem] text-ciocolata/55 underline underline-offset-2 hover:text-teracota"
                    >−</button>
                    <button
                      type="button"
                      onClick={() => schimbaCantitate(l.slug, l.marime, l.cantitate + 1)}
                      className="text-[0.75rem] text-ciocolata/55 underline underline-offset-2 hover:text-teracota"
                    >+</button>
                    <button
                      type="button"
                      onClick={() => sterge(l.slug, l.marime)}
                      className="text-[0.75rem] text-ciocolata/55 underline underline-offset-2 hover:text-teracota"
                    >{t.sterge}</button>
                  </div>
                </div>
                <span className="shrink-0 text-[0.87rem] tabular-nums">
                  {formatPret(l.pretRon * l.cantitate, moneda)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-linie pt-4 text-[0.88rem]">
            <div className="flex justify-between">
              <dt className="text-ciocolata/70">{t.subtotal}</dt>
              <dd className="tabular-nums">{formatPret(subtotal, moneda)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ciocolata/70">{t.transport}</dt>
              <dd className="tabular-nums">{costLivrare === 0 ? t.gratuit : formatPret(costLivrare, moneda)}</dd>
            </div>
            <div className="flex justify-between border-t border-linie pt-2.5 text-[1rem]">
              <dt>{t.total}</dt>
              <dd className="tabular-nums">{formatPret(total, moneda)}</dd>
            </div>
          </dl>
          {lipsa > 0 && (
            <p className="mt-3 text-[0.8rem] text-teracota">
              {t.lipsa.replace('{x}', formatPret(lipsa, moneda))}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
