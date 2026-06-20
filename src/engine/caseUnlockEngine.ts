import { GAME_CONFIG } from '../config/gameConfig';
import { evaluateRank } from './rankEngine';
import type { Case, PlayerStats } from '../types';

export type CaseUnlockStatus = 'available' | 'locked' | 'completed';
export type CaseUnlockReason = 'requires_level' | 'complete_previous';

export interface CaseUnlockInfo {
  readonly caseData: Case;
  readonly status: CaseUnlockStatus;
  readonly reason: CaseUnlockReason | null;
  /** Investigator level required to open this standard case. */
  readonly requiredLevel: number;
  /** Current investigator level at the moment unlocks were evaluated. */
  readonly currentLevel: number;
  /** Levels still needed; set only when reason is `requires_level`. */
  readonly levelsRemaining: number | null;
}

export interface CaseUnlockSummary {
  readonly total: number;
  readonly unlocked: number;
  readonly completed: number;
}

const isCompletedCase = (stats: PlayerStats, caseData: Case): boolean =>
  stats.completedCaseIds.includes(caseData.id);

type StandardCaseRequirementMap =
  typeof GAME_CONFIG.caseUnlocks.standardCaseRequiredLevelById;

export const getRequiredLevel = (caseData: Case): number => {
  const requirements = GAME_CONFIG.caseUnlocks.standardCaseRequiredLevelById;
  const level = requirements[caseData.id as keyof StandardCaseRequirementMap];
  return level ?? GAME_CONFIG.caseUnlocks.defaultRequiredLevel;
};

const caseNumberFromId = (id: string): number => {
  const match = /^case-(\d+)/.exec(id);
  return match?.[1] ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
};

/** Ascending unlock order: required level → case number. */
export const compareCasesByUnlockCriteria = (a: Case, b: Case): number => {
  const levelA = getRequiredLevel(a);
  const levelB = getRequiredLevel(b);
  if (levelA !== levelB) return levelA - levelB;

  return caseNumberFromId(a.id) - caseNumberFromId(b.id);
};

export const evaluateCaseUnlocks = (
  standardCases: readonly Case[],
  stats: PlayerStats,
): CaseUnlockInfo[] => {
  const currentLevel = evaluateRank(stats.xp).level;

  return standardCases.map((caseData, index) => {
    const completed = isCompletedCase(stats, caseData);
    const requiredLevel = getRequiredLevel(caseData);
    const hasRequiredLevel = currentLevel >= requiredLevel;
    const previousCase = standardCases[index - 1] ?? null;
    const previousCompleted =
      index === 0 || (previousCase ? isCompletedCase(stats, previousCase) : true);

    if (completed) {
      return {
        caseData,
        status: 'completed',
        reason: null,
        requiredLevel,
        currentLevel,
        levelsRemaining: null,
      };
    }

    if (!hasRequiredLevel) {
      return {
        caseData,
        status: 'locked',
        reason: 'requires_level',
        requiredLevel,
        currentLevel,
        levelsRemaining: Math.max(0, requiredLevel - currentLevel),
      };
    }

    if (!previousCompleted) {
      return {
        caseData,
        status: 'locked',
        reason: 'complete_previous',
        requiredLevel,
        currentLevel,
        levelsRemaining: null,
      };
    }

    return {
      caseData,
      status: 'available',
      reason: null,
      requiredLevel,
      currentLevel,
      levelsRemaining: null,
    };
  });
};

export const isCaseUnlocked = (info: CaseUnlockInfo): boolean =>
  info.status !== 'locked';

export const getNextAvailableCase = (
  unlocks: readonly CaseUnlockInfo[],
  currentCaseId: string | null,
): Case | null => {
  const availableCases = unlocks.filter(
    (info) => info.status === 'available' && info.caseData.id !== currentCaseId,
  );

  return availableCases[0]?.caseData ?? null;
};

export const summarizeCaseUnlocks = (
  unlocks: readonly CaseUnlockInfo[],
): CaseUnlockSummary => {
  const completed = unlocks.filter((info) => info.status === 'completed').length;
  const unlocked = unlocks.filter(isCaseUnlocked).length;

  return {
    total: unlocks.length,
    unlocked,
    completed,
  };
};
