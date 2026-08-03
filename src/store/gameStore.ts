/**
 * Найди ложь! Детективные дела — central Zustand store.
 *
 * This is the single runtime authority for mutable player state. It composes:
 *   • the pure reward engine        (src/engine/rewardEngine.ts)
 *   • the persistence layer         (src/services/persistence.ts)
 *   • the portal-neutral SDK boundary (src/services/platformAdapter.ts)
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
import { evaluatePerfectCaseStreak, evaluateStreak } from '../engine/streakEngine';
import { evaluateNewUnlocks } from '../engine/achievementsEngine';
import { bestMastery, evaluateMastery } from '../engine/masteryEngine';
import { updateWeeklyProgress } from '../engine/weeklyEngine';
import { toServerDay } from '../engine/offerEngine';
import {
  flushSync,
  loadSnapshot,
  makeDefaultStats,
  scheduleSync,
} from '../services/persistence';
import {
  getThematicPackCaseIds,
  getThematicPackIdByProductId,
  THEMATIC_PACKS,
} from '../data/thematicPacks';
import {
  DEFAULT_STAMP_INK_ID,
  STAMP_INKS,
  STAMP_TEXTS,
  getStampTextByProductId,
  isStampTextUnlocked,
} from '../data/stampTexts';
import { BUNDLES, getBundle, getBundleByProductId } from '../data/bundles';
import { initRemoteConfig } from '../services/remoteConfig';
import {
  getServerTimeMs,
  getAnalyticsUserId,
  getYandexLang,
  initYandex,
  onPauseChange,
  restorePurchases,
  showRewardedAd,
  trackAdOffer,
  submitLeaderboardScore,
} from '../services/platformAdapter';
import { GOAL, initMetrica, setAnalyticsContext, setAnalyticsUserId, setUserParams, trackGoal } from '../services/metrica';
import {
  SUPPORTED_LANGUAGES,
  type ActiveSession,
  type Case,
  type CaseResult,
  type Decision,
  type Language,
  type InvestigationService,
  type InteractiveEvidenceProgress,
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
  /** Evidence IDs the player stamped as contradictions (for the result breakdown). */
  stampedEvidenceIds: string[];
  mastery: 'none' | 'bronze' | 'silver' | 'gold';
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
  /**
   * Record that the player opened an evidence card. On budgeted cases this is
   * gated: opening a *new* card is a no-op once `investigationBudget` opens have
   * been spent (already-opened cards may always be re-read). Returns whether the
   * card is now considered open.
   */
  markEvidenceAsViewed: (id: string, caseData: Case) => boolean;
  toggleEvidenceStamp: (id: string, caseData?: Case) => boolean;
  updateInteractiveProgress: (
    caseData: Case,
    evidenceId: string,
    progress: InteractiveEvidenceProgress,
  ) => void;
  completeFinalSynthesis: (
    caseData: Case,
    links: Array<readonly [string, string]>,
    skipped?: boolean,
    completed?: boolean,
  ) => void;
  /**
   * Reveal an evidence card's true status for the active case.
   *   • `note`    — charges `balance` (20% of the claim); no-op if unaffordable.
   *   • `canvass` — shows a rewarded Yandex video, revealing for free once watched.
   * `targetEvidenceId` picks which card to reveal; omitted (or invalid/already
   * revealed) falls back to the next unrevealed card in case order. For
   * `canvass` the target is captured before the ad plays, so the reveal lands
   * on the chosen card once the video finishes.
   * Returns false when there is nothing to do (wrong/absent case, all revealed,
   * or `note` requested without enough balance).
   */
  buyHint: (
    caseData: Case,
    kind: HintKind,
    targetEvidenceId?: string,
  ) => boolean;
  selectInvestigationService: (caseData: Case, service: InvestigationService) => boolean;
  upgradeDepartment: (department: 'archive' | 'field' | 'lab') => boolean;

  /* ---- verdict & economy ---- */
  submitVerdict: (caseData: Case, decision: Decision) => RewardBreakdown;
  closeCase: () => Promise<void>;
  restoreFunds: () => void;
  /** Tally a shown fullscreen interstitial into the persisted cumulative counter. */
  recordInterstitialShown: () => void;

  /* ---- daily ---- */
  isDailyUnlocked: () => boolean;
  /** Watch a rewarded ad to skip the 24h cooldown and unlock the next daily case. */
  unlockDailyViaAd: (caseId: string) => void;
  /** Permanently unlock the next archive case for this pack after a rewarded ad. */
  unlockArchiveCaseViaAd: (packId: string, caseId: string) => boolean;
  /** Permanently grant all archive rights for a purchased pack. */
  grantArchivePurchase: (packId: string) => void;
  /** Restore purchased archive rights from the platform. */
  grantArchivePurchases: (packIds: readonly string[]) => void;
  /** Permanently grant the No Ads entitlement (purchase or restore). */
  grantNoAds: () => void;
  /** Permanently grant a cosmetic stamp caption and ink it immediately. */
  grantStampTextPurchase: (stampTextId: string) => void;
  /** Restore purchased stamp captions from the platform (no auto-select). */
  grantStampTextPurchases: (stampTextIds: readonly string[]) => void;
  /** Ink an owned caption onto the contradiction stamp; `null` = free default. */
  setActiveStampText: (stampTextId: string | null) => void;
  /** Pick the (free) ink colour of the stamp impression; `null` = archive red. */
  setActiveStampInk: (stampInkId: string | null) => void;
  /** Permanently grant a bundle and everything it contains (purchase/restore). */
  grantBundlePurchase: (bundleId: string) => void;
  /**
   * Apply a restored set of platform product ids — the single place that maps
   * Yandex product ids onto entitlements (archive packs + No Ads + stamp texts
   * + bundles, which re-grant their own contents).
   */
  applyRestoredPurchases: (productIds: readonly string[]) => void;

  /* ---- ad-linked rewards ---- */
  /** Add the total of the last verdict again to balance (rewarded-video double). */
  doubleLastReward: () => void;

  /* ---- pause guard (also driven by SDK callbacks) ---- */
  setPaused: (paused: boolean) => void;

  /* ---- dev only ---- */
  /**
   * DEV-ONLY cheat: instantly grant balance + XP for manual testing. A no-op in
   * production builds (`import.meta.env.DEV` guard), so it can never ship into a
   * real player's economy. Defaults: a huge balance and enough XP to sit at the
   * top rank. Pass overrides to dial in a specific balance/level.
   */
  devCheat: (opts?: { balance?: number; xp?: number }) => void;

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

/**
 * Per-player Metrica profile derived from the runtime stats. Pushed on boot and
 * after any action that moves level/balance/xp/case-count, so each player's
 * standing is queryable in the Metrica console (segmentation, cohorts).
 */
function reportUserParams(stats: PlayerStats): void {
  setUserParams({
    level: evaluateRank(stats.xp).level,
    balance: stats.balance,
    xp: stats.xp,
    completedCases: stats.completedCaseIds.length,
    streak: stats.streakCount,
    isBankrupt: stats.isBankrupt,
    language: stats.language,
  });
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
      const bootStartedAt = performance.now();
      // 1) Bring up the SDK (no-op-safe if unavailable → offline mode).
      await initYandex();
      // 2) Wire the global pause guard to ad lifecycles. Ad open/close anywhere
      //    in the app now flips `isPaused`, which the audio manager & game loop
      //    observe to mute contexts and freeze progression.
      onPauseChange((paused) => get().setPaused(paused));
      // 2b) Ad pacing is remotely tunable. Fire-and-forget: the policy reads
      //     local defaults until (and unless) the flags land.
      void initRemoteConfig();

      // 3) Hydrate from cloud (preferred) or LocalStorage.
      const { snapshot, isNew } = await loadSnapshot();

      // 4) First-time players inherit their Yandex UI language; returning players
      //    keep whatever they last chose (persisted in the save).
      let stats = snapshot.stats;
      if (isNew) {
        const detected = detectYandexLanguage();
        if (detected) stats = { ...stats, language: detected };
      }

      // Stamp day one, once. "Next day" store offers compare against it, so it
      // must come from server time (invariant #3) and must never be rewritten —
      // otherwise the offer would keep sliding out of reach.
      if (stats.firstSeenServerDay === null) {
        stats = { ...stats, firstSeenServerDay: toServerDay(getServerTimeMs()) };
      }

      set({
        stats,
        session: snapshot.session,
        isHydrated: true,
      });
      // Day one is only useful if it survives the session that recorded it.
      if (snapshot.stats.firstSeenServerDay === null) persist();

      // 5) Entitlements are platform-authoritative, not save-authoritative. The
      //    save can be lost (wiped storage, a failed cloud write, a new device
      //    before the first sync) but a paid product never can, so every boot
      //    re-grants what the platform says was bought. Fire-and-forget: it must
      //    never delay the first frame, and off-Yandex it resolves to an empty
      //    list, leaving the hydrated state untouched.
      void restorePurchases()
        .then((result) => get().applyRestoredPurchases(result.productIds))
        .catch(() => undefined);

      // Analytics is deliberately outside the boot path. Yield after hydration
      // so the game can paint before Metrica starts its network request; neither
      // a slow VPN nor a blocked mc.yandex.ru can delay play.
      window.setTimeout(() => {
        initMetrica();
        setAnalyticsUserId(getAnalyticsUserId());
        reportUserParams(stats);
        trackGoal(GOAL.bootComplete, {
          bootDurationMs: Math.round(performance.now() - bootStartedAt),
          isNewPlayer: isNew,
          saveSource: isNew ? 'new' : 'existing',
        });
      }, 0);
    },

    setLanguage(lang) {
      set((s) => ({ stats: { ...s.stats, language: lang } }));
      persist();
    },

    startCase(caseData) {
      // Resume an in-progress session for the same case rather than wiping it,
      // so re-entering a case mid-investigation restores stamps & viewed cards.
      const existing = get().session;
      if (existing && existing.caseId === caseData.id) {
        if (!caseData.claimStatements) {
          trackGoal(GOAL.investigationResume, {
            caseId: caseData.id,
            viewedCount: existing.viewedEvidenceIds.length,
            stampCount: existing.selectedEvidenceIds.length,
          });
          return;
        }
        const normalizedStamps = ((existing.stamps?.length ?? 0) > 0
          ? existing.stamps!
          : existing.selectedEvidenceIds.map((evidenceId) => ({
              caseId: caseData.id,
              statementId: 'claim_main',
              evidenceId,
            })))
          .map((stamp) => {
            const evidence = caseData.evidences.find((item) => item.id === stamp.evidenceId);
            if (!evidence) return null;
            return {
              caseId: caseData.id,
              evidenceId: evidence.id,
              statementId: stamp.statementId === 'claim_main' && evidence.statementLink
                ? evidence.statementLink.statementId
                : stamp.statementId,
            };
          })
          .filter((stamp): stamp is NonNullable<typeof stamp> => stamp != null);
        set({
          session: {
            ...existing,
            stamps: normalizedStamps,
            selectedEvidenceIds: normalizedStamps.map((stamp) => stamp.evidenceId),
          },
        });
        persist();
        trackGoal(GOAL.investigationResume, {
          caseId: caseData.id,
          viewedCount: existing.viewedEvidenceIds.length,
          stampCount: existing.selectedEvidenceIds.length,
        });
        return;
      }
      if (existing) {
        trackGoal(GOAL.investigationInterrupt, {
          caseId: existing.caseId,
          reason: 'switch_case',
          viewedCount: existing.viewedEvidenceIds.length,
        });
      }

      set({
        session: {
          caseId: caseData.id,
          selectedEvidenceIds: [],
          stamps: [],
          viewedEvidenceIds: [],
          revealedEvidenceIds: [],
          selectedService: null,
          hintsUsed: 0,
          extraOpens: 0,
          startedAtServerMs: getServerTimeMs(),
        },
        lastResult: null,
      });
      persist();

      trackGoal(GOAL.caseStart, {
        caseId: caseData.id,
        type: caseData.type,
        difficulty: caseData.difficulty,
        claimAmount: caseData.claimAmount,
        evidenceCount: caseData.evidences.length,
        budget: caseData.investigationBudget ?? null,
      });
      const completedCasesBefore = get().stats.completedCaseIds.length;
      if (completedCasesBefore === 0) trackGoal(GOAL.firstCaseStart, {
        caseId: caseData.id,
        campaignPosition: caseData.campaignOrder,
      });
      setAnalyticsContext({
        surface: 'investigation',
        caseId: caseData.id,
        investigationStartedAtMs: Date.now(),
        viewedCount: 0,
        stampedCount: 0,
        hintsUsed: 0,
      });
    },

    markEvidenceAsViewed(id, caseData) {
      const session = get().session;
      if (!session || session.caseId !== caseData.id) return false;

      // Already opened → always re-readable, no budget spent.
      if (session.viewedEvidenceIds.includes(id)) return true;

      // Budgeted case: refuse a *new* open once the budget is exhausted.
      const budget = caseData.investigationBudget;
      const evidence = caseData.evidences.find((item) => item.id === id);
      if (!evidence) return false;
      const budgetedViews = session.viewedEvidenceIds.filter((viewedId) =>
        caseData.evidences.find((item) => item.id === viewedId)?.evidenceTier !== 'arc'
      ).length;
      if (budget != null && evidence.evidenceTier !== 'arc' && budgetedViews >= budget + session.extraOpens) {
        return false;
      }

      set((s) => {
        if (!s.session || s.session.caseId !== caseData.id) return s;
        if (s.session.viewedEvidenceIds.includes(id)) return s;
        return {
          session: {
            ...s.session,
            viewedEvidenceIds: [...s.session.viewedEvidenceIds, id],
            revealedEvidenceIds:
              s.session.selectedService === 'expert_opinion' && s.session.revealedEvidenceIds.length === 0
                ? [...s.session.revealedEvidenceIds, id]
                : s.session.revealedEvidenceIds,
            hintsUsed:
              s.session.selectedService === 'expert_opinion' && s.session.revealedEvidenceIds.length === 0
                ? s.session.hintsUsed + 1
                : s.session.hintsUsed,
          },
        };
      });
      persist();

      trackGoal(GOAL.evidenceView, {
        caseId: caseData.id,
        evidenceId: id,
        evidenceType: caseData.evidences.find((e) => e.id === id)?.type ?? null,
        viewedCount: get().session?.viewedEvidenceIds.length ?? 0,
        budget: budget ?? null,
      });
      setAnalyticsContext({
        surface: 'investigation', caseId: caseData.id,
        viewedCount: get().session?.viewedEvidenceIds.length ?? 0,
        stampedCount: get().session?.selectedEvidenceIds.length ?? 0,
        hintsUsed: get().session?.hintsUsed ?? 0,
      });
      return true;
    },

    toggleEvidenceStamp(id, caseData) {
      if (!caseData) {
        set((s) => {
          if (!s.session) return s;
          const removing = s.session.selectedEvidenceIds.includes(id);
          return {
            session: {
              ...s.session,
              selectedEvidenceIds: removing
                ? s.session.selectedEvidenceIds.filter((item) => item !== id)
                : [...s.session.selectedEvidenceIds, id],
              stamps: removing
                ? (s.session.stamps ?? []).filter((stamp) => stamp.evidenceId !== id)
                : [...(s.session.stamps ?? []), { caseId: s.session.caseId, statementId: 'claim_main', evidenceId: id }],
            },
          };
        });
        persist();
        return true;
      }
      const before = get();
      const evidence = caseData.evidences.find((item) => item.id === id);
      const link = evidence?.statementLink;
      const progress = before.stats.interactiveEvidenceProgress[`${caseData.id}/${id}`];
      const interactive = evidence != null && ['document_scan', 'thermal_scan', 'shadow_time_check', 'seal_match', 'surface_reveal'].includes(evidence.type);
      if (
        !before.session || before.session.caseId !== caseData.id ||
        !evidence ||
        !before.session.viewedEvidenceIds.includes(id) ||
        (interactive && !progress?.analysisCompleted)
      ) return false;
      set((s) => {
        if (!s.session) return s;
        const selected = s.session.selectedEvidenceIds;
        const removing = selected.includes(id);
        const next = removing ? selected.filter((x) => x !== id) : [...selected, id];
        const stamps = removing
          ? (s.session.stamps ?? []).filter((stamp) => stamp.evidenceId !== id)
          : [...(s.session.stamps ?? []), { caseId: caseData.id, statementId: link?.statementId ?? 'claim_main', evidenceId: id }];
        return {
          session: { ...s.session, selectedEvidenceIds: next, stamps },
          stats: progress
            ? {
                ...s.stats,
                interactiveEvidenceProgress: {
                  ...s.stats.interactiveEvidenceProgress,
                  [`${caseData.id}/${id}`]: { ...progress, selectedContradiction: !removing },
                },
              }
            : s.stats,
        };
      });
      persist();

      const after = get().session;
      if (after) {
        trackGoal(GOAL.evidenceStamp, {
          caseId: after.caseId,
          evidenceId: id,
          statementId: link?.statementId ?? 'claim_main',
          stamped: after.selectedEvidenceIds.includes(id),
          stampCount: after.selectedEvidenceIds.length,
          isContradiction: evidence?.isContradiction ?? null,
          evidencePosition: caseData.evidences.findIndex((item) => item.id === id) + 1,
        });
        setAnalyticsContext({
          surface: 'investigation', caseId: after.caseId,
          viewedCount: after.viewedEvidenceIds.length, stampedCount: after.selectedEvidenceIds.length,
          hintsUsed: after.hintsUsed,
        });
      }
      return true;
    },

    updateInteractiveProgress(caseData, evidenceId, progress) {
      if (!caseData.evidences.some((evidence) => evidence.id === evidenceId)) return;
      const key = `${caseData.id}/${evidenceId}`;
      const previous = get().stats.interactiveEvidenceProgress[key];
      set((s) => ({
        stats: {
          ...s.stats,
          interactiveEvidenceProgress: {
            ...s.stats.interactiveEvidenceProgress,
            [key]: progress,
          },
        },
      }));
      persist();
      if (!previous?.opened && progress.opened) {
        trackGoal(GOAL.evidenceAnalysisStart, { caseId: caseData.id, evidenceId });
      }
      if ((progress.hintLevel ?? 0) > (previous?.hintLevel ?? 0)) {
        trackGoal(GOAL.evidenceAnalysisHint, {
          caseId: caseData.id,
          evidenceId,
          hintLevel: progress.hintLevel,
        });
      }
      if (!previous?.analysisCompleted && progress.analysisCompleted) {
        trackGoal(GOAL.evidenceAnalysisComplete, {
          caseId: caseData.id,
          evidenceId,
          attempts: progress.attempts,
          hintLevel: progress.hintLevel,
        });
      }
    },

    completeFinalSynthesis(caseData, links, skipped = false, completed = true) {
      if (!caseData.finalSynthesis || !get().stats.results[caseData.id]?.verdictCorrect) return;
      const previous = get().stats.finalSynthesisProgress[caseData.id];
      set((s) => ({
        stats: {
          ...s.stats,
          finalSynthesisProgress: {
            ...s.stats.finalSynthesisProgress,
            [caseData.id]: {
              completed: completed && !skipped,
              skipped,
              attempts: (previous?.attempts ?? 0) + 1,
              links,
            },
          },
        },
      }));
      persist(true);
      trackGoal(skipped ? GOAL.finalSynthesisSkip : GOAL.finalSynthesisComplete, {
        caseId: caseData.id,
        attempts: (previous?.attempts ?? 0) + 1,
        linkCount: links.length,
      });
    },

    buyHint(caseData, kind, targetEvidenceId) {
      const { session, stats } = get();
      if (!session || session.caseId !== caseData.id) return false;
      const service = kind === 'note' ? 'inspector_note' : 'witness_canvass';
      trackGoal(GOAL.serviceSelect, { caseId: caseData.id, service });

      // A valid, not-yet-revealed target picks that card; otherwise fall back
      // to the next unrevealed card in case order.
      const targetValid =
        targetEvidenceId != null &&
        caseData.evidences.some((e) => e.id === targetEvidenceId) &&
        !session.revealedEvidenceIds.includes(targetEvidenceId);
      const targeted = targetValid;
      const nextId = targetValid
        ? targetEvidenceId!
        : (caseData.evidences.find(
            (e) => !session.revealedEvidenceIds.includes(e.id),
          )?.id ?? null);
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
              hintsUsed: s.session.hintsUsed + 1,
            },
          };
        });
        persist();

        trackGoal(GOAL.hintBuy, {
          caseId: caseData.id,
          kind,
          cost: charge,
          revealedId: nextId,
          balanceAfter: get().stats.balance,
          targeted,
          targetIndex: caseData.evidences.findIndex((e) => e.id === nextId),
        });
        trackGoal(GOAL.serviceUse, {
          caseId: caseData.id,
          service,
          cost: charge,
          balanceAfter: get().stats.balance,
        });
      };

      if (kind === 'note') {
        const cost = Math.round(
          caseData.claimAmount * GAME_CONFIG.hints.inspectorNoteClaimPct,
        );
        if (stats.balance < cost) return false; // unaffordable — UI gates this
        trackGoal(GOAL.serviceBuy, {
          caseId: caseData.id,
          service,
          cost,
          balanceBefore: stats.balance,
        });
        reveal(cost);
        return true;
      }

      // kind === 'canvass' → rewarded Yandex video; reveal for free once watched.
      // (Offline/dev: showRewardedAd grants immediately so it stays playable.)
      showRewardedAd(() => reveal(0), 'witness_canvass');
      return true;
    },

    selectInvestigationService(caseData, service) {
      const { session, stats } = get();
      if (!session || session.caseId !== caseData.id || session.viewedEvidenceIds.length > 0) return false;
      if (session.selectedService) return false;
      if (service === 'extra_clearance' && caseData.investigationBudget == null) return false;

      const department = GAME_CONFIG.services[service].department;
      const level = stats.departmentLevels[department];
      if (level < 1) return false;
      const nowDay = Math.floor(getServerTimeMs() / GAME_CONFIG.daily.cooldownMs);
      const free = level >= GAME_CONFIG.services.freeDailyAtLevel &&
        stats.serviceFreeUseServerDay[service] !== nowDay;
      const discount = level >= GAME_CONFIG.services.discountAtLevel
        ? 1 - GAME_CONFIG.services.discountPct / 100
        : 1;
      const base = GAME_CONFIG.reward.baseByDifficulty[caseData.difficulty];
      const cost = free ? 0 : Math.round(base * GAME_CONFIG.services[service].pricePct * discount);
      if (stats.balance < cost) return false;

      set((s) => ({
        stats: {
          ...s.stats,
          balance: s.stats.balance - cost,
          serviceFreeUseServerDay: free
            ? { ...s.stats.serviceFreeUseServerDay, [service]: nowDay }
            : s.stats.serviceFreeUseServerDay,
        },
        session: s.session && s.session.caseId === caseData.id
          ? {
              ...s.session,
              selectedService: service,
              extraOpens: service === 'extra_clearance' ? 1 : 0,
            }
          : s.session,
      }));
      persist();
      trackGoal(GOAL.serviceBuy, { caseId: caseData.id, service, cost, free, level });
      return true;
    },

    upgradeDepartment(department) {
      const { stats } = get();
      const level = stats.departmentLevels[department];
      const cost = GAME_CONFIG.departments[department][level];
      if (cost == null || stats.balance < cost) return false;
      set((s) => ({
        stats: {
          ...s.stats,
          balance: s.stats.balance - cost,
          departmentLevels: { ...s.stats.departmentLevels, [department]: level + 1 },
        },
      }));
      persist(true);
      trackGoal(GOAL.serviceBuy, { service: 'department_upgrade', department, level: level + 1, cost });
      return true;
    },

    submitVerdict(caseData, decision) {
      const { session, stats } = get();
      const isReplay = stats.completedCaseIds.includes(caseData.id);
      const rewardEligible = !isReplay;
      const selected = session?.selectedEvidenceIds ?? [];
      const scoringStamps = (session?.stamps ?? []).map((stamp) => {
        if (stamp.statementId !== 'claim_main') return stamp;
        const evidence = caseData.evidences.find((item) => item.id === stamp.evidenceId);
        return evidence?.statementLink?.relation === 'contradicts'
          ? { ...stamp, statementId: evidence.statementLink.statementId }
          : stamp;
      });
      const scoringSession = session ? { ...session, stamps: scoringStamps } : null;

      const total = totalContradictions(caseData);
      const { correct, falseStamps } = classifyStamps(caseData, selected, scoringStamps);
      const proofRatio = total === 0 ? 1 : correct / total;
      const mastery = evaluateMastery(caseData, decision, scoringSession);
      const perfectStreak = evaluatePerfectCaseStreak(
        stats.perfectCaseStreakCount,
        mastery === 'silver' || mastery === 'gold',
        rewardEligible,
      );
      const previousMastery = stats.results[caseData.id]?.mastery ?? 'none';

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
        perfectStreakBonusPct: perfectStreak.multiplierPct,
        opensUsed: session?.viewedEvidenceIds.length ?? 0,
        rewardEligible,
        statementStamps: scoringStamps,
      });

      // Career XP, then detect whether this case crossed a rank threshold.
      const xpGained = isReplay ? 0 : evaluateXpGain({
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
        mastery: bestMastery(previousMastery, mastery),
        closedAtServerMs: getServerTimeMs(),
      };
      const weeklyProgress = caseData.type === 'standard'
        ? updateWeeklyProgress({
            current: stats.weeklyProgress,
            serverMs: result.closedAtServerMs,
            caseData,
            mastery,
            verdictCorrect: breakdown.verdictCorrect,
            hintsUsed: session?.hintsUsed ?? 0,
            opensUsed: session?.viewedEvidenceIds.length ?? 0,
          })
        : stats.weeklyProgress;
      const standardCompleted = new Set([
        ...stats.completedCaseIds.filter((id) => !id.endsWith('-daily')),
        ...(caseData.type === 'standard' ? [caseData.id] : []),
      ]).size;
      const weeklyEarned = weeklyProgress != null &&
        standardCompleted >= GAME_CONFIG.weekly.unlockAfterStandardCases &&
        weeklyProgress.completedTaskIds.length >= GAME_CONFIG.weekly.tasksRequired &&
        !weeklyProgress.rewardClaimed;
      const finalWeekly = weeklyEarned && weeklyProgress
        ? { ...weeklyProgress, rewardClaimed: true }
        : weeklyProgress;
      const weeklyStampId = weeklyEarned && finalWeekly
        ? `weekly-${finalWeekly.serverWeek}`
        : null;

      // Post-case stats *before* achievement bonuses — what predicates evaluate.
      const baseStats: PlayerStats = {
        ...stats,
        balance: stats.balance + breakdown.total + (weeklyEarned ? GAME_CONFIG.weekly.reward : 0),
        xp: stats.xp + xpGained,
        streakCount: streak.streak,
        lastPlayedServerDay: nowServerDay,
        perfectCaseStreakCount: perfectStreak.streak,
        completedCaseIds: stats.completedCaseIds.includes(caseData.id)
          ? stats.completedCaseIds
          : [...stats.completedCaseIds, caseData.id],
        results: { ...stats.results, [caseData.id]: result },
        weeklyProgress: finalWeekly,
        collectibleStampIds: weeklyStampId
          ? [...stats.collectibleStampIds, weeklyStampId]
          : stats.collectibleStampIds,
        // Record daily claim against authoritative server time for gating.
        lastDailyClaimServerMs:
          caseData.type === 'daily'
            ? result.closedAtServerMs
            : stats.lastDailyClaimServerMs,
        lastDailyCaseId: caseData.type === 'daily' ? caseData.id : stats.lastDailyCaseId,
        dailyAdCaseId: caseData.type === 'daily' ? null : stats.dailyAdCaseId,
        metaUnlocked: stats.metaUnlocked || (
          breakdown.verdictCorrect && caseData.onboarding?.menuUnlockAfterVerdict === true
        ),
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
          stampedEvidenceIds: [...selected],
          mastery: result.mastery,
        },
      });

      // Case closure is a critical moment → immediate (un-debounced) cloud write.
      persist(true);
      // The leaderboard tracks permanent career progress, never spendable balance.
      void submitLeaderboardScore(finalXp);

      // ── Analytics: the verdict is the richest signal for economy tuning. ──
      trackGoal(GOAL.verdictSubmit, {
        caseId: caseData.id,
        decision,
        difficulty: caseData.difficulty,
        type: caseData.type,
        verdictCorrect: breakdown.verdictCorrect,
        verdictComponent: breakdown.verdictComponent,
        proofComponent: breakdown.proofComponent,
        efficiencyComponent: breakdown.efficiencyComponent,
        penalty: breakdown.penalty,
        bonusPct: breakdown.bonusPct,
        dailyMultiplierApplied: breakdown.dailyMultiplierApplied,
        isReplay,
        rewardSource: isReplay ? 'training' : caseData.type,
        total: breakdown.total,
        xpGained,
        proofRatio,
        falseStamps,
        opensUsed: session?.viewedEvidenceIds.length ?? 0,
        caseWallTimeMs: session ? Math.max(0, getServerTimeMs() - session.startedAtServerMs) : null,
        hintsUsed: session?.hintsUsed ?? 0,
        stampCount: selected.length,
        contradictionsFound: selected.filter((id) => caseData.evidences.find((e) => e.id === id)?.isContradiction).length,
        totalContradictions: totalContradictions(caseData),
        campaignPosition: caseData.campaignOrder,
      });
      trackGoal(GOAL.caseComplete, { caseId: caseData.id, campaignPosition: caseData.campaignOrder });
      if (stats.completedCaseIds.length === 0) trackGoal(GOAL.firstCaseComplete, { caseId: caseData.id });
      setAnalyticsContext({ surface: 'result', caseId: caseData.id, verdictCorrect: breakdown.verdictCorrect });
      if (!stats.metaUnlocked && finalStats.metaUnlocked) {
        trackGoal(GOAL.onboardingComplete, { caseId: caseData.id });
      }
      for (const a of unlocks) {
        trackGoal(GOAL.achievement, { achievementId: a.id, caseId: caseData.id });
      }
      if (promotedToLevel != null) {
        trackGoal(GOAL.rankUp, { newLevel: promotedToLevel, xp: finalXp });
      }
      if (caseData.type === 'daily') {
        trackGoal(GOAL.dailyClaim, { caseId: caseData.id, total: breakdown.total });
      }
      if (!stats.isBankrupt && finalStats.isBankrupt) {
        // Informational economy marker only — since save v8 nothing is blocked.
        trackGoal(GOAL.bankruptcy, { caseId: caseData.id, balance: finalBalance, blocked: false });
      }
      reportUserParams(finalStats);
      return breakdown;
    },

    async closeCase() {
      const { session, lastResult } = get();
      if (session && !lastResult) {
        trackGoal(GOAL.investigationInterrupt, {
          caseId: session.caseId,
          reason: 'back_to_desk',
          viewedCount: session.viewedEvidenceIds.length,
        });
      }
      set({ session: null });
      await flushSync(snapshotOf(get()));
    },

    restoreFunds() {
      // Voluntary low-balance top-up behind a rewarded ad (the reward callback
      // only fires if the player actually watched it). Guard: never lets the
      // ad *lower* a balance that is already at or above the restore target.
      const previousBalance = get().stats.balance;
      if (previousBalance >= GAME_CONFIG.economy.restoreFundsTo) return;
      showRewardedAd(() => {
        set((s) => ({
          stats: {
            ...s.stats,
            balance: GAME_CONFIG.economy.restoreFundsTo,
            isBankrupt: false,
          },
        }));
        persist(true);
        trackGoal(GOAL.fundsRestore, {
          previousBalance,
          restoredTo: GAME_CONFIG.economy.restoreFundsTo,
        });
        reportUserParams(get().stats);
      }, 'restore_funds');
    },

    recordInterstitialShown() {
      set((s) => ({
        stats: {
          ...s.stats,
          interstitialsSeenTotal: s.stats.interstitialsSeenTotal + 1,
        },
      }));
      persist();
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
      trackGoal(GOAL.rewardDouble, {
        caseId: lastResult.caseId,
        amount: bonus,
        balanceAfter: newBalance,
      });
      reportUserParams(get().stats);
    },

    isDailyUnlocked() {
      const { lastDailyClaimServerMs, dailyAdUnlockServerDay, dailyAdCaseId } = get().stats;
      const today = Math.floor(getServerTimeMs() / GAME_CONFIG.daily.cooldownMs);
      if (dailyAdCaseId && dailyAdUnlockServerDay === today) return true;
      // Authoritative server time only — never the device clock.
      return evaluateDailyAvailability(lastDailyClaimServerMs, getServerTimeMs())
        .unlocked;
    },

    unlockDailyViaAd(caseId) {
      const today = Math.floor(getServerTimeMs() / GAME_CONFIG.daily.cooldownMs);
      if (get().stats.dailyAdUnlockServerDay === today) return;
      trackAdOffer('rewarded', 'daily_unlock');
      showRewardedAd(() => {
        set((s) => ({
          stats: {
            ...s.stats,
            dailyAdUnlockServerDay: today,
            dailyAdCaseId: caseId,
          },
        }));
        persist(true);
        trackGoal(GOAL.dailyAdUnlock, {});
      }, 'daily_unlock');
    },

    unlockArchiveCaseViaAd(packId, caseId) {
      const pack = THEMATIC_PACKS.find((item) => item.id === packId);
      if (!pack) return false;
      if (!getThematicPackCaseIds(pack).includes(caseId)) return false;

      const today = Math.floor(getServerTimeMs() / GAME_CONFIG.daily.cooldownMs);
      const { stats } = get();
      if (stats.archivePurchasedPackIds.includes(packId)) return false;
      if (stats.archiveUnlockedCaseIds.includes(caseId)) return false;
      if (stats.archiveAdUnlockServerDayByPack[packId] === today) return false;

      trackAdOffer('rewarded', 'archive_unlock');
      showRewardedAd(() => {
        set((s) => ({
          stats: {
            ...s.stats,
            archiveUnlockedCaseIds: s.stats.archiveUnlockedCaseIds.includes(caseId)
              ? s.stats.archiveUnlockedCaseIds
              : [...s.stats.archiveUnlockedCaseIds, caseId],
            archiveAdUnlockServerDayByPack: {
              ...s.stats.archiveAdUnlockServerDayByPack,
              [packId]: today,
            },
          },
        }));
        persist(true);
        trackGoal(GOAL.adReward, { kind: 'rewarded', placement: 'archive_unlock', packId, caseId });
      }, 'archive_unlock');
      return true;
    },

    grantArchivePurchase(packId) {
      if (get().stats.archivePurchasedPackIds.includes(packId)) return;
      set((s) => ({
        stats: {
          ...s.stats,
          archivePurchasedPackIds: [...s.stats.archivePurchasedPackIds, packId],
        },
      }));
      persist(true);
    },

    // Every boot re-grants what the platform reports, so this runs constantly
    // with nothing new to say. Writing anyway would spend a cloud write (and a
    // slice of the SDK's rate limit) on an identical snapshot.
    grantArchivePurchases(packIds) {
      const owned = get().stats.archivePurchasedPackIds;
      const merged = Array.from(new Set([...owned, ...packIds]));
      if (merged.length === owned.length) return;
      set((s) => ({ stats: { ...s.stats, archivePurchasedPackIds: merged } }));
      persist(true);
    },

    grantNoAds() {
      if (get().stats.noAdsPurchased) return;
      set((s) => ({ stats: { ...s.stats, noAdsPurchased: true } }));
      persist(true);
    },

    grantStampTextPurchase(stampTextId) {
      const stamp = STAMP_TEXTS.find((item) => item.id === stampTextId);
      if (!stamp || stamp.productId === null) return;
      set((s) => ({
        stats: {
          ...s.stats,
          ownedStampTextIds: s.stats.ownedStampTextIds.includes(stampTextId)
            ? s.stats.ownedStampTextIds
            : [...s.stats.ownedStampTextIds, stampTextId],
          // A just-bought caption is what the player wants to see printed.
          activeStampTextId: stampTextId,
        },
      }));
      persist(true);
    },

    grantStampTextPurchases(stampTextIds) {
      const owned = get().stats.ownedStampTextIds;
      const merged = Array.from(new Set([...owned, ...stampTextIds]));
      if (merged.length === owned.length) return; // nothing new — see above
      set((s) => ({ stats: { ...s.stats, ownedStampTextIds: merged } }));
      persist(true);
    },

    setActiveStampText(stampTextId) {
      // Only an unlocked caption can be inked; `null` always falls back to free.
      // Pack captions are unlocked by owning the archive, not by a purchase of
      // their own, so ownership is asked of the shared catalog helper.
      const { ownedStampTextIds, archivePurchasedPackIds } = get().stats;
      if (
        stampTextId !== null &&
        !isStampTextUnlocked(stampTextId, ownedStampTextIds, archivePurchasedPackIds)
      ) {
        return;
      }
      set((s) => ({ stats: { ...s.stats, activeStampTextId: stampTextId } }));
      persist(true);
    },

    setActiveStampInk(stampInkId) {
      // Ink is free and purely cosmetic; an unknown id falls back to the default.
      const resolved =
        stampInkId === null || stampInkId === DEFAULT_STAMP_INK_ID
          ? null
          : (STAMP_INKS.find((ink) => ink.id === stampInkId)?.id ?? null);
      set((s) => ({ stats: { ...s.stats, activeStampInkId: resolved } }));
      persist(true);
    },

    grantBundlePurchase(bundleId) {
      const bundle = getBundle(bundleId);
      if (!bundle) return;
      // A bundle owns nothing itself — it grants its contents, which is what the
      // rest of the game reads. The contents go first so that a bundle whose
      // record already exists (every boot after the purchase) still backfills
      // anything added to it since; recording the id keeps the shelf honest
      // ("already yours").
      get().grantArchivePurchases(bundle.packIds);
      get().grantStampTextPurchases(bundle.stampTextIds);
      if (get().stats.purchasedBundleIds.includes(bundle.id)) return;
      set((s) => ({
        stats: {
          ...s.stats,
          purchasedBundleIds: [...s.stats.purchasedBundleIds, bundle.id],
        },
      }));
      persist(true);
    },

    applyRestoredPurchases(productIds) {
      if (productIds.length === 0) return;
      const packIds = productIds
        .map(getThematicPackIdByProductId)
        .filter((packId): packId is string => packId !== null);
      get().grantArchivePurchases(packIds);
      if (productIds.includes(GAME_CONFIG.advertising.noAdsProductId)) get().grantNoAds();
      get().grantStampTextPurchases(
        productIds
          .map((productId) => getStampTextByProductId(productId)?.id)
          .filter((stampTextId): stampTextId is string => stampTextId !== undefined),
      );
      // Bundles carry no entitlement of their own: restoring one has to re-grant
      // every pack and caption it contains, or a reinstall would silently lose
      // the whole purchase.
      for (const productId of productIds) {
        const bundle = getBundleByProductId(productId);
        if (bundle) get().grantBundlePurchase(bundle.id);
      }
    },

    setPaused(paused) {
      set({ isPaused: paused });
    },

    devCheat(opts) {
      // Hard no-op in production — the cheat never touches a shipped economy.
      if (!import.meta.env.DEV) return;

      const ranks = GAME_CONFIG.progression.ranks;
      const topXp = ranks[ranks.length - 1]?.xpThreshold ?? 0;
      const balance = opts?.balance ?? 9_999_999;
      const xp = opts?.xp ?? topXp;

      // Payments are dead off-Yandex, so every paid surface is otherwise
      // untestable: grant the whole catalog, not just the currency. Real YAN
      // cannot be minted, so "buy everything" is expressed as owning
      // everything — the same end state a full purchase run produces.
      set((s) => ({
        stats: {
          ...s.stats,
          balance,
          xp,
          isBankrupt: balance <= GAME_CONFIG.economy.bankruptcyThreshold,
          ownedStampTextIds: STAMP_TEXTS.filter((stamp) => stamp.productId !== null).map(
            (stamp) => stamp.id,
          ),
          archivePurchasedPackIds: THEMATIC_PACKS.map((pack) => pack.id),
          purchasedBundleIds: BUNDLES.map((bundle) => bundle.id),
          noAdsPurchased: true,
        },
      }));
      persist(true);
      // eslint-disable-next-line no-console
      console.info(
        `[devCheat] balance=${balance} xp=${xp} +all archives, bundles, stamp captions, no-ads`,
      );
    },

    dismissRating() {
      set((s) => ({
        stats: { ...s.stats, ratingDismissals: s.stats.ratingDismissals + 1 },
      }));
      persist();
      trackGoal(GOAL.rating, {
        action: 'dismiss',
        dismissals: get().stats.ratingDismissals,
      });
    },

    suppressRating() {
      set((s) => ({
        stats: {
          ...s.stats,
          ratingDismissals: GAME_CONFIG.rating.suppressAfterDismissals,
        },
      }));
      persist();
      trackGoal(GOAL.rating, { action: 'never' });
    },
  };
});

/* --------------------------- Dev console hook ---------------------------- */

/**
 * Expose the cheat on `window.__cheat` in dev builds so it can be fired straight
 * from the browser console, e.g. `__cheat()` or `__cheat({ balance: 5_000_000,
 * xp: 700 })`. Stripped from production by the `import.meta.env.DEV` guard.
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __cheat?: GameStoreState['devCheat'] }).__cheat = (
    opts,
  ) => useGameStore.getState().devCheat(opts);
}

/* --------------------------- UI-gating selectors ------------------------- */

/**
 * Button-enable logic + budget bookkeeping for the verdict panel, derived from
 * session + case. The product rule is asymmetric:
 *
 *   • *approve* is always available — paying out a claim is the default action
 *     and needs no justification (budgeted or not).
 *   • *reject* (blocking the payout) requires grounds: ≥1 stamped contradiction.
 *
 * Also exposes budget bookkeeping (`opensRemaining`, `budgetExhausted`) so the
 * UI can seal un-opened cards and show a counter. Pure → cheap in render.
 */
export function selectCaseInvestigationGate(
  caseData: Case,
  state: Pick<GameStoreState, 'session'>,
): {
  canApprove: boolean;
  canReject: boolean;
  budget: number | null;
  opensRemaining: number | null;
  budgetExhausted: boolean;
} {
  const viewed = state.session?.viewedEvidenceIds ?? [];
  const budgetedViewed = viewed.filter((id) =>
    caseData.evidences.find((item) => item.id === id)?.evidenceTier !== 'arc'
  );
  const stamped = state.session?.selectedEvidenceIds ?? [];

  const hasStampedContradiction = stamped.length > 0;
  const baseBudget = caseData.investigationBudget ?? null;
  const budget = baseBudget == null ? null : baseBudget + (state.session?.extraOpens ?? 0);

  if (budget != null) {
    const opensRemaining = Math.max(0, budget - budgetedViewed.length);
    return {
      // Approving a payout is the default, low-stakes action — always available.
      canApprove: true,
      canReject: hasStampedContradiction,
      budget,
      opensRemaining,
      budgetExhausted: opensRemaining <= 0,
    };
  }

  return {
    // Approve is always available: paying out a claim needs no justification.
    canApprove: true,
    // Reject must be *justified*: enabled only once at least one contradiction
    // has been stamped. Blocking a payout always requires grounds.
    canReject: hasStampedContradiction,
    budget: null,
    opensRemaining: null,
    budgetExhausted: false,
  };
}
