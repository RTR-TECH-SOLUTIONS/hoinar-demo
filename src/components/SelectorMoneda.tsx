import { useStore } from '@nanostores/react';
import { moneda } from '../stores/cos';

export default function SelectorMoneda({ eticheta }: { eticheta: string }) {
  const m = useStore(moneda);
  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="sr-only">{eticheta}</span>
      <select
        value={m}
        onChange={(e) => moneda.set(e.currentTarget.value as 'RON' | 'EUR')}
        className="cursor-pointer bg-transparent text-current outline-none"
      >
        <option value="RON">RON</option>
        <option value="EUR">EUR</option>
      </select>
    </label>
  );
}
