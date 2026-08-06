import { describe, expect, it } from 'vitest';
import {
  clueEvidenceFor,
  evaluateCaseSuccess,
  mandatoryContradictions,
} from './caseSuccessEngine';
import { evaluateCaseUnlocks } from './caseUnlockEngine';
import { getCaseById, getStandardCaseSummaries } from '../data/caseLoader';
import { makeStats } from '../test/fixtures';
import { GAME_CONFIG } from '../config/gameConfig';

const caseData = getCaseById('case-001')!;
const mandatoryIds = mandatoryContradictions(caseData).map((e) => e.id);
const allIds = (stamped: readonly string[]) => [...stamped];
const standardCases = getStandardCaseSummaries();

describe('evaluateCaseSuccess', () => {
  it('closes the case on a right verdict backed by every mandatory contradiction', () => {
    const evaluation = evaluateCaseSuccess(caseData, {
      verdictCorrect: true,
      stampedEvidenceIds: allIds(mandatoryIds),
      falseStamps: 0,
    });

    expect(evaluation.solved).toBe(true);
    expect(evaluation.reason).toBe('solved');
    expect(evaluation.missedMandatoryEvidenceIds).toHaveLength(0);
  });

  it('a right verdict with no proof is its own state, not a failure', () => {
    const evaluation = evaluateCaseSuccess(caseData, {
      verdictCorrect: true,
      stampedEvidenceIds: [],
      falseStamps: 0,
    });

    expect(evaluation.solved).toBe(false);
    expect(evaluation.reason).toBe('insufficient_evidence');
    expect(evaluation.verdictCorrect).toBe(true);
    expect(evaluation.mandatoryFound).toBe(0);
    expect(evaluation.mandatoryTotal).toBe(mandatoryIds.length);
  });

  it('a wrong verdict is never rescued by perfect stamping', () => {
    const evaluation = evaluateCaseSuccess(caseData, {
      verdictCorrect: false,
      stampedEvidenceIds: allIds(mandatoryIds),
      falseStamps: 0,
    });

    expect(evaluation.solved).toBe(false);
    expect(evaluation.reason).toBe('wrong_verdict');
  });

  it('rejects a case buried under wrong stamps', () => {
    const evaluation = evaluateCaseSuccess(caseData, {
      verdictCorrect: true,
      stampedEvidenceIds: allIds(mandatoryIds),
      falseStamps: GAME_CONFIG.caseSuccess.maxFalseStamps + 1,
    });

    expect(evaluation.solved).toBe(false);
    expect(evaluation.reason).toBe('false_stamps');
  });

  it('picks the same clue every time so a re-opened sheet never shifts', () => {
    const evaluation = evaluateCaseSuccess(caseData, {
      verdictCorrect: false,
      stampedEvidenceIds: [],
      falseStamps: 0,
    });

    const first = clueEvidenceFor(caseData, evaluation, []);
    const second = clueEvidenceFor(caseData, evaluation, []);
    expect(first?.id).toBe(second?.id);
    expect(first?.id).toBe(mandatoryIds[0]);
  });
});

describe('progression gate', () => {
  it('a case that was never solved does not open the next one', () => {
    // The failed case is absent from `completedCaseIds` — that is the whole gate.
    const stats = makeStats({ xp: 100000, completedCaseIds: [] });
    const unlocks = evaluateCaseUnlocks(standardCases, stats);

    expect(unlocks[0]?.status).toBe('available');
    expect(unlocks[1]?.status).toBe('locked');
    expect(unlocks[1]?.reason).toBe('complete_previous');
  });

  it('grandfathers old saves: an already-completed case keeps its unlocks', () => {
    const stats = makeStats({
      xp: 100000,
      completedCaseIds: [standardCases[0]!.id],
    });
    const unlocks = evaluateCaseUnlocks(standardCases, stats);

    expect(unlocks[0]?.status).toBe('completed');
    expect(unlocks[1]?.status).toBe('available');
  });
});
