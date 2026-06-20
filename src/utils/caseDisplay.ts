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

/** Player-facing lock reason for a standard case row or folder cover. */
export const formatCaseLockMessage = (
  info: CaseUnlockInfo,
  lang: Language,
): string => {
  if (info.reason === 'requires_level') {
    return t('requiresLevel', lang).replace('{level}', String(info.requiredLevel));
  }
  if (info.reason === 'complete_previous') return t('completePreviousCase', lang);
  return t('caseLocked', lang);
};

/**
 * Fuller, actionable lock reason for a hover tooltip — states *why* a case is
 * locked and *what* unlocks it (the inline label is terser by design).
 */
export const formatCaseLockTooltip = (
  info: CaseUnlockInfo,
  lang: Language,
): string => {
  if (info.reason === 'requires_level') {
    return t('tipCaseLockedLevel', lang).replace(
      '{level}',
      String(info.requiredLevel),
    );
  }
  if (info.reason === 'complete_previous') return t('completePreviousCase', lang);
  return t('caseLocked', lang);
};

export { tDifficulty };
