/**
 * When is a case actually *closed*?
 *
 * A correct verdict alone never closed a case honestly: the player could guess
 * "reject", stamp nothing, and walk into the next dossier. The closing sheet
 * redesign makes the rule explicit and visible (docs/03-gameplay.md):
 *
 *     правильный вердикт
 *   + отмечены все обязательные противоречия дела
 *   + нет критической массы ошибочных штампов
 *   = дело успешно завершено
 *
 * "Обязательные противоречия" are the cards the author marked *both*
 * `isContradiction` and `requiredForVerdict` — not every contradiction. A case
 * may carry optional supporting contradictions; missing one of those costs
 * accuracy (and money), never progression.
 *
 * Only a solved case enters `completedCaseIds`, which is what
 * `caseUnlockEngine` reads — so a failed case can no longer unlock the next one.
 * Rewarded video is never part of this predicate: ads buy a hint, never progress.
 */
import { GAME_CONFIG } from '../config/gameConfig';
import type { Case, Evidence } from '../types';

/** Why the case is not closed — drives which closing sheet the player sees. */
export type CaseSuccessReason =
  | 'solved'
  | 'wrong_verdict'
  | 'insufficient_evidence'
  | 'false_stamps';

export interface CaseSuccessEvaluation {
  /** The one flag progression depends on. */
  readonly solved: boolean;
  readonly reason: CaseSuccessReason;
  readonly verdictCorrect: boolean;
  /** Mandatory contradictions authored on this case. */
  readonly mandatoryTotal: number;
  readonly mandatoryFound: number;
  /** Mandatory contradictions the player never stamped, in authored order. */
  readonly missedMandatoryEvidenceIds: readonly string[];
  readonly falseStamps: number;
}

/**
 * The cards that must be stamped to close the case, in a stable authored order
 * so "the missed clue" is the same card every time the sheet is re-opened.
 */
export function mandatoryContradictions(caseData: Case): readonly Evidence[] {
  return caseData.evidences.filter(
    (evidence) => evidence.isContradiction && evidence.requiredForVerdict === true,
  );
}

export function evaluateCaseSuccess(
  caseData: Case,
  input: {
    readonly verdictCorrect: boolean;
    readonly stampedEvidenceIds: readonly string[];
    readonly falseStamps: number;
  },
): CaseSuccessEvaluation {
  const mandatory = mandatoryContradictions(caseData);
  const missed = mandatory.filter(
    (evidence) => !input.stampedEvidenceIds.includes(evidence.id),
  );
  const mandatoryFound = mandatory.length - missed.length;
  const proofComplete =
    !GAME_CONFIG.caseSuccess.requireMandatoryContradictions || missed.length === 0;
  const stampsAcceptable =
    input.falseStamps <= GAME_CONFIG.caseSuccess.maxFalseStamps;

  const reason: CaseSuccessReason = !input.verdictCorrect
    ? 'wrong_verdict'
    : !proofComplete
      ? 'insufficient_evidence'
      : !stampsAcceptable
        ? 'false_stamps'
        : 'solved';

  return {
    solved: reason === 'solved',
    reason,
    verdictCorrect: input.verdictCorrect,
    mandatoryTotal: mandatory.length,
    mandatoryFound,
    missedMandatoryEvidenceIds: missed.map((evidence) => evidence.id),
    falseStamps: input.falseStamps,
  };
}

/**
 * The single card a rewarded hint opens after a failure: the first missed
 * mandatory contradiction in authored order (deterministic across re-opens).
 * Falls back to any missed contradiction so cases without `requiredForVerdict`
 * still have something to teach.
 */
export function clueEvidenceFor(
  caseData: Case,
  evaluation: CaseSuccessEvaluation,
  stampedEvidenceIds: readonly string[],
): Evidence | null {
  const fromMandatory = evaluation.missedMandatoryEvidenceIds[0];
  if (fromMandatory) {
    return caseData.evidences.find((evidence) => evidence.id === fromMandatory) ?? null;
  }
  return (
    caseData.evidences.find(
      (evidence) =>
        evidence.isContradiction && !stampedEvidenceIds.includes(evidence.id),
    ) ?? null
  );
}
