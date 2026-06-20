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
    expect(r.verdictComponent).toBe(reward.verdictShare * 1000); // 500
    expect(r.proofComponent).toBe(reward.proofShare * 1000); // 500 (ratio 1)
    expect(r.penalty).toBe(0);
    expect(r.bonusComponent).toBe(0);
    expect(r.total).toBe(1000);
    expect(r.dailyMultiplierApplied).toBe(1);
  });

  it('zeroes the verdict component on a wrong verdict but keeps proof', () => {
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
    expect(r.proofComponent).toBe(500); // full proof, ratio 1
    expect(r.total).toBe(500);
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
    expect(r.proofComponent).toBe(250);
    expect(r.total).toBe(750); // 500 verdict + 250 proof
  });

  it('awards the full proof component when a case has zero contradictions', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'approve',
      contradictions: 0,
      cleanCards: 3,
    });
    const r = evaluateReward(c, 'approve', []);
    expect(r.proofComponent).toBe(500); // guard: ratio defaults to 1
    expect(r.total).toBe(1000);
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
    expect(r.total).toBe(900);
  });

  it('can produce a negative net total', () => {
    const c = makeCase({
      claimAmount: 100,
      correctDecision: 'reject',
      contradictions: 0,
      cleanCards: 5,
    });
    // Wrong verdict (approve a reject-case is wrong only if correctDecision is
    // reject — here it is) and 5 false stamps.
    const r = evaluateReward(c, 'approve', cleanIds(c));
    // verdict 0, proof full (0 contradictions → ratio 1) = 0.5*100 = 50.
    // penalty = 5 * 50 = 250 → total 50 - 250 = -200.
    expect(r.total).toBe(-200);
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
    expect(r.total).toBe(5000);
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

    const positive = 500 + 500; // verdict + proof
    expect(r.bonusPct).toBe(15);
    expect(r.bonusComponent).toBe(Math.round((positive * 15) / 100)); // 150
    expect(r.penalty).toBe(50);
    expect(r.total).toBe(positive + 150 - 50); // 1100
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
    expect(r.total).toBe(1000);
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
    expect(r.verdictComponent).toBe(budgeted.verdictShare * 1000); // 400
    expect(r.proofComponent).toBe(budgeted.proofShare * 1000); // 400
    // unused 1/2 → efficiency = 0.2 * 1000 * 0.5 = 100
    expect(r.efficiencyComponent).toBe(100);
    expect(r.total).toBe(900);
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
    expect(r.efficiencyComponent).toBe(reward.budgeted.efficiencyShare * 1000); // 200
    expect(r.total).toBe(1000); // 400 + 400 + 200, ceiling preserved
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
    expect(r.msUntilUnlock).toBe(daily.cooldownMs / 2);
  });
});
