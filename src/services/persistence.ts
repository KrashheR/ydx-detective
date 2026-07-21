import { GAME_CONFIG } from '../config/gameConfig';
import { DEFAULT_LANGUAGE, type ActiveSession, type PersistedState, type PlayerStats } from '../types';
import { storageGet, storageSet } from './platformAdapter';

export const SAVE_KEY = 'claimDetectiveSave';
export const MAX_SAVE_BYTES = 1_000_000;
export function makeDefaultStats(): PlayerStats { return { balance: GAME_CONFIG.economy.startingBalance, language: DEFAULT_LANGUAGE, completedCaseIds: [], results: {}, lastDailyClaimMs: null, lastDailyCaseId: null, dailyAdUnlockDay: null, dailyAdCaseId: null, isBankrupt: false, interstitialsSeenTotal: 0, xp: 0, streakCount: 0, lastPlayedDay: null, perfectCaseStreakCount: 0, unlockedAchievementIds: [], departmentLevels: { archive: 0, field: 0, lab: 0 }, serviceFreeUseDay: {}, weeklyProgress: null, collectibleStampIds: [], archivePurchasedPackIds: [], archiveUnlockedCaseIds: [], archiveAdUnlockDayByPack: {}, interactiveEvidenceProgress: {}, finalSynthesisProgress: {}, metaUnlocked: false }; }
export const makeDefaultSnapshot = (): PersistedState => ({ version: GAME_CONFIG.saveVersion, stats: makeDefaultStats(), session: null });
export function migrate(raw: unknown): PersistedState | null {
  if (!raw || typeof raw !== 'object') return null; const candidate = raw as Partial<PersistedState> & { stats?: Record<string, unknown> };
  if (!candidate.stats) return null; const old = candidate.stats; const sessionRaw = candidate.session as (Partial<ActiveSession> & { startedAtServerMs?: number }) | null;
  const session = sessionRaw?.caseId ? { caseId: sessionRaw.caseId, selectedEvidenceIds: sessionRaw.selectedEvidenceIds ?? [], stamps: sessionRaw.stamps ?? (sessionRaw.selectedEvidenceIds ?? []).map((evidenceId) => ({ caseId: sessionRaw.caseId!, statementId: 'claim_main', evidenceId })), viewedEvidenceIds: sessionRaw.viewedEvidenceIds ?? [], revealedEvidenceIds: sessionRaw.revealedEvidenceIds ?? [], selectedService: sessionRaw.selectedService ?? null, hintsUsed: sessionRaw.hintsUsed ?? 0, extraOpens: sessionRaw.extraOpens ?? 0, startedAtMs: sessionRaw.startedAtMs ?? sessionRaw.startedAtServerMs ?? 0 } : null;
  const stats = { ...makeDefaultStats(), ...old, lastDailyClaimMs: old.lastDailyClaimMs ?? old.lastDailyClaimServerMs ?? null, dailyAdUnlockDay: old.dailyAdUnlockDay ?? old.dailyAdUnlockServerDay ?? null, lastPlayedDay: old.lastPlayedDay ?? old.lastPlayedServerDay ?? null, serviceFreeUseDay: old.serviceFreeUseDay ?? old.serviceFreeUseServerDay ?? {}, archiveAdUnlockDayByPack: old.archiveAdUnlockDayByPack ?? old.archiveAdUnlockServerDayByPack ?? {} } as PlayerStats;
  delete (stats as Partial<PlayerStats> & { ratingDismissals?: number }).ratingDismissals;
  if ((candidate.version ?? 0) < 8) stats.isBankrupt = false; if ((candidate.version ?? 0) < 9) stats.metaUnlocked = true;
  return { version: GAME_CONFIG.saveVersion, stats, session };
}
export async function loadSnapshot(): Promise<{ snapshot: PersistedState; isNew: boolean }> { const raw = storageGet(SAVE_KEY); try { const snapshot = raw ? migrate(JSON.parse(raw)) : null; return snapshot ? { snapshot, isNew: false } : { snapshot: makeDefaultSnapshot(), isNew: true }; } catch { return { snapshot: makeDefaultSnapshot(), isNew: true }; } }
export function serializeSnapshot(snapshot: PersistedState): string | null { try { const value = JSON.stringify(snapshot); return new TextEncoder().encode(value).byteLength < MAX_SAVE_BYTES ? value : null; } catch { return null; } }
export function scheduleSync(snapshot: PersistedState): void { const value = serializeSnapshot(snapshot); if (value) storageSet(value, SAVE_KEY); }
export async function flushSync(snapshot: PersistedState): Promise<void> { scheduleSync(snapshot); }
