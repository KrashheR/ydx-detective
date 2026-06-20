/**
 * Pure scoring & timing logic. No state, no SDK, no side effects — every
 * function is deterministic given its inputs, which makes the economy trivially
 * unit-testable and keeps the Zustand store thin.
 */
import { GAME_CONFIG } from '../config/gameConfig';
import type { Case, Decision, RewardBreakdown } from '../types';

/** How many evidence cards in this case are genuine contradictions. */
export function totalContradictions(caseData: Case): number {
  return caseData.evidences.filter((e) => e.isContradiction).length;
}

/**
 * Partition the player's stamps against ground truth.
 *   correct → stamped a real contradiction
 *   false   → stamped a non-contradiction (triggers anti-cheat penalty)
 */
export function classifyStamps(
  caseData: Case,
  selectedEvidenceIds: readonly string[],
): { correct: number; falseStamps: number } {
  const byId = new Map(caseData.evidences.map((e) => [e.id, e]));
  let correct = 0;
  let falseStamps = 0;
  for (const id of selectedEvidenceIds) {
    const ev = byId.get(id);
    if (!ev) continue; // stale id from a since-edited case — ignore safely
    if (ev.isContradiction) correct += 1;
    else falseStamps += 1;
  }
  return { correct, falseStamps };
}

/**
 * Player-derived reward modifiers. Passing them in (rather than reading player
 * state here) keeps this engine pure and deterministic — they are just inputs.
 */
export interface RewardModifiers {
  /** Additive % bonus from the player's investigator rank. */
  readonly rankBonusPct?: number;
  /** Additive % bonus from the player's daily streak. */
  readonly streakBonusPct?: number;
}

/**
 * The Multi-Tier Reward Math Engine.
 *
 * BaseReward = claimAmount, scaled ×dailyMultiplier for daily cases.
 *   • Verdict component: 50% of BaseReward iff decision === correctDecision.
 *   • Proof component:   50% of BaseReward × (correctStamps / totalContradictions).
 *   • Bonus component:   (rank% + streak%) applied to the positive base.
 *   • Penalty:           falseStampPenalty per wrongly-stamped card.
 *
 * A wrong verdict still allows the proof component to reflect investigation
 * skill, but you keep nothing if you also brute-forced stamps (penalty applies
 * unconditionally). The net total may be negative.
 */
export function evaluateReward(
  caseData: Case,
  decision: Decision,
  selectedEvidenceIds: readonly string[],
  modifiers: RewardModifiers = {},
): RewardBreakdown {
  const { reward } = GAME_CONFIG;
  const multiplier = caseData.type === 'daily' ? reward.dailyMultiplier : 1;
  const baseReward = caseData.claimAmount * multiplier;

  const verdictCorrect = decision === caseData.correctDecision;
  const verdictComponent = verdictCorrect
    ? reward.verdictShare * baseReward
    : 0;

  const total = totalContradictions(caseData);
  const { correct, falseStamps } = classifyStamps(caseData, selectedEvidenceIds);

  // Guard the divide-by-zero: a case with no contradictions awards the full
  // proof component automatically (there was nothing to miss).
  const ratio = total === 0 ? 1 : correct / total;
  const proofComponent = reward.proofShare * baseReward * ratio;

  // Rank + streak bonuses scale only the positive base (never the penalty).
  const positive = Math.round(verdictComponent) + Math.round(proofComponent);
  const bonusPct =
    (modifiers.rankBonusPct ?? 0) + (modifiers.streakBonusPct ?? 0);
  const bonusComponent = Math.round((positive * bonusPct) / 100);

  const penalty = falseStamps * reward.falseStampPenalty;

  return {
    verdictCorrect,
    verdictComponent: Math.round(verdictComponent),
    proofComponent: Math.round(proofComponent),
    penalty,
    dailyMultiplierApplied: multiplier,
    bonusComponent,
    bonusPct,
    total: positive + bonusComponent - penalty,
  };
}

/* -------------------------- Daily case evaluator ------------------------- */

/**
 * Whether a daily case may be played, evaluated strictly against Yandex
 * *server* time (passed in by the caller). Returns the unlock state plus, when
 * locked, how many ms remain — never reads device time.
 */
export function evaluateDailyAvailability(
  lastClaimServerMs: number | null,
  nowServerMs: number,
): { unlocked: boolean; msUntilUnlock: number } {
  if (lastClaimServerMs == null) return { unlocked: true, msUntilUnlock: 0 };
  const elapsed = nowServerMs - lastClaimServerMs;
  const remaining = GAME_CONFIG.daily.cooldownMs - elapsed;
  return remaining <= 0
    ? { unlocked: true, msUntilUnlock: 0 }
    : { unlocked: false, msUntilUnlock: remaining };
}
