import { useState, useEffect } from 'react';
import { formatDistanceToNowStrict, isPast } from 'date-fns';

export function useCountdown(targetMs: number | null) {
  const [label, setLabel] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (targetMs === null) return;

    function update() {
      const now = Date.now();
      if (targetMs! <= now) {
        setExpired(true);
        setLabel('Now!');
        return;
      }
      const diffSeconds = Math.floor((targetMs! - now) / 1000);
      const h = Math.floor(diffSeconds / 3600);
      const m = Math.floor((diffSeconds % 3600) / 60);
      const s = diffSeconds % 60;
      if (h > 0) {
        setLabel(`${h}h ${m}m`);
      } else if (m > 0) {
        setLabel(`${m}m ${s}s`);
      } else {
        setLabel(`${s}s`);
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  return { label, expired };
}
