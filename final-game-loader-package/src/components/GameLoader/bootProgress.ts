import type { BootSignals, BootWeights, LoaderPhase } from './types';

export const DEFAULT_BOOT_WEIGHTS: BootWeights = {
  sdkReady: 20,
  playerReady: 15,
  saveHydrated: 25,
  casesValidated: 20,
  assetsReady: 20,
};

export function calculateBootProgress(
  signals: BootSignals,
  weights: BootWeights = DEFAULT_BOOT_WEIGHTS,
): number {
  const entries = Object.entries(weights) as Array<[keyof BootSignals, number]>;
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);

  if (totalWeight <= 0) return 0;

  const completedWeight = entries.reduce(
    (sum, [key, weight]) => sum + (signals[key] ? weight : 0),
    0,
  );

  return Math.min(100, Math.max(0, (completedWeight / totalWeight) * 100));
}

export function areBootSignalsReady(signals: BootSignals): boolean {
  return Object.values(signals).every(Boolean);
}

export function getBootPhase(signals: BootSignals): LoaderPhase {
  if (!signals.sdkReady || !signals.playerReady) return 'sdk';
  if (!signals.saveHydrated) return 'save';
  if (!signals.casesValidated || !signals.assetsReady) return 'content';
  return 'ready';
}
