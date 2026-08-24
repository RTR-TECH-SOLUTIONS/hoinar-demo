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
}

export default function CosPagina({ t, urlFinalizare, urlMagazin }: Props) {
  const montat = useMontat();
  const liniiStore = useStore(cos);
  const subtotalStore = useStore(subtotalRon);
  const lipsaStore = useStore(lipsaTransport);
  const monedaVal = useStore(monedaStore);

  const linii = montat ? liniiStore : [];
  const subtotal = montat ? subtotalStore : 0;
  const lipsa = montat ? lipsaStore : PRAG_TRANSPORT_GRATUIT_RON;
  const moneda = montat ? monedaVal : 'RON';

  if (!montat) return <div className="min-h-[18rem]" />;

  if (linii.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[1.05rem]">{t.gol}</p>
        <p className="mt-2 text-[0.9rem] text-ciocolata/65">{t.golText}</p>
        <a href={urlMagazin} className="mt-7 inline-block rounded-[10px] bg-ink px-7 py-3.5 text-[0.92rem] text-crem transition-colors hover:bg-ciocolata">
          {t.inapoiMagazin}
        </a>
      </div>
    );
  }

  const progres = Math.min(100, (subtotal / PRAG_TRANSPORT_GRATUIT_RON) * 100);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
      <div>
        <ul className="divide-y divide-linie border-y border-linie">
          {linii.map((l) => (
            <li key={`${l.slug}-${l.marime}`} className="flex gap-4 py-5 sm:gap-6">
              <a href={l.url} className="shrink-0">
                <img src={l.imagine} alt="" width={96} height={120}
                  className="h-[7.5rem] w-24 rounded-[8px] object-cover" />
              </a>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <a href={l.url} className="block text-[0.95rem] leading-snug hover:text-teracota">{l.nume}</a>
                    <p className="mt-1 text-[0.83rem] text-ciocolata/60">
                      {t.marime}: {l.marime}
                    </p>
                  </div>
                  <p className="shrink-0 text-[0.95rem] tabular-nums">
                    {formatPret(l.pretRon * l.cantitate, moneda)}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <div className="inline-flex items-center rounded-[8px] border border-linie">
                    <button type="button" aria-label="-" onClick={() => schimbaCantitate(l.slug, l.marime, l.cantitate - 1)}
                      className="px-3 py-1.5 text-[1rem] leading-none transition-colors hover:text-teracota">−</button>
                    <span className="min-w-7 text-center text-[0.88rem] tabular-nums">{l.cantitate}</span>
                    <button type="button" aria-label="+" onClick={() => schimbaCantitate(l.slug, l.marime, l.cantitate + 1)}
                      className="px-3 py-1.5 text-[1rem] leading-none transition-colors hover:text-teracota">+</button>
                  </div>
                  <button type="button" onClick={() => sterge(l.slug, l.marime)}
                    className="text-[0.83rem] text-ciocolata/60 underline underline-offset-4 transition-colors hover:text-teracota">
                    {t.sterge}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <a href={urlMagazin} className="mt-6 inline-block text-[0.88rem] underline underline-offset-4 hover:text-teracota">
          {t.continua}
        </a>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-total)+1.5rem)] lg:self-start">
        <div className="rounded-[12px] border border-linie bg-nisip p-5">
          <h2 className="text-[1.15rem]">{t.sumar}</h2>

          <div className="mt-4 border-b border-linie pb-4">
            <p className="text-[0.83rem] text-ciocolata/70">
              {lipsa > 0 ? t.lipsa.replace('{x}', formatPret(lipsa, moneda)) : t.atins}
            </p>
            <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-crem">
              <div className="h-full rounded-full bg-teracota transition-[width] duration-300 ease-out"
                style={{ width: `${progres}%` }} />
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-ciocolata/70">{t.subtotal}</dt>
              <dd className="tabular-nums">{formatPret(subtotal, moneda)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ciocolata/70">{t.transport}</dt>
              <dd className="tabular-nums">{lipsa > 0 ? t.laFinal : t.gratuit}</dd>
            </div>
            <div className="flex justify-between border-t border-linie pt-3 text-[1.05rem]">
              <dt>{t.total}</dt>
              <dd className="tabular-nums">{formatPret(subtotal, moneda)}</dd>
            </div>
          </dl>

          <a href={urlFinalizare}
            className="mt-5 block rounded-[10px] bg-ink px-6 py-3.5 text-center text-[0.93rem] text-crem transition-colors hover:bg-ciocolata">
            {t.cumpara}
          </a>

          <ul className="mt-5 space-y-2 text-[0.8rem] text-ciocolata/65">
            {[t.avantaj1, t.avantaj2, t.avantaj3].map((a) => (
              <li key={a} className="flex items-start gap-2">
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
