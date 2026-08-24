import { useState } from 'react';

interface Imagine { mic: string; mare: string }

interface Props {
  imagini: Imagine[];
  alt: string;
  eticheta: string;
}

export default function Galerie({ imagini, alt, eticheta }: Props) {
  const [activ, setActiv] = useState(0);

  /**
   * O singură listă de miniaturi, poziționată din CSS:
   * pe mobil sub imagine, pe desktop în stânga ei. `flex-row-reverse` face
   * ca al doilea element din DOM să apară primul pe ecran.
   */
  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-start">
      <div className="min-w-0 flex-1 overflow-hidden rounded-[12px] bg-nisip">
        <img
          data-principala
          src={imagini[activ].mare}
          alt={alt}
          width={1000}
          height={1000}
          loading="eager"
          className="aspect-square w-full object-cover"
        />
      </div>

      {imagini.length > 1 && (
        <ul className="flex shrink-0 gap-2.5 lg:w-[4.5rem] lg:flex-col" aria-label={eticheta}>
          {imagini.map((im, i) => (
            <li key={im.mic}>
              <button
                type="button"
                onClick={() => setActiv(i)}
                aria-current={i === activ}
                className={`block overflow-hidden rounded-[8px] border transition-colors ${
                  i === activ ? 'border-ciocolata' : 'border-linie hover:border-camel'
                }`}
              >
                <img
                  src={im.mic}
                  alt=""
                  width={72}
                  height={72}
                  loading="lazy"
                  className="h-[4.5rem] w-[4.5rem] object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
