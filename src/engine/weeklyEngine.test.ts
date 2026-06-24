import { describe, expect, it } from 'vitest';
import { makeCase } from '../test/fixtures';
import { updateWeeklyProgress } from './weeklyEngine';

describe('weekly plan', () => {
  it('counts a case once and resets on a new server week', () => {
    const c = makeCase();
    const first = updateWeeklyProgress({ current: null, serverMs: 0, caseData: c, mastery: 'gold', verdictCorrect: true, hintsUsed: 0, opensUsed: 0 });
    const duplicate = updateWeeklyProgress({ current: first, serverMs: 1, caseData: c, mastery: 'gold', verdictCorrect: true, hintsUsed: 0, opensUsed: 0 });
    expect(duplicate.correctCount).toBe(1);
    const nextWeek = updateWeeklyProgress({ current: duplicate, serverMs: 8 * 24 * 60 * 60 * 1000, caseData: c, mastery: 'bronze', verdictCorrect: true, hintsUsed: 1, opensUsed: 0 });
    expect(nextWeek.serverWeek).not.toBe(first.serverWeek);
    expect(nextWeek.correctCount).toBe(1);
  });
});
