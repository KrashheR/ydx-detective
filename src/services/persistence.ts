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
import { canUseCloud, cloudGet, cloudSet } from './platformAdapter';

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
    interstitialsSeenTotal: 0,
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
    noAdsPurchased: false,
    ownedStampTextIds: [],
    activeStampTextId: null,
    activeStampInkId: null,
    purchasedBundleIds: [],
    archiveUnlockedCaseIds: [],
    archiveAdUnlockServerDayByPack: {},
    interactiveEvidenceProgress: {},
    finalSynthesisProgress: {},
    caseClueReveals: {},
    metaUnlocked: false,
    firstSeenServerDay: null,
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
 *   • v7 → v8 — bankruptcy is no longer a gate: force `isBankrupt: false` so
 *     players stuck on the old blocking screen are freed; adds
 *     `interstitialsSeenTotal` (backfilled to 0 by the defaults spread).
 *   • v9 → v10 — adds `noAdsPurchased` (the permanent ad-free IAP), backfilled
 *     to false by the defaults spread; the entitlement is re-granted from the
 *     platform on restore, so no data can be lost by the backfill. Same version
 *     adds `ownedStampTextIds` / `activeStampTextId` (the stamp-caption shop):
 *     an empty list + `null` means the free `classic` caption, which is exactly
 *     what every pre-v10 profile was printing, and purchases are likewise
 *     re-granted from the platform on restore.
 *   • v10 → v11 — the Bureau of Special Cases adds `activeStampInkId` (free ink
 *     colour of the stamp impression) and `purchasedBundleIds` (the archive +
 *     stamp bundle IAPs). Both are backfilled by the defaults spread: `null`
 *     ink is exactly the archive red every pre-v11 profile printed, and an
 *     empty bundle list loses nothing because bundles re-grant their contents
 *     through `applyRestoredPurchases`.
 *   • v11 → v12 — adds `firstSeenServerDay`, the day-one marker behind "next
 *     day" store offers. The defaults spread backfills it to `null`, and the
 *     store stamps it on the first boot after the upgrade — so a returning
 *     player's next-day offer opens a day after that boot rather than
 *     retroactively. That is deliberate: the alternative would be to fabricate
 *     a first-seen day the profile never recorded.
 */
function migrate(raw: unknown): PersistedState | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<PersistedState>;
  if (!candidate.stats) return null;
  const fromVersion = typeof candidate.version === 'number' ? candidate.version : 0;

  // Backfill the in-progress session's newer fields when one is present.
  const rawSession = candidate.session as Partial<ActiveSession> | null | undefined;
  const session: ActiveSession | null =
    rawSession && rawSession.caseId
      ? {
          caseId: rawSession.caseId,
          selectedEvidenceIds: rawSession.selectedEvidenceIds ?? [],
          stamps: rawSession.stamps ?? (rawSession.selectedEvidenceIds ?? []).map((evidenceId) => ({
            caseId: rawSession.caseId!,
            statementId: 'claim_main',
            evidenceId,
          })),
          viewedEvidenceIds: rawSession.viewedEvidenceIds ?? [],
          revealedEvidenceIds: rawSession.revealedEvidenceIds ?? [],
          selectedService: rawSession.selectedService ?? null,
          hintsUsed: rawSession.hintsUsed ?? 0,
          extraOpens: rawSession.extraOpens ?? 0,
          startedAtServerMs: rawSession.startedAtServerMs ?? 0,
        }
      : null;

  const stats: PlayerStats = { ...makeDefaultStats(), ...candidate.stats };
  // v8 removed the hard bankruptcy gate — un-stick anyone saved mid-block.
  if (fromVersion < 8) stats.isBankrupt = false;
  if (fromVersion < 9) stats.metaUnlocked = true;
  // v13 added the rewarded clue ledger. Older saves have no reveals; the spread
  // above already seeded `{}`, this only repairs a corrupted/partial field.
  if (fromVersion < 13 || typeof stats.caseClueReveals !== 'object' || stats.caseClueReveals == null) {
    stats.caseClueReveals = {};
  }

  return {
    version: GAME_CONFIG.saveVersion,
    stats,
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
let inFlight: Promise<void> | null = null;

/**
 * Write queued snapshots to the cloud one at a time until the queue is empty.
 *
 * The loop (rather than a single write) is what makes a burst of flushes safe:
 * one IAP grant fans out into several `flushSync` calls in the same tick (a
 * bundle grants packs, then captions, then itself), and the *last* snapshot is
 * the only complete one. Dropping it while an earlier write was in flight lost
 * the purchase on the next boot, because `loadSnapshot` prefers cloud over the
 * (correct) LocalStorage copy.
 */
async function drainToCloud(): Promise<void> {
  while (pendingSnapshot && canUseCloud()) {
    const snapshot = pendingSnapshot;
    pendingSnapshot = null;
    try {
      await cloudSet(snapshot);
    } catch {
      // Re-queue for a later retry — but never clobber a snapshot that was
      // queued while this write was failing; that one is newer.
      pendingSnapshot ??= snapshot;
      armRetry();
      return;
    }
  }
}

/**
 * Start the drain, or join the one already running. Callers get a promise that
 * resolves once the queue they added to has been worked off, so `flushSync` can
 * honestly await its own snapshot reaching the cloud.
 */
function pushToCloud(): Promise<void> {
  if (inFlight) return inFlight;
  const run = drainToCloud().finally(() => {
    inFlight = null;
  });
  inFlight = run;
  return run;
}

/** Re-arm the debounce so a failed write is retried without a new edit. */
function armRetry(): void {
  if (debounceTimer) return;
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void pushToCloud();
  }, GAME_CONFIG.sync.debounceMs);
}

/**
 * Record new state. LocalStorage is written immediately (cheap, offline-safe);
 * the cloud write is debounced to at most once per `sync.debounceMs` to respect
 * Yandex rate limits.
 */
export function scheduleSync(snapshot: PersistedState): void {
  localWrite(snapshot);
  pendingSnapshot = snapshot;
  armRetry(); // a write already scheduled within the window covers this edit too
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
