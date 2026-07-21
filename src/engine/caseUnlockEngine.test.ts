import { describe, it, expect } from 'vitest';
import {
  getRequiredLevel,
  compareCasesByUnlockCriteria,
  evaluateCaseUnlocks,
  isCaseUnlocked,
  getNextAvailableCase,
  summarizeCaseUnlocks,
} from './caseUnlockEngine';
import { GAME_CONFIG } from '../config/gameConfig';
import { makeCase, makeStats } from '../test/fixtures';

const { standardCaseRequiredLevelById, defaultRequiredLevel } =
  GAME_CONFIG.caseUnlocks;

describe('getRequiredLevel', () => {
  it('reads the configured level for a known case', () => {
    expect(getRequiredLevel(makeCase({ id: 'case-003' }))).toBe(
      standardCaseRequiredLevelById['case-003'],
    );
  });

  it('falls back to the default for an unlisted case', () => {
    expect(getRequiredLevel(makeCase({ id: 'case-999' }))).toBe(defaultRequiredLevel);
  });
});

describe('compareCasesByUnlockCriteria', () => {
  it('orders by required level, then by case number', () => {
    const c1 = makeCase({ id: 'case-001' }); // level 1
    const c3 = makeCase({ id: 'case-013' }); // level 2
    expect(compareCasesByUnlockCriteria(c1, c3)).toBeLessThan(0);
    expect(compareCasesByUnlockCriteria(c3, c1)).toBeGreaterThan(0);
  });
});

describe('evaluateCaseUnlocks', () => {
  const c1 = makeCase({ id: 'case-001' }); // requires level 1
  const c3 = makeCase({ id: 'case-013' }); // requires level 2 (next tier after case-001)

  it('marks a completed case as completed', () => {
    const stats = makeStats({ completedCaseIds: ['case-001'] });
    const [info] = evaluateCaseUnlocks([c1], stats);
    expect(info!.status).toBe('completed');
    expect(info!.reason).toBeNull();
  });

  it('locks a case behind the required level and reports the gap', () => {
    const stats = makeStats({ xp: 0 }); // level 1
    const [info] = evaluateCaseUnlocks([c3], stats); // c3 needs level 2
    expect(info!.status).toBe('locked');
    expect(info!.reason).toBe('requires_level');
    expect(info!.levelsRemaining).toBe(1);
  });

  it('locks a level-eligible case until the previous one is completed', () => {
    const stats = makeStats({ xp: 10 }); // level 2, nothing completed
    const infos = evaluateCaseUnlocks([c1, c3], stats);
    expect(infos[0]!.status).toBe('available'); // first case, no predecessor
    expect(infos[1]!.status).toBe('locked');
    expect(infos[1]!.reason).toBe('complete_previous');
  });

  it('opens a case once level + previous-completion are satisfied', () => {
    const stats = makeStats({ xp: 10, completedCaseIds: ['case-001'] });
    const infos = evaluateCaseUnlocks([c1, c3], stats);
    expect(infos[1]!.status).toBe('available');
    expect(infos[1]!.reason).toBeNull();
  });

  it('makes every case available for the development all-levels preview', () => {
    const stats = makeStats({ xp: 0 });
    const infos = evaluateCaseUnlocks([c1, c3], stats, { unlockAll: true });

    expect(infos.map((info) => info.status)).toEqual(['available', 'available']);
    expect(infos.map((info) => info.reason)).toEqual([null, null]);
  });
});

describe('isCaseUnlocked / getNextAvailableCase / summarize', () => {
  const c1 = makeCase({ id: 'case-001' }); // level 1
  const c3 = makeCase({ id: 'case-013' }); // level 2

  it('treats only locked cases as not unlocked', () => {
    const stats = makeStats({ xp: 0 });
    const [info] = evaluateCaseUnlocks([c3], stats);
    expect(isCaseUnlocked(info!)).toBe(false);
  });

  it('returns the first available case excluding the current one', () => {
    const stats = makeStats({ xp: 10, completedCaseIds: ['case-001'] });
    const unlocks = evaluateCaseUnlocks([c1, c3], stats);
    // c1 is completed (not 'available'); c3 is available → it is "next".
    expect(getNextAvailableCase(unlocks, 'case-001')?.id).toBe('case-013');
  });

  it('returns null when no other case is available', () => {
    const stats = makeStats({ xp: 0 }); // c3 locked
    const unlocks = evaluateCaseUnlocks([c3], stats);
    expect(getNextAvailableCase(unlocks, null)).toBeNull();
  });

  it('summarizes totals/unlocked/completed', () => {
    const stats = makeStats({ xp: 10, completedCaseIds: ['case-001'] });
    const unlocks = evaluateCaseUnlocks([c1, c3], stats);
    const summary = summarizeCaseUnlocks(unlocks);
    expect(summary.total).toBe(2);
    expect(summary.completed).toBe(1);
    expect(summary.unlocked).toBe(2); // completed + available both count as unlocked
  });
});
