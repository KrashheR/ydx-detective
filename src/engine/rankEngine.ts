/**
 * Career progression math — pure & deterministic, like the reward engine.
 * Converts case performance into XP, and cumulative XP into an investigator
 * level. No state, no SDK; all tuning lives in `GAME_CONFIG.progression`.
 *
 * XP is permanent (never spent) and is kept strictly separate from `balance`,
 * the spendable currency. Levels grant a small additive reward bonus, surfaced
 * to the player as a sense of growing seniority.
 */
import { GAME_CONFIG } from '../config/gameConfig';
import type { Difficulty } from '../types';

export interface XpGainInput {
  readonly difficulty: Difficulty;
  readonly verdictCorrect: boolean;
  /** Share of real contradictions correctly stamped, 0..1. */
  readonly proofRatio: number;
  readonly isDaily: boolean;
}

/**
 * XP awarded for closing a case.
 *   • Wrong verdict → a small flat participation award.
 *   • Correct verdict → difficulty weight × (0.5 + 0.5 × proofRatio), so a
 *     sloppy-but-correct verdict still earns the floor and a clean one the max.
 *   • Daily cases multiply the result.
 */
export function evaluateXpGain(input: XpGainInput): number {
  const { progression } = GAME_CONFIG;
  if (!input.verdictCorrect) return progression.wrongVerdictXp;

  const weight = progression.xpDifficultyWeight[input.difficulty];
  const ratio = Math.max(0, Math.min(1, input.proofRatio));
  const base = weight * (0.5 + 0.5 * ratio);
  const scaled = input.isDaily ? base * progression.dailyXpMultiplier : base;
  return Math.round(scaled);
}

export interface RankInfo {
  readonly index: number;
  /** 1-based investigator level shown to the player. */
  readonly level: number;
  readonly id: string;
  readonly rewardBonusPct: number;
  /** XP accumulated past this level's threshold. */
  readonly xpIntoRank: number;
  /** XP needed to reach the next level, or null at max level. */
  readonly xpForNext: number | null;
  /** Progress to the next level, 0..1 (1 at max level). */
  readonly progress: number;
  readonly isMax: boolean;
}

/**
 * Resolve cumulative XP into the current level plus progress toward the next.
 * The ranks table is assumed ascending by `xpThreshold` (it is, in config).
 */
export function evaluateRank(xp: number): RankInfo {
  const ranks = GAME_CONFIG.progression.ranks;

  // Highest rank whose threshold the player has reached.
  let index = 0;
  for (let i = 0; i < ranks.length; i += 1) {
    const rank = ranks[i];
    if (rank && xp >= rank.xpThreshold) index = i;
    else break;
  }

  const current = ranks[index] ?? ranks[0]!;
  const next = ranks[index + 1] ?? null;
  const isMax = next === null;
  const xpIntoRank = xp - current.xpThreshold;
  const xpForNext = next ? next.xpThreshold - current.xpThreshold : null;
  const progress =
    next && xpForNext && xpForNext > 0
      ? Math.max(0, Math.min(1, xpIntoRank / xpForNext))
      : 1;

  return {
    index,
    level: index + 1,
    id: current.id,
    rewardBonusPct: current.rewardBonusPct,
    xpIntoRank,
    xpForNext,
    progress,
    isMax,
  };
}
