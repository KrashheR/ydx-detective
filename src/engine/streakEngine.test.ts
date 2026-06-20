import { describe, it, expect } from 'vitest';
import { evaluateStreak } from './streakEngine';
import { GAME_CONFIG } from '../config/gameConfig';

const { bonusPctPerDay, bonusCapPct } = GAME_CONFIG.streak;

describe('evaluateStreak', () => {
  it('starts a streak of 1 on the first play ever', () => {
    const r = evaluateStreak(0, null, 100);
    expect(r.streak).toBe(1);
    expect(r.multiplierPct).toBe(bonusPctPerDay);
  });

  it('does not grow on a same-day replay', () => {
    const r = evaluateStreak(3, 100, 100);
    expect(r.streak).toBe(3); // unchanged
  });

  it('keeps at least 1 on a same-day replay with no prior streak', () => {
    const r = evaluateStreak(0, 100, 100);
    expect(r.streak).toBe(1);
  });

  it('increments on the very next server-day', () => {
    const r = evaluateStreak(3, 100, 101);
    expect(r.streak).toBe(4);
  });

  it('resets to 1 when a day was skipped', () => {
    const r = evaluateStreak(9, 100, 105);
    expect(r.streak).toBe(1);
  });

  it('resets to 1 when the clock moved backwards', () => {
    const r = evaluateStreak(9, 100, 50);
    expect(r.streak).toBe(1);
  });

  it('caps the bonus percentage', () => {
    const cappingStreak = Math.ceil(bonusCapPct / bonusPctPerDay) + 5;
    const r = evaluateStreak(cappingStreak - 1, 100, 101);
    expect(r.streak).toBe(cappingStreak);
    expect(r.multiplierPct).toBe(bonusCapPct);
  });
});
