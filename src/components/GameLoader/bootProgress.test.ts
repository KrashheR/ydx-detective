import { describe, expect, it } from 'vitest';
import { areBootSignalsReady, calculateBootProgress } from './bootProgress';
import type { BootSignals } from './types';

const signals = (overrides: Partial<BootSignals> = {}): BootSignals => ({
  sdkReady: false,
  playerReady: false,
  saveHydrated: false,
  casesValidated: false,
  assetsReady: false,
  ...overrides,
});

describe('boot progress', () => {
  it('uses completed real signals and reaches 100 only when all are ready', () => {
    expect(calculateBootProgress(signals())).toBe(0);
    expect(calculateBootProgress(signals({ sdkReady: true }))).toBe(20);
    expect(calculateBootProgress(signals({
      sdkReady: true,
      playerReady: true,
      saveHydrated: true,
      casesValidated: true,
      assetsReady: true,
    }))).toBe(100);
  });

  it('requires every signal before declaring the game ready', () => {
    expect(areBootSignalsReady(signals({ sdkReady: true }))).toBe(false);
    expect(areBootSignalsReady(signals({
      sdkReady: true,
      playerReady: true,
      saveHydrated: true,
      casesValidated: true,
      assetsReady: true,
    }))).toBe(true);
  });
});
