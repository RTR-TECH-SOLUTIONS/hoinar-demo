import { useState } from 'react';

interface Imagine {
  mic: string;
  mare: string;
}

interface Props {
  imagini: Imagine[];
  alt: string;
  eticheta: string;
}

export default function Galerie({ imagini, alt, eticheta }: Props) {
  const [activ, setActiv] = useState(0);

  return (
    <div>
      <div className="overflow-hidden rounded-[12px] bg-nisip">
        <img
          src={imagini[activ].mare}
          alt={alt}
          width={1088}
          height={1360}
          loading="eager"
          className="aspect-[4/5] w-full object-cover"
        />
      </div>

      {imagini.length > 1 && (
        <ul className="mt-3 flex gap-3" aria-label={eticheta}>
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
                  height={90}
                  loading="lazy"
                  className="h-[5.6rem] w-[4.5rem] object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
