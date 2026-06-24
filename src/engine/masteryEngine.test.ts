import { describe, expect, it } from 'vitest';
import { makeCase } from '../test/fixtures';
import type { ActiveSession } from '../types';
import { evaluateMastery } from './masteryEngine';

function session(caseId: string, selected: string[], hintsUsed = 0): ActiveSession {
  return {
    caseId,
    selectedEvidenceIds: selected,
    viewedEvidenceIds: [],
    revealedEvidenceIds: [],
    selectedService: null,
    hintsUsed,
    canvassUsed: false,
    extraOpens: 0,
    evidenceThesisLinks: {},
    startedAtServerMs: 0,
  };
}

describe('evaluateMastery', () => {
  it('awards bronze for a correct verdict with incomplete proof', () => {
    const c = makeCase({ contradictions: 2, cleanCards: 1 });
    expect(evaluateMastery(c, c.correctDecision, session(c.id, []))).toBe('bronze');
  });

  it('awards gold for complete clean proof without hints', () => {
    const c = makeCase({ contradictions: 2, cleanCards: 1 });
    const ids = c.evidences.filter((e) => e.isContradiction).map((e) => e.id);
    expect(evaluateMastery(c, c.correctDecision, session(c.id, ids))).toBe('gold');
  });

  it('caps otherwise-perfect proof at silver after a hint', () => {
    const c = makeCase({ contradictions: 1, cleanCards: 1 });
    const ids = c.evidences.filter((e) => e.isContradiction).map((e) => e.id);
    expect(evaluateMastery(c, c.correctDecision, session(c.id, ids, 1))).toBe('silver');
  });
});
