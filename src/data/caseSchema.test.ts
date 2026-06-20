import { describe, it, expect } from 'vitest';
import { parseCase, safeParseCases } from './caseSchema';
import { makeCase } from '../test/fixtures';

/** A plain (non-readonly) deep clone we can mutate to forge invalid inputs. */
function rawCase(): any {
  return JSON.parse(JSON.stringify(makeCase({ contradictions: 1, cleanCards: 1 })));
}

describe('parseCase', () => {
  it('accepts a fully-valid case', () => {
    const raw = rawCase();
    const parsed = parseCase(raw);
    expect(parsed.id).toBe(raw.id);
    expect(parsed.evidences).toHaveLength(2);
  });

  it('rejects a case missing a required language translation', () => {
    const raw = rawCase();
    delete raw.title.en; // strict localized shape requires every language
    expect(() => parseCase(raw)).toThrow();
  });

  it('rejects an unknown language key (strict mode)', () => {
    const raw = rawCase();
    raw.title.zz = 'extra';
    expect(() => parseCase(raw)).toThrow();
  });

  it('rejects duplicate evidence ids within a case', () => {
    const raw = rawCase();
    raw.evidences[1].id = raw.evidences[0].id; // collide ids
    expect(() => parseCase(raw)).toThrow(/Duplicate evidence id/);
  });

  it('rejects a negative claim amount', () => {
    const raw = rawCase();
    raw.claimAmount = -1;
    expect(() => parseCase(raw)).toThrow();
  });

  it('rejects a case with no evidence cards', () => {
    const raw = rawCase();
    raw.evidences = [];
    expect(() => parseCase(raw)).toThrow();
  });

  it('rejects an unknown extra top-level field (strict)', () => {
    const raw = rawCase();
    raw.surprise = true;
    expect(() => parseCase(raw)).toThrow();
  });
});

describe('safeParseCases', () => {
  it('collects valid cases and records errors without throwing', () => {
    const good = rawCase();
    const bad = rawCase();
    delete bad.correctDecision;

    const { cases, errors } = safeParseCases([good, bad]);
    expect(cases).toHaveLength(1);
    expect(cases[0]!.id).toBe(good.id);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.index).toBe(1);
  });
});
