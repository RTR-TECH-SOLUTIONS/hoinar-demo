import { useEffect, useState } from 'react';

interface Props {
  /** Timestamp ISO către care se numără. Vine de pe server, ca să nu difere. */
  pana: string;
  etichete: { zile: string; ore: string; minute: string; secunde: string };
}

function bucati(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    zile: Math.floor(s / 86400),
    ore: Math.floor((s % 86400) / 3600),
    minute: Math.floor((s % 3600) / 60),
    secunde: s % 60,
  };
}

export default function Numaratoare({ pana, etichete }: Props) {
  const tinta = new Date(pana).getTime();
  // Prima randare trebuie sa fie identica cu serverul, deci pornim gol.
  const [ramas, setRamas] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRamas(tinta - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tinta]);

  const b = bucati(ramas ?? 0);
  const celule = [
    [b.zile, etichete.zile],
    [b.ore, etichete.ore],
    [b.minute, etichete.minute],
    [b.secunde, etichete.secunde],
  ] as const;

  return (
    <div className="flex items-center gap-2" role="timer" aria-live="off">
      {celule.map(([val, eticheta], i) => (
        <div key={eticheta} className="flex items-center gap-2">
          <div className="min-w-[3rem] rounded-[8px] bg-ink/8 px-2 py-1.5 text-center">
            <span className="block text-[1.15rem] leading-none tabular-nums">
              {ramas === null ? '--' : String(val).padStart(2, '0')}
            </span>
            <span className="mt-1 block text-[0.66rem] text-ciocolata/60">{eticheta}</span>
          </div>
          {i < celule.length - 1 && <span aria-hidden="true" className="text-ciocolata/30">:</span>}
        </div>
      ))}
    </div>
  );
}
