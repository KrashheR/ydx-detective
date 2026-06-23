/**
 * Campaign-progression invariants — the "difficulty curve" contract.
 *
 * These guard the player-retention design: the standard campaign must ramp
 * gently (2-evidence onboarding → 6-evidence expert), never step *down* in
 * evidence count or required level, and drip-feed the advanced evidence types
 * (bank_statement / phone_records / social_media) into the late game.
 *
 * The campaign ORDER is `getStandardCases()` (sorted by the unlock comparator);
 * positions below are 1-based indices into that order.
 */
import { describe, it, expect } from 'vitest';
import { getStandardCases } from './caseLoader';
import { getRequiredLevel } from '../engine/caseUnlockEngine';
import type { EvidenceType } from '../types';

const standard = getStandardCases();

/** First appearance (1-based position) of an evidence type in campaign order. */
function debutPosition(type: EvidenceType): number | null {
  for (let i = 0; i < standard.length; i += 1) {
    if (standard[i]!.evidences.some((e) => e.type === type)) return i + 1;
  }
  return null;
}

describe('campaign difficulty curve', () => {
  it('ships the full expected standard roster (catches silently-skipped cases)', () => {
    // 33 standard cases: 21 reordered originals (incl. the once-orphan case-022)
    // + 17 expert-tier cases (case-023..039). A drop below this means a case
    // failed Zod validation at load and was silently skipped.
    expect(standard.length).toBe(38);
  });

  it('opens with two 2-evidence onboarding cases using only photo/document', () => {
    const onboarding = standard.slice(0, 2);
    for (const c of onboarding) {
      expect(c.evidences.length).toBe(2);
      for (const e of c.evidences) {
        expect(['photo', 'document']).toContain(e.type);
      }
    }
  });

  it('never decreases evidence count along the campaign order', () => {
    let prev = 0;
    for (const c of standard) {
      const n = c.evidences.length;
      expect(n).toBeGreaterThanOrEqual(prev);
      prev = n;
    }
    // And it actually climbs to the 6-evidence expert tier by the end.
    expect(standard[standard.length - 1]!.evidences.length).toBe(6);
  });

  it('never decreases the required level along the campaign order', () => {
    let prev = 0;
    for (const c of standard) {
      const lvl = getRequiredLevel(c);
      expect(lvl).toBeGreaterThanOrEqual(prev);
      prev = lvl;
    }
  });

  it('keeps required levels reachable — no late-game XP wall', () => {
    // Levels are a complexity tier, not a hard wall; the strict sequence gate is
    // the real lock. Cap stays low so a linear player is never under-levelled.
    for (const c of standard) {
      expect(getRequiredLevel(c)).toBeLessThanOrEqual(16);
    }
  });

  it('debuts the advanced evidence types only in the late game', () => {
    const bank = debutPosition('bank_statement');
    const phone = debutPosition('phone_records');
    const social = debutPosition('social_media');
    // All three must actually be used somewhere…
    expect(bank).not.toBeNull();
    expect(phone).not.toBeNull();
    expect(social).not.toBeNull();
    // …and not before the advanced stretch of the campaign.
    expect(bank!).toBeGreaterThanOrEqual(18);
    expect(phone!).toBeGreaterThanOrEqual(18);
    expect(social!).toBeGreaterThanOrEqual(18);
  });
});

describe('truth ↔ contradiction convention (all standard cases)', () => {
  it('fraud cases reject with >=2 contradictions; valid cases approve with 0', () => {
    for (const c of standard) {
      const contradictions = c.evidences.filter((e) => e.isContradiction).length;
      if (c.truth === 'fraud') {
        expect(c.correctDecision).toBe('reject');
        expect(contradictions).toBeGreaterThanOrEqual(2);
      } else {
        expect(c.correctDecision).toBe('approve');
        expect(contradictions).toBe(0);
      }
    }
  });
});
