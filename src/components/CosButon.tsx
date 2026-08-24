import { useStore } from '@nanostores/react';
import { numarProduse, drawerDeschis } from '../stores/cos';
import { useMontat } from '../lib/useMontat';

export default function CosButon({ eticheta }: { eticheta: string }) {
  const montat = useMontat();
  const numar = useStore(numarProduse);
  const n = montat ? numar : 0;
  return (
    <button
      type="button"
      onClick={() => drawerDeschis.set(true)}
      className="relative inline-flex items-center gap-2 text-[0.9rem] hover:text-teracota transition-colors"
      aria-label={`${eticheta} (${n})`}
    >
      <span>{eticheta}</span>
      <span
        className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.7rem] leading-none text-crem tabular-nums"
        aria-hidden="true"
      >
        {n}
      </span>
    </button>
  );
}
