import { useEffect, useRef, useState } from 'react';
import { adauga, drawerDeschis } from '../stores/cos';
import { formatPret } from '../lib/pret';

interface Props {
  slug: string;
  nume: string;
  pretRon: number;
  imagine: string;
  url: string;
  marimi: string[];
  stoc: number;
  t: Record<string, string>;
}

export default function AdaugaInCos({ slug, nume, pretRon, imagine, url, marimi, stoc, t }: Props) {
  const [marime, setMarime] = useState<string | null>(marimi.length === 1 ? marimi[0] : null);
  const [eroare, setEroare] = useState(false);
  const [barăVizibilă, setBarăVizibilă] = useState(false);
  const ancora = useRef<HTMLDivElement>(null);

  const epuizat = stoc <= 0;

  // Pe telefon, butonul principal iese repede din ecran. Bara fixă de jos
  // apare doar după ce el nu se mai vede, ca să nu acopere degeaba conținutul.
  useEffect(() => {
    const el = ancora.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([intrare]) => setBarăVizibilă(!intrare.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function laClic() {
    if (!marime) {
      setEroare(true);
      return;
    }
    adauga({ slug, nume, marime, pretRon, imagine, url });
    drawerDeschis.set(true);
  }

  return (
    <div ref={ancora}>
      {marimi.length > 1 && (
        <fieldset className="mt-7">
          <legend className="text-[0.85rem] text-ciocolata/70">{t.marime}</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {marimi.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMarime(m);
                  setEroare(false);
                }}
                aria-pressed={marime === m}
                className={`min-w-[3.25rem] rounded-[8px] border px-3.5 py-2 text-[0.88rem] transition-colors ${
                  marime === m
                    ? 'border-ink bg-ink text-crem'
                    : 'border-linie hover:border-ciocolata'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {eroare && <p className="mt-2 text-[0.82rem] text-teracota">{t.alegeMarime}</p>}
        </fieldset>
      )}

      <button
        type="button"
        onClick={laClic}
        disabled={epuizat}
        className="mt-6 w-full rounded-[10px] bg-ink px-6 py-4 text-[0.95rem] text-crem transition-colors hover:bg-ciocolata disabled:cursor-not-allowed disabled:bg-linie disabled:text-ciocolata/50"
      >
        {epuizat ? t.epuizat : t.adauga}
      </button>

      {/* bara fixă de jos, doar pe telefon */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-linie bg-crem/97 px-4 py-3 backdrop-blur-sm transition-transform duration-200 ease-out lg:hidden ${
          barăVizibilă ? 'translate-y-0' : 'translate-y-full'
        }`}
        aria-hidden={!barăVizibilă}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.85rem] leading-tight">{nume}</p>
            <p className="text-[0.85rem] tabular-nums text-ciocolata/70">
              {formatPret(pretRon)}
              {marime && <span className="ml-2 text-ciocolata/50">{marime}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={laClic}
            disabled={epuizat}
            className="shrink-0 rounded-[10px] bg-ink px-5 py-3 text-[0.9rem] text-crem transition-colors disabled:bg-linie disabled:text-ciocolata/50"
          >
            {epuizat ? t.epuizat : t.adauga}
          </button>
        </div>
      </div>
    </div>
  );
}
