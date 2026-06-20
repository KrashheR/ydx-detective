import { describe, it, expect } from 'vitest';
import { evaluateXpGain, evaluateRank } from './rankEngine';
import { GAME_CONFIG } from '../config/gameConfig';

const { progression } = GAME_CONFIG;
const ranks = progression.ranks;

describe('evaluateXpGain', () => {
  it('grants only the flat participation award for a wrong verdict', () => {
    const xp = evaluateXpGain({
      difficulty: 'hard',
      verdictCorrect: false,
      proofRatio: 1,
      isDaily: true,
    });
    expect(xp).toBe(progression.wrongVerdictXp);
  });

  it('weights a correct verdict by difficulty and proof quality', () => {
    // easy weight 10, proofRatio 1 → 10 * (0.5 + 0.5) = 10
    expect(
      evaluateXpGain({
        difficulty: 'easy',
        verdictCorrect: true,
        proofRatio: 1,
        isDaily: false,
      }),
    ).toBe(10);

    // medium weight 20, proofRatio 0 → 20 * 0.5 = 10 (the floor)
    expect(
      evaluateXpGain({
        difficulty: 'medium',
        verdictCorrect: true,
        proofRatio: 0,
        isDaily: false,
      }),
    ).toBe(10);

    // hard weight 35, proofRatio 0.5 → 35 * 0.75 = 26.25 → 26
    expect(
      evaluateXpGain({
        difficulty: 'hard',
        verdictCorrect: true,
        proofRatio: 0.5,
        isDaily: false,
      }),
    ).toBe(26);
  });

  it('clamps proofRatio into [0,1]', () => {
    const over = evaluateXpGain({
      difficulty: 'easy',
      verdictCorrect: true,
      proofRatio: 5,
      isDaily: false,
    });
    const under = evaluateXpGain({
      difficulty: 'easy',
      verdictCorrect: true,
      proofRatio: -5,
      isDaily: false,
    });
    expect(over).toBe(10); // clamped to 1
    expect(under).toBe(5); // clamped to 0 → 10 * 0.5
  });

  it('multiplies daily-case XP', () => {
    const standard = evaluateXpGain({
      difficulty: 'easy',
      verdictCorrect: true,
      proofRatio: 1,
      isDaily: false,
    });
    const dailyXp = evaluateXpGain({
      difficulty: 'easy',
      verdictCorrect: true,
      proofRatio: 1,
      isDaily: true,
    });
    expect(dailyXp).toBe(standard * progression.dailyXpMultiplier);
  });
});

describe('evaluateRank', () => {
  it('resolves the exact threshold of every rank', () => {
    ranks.forEach((rank, i) => {
      const info = evaluateRank(rank.xpThreshold);
      expect(info.index).toBe(i);
      expect(info.id).toBe(rank.id);
      expect(info.rewardBonusPct).toBe(rank.rewardBonusPct);
    });
  });

  it('reports fractional progress between two ranks', () => {
    // Derived from config so a re-tuned ladder doesn't break the test.
    const r1 = ranks[1]!;
    const r2 = ranks[2]!;
    const span = r2.xpThreshold - r1.xpThreshold;
    const midpoint = r1.xpThreshold + span / 2;
    const info = evaluateRank(midpoint);
    expect(info.id).toBe(r1.id);
    expect(info.xpIntoRank).toBe(span / 2);
    expect(info.xpForNext).toBe(span);
    expect(info.progress).toBeCloseTo(0.5, 5);
    expect(info.isMax).toBe(false);
  });

  it('exposes a 1-based investigator level', () => {
    expect(evaluateRank(ranks[0]!.xpThreshold).level).toBe(1);
    expect(evaluateRank(ranks[2]!.xpThreshold).level).toBe(3);
  });

  it('caps progress and nulls xpForNext at the max rank', () => {
    const max = ranks[ranks.length - 1]!;
    const info = evaluateRank(max.xpThreshold + 99_999);
    expect(info.id).toBe(max.id);
    expect(info.isMax).toBe(true);
    expect(info.xpForNext).toBeNull();
    expect(info.progress).toBe(1);
  });

  it('floors to the lowest rank for zero/low XP', () => {
    const info = evaluateRank(0);
    expect(info.index).toBe(0);
    expect(info.id).toBe(ranks[0]!.id);
  });
});
