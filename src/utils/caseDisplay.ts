import { getStandardCases } from '../data/caseLoader';
import type { CaseUnlockInfo } from '../engine/caseUnlockEngine';
import { formatCaseNumber, t, tDifficulty } from '../i18n/ui';
import type { Case, Language } from '../types';

/** Player-facing label for a case — "Case 1" / "Дело 1", or the daily-case title. */
export const formatCaseLabel = (caseData: Case, lang: Language): string => {
  if (caseData.type === 'daily') return t('dailyCase', lang);

  const idx = getStandardCases().findIndex((c) => c.id === caseData.id);
  if (idx < 0) return caseData.id;

  return formatCaseNumber(idx + 1, lang);
};

/**
 * Player-facing lock reason for a standard case row or folder cover.
 *
 * The real campaign lock is always the sequence — `requiredLevel` is an
 * internal difficulty tier (always reachable, capped low) that never
 * blocks a linear player, so both lock reasons surface the same
 * "finish the previous case" wording rather than exposing the level tier.
 */
export const formatCaseLockMessage = (
  info: CaseUnlockInfo,
  lang: Language,
): string => {
  if (info.reason === 'requires_level' || info.reason === 'complete_previous') {
    return t('completePreviousCase', lang);
  }
  return t('caseLocked', lang);
};

/**
 * Fuller, actionable lock reason for a hover tooltip. Currently identical to
 * the inline label — kept as a separate function since the tooltip is the
 * natural place to elaborate if the lock ever grows more detail.
 */
export const formatCaseLockTooltip = (
  info: CaseUnlockInfo,
  lang: Language,
): string => {
  if (info.reason === 'requires_level' || info.reason === 'complete_previous') {
    return t('completePreviousCase', lang);
  }
  return t('caseLocked', lang);
};

export { tDifficulty };
