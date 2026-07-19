import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Animates the displayed number from its previous value to `value` on every
 * change (ease-out over `duration`ms) instead of snapping instantly — makes
 * economy numbers (balance/XP/accuracy) read as "earned" rather than
 * "re-rendered". Skips the animation under prefers-reduced-motion.
 *
 * Pass `from` to also animate in on mount (e.g. a reward total counting up
 * from 0 the moment a result screen appears) — omit it for values that
 * already exist before mount, where an initial animation would be noise.
 */
export function useCountUp(value: number, duration = 550, from?: number): number {
  const [display, setDisplay] = useState(from ?? value);
  const prevRef = useRef(from ?? value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;

    if (prefersReducedMotion()) {
      prevRef.current = to;
      setDisplay(to);
      return;
    }

    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}
