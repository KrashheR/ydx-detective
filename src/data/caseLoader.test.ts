import { describe, it, expect } from 'vitest';
import {
  getAllCases,
  getCaseById,
  getStandardCases,
  getDailyCases,
  getDailyCase,
} from './caseLoader';

describe('case registry', () => {
  it('loads at least one case and they all validate', () => {
    const all = getAllCases();
    expect(all.length).toBeGreaterThan(0);
    // Every shipped case must have a unique id and at least one evidence card.
    const ids = all.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of all) expect(c.evidences.length).toBeGreaterThan(0);
  });

  it('every real case has unique evidence ids within it', () => {
    for (const c of getAllCases()) {
      const evIds = c.evidences.map((e) => e.id);
      expect(new Set(evIds).size).toBe(evIds.length);
    }
  });

  it('getCaseById returns the case or undefined', () => {
    const first = getAllCases()[0]!;
    expect(getCaseById(first.id)).toBe(first);
    expect(getCaseById('does-not-exist')).toBeUndefined();
  });

  it('splits standard and daily cases by type', () => {
    expect(getStandardCases().every((c) => c.type === 'standard')).toBe(true);
    expect(getDailyCases().every((c) => c.type === 'daily')).toBe(true);
  });

  it('orders daily cases deterministically by id', () => {
    const ids = getDailyCases().map((c) => c.id);
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)));
  });
});

describe('getDailyCase rotation', () => {
  const dailies = getDailyCases();

  it('rotates cyclically by day index', () => {
    if (dailies.length === 0) return;
    for (let day = 0; day < dailies.length * 2; day += 1) {
      expect(getDailyCase(day)!.id).toBe(dailies[day % dailies.length]!.id);
    }
  });

  it('wraps negative indices safely', () => {
    if (dailies.length === 0) return;
    expect(getDailyCase(-1)!.id).toBe(dailies[dailies.length - 1]!.id);
  });

  it('falls back to the first daily when no index is given', () => {
    if (dailies.length === 0) return;
    expect(getDailyCase()!.id).toBe(dailies[0]!.id);
  });
});
