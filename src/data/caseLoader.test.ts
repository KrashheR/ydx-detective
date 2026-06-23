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

  it('does not leak Cyrillic text into non-Cyrillic locales', () => {
    const languageKeys = ['ru', 'en', 'tr', 'ar', 'kk'];
    const cyrillic = /[А-Яа-яЁё]/;
    const leaks: string[] = [];

    const visit = (value: unknown, path: string): void => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => visit(item, `${path}[${index}]`));
        return;
      }
      if (!value || typeof value !== 'object') return;

      const record = value as Record<string, unknown>;
      if (languageKeys.every((lang) => lang in record)) {
        for (const lang of ['en', 'tr', 'ar']) {
          const entries = Array.isArray(record[lang]) ? record[lang] : [record[lang]];
          entries.forEach((entry, index) => {
            if (typeof entry === 'string' && cyrillic.test(entry)) {
              leaks.push(`${path}.${lang}${entries.length > 1 ? `[${index}]` : ''}`);
            }
          });
        }
      }

      Object.entries(record).forEach(([key, child]) => visit(child, `${path}.${key}`));
    };

    getAllCases().forEach((caseData) => visit(caseData, caseData.id));
    expect(leaks).toEqual([]);
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
