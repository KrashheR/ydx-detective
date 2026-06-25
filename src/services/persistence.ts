/**
 * Persistence layer — owns *where* the runtime snapshot lives and *when* it is
 * written. The store calls `loadSnapshot()` once on boot and `scheduleSync()` /
 * `flushSync()` whenever runtime state changes. It knows nothing about cases or
 * rewards.
 *
 * Strategy:
 *   • READ  — try cloud first, fall back to LocalStorage, merge by recency.
 *   • WRITE — write LocalStorage synchronously (instant, lossless) and the
 *             cloud on a 10s debounce (rate-limit protection). Case closure
 *             calls `flushSync()` for an immediate cloud write.
 */
import { GAME_CONFIG } from '../config/gameConfig';
import {
  DEFAULT_LANGUAGE,
  type ActiveSession,
  type PersistedState,
  type PlayerStats,
} from '../types';
import { canUseCloud, cloudGet, cloudSet } from './yandexSDK';

const LOCAL_KEY = 'claimDetectiveSave';

/* ------------------------------ Defaults --------------------------------- */

export function makeDefaultStats(): PlayerStats {
  return {
    balance: GAME_CONFIG.economy.startingBalance,
    language: DEFAULT_LANGUAGE,
    completedCaseIds: [],
    results: {},
    lastDailyClaimServerMs: null,
    lastDailyCaseId: null,
    dailyAdUnlockServerDay: null,
    dailyAdCaseId: null,
    isBankrupt: false,
    xp: 0,
    streakCount: 0,
    lastPlayedServerDay: null,
    perfectCaseStreakCount: 0,
    unlockedAchievementIds: [],
    ratingDismissals: 0,
    departmentLevels: { archive: 0, field: 0, lab: 0 },
    serviceFreeUseServerDay: {},
    weeklyProgress: null,
    collectibleStampIds: [],
    archivePurchasedPackIds: [],
    archiveUnlockedCaseIds: [],
    archiveAdUnlockServerDayByPack: {},
  };
}

export function makeDefaultSnapshot(): PersistedState {
  return {
    version: GAME_CONFIG.saveVersion,
    stats: makeDefaultStats(),
    session: null,
  };
}

/* ----------------------------- Migration --------------------------------- */

/**
 * Upgrade an older snapshot to the current schema. Spreading defaults under the
 * persisted values backfills any field added in a newer version, so older cloud
 * saves load cleanly:
 *   • v1 → v2 — adds xp / streakCount / lastPlayedServerDay /
 *     unlockedAchievementIds to stats, and revealedEvidenceIds to the session.
 */
function migrate(raw: unknown): PersistedState | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<PersistedState>;
  if (!candidate.stats) return null;

  // Backfill the in-progress session's newer fields when one is present.
  const rawSession = candidate.session as Partial<ActiveSession> | null | undefined;
  const session: ActiveSession | null =
    rawSession && rawSession.caseId
      ? {
          caseId: rawSession.caseId,
          selectedEvidenceIds: rawSession.selectedEvidenceIds ?? [],
          viewedEvidenceIds: rawSession.viewedEvidenceIds ?? [],
          revealedEvidenceIds: rawSession.revealedEvidenceIds ?? [],
          selectedService: rawSession.selectedService ?? null,
          hintsUsed: rawSession.hintsUsed ?? 0,
          canvassUsed: rawSession.canvassUsed ?? false,
          extraOpens: rawSession.extraOpens ?? 0,
          evidenceThesisLinks: rawSession.evidenceThesisLinks ?? {},
          startedAtServerMs: rawSession.startedAtServerMs ?? 0,
        }
      : null;

  return {
    version: GAME_CONFIG.saveVersion,
    stats: { ...makeDefaultStats(), ...candidate.stats },
    session,
  };
}

/* ------------------------------- Local I/O ------------------------------- */

function localRead(): PersistedState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? migrate(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function localWrite(snapshot: PersistedState): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(snapshot));
  } catch {
    /* Quota / privacy mode — nothing we can do; cloud may still succeed. */
  }
}

/* --------------------------------- Load ---------------------------------- */

/**
 * Resolve the authoritative starting snapshot. Cloud wins when present (it is
 * cross-device); otherwise LocalStorage; otherwise a fresh default.
 *
 * `isNew` is true only when no prior save existed anywhere (a first-time player),
 * which is the store's signal to seed the language from the Yandex locale.
 */
export async function loadSnapshot(): Promise<{
  snapshot: PersistedState;
  isNew: boolean;
}> {
  const local = localRead();

  if (canUseCloud()) {
    try {
      const cloud = migrate(await cloudGet());
      if (cloud) {
        // Cloud is source of truth across devices; refresh local cache.
        localWrite(cloud);
        return { snapshot: cloud, isNew: false };
      }
    } catch {
      /* Network hiccup — fall back to local. */
    }
  }

  return local
    ? { snapshot: local, isNew: false }
    : { snapshot: makeDefaultSnapshot(), isNew: true };
}

/* --------------------------------- Sync ---------------------------------- */

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSnapshot: PersistedState | null = null;
let inFlight = false;

/**
 * Push the latest pending snapshot to the cloud, guarding against overlapping
 * writes. LocalStorage is always already up to date by the time we get here.
 */
async function pushToCloud(): Promise<void> {
  if (inFlight || !pendingSnapshot || !canUseCloud()) return;
  const snapshot = pendingSnapshot;
  pendingSnapshot = null;
  inFlight = true;
  try {
    await cloudSet(snapshot);
  } catch {
    // Re-queue so the next tick retries; never drop the most recent state.
    pendingSnapshot = snapshot;
  } finally {
    inFlight = false;
  }
}

/**
 * Record new state. LocalStorage is written immediately (cheap, offline-safe);
 * the cloud write is debounced to at most once per `sync.debounceMs` to respect
 * Yandex rate limits.
 */
export function scheduleSync(snapshot: PersistedState): void {
  localWrite(snapshot);
  pendingSnapshot = snapshot;

  if (debounceTimer) return; // a write is already scheduled within the window
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void pushToCloud();
  }, GAME_CONFIG.sync.debounceMs);
}

/**
 * Force an immediate cloud write, cancelling any pending debounce. Called on
 * case closure (ResultScreen mount) and on `beforeunload` so the most important
 * moments are never lost to the debounce window.
 */
export async function flushSync(snapshot: PersistedState): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  localWrite(snapshot);
  pendingSnapshot = snapshot;
  await pushToCloud();
}
