/**
 * Claim Detective — central Zustand store.
 *
 * This is the single runtime authority for mutable player state. It composes:
 *   • the pure reward engine        (src/engine/rewardEngine.ts)
 *   • the persistence layer         (src/services/persistence.ts)
 *   • the Yandex SDK boundary       (src/services/yandexSDK.ts)
 *
 * ── Yandex SDK ↔ engine interaction map ──────────────────────────────────
 *
 *  init()            → initYandex() → loadSnapshot()  (cloud-first hydration)
 *  any mutation      → persist()    → scheduleSync()  (10s debounced cloud write)
 *  closeCase()/Result→ persist(flush:true) → flushSync()  (immediate cloud write)
 *  ad open/close     → onPauseChange() → setPaused()  (freeze game + mute audio)
 *  restoreFunds()    → showRewardedAd() → onReward → balance reset
 *  daily gating      → getServerTimeMs() (NEVER device time)
 *
 * Static `Case` data is passed *into* actions by the React layer (after Zod
 * validation) and is never stored here — preserving the static/runtime split.
 */
import { create } from 'zustand';
import { GAME_CONFIG } from '../config/gameConfig';
import {
  evaluateDailyAvailability,
  evaluateReward,
  totalContradictions,
  classifyStamps,
} from '../engine/rewardEngine';
import {
  flushSync,
  loadSnapshot,
  makeDefaultStats,
  scheduleSync,
} from '../services/persistence';
import {
  getServerTimeMs,
  initYandex,
  onPauseChange,
  showRewardedAd,
  submitLeaderboardScore,
} from '../services/yandexSDK';
import type {
  ActiveSession,
  Case,
  CaseResult,
  Decision,
  Language,
  PersistedState,
  PlayerStats,
  RewardBreakdown,
} from '../types';

/* ----------------------------- Store contract ---------------------------- */

export interface GameStoreState {
  /* ---- persisted slice ---- */
  stats: PlayerStats;
  session: ActiveSession | null;

  /* ---- transient runtime slice (never persisted) ---- */
  /** True while a Yandex ad is on screen — freeze progression & mute audio. */
  isPaused: boolean;
  /** True once cloud/local hydration has completed. */
  isHydrated: boolean;
  /** Result of the most recently submitted verdict (drives ResultScreen). */
  lastResult: (RewardBreakdown & { caseId: string }) | null;

  /* ---- lifecycle ---- */
  /** Boot the engine: init SDK, wire pause guard, hydrate snapshot. */
  init: () => Promise<void>;

  /* ---- settings ---- */
  setLanguage: (lang: Language) => void;

  /* ---- session ---- */
  startCase: (caseData: Case) => void;
  markEvidenceAsViewed: (id: string) => void;
  toggleEvidenceStamp: (id: string) => void;

  /* ---- verdict & economy ---- */
  submitVerdict: (caseData: Case, decision: Decision) => RewardBreakdown;
  closeCase: () => Promise<void>;
  restoreFunds: () => void;

  /* ---- daily ---- */
  isDailyUnlocked: () => boolean;

  /* ---- pause guard (also driven by SDK callbacks) ---- */
  setPaused: (paused: boolean) => void;
}

/* ------------------------------ Helpers ---------------------------------- */

/** Build the exact snapshot to persist from the current store state. */
function snapshotOf(state: {
  stats: PlayerStats;
  session: ActiveSession | null;
}): PersistedState {
  return {
    version: GAME_CONFIG.saveVersion,
    stats: state.stats,
    session: state.session,
  };
}

/* -------------------------------- Store ---------------------------------- */

export const useGameStore = create<GameStoreState>((set, get) => {
  /**
   * Persist the current runtime state. `flush:true` bypasses the debounce for
   * critical moments (case closure, unload). Fire-and-forget for normal edits.
   */
  const persist = (flush = false): void => {
    const snapshot = snapshotOf(get());
    if (flush) void flushSync(snapshot);
    else scheduleSync(snapshot);
  };

  return {
    stats: makeDefaultStats(),
    session: null,
    isPaused: false,
    isHydrated: false,
    lastResult: null,

    async init() {
      // 1) Bring up the SDK (no-op-safe if unavailable → offline mode).
      await initYandex();

      // 2) Wire the global pause guard to ad lifecycles. Ad open/close anywhere
      //    in the app now flips `isPaused`, which the audio manager & game loop
      //    observe to mute contexts and freeze progression.
      onPauseChange((paused) => get().setPaused(paused));

      // 3) Hydrate from cloud (preferred) or LocalStorage.
      const snapshot = await loadSnapshot();
      set({
        stats: snapshot.stats,
        session: snapshot.session,
        isHydrated: true,
      });
    },

    setLanguage(lang) {
      set((s) => ({ stats: { ...s.stats, language: lang } }));
      persist();
    },

    startCase(caseData) {
      // Resume an in-progress session for the same case rather than wiping it,
      // so re-entering a case mid-investigation restores stamps & viewed cards.
      const existing = get().session;
      if (existing && existing.caseId === caseData.id) return;

      set({
        session: {
          caseId: caseData.id,
          selectedEvidenceIds: [],
          viewedEvidenceIds: [],
          startedAtServerMs: getServerTimeMs(),
        },
        lastResult: null,
      });
      persist();
    },

    markEvidenceAsViewed(id) {
      set((s) => {
        if (!s.session) return s;
        if (s.session.viewedEvidenceIds.includes(id)) return s;
        return {
          session: {
            ...s.session,
            viewedEvidenceIds: [...s.session.viewedEvidenceIds, id],
          },
        };
      });
      persist();
    },

    toggleEvidenceStamp(id) {
      set((s) => {
        if (!s.session) return s;
        const selected = s.session.selectedEvidenceIds;
        const next = selected.includes(id)
          ? selected.filter((x) => x !== id)
          : [...selected, id];
        return {
          session: { ...s.session, selectedEvidenceIds: next },
        };
      });
      persist();
    },

    submitVerdict(caseData, decision) {
      const { session, stats } = get();
      const selected = session?.selectedEvidenceIds ?? [];

      // Pure scoring — see rewardEngine. Daily ×5 handled inside.
      const breakdown = evaluateReward(caseData, decision, selected);
      const { falseStamps } = classifyStamps(caseData, selected);

      const result: CaseResult = {
        caseId: caseData.id,
        decision,
        verdictCorrect: breakdown.verdictCorrect,
        correctlyMarkedContradictions:
          totalContradictions(caseData) === 0
            ? 0
            : selected.filter(
                (id) =>
                  caseData.evidences.find((e) => e.id === id)?.isContradiction,
              ).length,
        totalContradictions: totalContradictions(caseData),
        falseStamps,
        rewardEarned: breakdown.total,
        closedAtServerMs: getServerTimeMs(),
      };

      const newBalance = stats.balance + breakdown.total;
      const isBankrupt = newBalance <= GAME_CONFIG.economy.bankruptcyThreshold;

      set((s) => ({
        stats: {
          ...s.stats,
          balance: newBalance,
          isBankrupt,
          completedCaseIds: s.stats.completedCaseIds.includes(caseData.id)
            ? s.stats.completedCaseIds
            : [...s.stats.completedCaseIds, caseData.id],
          results: { ...s.stats.results, [caseData.id]: result },
          // Record daily claim against authoritative server time for gating.
          lastDailyClaimServerMs:
            caseData.type === 'daily'
              ? result.closedAtServerMs
              : s.stats.lastDailyClaimServerMs,
        },
        lastResult: { ...breakdown, caseId: caseData.id },
      }));

      // Case closure is a critical moment → immediate (un-debounced) cloud write.
      persist(true);
      // Publish the new balance to the global leaderboard (best-effort).
      void submitLeaderboardScore(newBalance);
      return breakdown;
    },

    async closeCase() {
      set({ session: null });
      await flushSync(snapshotOf(get()));
    },

    restoreFunds() {
      // Failure-state recovery is gated behind a rewarded ad. The reward
      // callback only fires if the player actually watched it.
      showRewardedAd(() => {
        set((s) => ({
          stats: {
            ...s.stats,
            balance: GAME_CONFIG.economy.restoreFundsTo,
            isBankrupt: false,
          },
        }));
        persist(true);
        void submitLeaderboardScore(GAME_CONFIG.economy.restoreFundsTo);
      });
    },

    isDailyUnlocked() {
      const { lastDailyClaimServerMs } = get().stats;
      // Authoritative server time only — never the device clock.
      return evaluateDailyAvailability(lastDailyClaimServerMs, getServerTimeMs())
        .unlocked;
    },

    setPaused(paused) {
      set({ isPaused: paused });
    },
  };
});

/* --------------------------- UI-gating selectors ------------------------- */

/**
 * Button-enable logic for the verdict panel, derived from session + case.
 * Mirrors the product rule: you may only *approve* a fully-reviewed case, and
 * you may only *reject* with at least one stamped contradiction (or after a
 * full review). Pure selector → cheap to call in render.
 */
export function selectCaseInvestigationGate(
  caseData: Case,
  state: Pick<GameStoreState, 'session'>,
): { canApprove: boolean; canReject: boolean } {
  const viewed = state.session?.viewedEvidenceIds ?? [];
  const stamped = state.session?.selectedEvidenceIds ?? [];

  const allViewed = caseData.evidences.every((ev) => viewed.includes(ev.id));
  const hasStampedContradiction = stamped.length > 0;

  return {
    canApprove: allViewed, // approve only after studying the whole file
    canReject: hasStampedContradiction || allViewed,
  };
}
