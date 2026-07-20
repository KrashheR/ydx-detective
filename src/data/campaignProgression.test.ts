/**
 * Campaign-progression invariants — the "difficulty curve" contract.
 *
 * These guard the player-retention design: the standard campaign must ramp
 * through a three-case action tutorial, then alternate dense synthesis with
 * shorter breathers. `campaignOrder`, numeric budgets and exact links are the
 * authoritative curve; raw card count is deliberately allowed to step down.
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
    // 50 standard cases: 38 campaign cases plus 12 special-archive expert files.
    // A drop below this means a case
    // failed Zod validation at load and was silently skipped.
    expect(standard.length).toBe(50);
  });

  it('opens with the canonical three-case interactive onboarding', () => {
    expect(standard.slice(0, 3).map((c) => c.id)).toEqual(['case-001', 'case-009', 'case-013']);
    expect(standard[0]!.evidences.some((e) => e.type === 'thermal_scan')).toBe(true);
    expect(standard[1]!.truth).toBe('valid');
    expect(standard[2]!.evidences.some((e) => e.type === 'document_scan')).toBe(true);
    expect(standard.slice(0, 3).map((c) => c.investigationBudget)).toEqual([2, 3, 3]);
  });

  it('has contiguous campaign order and a solvable numeric budget', () => {
    expect(standard.map((c) => c.campaignOrder)).toEqual(Array.from({ length: 50 }, (_, index) => index + 1));
    for (const c of standard) {
      expect(c.investigationBudget).toBeTypeOf('number');
      expect(c.investigationBudget!).toBeLessThanOrEqual(c.evidences.filter((e) => e.evidenceTier !== 'arc').length);
      expect(c.evidences.filter((e) => e.requiredForVerdict).length).toBeLessThanOrEqual(c.investigationBudget!);
    }
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

  it('keeps financial and phone records out of the onboarding', () => {
    const bank = debutPosition('bank_statement');
    const phone = debutPosition('phone_records');
    // The canonical Archive 17 campaign uses bank/phone data; social_media is
    // optional and remains supported by the renderer for daily/author content.
    expect(bank).not.toBeNull();
    expect(phone).not.toBeNull();
    expect(bank!).toBeGreaterThan(3);
    expect(phone!).toBeGreaterThan(3);
  });
});

describe('truth ↔ contradiction convention (all standard cases)', () => {
  it('fraud cases reject with a direct contradiction; valid cases approve with 0', () => {
    for (const c of standard) {
      const contradictions = c.evidences.filter((e) => e.isContradiction).length;
      if (c.truth === 'fraud') {
        expect(c.correctDecision).toBe('reject');
        expect(contradictions).toBeGreaterThanOrEqual(1);
      } else {
        expect(c.correctDecision).toBe('approve');
        expect(contradictions).toBe(0);
      }
    }
  });
});
