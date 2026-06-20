/**
 * Где ложь? Симулятор детектива — central Zustand store.
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
import { evaluateRank, evaluateXpGain } from '../engine/rankEngine';
import { evaluateStreak } from '../engine/streakEngine';
import { evaluateNewUnlocks } from '../engine/achievementsEngine';
import {
  flushSync,
  loadSnapshot,
  makeDefaultStats,
  scheduleSync,
} from '../services/persistence';
import {
  getServerTimeMs,
  getYandexLang,
  initYandex,
  onPauseChange,
  showFullscreenAd,
  showRewardedAd,
  submitLeaderboardScore,
} from '../services/yandexSDK';
import {
  SUPPORTED_LANGUAGES,
  type ActiveSession,
  type Case,
  type CaseResult,
  type Decision,
  type Language,
  type PersistedState,
  type PlayerStats,
  type RewardBreakdown,
} from '../types';

/**
 * Map the Yandex locale onto a supported game language. Yandex reports a plain
 * 2-letter code (occasionally region-tagged like 'pt-br'); we match the leading
 * subtag and return null for anything we don't ship, so the caller keeps the
 * default language.
 */
function detectYandexLanguage(): Language | null {
  const raw = getYandexLang();
  if (!raw) return null;
  const code = raw.toLowerCase().split('-')[0] ?? '';
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code)
    ? (code as Language)
    : null;
}

/* ----------------------------- Store contract ---------------------------- */

/**
 * Transient outcome of the most recent verdict, surfaced to the ResultSheet.
 * Bundles the pure reward breakdown with the meta-progression deltas (XP gained
 * and any rank promotion) the store computed alongside it.
 */
export type VerdictOutcome = RewardBreakdown & {
  caseId: string;
  xpGained: number;
  /** Investigator level the player was promoted to this case, or null if no promotion. */
  promotedToLevel: number | null;
  /** Achievement ids unlocked by closing this case (for the result sheet). */
  newAchievementIds: string[];
};

/**
 * Which hint the player is buying for the active case. Both reveal one card's
 * true status; `note` is paid with balance, `canvass` is unlocked by a rewarded
 * video. (See GAME_CONFIG.hints.)
 */
export type HintKind = 'note' | 'canvass';

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
  lastResult: VerdictOutcome | null;

  /* ---- lifecycle ---- */
  /** Boot the engine: init SDK, wire pause guard, hydrate snapshot. */
  init: () => Promise<void>;

  /* ---- settings ---- */
  setLanguage: (lang: Language) => void;

  /* ---- session ---- */
  startCase: (caseData: Case) => void;
  markEvidenceAsViewed: (id: string) => void;
  toggleEvidenceStamp: (id: string) => void;
  /**
   * Reveal the next unrevealed evidence card's true status for the active case.
   *   • `note`    — charges `balance` (20% of the claim); no-op if unaffordable.
   *   • `canvass` — shows a rewarded Yandex video, revealing for free once watched.
   * Returns false when there is nothing to do (wrong/absent case, all revealed,
   * or `note` requested without enough balance).
   */
  buyHint: (caseData: Case, kind: HintKind) => boolean;

  /* ---- verdict & economy ---- */
  submitVerdict: (caseData: Case, decision: Decision) => RewardBreakdown;
  closeCase: () => Promise<void>;
  restoreFunds: () => void;

  /* ---- daily ---- */
  isDailyUnlocked: () => boolean;

  /* ---- ad-linked rewards ---- */
  /** Add the total of the last verdict again to balance (rewarded-video double). */
  doubleLastReward: () => void;

  /* ---- pause guard (also driven by SDK callbacks) ---- */
  setPaused: (paused: boolean) => void;

  /* ---- rating prompt ---- */
  /** Record one "Not now" dismissal. Suppresses after GAME_CONFIG.rating.suppressAfterDismissals. */
  dismissRating: () => void;
  /** Permanently suppress the rating prompt ("Don't ask again"). */
  suppressRating: () => void;
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
      const { snapshot, isNew } = await loadSnapshot();

      // 4) First-time players inherit their Yandex UI language; returning players
      //    keep whatever they last chose (persisted in the save).
      let stats = snapshot.stats;
      if (isNew) {
        const detected = detectYandexLanguage();
        if (detected) stats = { ...stats, language: detected };
      }

      set({
        stats,
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
          revealedEvidenceIds: [],
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

    buyHint(caseData, kind) {
      const { session, stats } = get();
      if (!session || session.caseId !== caseData.id) return false;

      // Both hints reveal the next not-yet-revealed card (in case order).
      const nextId =
        caseData.evidences.find(
          (e) => !session.revealedEvidenceIds.includes(e.id),
        )?.id ?? null;
      if (!nextId) return false; // every card already revealed

      // `charge` is the amount to deduct (0 on the ad-funded path).
      const reveal = (charge: number) => {
        set((s) => {
          if (!s.session || s.session.caseId !== caseData.id) return s;
          if (s.session.revealedEvidenceIds.includes(nextId)) return s;
          return {
            stats: charge
              ? { ...s.stats, balance: s.stats.balance - charge }
              : s.stats,
            session: {
              ...s.session,
              revealedEvidenceIds: [...s.session.revealedEvidenceIds, nextId],
            },
          };
        });
        persist();
      };

      if (kind === 'note') {
        const cost = Math.round(
          caseData.claimAmount * GAME_CONFIG.hints.inspectorNoteClaimPct,
        );
        if (stats.balance < cost) return false; // unaffordable — UI gates this
        showFullscreenAd(() => reveal(cost));
        return true;
      }

      // kind === 'canvass' → rewarded Yandex video; reveal for free once watched.
      // (Offline/dev: showRewardedAd grants immediately so it stays playable.)
      showRewardedAd(() => reveal(0));
      return true;
    },

    submitVerdict(caseData, decision) {
      const { session, stats } = get();
      const selected = session?.selectedEvidenceIds ?? [];

      const total = totalContradictions(caseData);
      const { correct, falseStamps } = classifyStamps(caseData, selected);
      const proofRatio = total === 0 ? 1 : correct / total;

      // The rank bonus reflects the player's standing *when they solved it*, so
      // it is read from the rank held before this case's XP is added.
      const rankBefore = evaluateRank(stats.xp);

      // Continue (or reset) the daily streak against authoritative server time.
      const nowServerDay = Math.floor(
        getServerTimeMs() / GAME_CONFIG.daily.cooldownMs,
      );
      const streak = evaluateStreak(
        stats.streakCount,
        stats.lastPlayedServerDay,
        nowServerDay,
      );

      // Pure scoring — see rewardEngine. Daily ×5, rank & streak bonus are inputs.
      const breakdown = evaluateReward(caseData, decision, selected, {
        rankBonusPct: rankBefore.rewardBonusPct,
        streakBonusPct: streak.multiplierPct,
      });

      // Career XP, then detect whether this case crossed a rank threshold.
      const xpGained = evaluateXpGain({
        difficulty: caseData.difficulty,
        verdictCorrect: breakdown.verdictCorrect,
        proofRatio,
        isDaily: caseData.type === 'daily',
      });
      const result: CaseResult = {
        caseId: caseData.id,
        decision,
        verdictCorrect: breakdown.verdictCorrect,
        correctlyMarkedContradictions: total === 0 ? 0 : correct,
        totalContradictions: total,
        falseStamps,
        rewardEarned: breakdown.total,
        closedAtServerMs: getServerTimeMs(),
      };

      // Post-case stats *before* achievement bonuses — what predicates evaluate.
      const baseStats: PlayerStats = {
        ...stats,
        balance: stats.balance + breakdown.total,
        xp: stats.xp + xpGained,
        streakCount: streak.streak,
        lastPlayedServerDay: nowServerDay,
        completedCaseIds: stats.completedCaseIds.includes(caseData.id)
          ? stats.completedCaseIds
          : [...stats.completedCaseIds, caseData.id],
        results: { ...stats.results, [caseData.id]: result },
        // Record daily claim against authoritative server time for gating.
        lastDailyClaimServerMs:
          caseData.type === 'daily'
            ? result.closedAtServerMs
            : stats.lastDailyClaimServerMs,
      };

      // Achievements newly satisfied by this case grant one-time XP + currency.
      const unlocks = evaluateNewUnlocks({ stats: baseStats, result, caseData });
      const bonusXp = unlocks.reduce((n, a) => n + a.xpBonus, 0);
      const bonusRub = unlocks.reduce((n, a) => n + a.rubBonus, 0);

      const finalXp = baseStats.xp + bonusXp;
      const finalBalance = baseStats.balance + bonusRub;
      // Promotion accounts for achievement bonus XP too (it may tip a threshold).
      const rankAfter = evaluateRank(finalXp);
      const promotedToLevel =
        rankAfter.index > rankBefore.index ? rankAfter.level : null;

      const finalStats: PlayerStats = {
        ...baseStats,
        xp: finalXp,
        balance: finalBalance,
        isBankrupt: finalBalance <= GAME_CONFIG.economy.bankruptcyThreshold,
        unlockedAchievementIds: unlocks.length
          ? [...baseStats.unlockedAchievementIds, ...unlocks.map((a) => a.id)]
          : baseStats.unlockedAchievementIds,
      };

      set({
        stats: finalStats,
        lastResult: {
          ...breakdown,
          caseId: caseData.id,
          xpGained,
          promotedToLevel,
          newAchievementIds: unlocks.map((a) => a.id),
        },
      });

      // Case closure is a critical moment → immediate (un-debounced) cloud write.
      persist(true);
      // Publish the new balance to the global leaderboard (best-effort).
      void submitLeaderboardScore(finalBalance);
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

    doubleLastReward() {
      const { lastResult, stats } = get();
      if (!lastResult || lastResult.total <= 0) return;
      const bonus = lastResult.total;
      const newBalance = stats.balance + bonus;
      set((s) => ({
        stats: {
          ...s.stats,
          balance: newBalance,
          isBankrupt: newBalance <= GAME_CONFIG.economy.bankruptcyThreshold,
        },
      }));
      persist(true);
      void submitLeaderboardScore(newBalance);
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

    dismissRating() {
      set((s) => ({
        stats: { ...s.stats, ratingDismissals: s.stats.ratingDismissals + 1 },
      }));
      persist();
    },

    suppressRating() {
      set((s) => ({
        stats: {
          ...s.stats,
          ratingDismissals: GAME_CONFIG.rating.suppressAfterDismissals,
        },
      }));
      persist();
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
    // Reject must be *justified*: enabled only once at least one contradiction
    // has been stamped. A full review alone never unlocks an unproven rejection.
    canReject: hasStampedContradiction,
  };
}
