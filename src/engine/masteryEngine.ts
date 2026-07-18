import type { ActiveSession, Case, Decision, MasteryLevel } from '../types';
import { classifyStamps, totalContradictions } from './rewardEngine';

const RANK: Record<MasteryLevel, number> = { none: 0, bronze: 1, silver: 2, gold: 3 };

export function evaluateMastery(
  caseData: Case,
  decision: Decision,
  session: ActiveSession | null,
): MasteryLevel {
  if (!session || decision !== caseData.correctDecision) return 'none';
  const { correct, falseStamps } = classifyStamps(caseData, session.selectedEvidenceIds);
  const silver = falseStamps === 0 && correct === totalContradictions(caseData);
  if (!silver) return 'bronze';

  const budget = caseData.investigationBudget;
  const hasSpareOpen = budget == null || session.viewedEvidenceIds.length < budget + session.extraOpens;
  return session.hintsUsed === 0 && hasSpareOpen ? 'gold' : 'silver';
}

export function bestMastery(a: MasteryLevel, b: MasteryLevel): MasteryLevel {
  return RANK[a] >= RANK[b] ? a : b;
}
