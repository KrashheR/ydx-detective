/**
 * Achievement unlock logic — pure & deterministic. Predicates are keyed by
 * achievement id and evaluated against the player's *post-case* stats plus the
 * case that was just closed. No state, no SDK; the store grants the rewards.
 */
import { ACHIEVEMENTS, type Achievement } from '../data/achievements';
import type { Case, CaseResult, PlayerStats } from '../types';

export interface AchievementContext {
  /** Player stats *after* the just-closed case has been applied. */
  readonly stats: PlayerStats;
  /** Result of the case that just closed. */
  readonly result: CaseResult;
  /** The case that just closed (for static attributes like difficulty). */
  readonly caseData: Case;
}

type Predicate = (ctx: AchievementContext) => boolean;

/** One predicate per achievement id. Missing id → never unlocks (safe). */
const PREDICATES: Record<string, Predicate> = {
  'first-fraud': ({ result, caseData }) =>
    result.verdictCorrect && caseData.correctDecision === 'reject',

  'solved-10': ({ stats }) => stats.completedCaseIds.length >= 10,

  'perfect-proof-hard': ({ result, caseData }) =>
    caseData.difficulty === 'hard' &&
    result.verdictCorrect &&
    result.totalContradictions > 0 &&
    result.correctlyMarkedContradictions === result.totalContradictions &&
    result.falseStamps === 0,

  'streak-5': ({ stats }) => stats.streakCount >= 5,

  'clean-hands-10': ({ stats }) =>
    Object.values(stats.results).filter((r) => r.falseStamps === 0).length >= 10,
};

/**
 * Achievements newly satisfied by this case — i.e. their predicate is now true
 * and they were not already unlocked. The caller is responsible for granting
 * the rewards and recording the ids.
 */
export function evaluateNewUnlocks(ctx: AchievementContext): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) =>
      !ctx.stats.unlockedAchievementIds.includes(a.id) &&
      PREDICATES[a.id]?.(ctx) === true,
  );
}
