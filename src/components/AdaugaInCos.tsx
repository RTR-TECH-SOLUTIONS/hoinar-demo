import { useState } from 'react';
import { adauga, drawerDeschis } from '../stores/cos';

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

  const epuizat = stoc <= 0;

  function laClic() {
    if (!marime) {
      setEroare(true);
      return;
    }
    adauga({ slug, nume, marime, pretRon, imagine, url });
    drawerDeschis.set(true);
  }

  return (
    <div>
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
    </div>
  );
}
