import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  cos,
  drawerDeschis,
  subtotalRon,
  lipsaTransport,
  schimbaCantitate,
  sterge,
  moneda as monedaStore,
} from '../stores/cos';
import { useMontat } from '../lib/useMontat';
import { formatPret, PRAG_TRANSPORT_GRATUIT_RON } from '../lib/pret';

interface Props {
  t: Record<string, string>;
  urlCos: string;
}

export default function CosDrawer({ t, urlCos }: Props) {
  const montat = useMontat();
  const liniiStore = useStore(cos);
  const deschis = useStore(drawerDeschis);
  const subtotalStore = useStore(subtotalRon);
  const lipsaStore = useStore(lipsaTransport);
  const monedaVal = useStore(monedaStore);
  const panou = useRef<HTMLDivElement>(null);

  // Până la montare randăm exact ce a randat serverul: coș gol, RON.
  const linii = montat ? liniiStore : [];
  const subtotal = montat ? subtotalStore : 0;
  const lipsa = montat ? lipsaStore : PRAG_TRANSPORT_GRATUIT_RON;
  const moneda = montat ? monedaVal : 'RON';

  useEffect(() => {
    if (!deschis) return;
    const laTasta = (e: KeyboardEvent) => {
      if (e.key === 'Escape') drawerDeschis.set(false);
    };
    document.addEventListener('keydown', laTasta);
    document.body.style.overflow = 'hidden';
    panou.current?.focus();
    return () => {
      document.removeEventListener('keydown', laTasta);
      document.body.style.overflow = '';
    };
  }, [deschis]);

  const progres = Math.min(100, (subtotal / PRAG_TRANSPORT_GRATUIT_RON) * 100);

  return (
    <div
      className={`fixed inset-0 z-[70] ${deschis ? '' : 'pointer-events-none'}`}
      aria-hidden={!deschis}
    >
      <div
        className={`absolute inset-0 bg-ink/35 transition-opacity duration-200 ${deschis ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => drawerDeschis.set(false)}
      />
      <div
        ref={panou}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t.titlu}
        className={`absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col bg-crem shadow-2xl transition-transform duration-200 ease-out ${deschis ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-center justify-between border-b border-linie px-5 py-4">
          <h2 className="text-[1.35rem]">{t.titlu}</h2>
          <button
            type="button"
            onClick={() => drawerDeschis.set(false)}
            className="text-[0.85rem] underline underline-offset-4 hover:text-teracota"
          >
            {t.inchide}
          </button>
        </header>

        {linii.length > 0 && (
          <div className="border-b border-linie px-5 py-3">
            <p className="text-[0.8rem] text-ciocolata/75">
              {lipsa > 0 ? t.lipsa.replace('{x}', formatPret(lipsa, moneda)) : t.atins}
            </p>
            <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-nisip">
              <div
                className="h-full rounded-full bg-teracota transition-[width] duration-300 ease-out"
                style={{ width: `${progres}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {linii.length === 0 ? (
            <p className="py-12 text-center text-[0.95rem] text-ciocolata/70">{t.gol}</p>
          ) : (
            <ul className="divide-y divide-linie">
              {linii.map((l) => (
                <li key={`${l.slug}-${l.marime}`} className="flex gap-4 py-4">
                  <a href={l.url} aria-label={l.nume} className="shrink-0">
                    <img
                      src={l.imagine}
                      alt=""
                      width={72}
                      height={96}
                      className="h-24 w-[4.5rem] rounded-[8px] object-cover"
                    />
                  </a>
                  <div className="min-w-0 flex-1">
                    <a href={l.url} className="block text-[0.9rem] leading-snug hover:text-teracota">
                      {l.nume}
                    </a>
                    <p className="mt-0.5 text-[0.8rem] text-ciocolata/65">{l.marime}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-[8px] border border-linie">
                        <button
                          type="button"
                          className="px-2.5 py-1 text-[0.95rem] hover:text-teracota"
                          onClick={() => schimbaCantitate(l.slug, l.marime, l.cantitate - 1)}
                          aria-label="-"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-[0.85rem] tabular-nums">
                          {l.cantitate}
                        </span>
                        <button
                          type="button"
                          className="px-2.5 py-1 text-[0.95rem] hover:text-teracota"
                          onClick={() => schimbaCantitate(l.slug, l.marime, l.cantitate + 1)}
                          aria-label="+"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[0.9rem] tabular-nums">
                        {formatPret(l.pretRon * l.cantitate, moneda)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mt-2 text-[0.75rem] text-ciocolata/60 underline underline-offset-4 hover:text-teracota"
                      onClick={() => sterge(l.slug, l.marime)}
                    >
                      {t.sterge}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {linii.length > 0 && (
          <footer className="border-t border-linie px-5 py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.9rem]">{t.subtotal}</span>
              <span className="text-[1.15rem] tabular-nums">{formatPret(subtotal, moneda)}</span>
            </div>
            <p className="mt-1 text-[0.78rem] text-ciocolata/60">
              {t.transport}: {lipsa > 0 ? '—' : t.gratuit}
            </p>
            <a
              href={urlCos}
              className="mt-4 block rounded-[10px] bg-ink px-5 py-3.5 text-center text-[0.9rem] text-crem transition-colors hover:bg-ciocolata"
            >
              {t.cumpara}
            </a>
          </footer>
        )}
      </div>
    </div>
  );
}
