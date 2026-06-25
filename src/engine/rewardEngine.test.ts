import { describe, it, expect } from 'vitest';
import {
  totalContradictions,
  classifyStamps,
  evaluateReward,
  evaluateDailyAvailability,
} from './rewardEngine';
import { GAME_CONFIG } from '../config/gameConfig';
import { makeCase, contradictionIds, cleanIds } from '../test/fixtures';

const { reward, daily } = GAME_CONFIG;
const easyBase = reward.baseByDifficulty.easy;

describe('totalContradictions', () => {
  it('counts only cards flagged as contradictions', () => {
    const c = makeCase({ contradictions: 3, cleanCards: 2 });
    expect(totalContradictions(c)).toBe(3);
  });

  it('returns 0 for a case with no contradictions', () => {
    const c = makeCase({ contradictions: 0, cleanCards: 3 });
    expect(totalContradictions(c)).toBe(0);
  });
});

describe('classifyStamps', () => {
  const c = makeCase({ contradictions: 2, cleanCards: 2 });
  const reals = contradictionIds(c);
  const cleans = cleanIds(c);

  it('counts all-correct stamps', () => {
    expect(classifyStamps(c, reals)).toEqual({ correct: 2, falseStamps: 0 });
  });

  it('counts all-false stamps', () => {
    expect(classifyStamps(c, cleans)).toEqual({ correct: 0, falseStamps: 2 });
  });

  it('partitions a mixed selection', () => {
    expect(classifyStamps(c, [reals[0]!, cleans[0]!])).toEqual({
      correct: 1,
      falseStamps: 1,
    });
  });

  it('ignores stale ids that no longer exist in the case', () => {
    expect(classifyStamps(c, [reals[0]!, 'ghost-id'])).toEqual({
      correct: 1,
      falseStamps: 0,
    });
  });

  it('returns zeros for an empty selection', () => {
    expect(classifyStamps(c, [])).toEqual({ correct: 0, falseStamps: 0 });
  });
});

describe('evaluateReward', () => {
  it('awards verdict + full proof for a perfect correct reject', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 2,
      cleanCards: 1,
    });
    const r = evaluateReward(c, 'reject', contradictionIds(c));

    expect(r.verdictCorrect).toBe(true);
    expect(r.verdictComponent).toBe(reward.verdictShare * easyBase);
    expect(r.proofComponent).toBe(reward.proofShare * easyBase);
    expect(r.penalty).toBe(0);
    expect(r.bonusComponent).toBe(0);
    expect(r.total).toBe(easyBase);
    expect(r.dailyMultiplierApplied).toBe(1);
  });

  it('awards nothing at all on a wrong verdict, even with perfect stamping', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 2,
      cleanCards: 0,
    });
    // Player approves (wrong) but still stamped both real contradictions.
    const r = evaluateReward(c, 'approve', contradictionIds(c));

    expect(r.verdictCorrect).toBe(false);
    expect(r.verdictComponent).toBe(0);
    expect(r.proofComponent).toBe(0); // proof is gated behind a correct verdict
    expect(r.efficiencyComponent).toBe(0);
    expect(r.bonusComponent).toBe(0);
    expect(r.penalty).toBe(0); // no penalty either — the missed payout is the cost
    expect(r.total).toBe(0);
  });

  it('scales the proof component by the stamped ratio', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 2,
      cleanCards: 0,
    });
    // Stamp only 1 of 2 → ratio 0.5 → proof = 0.5 * 0.5 * 1000 = 250
    const r = evaluateReward(c, 'reject', [contradictionIds(c)[0]!]);
    expect(r.proofComponent).toBe(easyBase * 0.25);
    expect(r.total).toBe(easyBase * 0.75);
  });

  it('awards the full proof component when a case has zero contradictions', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'approve',
      contradictions: 0,
      cleanCards: 3,
    });
    const r = evaluateReward(c, 'approve', []);
    expect(r.proofComponent).toBe(easyBase * reward.proofShare);
    expect(r.total).toBe(easyBase);
  });

  it('subtracts a fixed penalty per falsely stamped card', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 1,
      cleanCards: 2,
    });
    // Correct verdict + 1 real stamp + 2 false stamps.
    const r = evaluateReward(c, 'reject', [
      ...contradictionIds(c),
      ...cleanIds(c),
    ]);
    expect(r.penalty).toBe(2 * reward.falseStampPenalty); // 100
    // positive = 500 + 500 = 1000; total = 1000 - 100
    expect(r.total).toBe(easyBase - 2 * reward.falseStampPenalty);
  });

  it('can produce a negative net total when a correct verdict is brute-forced', () => {
    const c = makeCase({
      claimAmount: 100,
      correctDecision: 'approve',
      contradictions: 0,
      cleanCards: 5,
    });
    // Correct verdict (approve), but every clean card is falsely stamped.
    const r = evaluateReward(c, 'approve', cleanIds(c));
    // verdict 50 + proof full (0 contradictions → ratio 1) 50 = 100 positive.
    // penalty = 5 * 50 = 250 → total 100 - 250 = -150.
    expect(r.verdictCorrect).toBe(true);
    expect(r.total).toBe(easyBase - 5 * reward.falseStampPenalty);
  });

  it('applies the ×5 daily multiplier to the base', () => {
    const c = makeCase({
      type: 'daily',
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 1,
      cleanCards: 0,
    });
    const r = evaluateReward(c, 'reject', contradictionIds(c));
    expect(r.dailyMultiplierApplied).toBe(reward.dailyMultiplier); // 5
    // base 5000; verdict 2500 + proof 2500 = 5000
    expect(r.total).toBe(easyBase * reward.dailyMultiplier);
  });

  it('applies rank + streak bonus only to the positive base, not the penalty', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 1,
      cleanCards: 1,
    });
    // Correct + 1 real stamp + 1 false stamp, with 10% rank + 5% streak.
    const r = evaluateReward(c, 'reject', [
      ...contradictionIds(c),
      ...cleanIds(c),
    ], { rankBonusPct: 10, streakBonusPct: 5 });

    const positive = easyBase;
    expect(r.bonusPct).toBe(15);
    expect(r.bonusComponent).toBe(Math.round((positive * 15) / 100));
    expect(r.penalty).toBe(50);
    expect(r.total).toBe(positive + Math.round((positive * 15) / 100) - 50);
  });

  it('includes the perfect-case streak bonus in the additive reward bonus', () => {
    const c = makeCase({ contradictions: 1, cleanCards: 0 });
    const r = evaluateReward(c, c.correctDecision, contradictionIds(c), {
      rankBonusPct: 10,
      streakBonusPct: 5,
      perfectStreakBonusPct: 6,
    });

    expect(r.bonusPct).toBe(21);
    expect(r.bonusComponent).toBe(Math.round((easyBase * 21) / 100));
  });

  it('treats missing modifiers as zero bonus', () => {
    const c = makeCase({ contradictions: 1, cleanCards: 0 });
    const r = evaluateReward(c, c.correctDecision, contradictionIds(c));
    expect(r.bonusPct).toBe(0);
    expect(r.bonusComponent).toBe(0);
  });

  it('awards no efficiency component on un-budgeted cases', () => {
    const c = makeCase({ claimAmount: 1000, contradictions: 1, cleanCards: 0 });
    const r = evaluateReward(c, c.correctDecision, contradictionIds(c), {
      opensUsed: 0,
    });
    expect(r.efficiencyComponent).toBe(0);
    // Classic 50/50 split is preserved → 100% of base.
    expect(r.total).toBe(easyBase);
  });

  it('reallocates to 40/40 and adds efficiency on a budgeted case', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 1,
      cleanCards: 3,
      investigationBudget: 2,
    });
    // Correct verdict, full proof, decided having opened only 1 of 2 budget.
    const r = evaluateReward(c, 'reject', contradictionIds(c), { opensUsed: 1 });
    const { budgeted } = reward;
    expect(r.verdictComponent).toBe(budgeted.verdictShare * easyBase);
    expect(r.proofComponent).toBe(budgeted.proofShare * easyBase);
    // unused 1/2 → efficiency = 0.2 * 1000 * 0.5 = 100
    expect(r.efficiencyComponent).toBe(budgeted.efficiencyShare * easyBase * 0.5);
    expect(r.total).toBe(easyBase * 0.9);
  });

  it('pays the full efficiency share when the verdict is reached with no opens used', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 0,
      cleanCards: 3,
      investigationBudget: 3,
    });
    // Zero contradictions → full proof; opensUsed 0 → full efficiency.
    const r = evaluateReward(c, 'reject', [], { opensUsed: 0 });
    expect(r.efficiencyComponent).toBe(reward.budgeted.efficiencyShare * easyBase);
    expect(r.total).toBe(easyBase);
  });

  it('awards no efficiency on a budgeted case with a wrong verdict', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 1,
      cleanCards: 2,
      investigationBudget: 3,
    });
    const r = evaluateReward(c, 'approve', [], { opensUsed: 0 });
    expect(r.verdictComponent).toBe(0);
    expect(r.efficiencyComponent).toBe(0);
  });

  it('defaults opensUsed to the full budget (no efficiency) when omitted', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 1,
      cleanCards: 1,
      investigationBudget: 2,
    });
    const r = evaluateReward(c, 'reject', contradictionIds(c));
    expect(r.efficiencyComponent).toBe(0); // assumed all budget spent
  });
});

describe('evaluateDailyAvailability', () => {
  it('is unlocked when never claimed', () => {
    expect(evaluateDailyAvailability(null, 1_000_000)).toEqual({
      unlocked: true,
      msUntilUnlock: 0,
    });
  });

  it('is unlocked once the cooldown has fully elapsed', () => {
    const last = 0;
    const now = daily.cooldownMs; // exactly elapsed
    expect(evaluateDailyAvailability(last, now)).toEqual({
      unlocked: true,
      msUntilUnlock: 0,
    });
  });

  it('is locked mid-cooldown and reports the remaining time', () => {
    const last = 1_000_000;
    const now = last + daily.cooldownMs / 2;
    const r = evaluateDailyAvailability(last, now);
    expect(r.unlocked).toBe(false);
    expect(r.msUntilUnlock).toBe(daily.cooldownMs - now);
  });
});
