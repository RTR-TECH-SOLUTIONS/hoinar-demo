import { useState } from 'react';

interface Props { t: Record<string, string> }

/**
 * Pagina de cont. Este o demonstrație: formularul nu trimite nimic nicăieri
 * și nu se creează niciun cont. Mesajul de sub buton spune asta explicit.
 */
export default function Cont({ t }: Props) {
  const [fila, setFila] = useState<'intra' | 'nou'>('intra');
  const [trimis, setTrimis] = useState(false);

  const camp = (id: string, eticheta: string, tip = 'text', autocomplete?: string) => (
    <label className="block">
      <span className="text-[0.85rem] text-ciocolata/75">{eticheta}</span>
      <input
        id={id}
        type={tip}
        autoComplete={autocomplete}
        className="mt-1.5 w-full rounded-[8px] border border-linie bg-crem px-3.5 py-3 text-[0.95rem] outline-none focus:border-teracota"
      />
    </label>
  );

  return (
    <div className="mx-auto grid max-w-[64rem] gap-12 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-16">
      <div>
        <div className="flex gap-1 rounded-[10px] border border-linie p-1">
          {(['intra', 'nou'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => { setFila(f); setTrimis(false); }}
              aria-pressed={fila === f}
              className={`flex-1 rounded-[7px] px-4 py-2.5 text-[0.9rem] transition-colors ${
                fila === f ? 'bg-ink text-crem' : 'hover:bg-nisip'
              }`}
            >
              {f === 'intra' ? t.intra : t.nou}
            </button>
          ))}
        </div>

        <form
          className="mt-7 space-y-4"
          onSubmit={(e) => { e.preventDefault(); setTrimis(true); }}
        >
          {fila === 'nou' && camp('cont-nume', t.nume, 'text', 'name')}
          {camp('cont-email', t.email, 'email', 'email')}
          {camp('cont-parola', t.parola, 'password', fila === 'intra' ? 'current-password' : 'new-password')}

          {fila === 'nou' && (
            <label className="flex cursor-pointer items-start gap-2.5 text-[0.85rem] leading-snug text-ciocolata/75">
              <input type="checkbox" required className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 cursor-pointer accent-[#181613]" />
              {t.termeni}
            </label>
          )}

          <button
            type="submit"
            className="w-full rounded-[10px] bg-ink px-6 py-3.5 text-[0.93rem] text-crem transition-colors hover:bg-ciocolata"
          >
            {fila === 'intra' ? t.intraButon : t.creeaza}
          </button>

          {fila === 'intra' && (
            <p className="text-center">
              <a href="#" onClick={(e) => { e.preventDefault(); setTrimis(true); }}
                className="text-[0.85rem] underline underline-offset-4 hover:text-teracota">
                {t.uitat}
              </a>
            </p>
          )}

          <p className={`text-center text-[0.8rem] ${trimis ? 'text-teracota' : 'text-ciocolata/50'}`} role="status" aria-live="polite">
            {t.demo}
          </p>
        </form>
      </div>

      <aside className="md:pt-[3.6rem]">
        <div className="rounded-[12px] border border-linie bg-nisip p-5">
          <h2 className="text-[1.05rem]">{t.deCe}</h2>
          <ul className="mt-4 space-y-3 text-[0.87rem] leading-snug text-ciocolata/80">
            {[t.deCe1, t.deCe2, t.deCe3, t.deCe4].map((x) => (
              <li key={x} className="flex items-start gap-2.5">
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
