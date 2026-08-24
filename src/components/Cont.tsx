import { useEffect, useRef, useState } from 'react';

interface Props { t: Record<string, string> }

type Fila = 'intra' | 'nou';
type Stare = 'gata' | 'lucreaza' | 'trimis';

/**
 * Pagina de cont. Este o demonstrație: formularul nu trimite nimic nicăieri
 * și nu se creează niciun cont. Mesajul de sub buton spune asta explicit.
 */
export default function Cont({ t }: Props) {
  const [fila, setFila] = useState<Fila>('intra');
  const [stare, setStare] = useState<Stare>('gata');
  const ceas = useRef<number>();

  useEffect(() => () => window.clearTimeout(ceas.current), []);

  function schimba(f: Fila) {
    if (f === fila) return;
    setFila(f);
    setStare('gata');
  }

  function trimite(e: React.FormEvent) {
    e.preventDefault();
    if (stare !== 'gata') return;
    setStare('lucreaza');
    // simulăm cererea, ca butonul să aibă un ciclu credibil
    ceas.current = window.setTimeout(() => setStare('trimis'), 900);
  }

  const campuri: Array<[string, string, string, string]> =
    fila === 'nou'
      ? [
          ['cont-nume', t.nume, 'text', 'name'],
          ['cont-email', t.email, 'email', 'email'],
          ['cont-parola', t.parola, 'password', 'new-password'],
        ]
      : [
          ['cont-email', t.email, 'email', 'email'],
          ['cont-parola', t.parola, 'password', 'current-password'],
        ];

  return (
    <div className="mx-auto grid max-w-[64rem] gap-12 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-16">
      <div>
        {/* file cu indicator care alunecă */}
        <div className="relative grid grid-cols-2 rounded-[10px] border border-linie p-1">
          <span
            aria-hidden="true"
            className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-[7px] bg-ink transition-transform duration-300 ease-out"
            style={{ transform: fila === 'nou' ? 'translateX(100%)' : 'none' }}
          />
          {(['intra', 'nou'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => schimba(f)}
              aria-pressed={fila === f}
              className={`relative z-10 rounded-[7px] px-4 py-2.5 text-[0.9rem] transition-colors duration-200 ${
                fila === f ? 'text-crem' : 'text-ciocolata hover:text-teracota'
              }`}
            >
              {f === 'intra' ? t.intra : t.nou}
            </button>
          ))}
        </div>

        {/* cheia pe filă remontează câmpurile, ca să reintre în cascadă */}
        <form key={fila} className="mt-7 space-y-4" onSubmit={trimite}>
          {campuri.map(([id, eticheta, tip, ac], i) => (
            <label key={id} className="apare block" style={{ '--pas': `${i * 70}ms` } as any}>
              <span className="text-[0.85rem] text-ciocolata/75">{eticheta}</span>
              <input
                id={id}
                type={tip}
                autoComplete={ac}
                required
                className="mt-1.5 w-full rounded-[8px] border border-linie bg-crem px-3.5 py-3 text-[0.95rem] outline-none transition-[border-color,box-shadow] duration-200 focus:border-teracota focus:shadow-[0_0_0_3px_rgba(161,92,58,0.12)]"
              />
            </label>
          ))}

          {fila === 'nou' && (
            <label
              className="apare flex cursor-pointer items-start gap-2.5 text-[0.85rem] leading-snug text-ciocolata/75"
              style={{ '--pas': '210ms' } as any}
            >
              <input type="checkbox" required className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 cursor-pointer accent-[#181613]" />
              {t.termeni}
            </label>
          )}

          <div className="apare" style={{ '--pas': `${campuri.length * 70 + 60}ms` } as any}>
            <button
              type="submit"
              disabled={stare !== 'gata'}
              className={`relative w-full overflow-hidden rounded-[10px] px-6 py-3.5 text-[0.93rem] transition-colors duration-200 ${
                stare === 'trimis' ? 'bg-teracota text-crem' : 'bg-ink text-crem hover:bg-ciocolata'
              }`}
            >
              <span className={`flex items-center justify-center gap-2.5 transition-opacity duration-200 ${stare === 'lucreaza' ? 'opacity-0' : 'opacity-100'}`}>
                {stare === 'trimis' && (
                  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" className="pop fill-none stroke-current" strokeWidth="2">
                    <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {stare === 'trimis' ? t.gata : fila === 'intra' ? t.intraButon : t.creeaza}
              </span>

              {stare === 'lucreaza' && (
                <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
                  <span className="h-[1.15rem] w-[1.15rem] animate-spin rounded-full border-2 border-crem/30 border-t-crem" />
                </span>
              )}
            </button>
          </div>

          {fila === 'intra' && (
            <p className="apare text-center" style={{ '--pas': '260ms' } as any}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setStare('trimis'); }}
                className="text-[0.85rem] underline underline-offset-4 transition-colors hover:text-teracota"
              >
                {t.uitat}
              </a>
            </p>
          )}

          <p
            className={`text-center text-[0.8rem] transition-colors duration-300 ${stare === 'trimis' ? 'text-teracota' : 'text-ciocolata/50'}`}
            role="status"
            aria-live="polite"
          >
            {t.demo}
          </p>
        </form>
      </div>

      <aside className="md:pt-[3.6rem]">
        <div className="overflow-hidden rounded-[12px] border border-linie bg-nisip p-5">
          <h2 className="apare text-[1.05rem]">{t.deCe}</h2>
          <ul className="mt-4 space-y-3 text-[0.87rem] leading-snug text-ciocolata/80">
            {[t.deCe1, t.deCe2, t.deCe3, t.deCe4].map((x, i) => (
              <li key={x} className="apare-x flex items-start gap-2.5" style={{ '--pas': `${140 + i * 90}ms` } as any}>
                <span aria-hidden="true" className="mt-[0.5em] h-[3px] w-[11px] shrink-0 bg-camel" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
