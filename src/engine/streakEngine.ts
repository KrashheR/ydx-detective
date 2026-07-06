/**
 * Daily-engagement streak math — pure & deterministic. A streak is the number
 * of consecutive *server*-days on which the player closed at least one case.
 * It yields a capped, additive reward bonus. All gating is by server-day index
 * (floor(serverMs / 24h)); the device clock is never consulted.
 */
import { GAME_CONFIG } from '../config/gameConfig';

export interface StreakResult {
  /** The streak length after accounting for today's play. */
  readonly streak: number;
  /** Additive reward bonus percentage this streak grants (capped). */
  readonly multiplierPct: number;
}

/**
 * Recompute the streak when a case is closed today.
 *   • First play ever → streak 1.
 *   • Same server-day as last play → unchanged (multiple cases don't stack).
 *   • Exactly the next server-day → streak + 1.
 *   • A skipped day (or a clock that moved backwards) → reset to 1.
 */
export function evaluateStreak(
  prevStreak: number,
  lastPlayedServerDay: number | null,
  nowServerDay: number,
): StreakResult {
  let streak: number;

  if (lastPlayedServerDay === null) {
    streak = 1;
  } else if (nowServerDay === lastPlayedServerDay) {
    streak = Math.max(prevStreak, 1);
  } else if (nowServerDay === lastPlayedServerDay + 1) {
    streak = prevStreak + 1;
  } else {
    streak = 1;
  }

  const { bonusPctPerDay, bonusCapPct } = GAME_CONFIG.streak;
  const multiplierPct = Math.min(streak * bonusPctPerDay, bonusCapPct);

  return { streak, multiplierPct };
}

/**
 * Recompute the consecutive 100%-proof streak after a case closes.
 *   • Replay / non-rewarded closure → unchanged; this mode is training only.
 *   • First-time silver/gold closure → streak + 1.
 *   • First-time non-perfect closure → reset to 0.
 */
export function evaluatePerfectCaseStreak(
  prevStreak: number,
  isPerfectCase: boolean,
  rewardEligible: boolean,
): StreakResult {
  const streak = rewardEligible
    ? isPerfectCase ? prevStreak + 1 : 0
    : prevStreak;

  const { bonusPctPerCase, bonusCapPct } = GAME_CONFIG.perfectCaseStreak;
  const multiplierPct = isPerfectCase && rewardEligible
    ? Math.min(streak * bonusPctPerCase, bonusCapPct)
    : 0;

  return { streak, multiplierPct };
}
