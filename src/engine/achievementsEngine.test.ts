import { describe, it, expect } from 'vitest';
import { evaluateNewUnlocks } from './achievementsEngine';
import { makeCase, makeStats, makeResult } from '../test/fixtures';
import type { CaseResult } from '../types';

function unlockIds(...args: Parameters<typeof evaluateNewUnlocks>): string[] {
  return evaluateNewUnlocks(...args).map((a) => a.id);
}

describe('evaluateNewUnlocks', () => {
  it('unlocks "first-fraud" on a correctly-rejected fraud case', () => {
    const caseData = makeCase({ correctDecision: 'reject' });
    const result = makeResult({ verdictCorrect: true });
    const stats = makeStats({ completedCaseIds: ['c1'], results: { c1: result } });
    expect(unlockIds({ stats, result, caseData })).toContain('first-fraud');
  });

  it('does not unlock "first-fraud" on an approve case', () => {
    const caseData = makeCase({ correctDecision: 'approve' });
    const result = makeResult({ verdictCorrect: true });
    const stats = makeStats();
    expect(unlockIds({ stats, result, caseData })).not.toContain('first-fraud');
  });

  it('unlocks "solved-10" once ten cases are completed', () => {
    const caseData = makeCase({ correctDecision: 'approve' });
    const result = makeResult({ verdictCorrect: true });
    const stats = makeStats({
      completedCaseIds: Array.from({ length: 10 }, (_, i) => `c${i}`),
    });
    expect(unlockIds({ stats, result, caseData })).toContain('solved-10');
  });

  it('unlocks "perfect-proof-hard" only for a flawless hard case', () => {
    const caseData = makeCase({ difficulty: 'hard', correctDecision: 'reject' });
    const result = makeResult({
      verdictCorrect: true,
      totalContradictions: 3,
      correctlyMarkedContradictions: 3,
      falseStamps: 0,
    });
    const stats = makeStats();
    expect(unlockIds({ stats, result, caseData })).toContain('perfect-proof-hard');
  });

  it('does not unlock "perfect-proof-hard" with a false stamp', () => {
    const caseData = makeCase({ difficulty: 'hard', correctDecision: 'reject' });
    const result = makeResult({
      verdictCorrect: true,
      totalContradictions: 3,
      correctlyMarkedContradictions: 3,
      falseStamps: 1,
    });
    expect(unlockIds({ stats: makeStats(), result, caseData })).not.toContain(
      'perfect-proof-hard',
    );
  });

  it('unlocks "streak-5" at a 5-day streak', () => {
    const caseData = makeCase({ correctDecision: 'approve' });
    const result = makeResult({ verdictCorrect: true });
    const stats = makeStats({ streakCount: 5 });
    expect(unlockIds({ stats, result, caseData })).toContain('streak-5');
  });

  it('unlocks "clean-hands-10" after ten clean results', () => {
    const caseData = makeCase({ correctDecision: 'approve' });
    const result = makeResult({ verdictCorrect: true, falseStamps: 0 });
    const results: Record<string, CaseResult> = {};
    for (let i = 0; i < 10; i += 1) {
      results[`c${i}`] = makeResult({ caseId: `c${i}`, falseStamps: 0 });
    }
    const stats = makeStats({ results });
    expect(unlockIds({ stats, result, caseData })).toContain('clean-hands-10');
  });

  it('filters out achievements that are already unlocked', () => {
    const caseData = makeCase({ correctDecision: 'reject' });
    const result = makeResult({ verdictCorrect: true });
    const stats = makeStats({ unlockedAchievementIds: ['first-fraud'] });
    expect(unlockIds({ stats, result, caseData })).not.toContain('first-fraud');
  });

  it('can unlock several achievements from a single case', () => {
    // Flawless hard reject that is also the player's 10th completed case.
    const caseData = makeCase({ difficulty: 'hard', correctDecision: 'reject' });
    const result = makeResult({
      verdictCorrect: true,
      totalContradictions: 2,
      correctlyMarkedContradictions: 2,
      falseStamps: 0,
    });
    const stats = makeStats({
      completedCaseIds: Array.from({ length: 10 }, (_, i) => `c${i}`),
    });
    const ids = unlockIds({ stats, result, caseData });
    expect(ids).toEqual(
      expect.arrayContaining(['first-fraud', 'solved-10', 'perfect-proof-hard']),
    );
  });
});
