import { useEffect, useState } from 'react';
import { hidrateaza } from '../stores/cos';

/**
 * Întoarce false la prima randare din browser și true după montare.
 *
 * Serverul randează cu store-urile goale. Dacă o insulă ar folosi direct
 * valoarea din localStorage la prima randare, ar diferi de HTML-ul primit
 * și React ar arunca eroare de hidratare. În plus, insulele se hidratează
 * la momente diferite (client:load vs client:idle), deci prima care se
 * hidratează ar schimba starea comună sub picioarele celorlalte.
 *
 * Regula: cât timp întoarce false, randează exact ce a randat serverul.
 */
export function useMontat(): boolean {
  const [montat, setMontat] = useState(false);
  useEffect(() => {
    hidrateaza();
    setMontat(true);
  }, []);
  return montat;
}
