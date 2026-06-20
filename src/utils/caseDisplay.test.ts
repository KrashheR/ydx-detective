import { describe, it, expect } from 'vitest';
import { formatCaseLabel, formatCaseLockMessage } from './caseDisplay';
import { formatCaseNumber, t } from '../i18n/ui';
import { getStandardCases } from '../data/caseLoader';
import { makeCase } from '../test/fixtures';
import type { CaseUnlockInfo } from '../engine/caseUnlockEngine';

function lockInfo(overrides: Partial<CaseUnlockInfo>): CaseUnlockInfo {
  return {
    caseData: makeCase(),
    status: 'locked',
    reason: 'requires_level',
    requiredLevel: 5,
    currentLevel: 1,
    levelsRemaining: 4,
    ...overrides,
  };
}

describe('formatCaseLabel', () => {
  it('labels a daily case with the daily-case string', () => {
    const daily = makeCase({ type: 'daily' });
    expect(formatCaseLabel(daily, 'ru')).toBe(t('dailyCase', 'ru'));
  });

  it('labels a real standard case by its 1-based position', () => {
    const first = getStandardCases()[0]!;
    expect(formatCaseLabel(first, 'ru')).toBe(formatCaseNumber(1, 'ru'));
  });

  it('falls back to the id for an unknown standard case', () => {
    const ghost = makeCase({ id: 'case-unknown', type: 'standard' });
    expect(formatCaseLabel(ghost, 'ru')).toBe('case-unknown');
  });
});

describe('formatCaseLockMessage', () => {
  it('interpolates the required level for a level lock', () => {
    const msg = formatCaseLockMessage(lockInfo({ requiredLevel: 7 }), 'ru');
    expect(msg).toBe(t('requiresLevel', 'ru').replace('{level}', '7'));
    expect(msg).toContain('7');
  });

  it('uses the complete-previous string for a prerequisite lock', () => {
    const msg = formatCaseLockMessage(
      lockInfo({ reason: 'complete_previous', levelsRemaining: null }),
      'ru',
    );
    expect(msg).toBe(t('completePreviousCase', 'ru'));
  });

  it('falls back to the generic locked string when there is no reason', () => {
    const msg = formatCaseLockMessage(lockInfo({ reason: null }), 'ru');
    expect(msg).toBe(t('caseLocked', 'ru'));
  });
});
