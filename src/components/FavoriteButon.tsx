import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { numarFavorite, hidrateazaFavorite } from '../stores/favorite';

export default function FavoriteButon({ eticheta, href }: { eticheta: string; href: string }) {
  const [montat, setMontat] = useState(false);
  useEffect(() => {
    hidrateazaFavorite();
    setMontat(true);
  }, []);
  const n = useStore(numarFavorite);
  const afisat = montat ? n : 0;

  return (
    <a href={href} className="relative inline-flex items-center gap-2 transition-colors hover:text-teracota" aria-label={`${eticheta} (${afisat})`}>
      <svg viewBox="0 0 20 18" width="19" height="19" aria-hidden="true" className="fill-none stroke-current" strokeWidth="1.4">
        <path d="M10 16.5S1.6 11.4 1.6 6.2A4.2 4.2 0 0 1 10 4.3a4.2 4.2 0 0 1 8.4 1.9c0 5.2-8.4 10.3-8.4 10.3Z" strokeLinejoin="round" />
      </svg>
      <span className="hidden xl:inline">{eticheta}</span>
      {afisat > 0 && (
        <span className="absolute -right-2 -top-1.5 inline-grid h-4 min-w-4 place-items-center rounded-full bg-teracota px-1 text-[0.62rem] leading-none text-crem tabular-nums xl:static xl:ml-1">
          {afisat}
        </span>
      )}
    </a>
  );
}
