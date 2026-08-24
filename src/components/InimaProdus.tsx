import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { favorite, comutaFavorit, hidrateazaFavorite } from '../stores/favorite';

interface Props { slug: string; adauga: string; adaugat: string }

export default function InimaProdus({ slug, adauga, adaugat }: Props) {
  const [montat, setMontat] = useState(false);
  useEffect(() => {
    hidrateazaFavorite();
    setMontat(true);
  }, []);
  const lista = useStore(favorite);
  const activ = montat && lista.includes(slug);

  return (
    <button
      type="button"
      onClick={() => comutaFavorit(slug)}
      aria-pressed={activ}
      className="mt-3 inline-flex items-center gap-2 text-[0.85rem] text-ciocolata/70 transition-colors hover:text-teracota"
    >
      <svg viewBox="0 0 20 18" width="17" height="17" aria-hidden="true" className={activ ? 'fill-teracota stroke-teracota' : 'fill-none stroke-current'} strokeWidth="1.4">
        <path d="M10 16.5S1.6 11.4 1.6 6.2A4.2 4.2 0 0 1 10 4.3a4.2 4.2 0 0 1 8.4 1.9c0 5.2-8.4 10.3-8.4 10.3Z" strokeLinejoin="round" />
      </svg>
      {activ ? adaugat : adauga}
    </button>
  );
}
