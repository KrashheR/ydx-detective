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
  /**
   * How many evidence cards the player opened this case. Used only for the
   * efficiency component on budgeted cases; ignored when the case has no
   * `investigationBudget`. Defaults to "all opened" so an un-budgeted case is
   * unaffected.
   */
  readonly opensUsed?: number;
}

/**
 * The Multi-Tier Reward Math Engine.
 *
 * BaseReward = claimAmount, scaled ×dailyMultiplier for daily cases.
 *   • Verdict component:    verdictShare of BaseReward iff decision === correctDecision.
 *   • Proof component:      proofShare of BaseReward × (correctStamps / totalContradictions).
 *   • Efficiency component: efficiencyShare of BaseReward × (unusedOpens / budget),
 *                           only on budgeted cases with a correct verdict.
 *   • Bonus component:      (rank% + streak%) applied to the positive base.
 *   • Penalty:              falseStampPenalty per wrongly-stamped card.
 *
 * A wrong verdict earns nothing at all: every component is zeroed and no
 * penalty is charged (the missed payout is the entire consequence). Reward —
 * proof, efficiency, bonuses — is gated behind getting the verdict right.
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
  const { correct, falseStamps } = classifyStamps(caseData, selectedEvidenceIds);

  // A wrong verdict means no reward at all — short-circuit before any component
  // math so investigation skill never pays out on a misjudged case.
  if (!verdictCorrect) {
    return {
      verdictCorrect: false,
      verdictComponent: 0,
      proofComponent: 0,
      efficiencyComponent: 0,
      penalty: 0,
      dailyMultiplierApplied: multiplier,
      bonusComponent: 0,
      bonusPct: 0,
      total: 0,
    };
  }

  // Budgeted cases reallocate some verdict/proof weight into an efficiency
  // component; un-budgeted cases keep the classic 50/50 split (no efficiency).
  const budget = caseData.investigationBudget;
  const isBudgeted = budget != null && budget > 0;
  const verdictShare = isBudgeted
    ? reward.budgeted.verdictShare
    : reward.verdictShare;
  const proofShare = isBudgeted
    ? reward.budgeted.proofShare
    : reward.proofShare;

  const verdictComponent = verdictShare * baseReward;

  const total = totalContradictions(caseData);

  // Guard the divide-by-zero: a case with no contradictions awards the full
  // proof component automatically (there was nothing to miss).
  const ratio = total === 0 ? 1 : correct / total;
  const proofComponent = proofShare * baseReward * ratio;

  // Efficiency: reward a correct verdict reached with budget to spare. Only
  // budgeted cases qualify; an un-budgeted case never awards this component.
  let efficiencyComponent = 0;
  if (isBudgeted) {
    const opensUsed = Math.min(modifiers.opensUsed ?? budget, budget);
    const unused = Math.max(0, budget - opensUsed);
    efficiencyComponent =
      reward.budgeted.efficiencyShare * baseReward * (unused / budget);
  }

  // Rank + streak bonuses scale only the positive base (never the penalty).
  const positive =
    Math.round(verdictComponent) +
    Math.round(proofComponent) +
    Math.round(efficiencyComponent);
  const bonusPct =
    (modifiers.rankBonusPct ?? 0) + (modifiers.streakBonusPct ?? 0);
  const bonusComponent = Math.round((positive * bonusPct) / 100);

  const penalty = falseStamps * reward.falseStampPenalty;

  return {
    verdictCorrect,
    verdictComponent: Math.round(verdictComponent),
    proofComponent: Math.round(proofComponent),
    efficiencyComponent: Math.round(efficiencyComponent),
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
