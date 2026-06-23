import { useEffect, useRef, useState } from 'react';

const clamp = (value: number) => Math.min(100, Math.max(0, value));

/**
 * Smooths step-based boot progress without lying about readiness.
 * Before `ready`, it may approach but never pass `maxBeforeReady`.
 * Once ready, it reaches 100% and stops.
 */
export function useSmoothedProgress(
  targetProgress: number,
  ready: boolean,
  options: {
    maxBeforeReady?: number;
    tickMs?: number;
    ease?: number;
    initialValue?: number;
  } = {},
): number {
  const {
    maxBeforeReady = 96,
    tickMs = 50,
    ease = 0.16,
    initialValue = 10,
  } = options;

  const safeTarget = clamp(ready ? 100 : Math.min(targetProgress, maxBeforeReady));
  const [displayed, setDisplayed] = useState(() => clamp(initialValue));
  const targetRef = useRef(safeTarget);

  useEffect(() => {
    targetRef.current = safeTarget;
  }, [safeTarget]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDisplayed((current) => {
        const target = targetRef.current;
        const distance = target - current;

        if (Math.abs(distance) < 0.08) return target;

        const minimumStep = ready ? 0.22 : 0.05;
        const step = Math.max(Math.abs(distance) * ease, minimumStep);
        return clamp(current + Math.sign(distance) * Math.min(step, Math.abs(distance)));
      });
    }, tickMs);

    return () => window.clearInterval(interval);
  }, [ease, ready, tickMs]);

  return displayed;
}
