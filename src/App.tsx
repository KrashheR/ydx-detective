import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getDailyCaseSummary,
  getStandardCaseSummaries,
  getCaseSummaryById,
  getCaseById,
  loadCaseById,
  preloadCases,
} from './data/caseLoader';
import {
  useGameStore,
  selectCaseInvestigationGate,
} from './store/gameStore';
import {
  evaluateCaseUnlocks,
  getNextAvailableCase,
  isCaseUnlocked,
  type CaseUnlockInfo,
} from './engine/caseUnlockEngine';
import { evaluateDailyAvailability } from './engine/rewardEngine';
import { resolvePrice, type OfferContext } from './engine/offerEngine';
import { evaluateInterstitial } from './engine/adPolicyEngine';
import {
  getServerTimeMs,
  fetchLeaderboard,
  showFullscreenAd,
  showRewardedAd,
  trackAdOffer,
  canReview,
  requestReview,
  notifyGameplayStart,
  notifyGameplayStop,
  isPaymentsAvailable,
  fetchPaymentsCatalog,
  purchaseProduct,
  restorePurchases,
  type LeaderboardRow,
  type PaymentsProduct,
} from './services/platformAdapter';
import { GOAL, getAnalyticsActiveTotalMs, trackEvent, trackGoal } from './services/metrica';
import { GAME_CONFIG } from './config/gameConfig';
import { RTL_LANGUAGES, t } from './i18n/ui';
import type { CaseSummary } from './types';
import {
  THEMATIC_PACKS,
  getThematicPackCaseIds,
  getThematicPackIdByProductId,
  isPurchasedArchiveCase,
} from './data/thematicPacks';
import {
  getArchivePackForCase,
  getNextArchiveCase,
  indexUnlocksByCaseId,
  listArchiveCases,
} from './engine/archiveAccessEngine';
import { getAdPolicyConfig } from './services/remoteConfig';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { CaseFile } from './components/CaseFile';
import { CaseSelect } from './components/CaseSelect';
import { MobileDeskMenu } from './components/MobileDeskMenu';
import { StampModal } from './components/StampModal';
import { ResultSheet } from './components/ResultSheet';
import { clueEvidenceFor } from './engine/caseSuccessEngine';
import { AchievementsModal } from './components/AchievementsModal';
import { SpecialArchivesEntry } from './components/SpecialArchivesEntry';
import { TopBar } from './components/TopBar';
import { BureauScreen, type BureauTab } from './components/BureauScreen';
import type { ThematicPack } from './data/thematicPacks';
import type { StampText } from './data/stampTexts';
import {
  DEFAULT_STAMP_INK_ID,
  DEFAULT_STAMP_TEXT_ID,
  getStampInkColor,
} from './data/stampTexts';
import { getBundle, getBundleByProductId } from './data/bundles';
import { RatingModal } from './components/RatingModal';
import { EvidenceLinkBoard } from './components/EvidenceLinkBoard';
import { formatCountdown } from './components/icons';
import { formatCaseLockMessage } from './utils/caseDisplay';
import { getAdjacentEvidenceId } from './utils/evidenceNavigation';

/**
 * Folder visual theme. The mockup ships two looks; manila (warm archive) is the
 * default. Switch to 'dossier' for the corporate look — both are wired in CSS.
 */
const FOLDER_LOOK: 'manila' | 'dossier' = 'manila';

export default function App() {
  const store = useGameStore();
  const { stats, session, isPaused, isHydrated, lastResult } = store;
  const lang = stats.language;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalEvidenceId, setModalEvidenceId] = useState<string | null>(null);
  const [resultDismissed, setResultDismissed] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  /** Which Bureau tab is open, or `null` when the desk is showing. */
  const [bureauTab, setBureauTab] = useState<BureauTab | null>(null);
  /** Live Yandex prices, keyed by product id. Empty until the shop is opened. */
  const [paymentsCatalog, setPaymentsCatalog] = useState<Record<string, PaymentsProduct>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rewardDoubled, setRewardDoubled] = useState(false);
  const [lowBalanceOfferDismissed, setLowBalanceOfferDismissed] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showFinalSynthesis, setShowFinalSynthesis] = useState(false);
  /** Active-time stamp of the last interstitial that was *actually shown*. */
  const lastShownInterstitialActiveMsRef = useRef<number | null>(null);
  /** Cases finished since that ad (or since the session started). */
  const casesSinceLastInterstitialRef = useRef(0);
  /** Last case id already counted into the gap above (guards double counting). */
  const countedCaseIdRef = useRef<string | null>(null);
  // Gate: show rating modal at most once per session.
  const ratingShownRef = useRef(false);
  // Gate: fire `reject_blocked` at most once per case investigation.
  const rejectBlockedCaseIdRef = useRef<string | null>(null);
  const evidenceOpenedAtRef = useRef<{ id: string; openedAt: number } | null>(null);
  const resultOpenedAtRef = useRef<number | null>(null);
  const deskViewedRef = useRef(false);
  // Gate: auto-open a case at most once per session (see the boot effect below).
  const autoOpenedRef = useRef(false);

  const flashToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3800);
  };

  // Boot the engine once: SDK init → pause-guard wiring → cloud/local hydrate.
  useEffect(() => {
    void store.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    notifyGameplayStart();
    return notifyGameplayStop;
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || deskViewedRef.current) return;
    deskViewedRef.current = true;
    trackEvent('desk_view', { completedCases: stats.completedCaseIds.length });
  }, [isHydrated, stats.completedCaseIds.length]);

  // DEV-ONLY: Ctrl+Shift+M grants a big balance + top rank for manual testing.
  // Compiled out of production by the `import.meta.env.DEV` guard.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        store.devCheat();
        flashToast('💰 DEV: balance + max rank granted');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Document direction, lang, and title follow the active language (RTL for Arabic).
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
    document.title = t('gameTitle', lang);
  }, [lang]);

  // The stamp impression's ink colour is a single variable, so the three places
  // that print it (evidence card, stamp modal, workshop) stay in sync without
  // threading a prop through the whole case tree — and the theme's `--stamp`
  // chrome red is left untouched. Mirrored onto `<html>` for anything that
  // portals outside the React root.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--stamp-ink',
      getStampInkColor(stats.activeStampInkId),
    );
  }, [stats.activeStampInkId]);

  // A fresh verdict re-opens the result sheet and resets the double-reward slot.
  useEffect(() => {
    if (lastResult) {
      setResultDismissed(false);
      setRewardDoubled(false);
      if (lastResult.total > 0) trackAdOffer('rewarded', 'double_reward');
      resultOpenedAtRef.current = Date.now();
      trackEvent('result_view', {
        caseId: lastResult.caseId,
        verdictCorrect: lastResult.verdictCorrect,
        mastery: lastResult.mastery,
        reward: lastResult.total,
      });
    }
  }, [lastResult]);

  // Voluntary low-balance offer: appears on the desk, never blocks play.
  const showLowBalanceOffer =
    stats.balance < GAME_CONFIG.economy.lowBalanceOfferThreshold &&
    !selectedId &&
    !lowBalanceOfferDismissed;

  useEffect(() => {
    if (showLowBalanceOffer) trackAdOffer('rewarded', 'restore_funds');
  }, [showLowBalanceOffer]);

  // A dismissed offer re-arms once the balance recovers above the threshold.
  useEffect(() => {
    if (stats.balance >= GAME_CONFIG.economy.lowBalanceOfferThreshold) {
      setLowBalanceOfferDismissed(false);
    }
  }, [stats.balance]);

  // Rating prompt: show after a correct verdict at the peak of pride.
  useEffect(() => {
    if (!lastResult?.verdictCorrect) return;
    if (stats.completedCaseIds.length < GAME_CONFIG.rating.minCasesForPrompt) return;
    if (stats.ratingDismissals >= GAME_CONFIG.rating.suppressAfterDismissals) return;
    if (ratingShownRef.current) return;
    void canReview().then((ok) => {
      if (!ok) return;
      ratingShownRef.current = true;
      setShowRating(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResult]);

  // Pull the live leaderboard after hydration and whenever career XP changes.
  useEffect(() => {
    if (!isHydrated) return;
    let active = true;
    void fetchLeaderboard().then((rows) => {
      if (active) setLeaderboard(rows);
    });
    return () => {
      active = false;
    };
  }, [isHydrated, stats.xp]);

  const standardCases = useMemo(() => getStandardCaseSummaries(), []);
  const devUnlockAllLevels =
    import.meta.env.DEV && import.meta.env.VITE_UNLOCK_ALL_LEVELS === 'true';
  const standardCaseUnlocks = useMemo(
    () => evaluateCaseUnlocks(standardCases, stats, { unlockAll: devUnlockAllLevels }),
    [devUnlockAllLevels, standardCases, stats],
  );
  // Rotate the daily pool by server-day. Server time only (see CLAUDE.md).
  // State-driven so the countdown timer re-renders every second.
  const [serverNow, setServerNow] = useState(() => getServerTimeMs());
  useEffect(() => {
    const id = window.setInterval(() => setServerNow(getServerTimeMs()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const serverDay = Math.floor(serverNow / GAME_CONFIG.daily.cooldownMs);
  const baseDailyCase = useMemo(() => getDailyCaseSummary(serverDay), [serverDay]);
  const adDailyCase = useMemo(
    () => getDailyCaseSummary(serverDay + 1),
    [serverDay],
  );
  const dailyCase = stats.dailyAdUnlockServerDay === serverDay && stats.dailyAdCaseId
    ? getCaseSummaryById(stats.dailyAdCaseId) ?? baseDailyCase
    : baseDailyCase;
  const selectedCase = selectedId ? getCaseById(selectedId) : undefined;

  const daily = evaluateDailyAvailability(
    stats.lastDailyClaimServerMs,
    serverNow,
  );

  // Warm only content the player can actually open. The shelf itself is built
  // from lightweight summaries, so locked case JSON/evidence stays unfetched.
  useEffect(() => {
    if (!isHydrated) return;

    const accessibleIds = new Set(
      standardCaseUnlocks
        .filter(isCaseUnlocked)
        .map((info) => info.caseData.id),
    );
    if (daily.unlocked && dailyCase) accessibleIds.add(dailyCase.id);
    if (session?.caseId) accessibleIds.add(session.caseId);

    for (const pack of THEMATIC_PACKS) {
      const caseIds = getThematicPackCaseIds(pack);
      const purchased = stats.archivePurchasedPackIds.includes(pack.id);
      caseIds.forEach((caseId, index) => {
        if (
          purchased ||
          index === 0 ||
          stats.archiveUnlockedCaseIds.includes(caseId)
        ) {
          accessibleIds.add(caseId);
        }
      });
    }

    preloadCases([...accessibleIds]);
  }, [daily.unlocked, dailyCase, isHydrated, session?.caseId, standardCaseUnlocks,
    stats.archivePurchasedPackIds, stats.archiveUnlockedCaseIds]);

  useEffect(() => {
    if (isHydrated && !daily.unlocked) trackAdOffer('rewarded', 'daily_unlock');
  }, [daily.unlocked, isHydrated, serverDay]);

  const results = useMemo(() => Object.values(stats.results), [stats.results]);
  const accuracyPct = useMemo(() => {
    if (results.length === 0) return 0;
    const correct = results.filter((r) => r.verdictCorrect).length;
    return Math.round((correct / results.length) * 100);
  }, [results]);
  const errorsCount = useMemo(
    () => results.filter((r) => !r.verdictCorrect).length,
    [results],
  );

  const formatLockedCaseMessage = (info: CaseUnlockInfo<CaseSummary>): string =>
    formatCaseLockMessage(info, lang);

  /* --------------------- Archive (story pack) context -------------------- */

  const unlockByCaseId = useMemo(
    () => indexUnlocksByCaseId(standardCaseUnlocks),
    [standardCaseUnlocks],
  );
  /** The story pack the open case belongs to — `null` on the standard desk. */
  const activePack = selectedId ? getArchivePackForCase(selectedId) : null;
  const activePackCases = useMemo(
    () => (activePack ? listArchiveCases(stats, activePack, unlockByCaseId) : []),
    [activePack, stats, unlockByCaseId],
  );

  const openCase = async (
    summary: CaseSummary,
    opts?: { skipStandardGate?: boolean; sourceSurface?: string },
  ) => {
    if (summary.type === 'standard' && !opts?.skipStandardGate) {
      const unlock = standardCaseUnlocks.find((info) => info.caseData.id === summary.id);
      const isResumingActiveCase = session?.caseId === summary.id;
      if (unlock && !isCaseUnlocked(unlock) && !isResumingActiveCase) {
        flashToast(formatLockedCaseMessage(unlock));
        return;
      }
    }

    // Archive cases are reachable from the desk column now, not only from the
    // Bureau — so the paywall has to be enforced here too, or a locked file
    // would open for free from the left column.
    const pack = getArchivePackForCase(summary.id);
    if (pack) {
      const entry = listArchiveCases(stats, pack, unlockByCaseId).find(
        (item) => item.caseData.id === summary.id,
      );
      if (entry?.status === 'locked' && session?.caseId !== summary.id) {
        flashToast(t('archiveCaseLockedToast', lang));
        openBureau('archives');
        return;
      }
    }

    trackEvent('case_card_click', {
      caseId: summary.id,
      caseType: summary.type,
      campaignPosition: summary.campaignOrder ?? null,
      sourceSurface:
        opts?.sourceSurface ?? (opts?.skipStandardGate ? 'archive' : 'desk'),
    });

    const c = await loadCaseById(summary.id);
    if (!c) return;
    setSelectedId(c.id);
    store.startCase(c);
    trackGoal(GOAL.serviceView, { caseId: c.id, service: 'inspector_note' });
    trackGoal(GOAL.serviceView, { caseId: c.id, service: 'witness_canvass' });
    trackAdOffer('rewarded', 'witness_canvass');
  };

  const handleSelectCase = (c: CaseSummary) => void openCase(c);

  // Boot straight into a case instead of the desk/menu: resume the in-progress
  // investigation if there is one, otherwise open the next unlocked, not yet
  // completed campaign case. Runs once per session; the desk stays reachable via
  // the normal "back" affordance. If nothing qualifies (campaign finished), the
  // player lands on the desk as before.
  useEffect(() => {
    if (!isHydrated || autoOpenedRef.current || selectedId) return;
    autoOpenedRef.current = true;

    const resume = session?.caseId ? getCaseSummaryById(session.caseId) : undefined;
    const next = standardCaseUnlocks
      .filter(isCaseUnlocked)
      .map((info) => info.caseData)
      .find((c) => !stats.completedCaseIds.includes(c.id));
    const target = resume ?? next;
    if (target) void openCase(target, { skipStandardGate: true, sourceSurface: 'autostart' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  const onboardingLocked = !stats.metaUnlocked;
  // The grouped mobile desk menu replaces the 3-column layout on small screens —
  // but only when it actually renders. During onboarding it is suppressed, so the
  // 3-column layout must stay visible on mobile too, otherwise a first-time
  // player gets an empty screen (the desk menu is hidden, the columns are
  // `hidden md:flex`).
  const mobileDeskMenuShown = !selectedCase && !onboardingLocked;

  const handleSelectStandardCase = (info: CaseUnlockInfo<CaseSummary>) => {
    if (!isCaseUnlocked(info)) {
      flashToast(formatLockedCaseMessage(info));
      trackGoal(GOAL.lockedCaseClick, {
        caseId: info.caseData.id,
        lockReason: info.reason === 'requires_level' ? 'level' : 'sequence',
        campaignPosition: standardCaseUnlocks.findIndex(
          (u) => u.caseData.id === info.caseData.id,
        ),
      });
      return;
    }
    handleSelectCase(info.caseData);
  };

  const handleOpenEvidence = (id: string) => {
    if (!selectedCase) return;
    const wasViewed = session?.viewedEvidenceIds.includes(id) ?? false;
    // On budgeted cases, opening a *new* card may be refused once the budget is
    // spent. Re-opening an already-viewed card always succeeds.
    const opened = store.markEvidenceAsViewed(id, selectedCase);
    if (!opened) {
      flashToast(t('budgetExhausted', lang));
      trackGoal(GOAL.budgetExhausted, {
        caseId: selectedCase.id,
        budget: selectedCase.investigationBudget ?? null,
        opensUsed: session?.viewedEvidenceIds.length ?? 0,
      });
      return;
    }
    const previous = evidenceOpenedAtRef.current;
    if (previous && previous.id !== id) {
      trackEvent('evidence_close', {
        caseId: selectedCase.id, evidenceId: previous.id,
        dwellMs: Date.now() - previous.openedAt, navigationMethod: 'next_previous',
      });
    }
    const evidence = selectedCase.evidences.find((item) => item.id === id);
    trackEvent('evidence_open', {
      caseId: selectedCase.id, evidenceId: id, evidenceType: evidence?.type ?? null,
      isContradiction: evidence?.isContradiction ?? null,
      firstOpen: !wasViewed,
      openIndex: (session?.viewedEvidenceIds.length ?? 0) + 1,
      evidencePosition: selectedCase.evidences.findIndex((item) => item.id === id) + 1,
    });
    evidenceOpenedAtRef.current = { id, openedAt: Date.now() };
    setModalEvidenceId(id);
  };

  const handleCloseEvidence = () => {
    const opened = evidenceOpenedAtRef.current;
    if (opened && selectedCase) {
      trackEvent('evidence_close', {
        caseId: selectedCase.id, evidenceId: opened.id,
        dwellMs: Date.now() - opened.openedAt,
        stampedOnClose: session?.selectedEvidenceIds.includes(opened.id) ?? false,
        navigationMethod: 'close',
      });
    }
    evidenceOpenedAtRef.current = null;
    setModalEvidenceId(null);
  };

  const handleNavigateEvidence = (direction: -1 | 1) => {
    if (!selectedCase || !modalEvidenceId) return;
    const nextEvidenceId = getAdjacentEvidenceId(
      selectedCase.evidences,
      modalEvidenceId,
      direction,
    );
    if (nextEvidenceId) handleOpenEvidence(nextEvidenceId);
  };

  const submitWithAdGate = (decision: 'approve' | 'reject') => {
    if (!selectedCase) return;
    store.submitVerdict(selectedCase, decision);
  };

  const handleApprove = () => submitWithAdGate('approve');

  /** Returns false (→ show prompt) when rejecting without any stamped proof. */
  const handleReject = (): boolean => {
    if (!selectedCase) return true;
    if ((session?.selectedEvidenceIds.length ?? 0) === 0) {
      // Fire once per case investigation — repeated blocked attempts on the
      // same case aren't a new signal.
      if (rejectBlockedCaseIdRef.current !== selectedCase.id) {
        rejectBlockedCaseIdRef.current = selectedCase.id;
        trackGoal(GOAL.rejectBlocked, {
          caseId: selectedCase.id,
          viewedCount: session?.viewedEvidenceIds.length ?? 0,
          stampedCount: session?.selectedEvidenceIds.length ?? 0,
        });
      }
      return false;
    }
    submitWithAdGate('reject');
    return true;
  };

  /**
   * Both rewarded placements on the closing sheet share one shape: the sheet
   * asks for an ad and gets exactly one settle callback. Nothing is credited
   * before `onReward` fires, and a cancel / error / no-fill settles `false` so
   * the sheet can restore its button instead of hanging on "loading".
   */
  const handleDoubleReward = (settle: (granted: boolean) => void) => {
    trackEvent('result_action', {
      caseId: lastResult?.caseId, action: 'double_reward',
      resultDwellMs: resultOpenedAtRef.current == null ? null : Date.now() - resultOpenedAtRef.current,
    });
    showRewardedAd(
      () => {
        store.doubleLastReward();
        setRewardDoubled(true);
        settle(true);
      },
      'double_reward',
      () => settle(false),
    );
  };

  /**
   * The failure sheet's rewarded hint: one missed contradiction, opened for the
   * current case only. It never closes the case and never unlocks the next one
   * — the reveal is carried into the retry by `startCase`.
   */
  const handleRevealClue = (settle: (granted: boolean) => void) => {
    if (!selectedCase || !lastResult) return;
    const clue = clueEvidenceFor(
      selectedCase,
      lastResult.success,
      lastResult.stampedEvidenceIds,
    );
    if (!clue) { settle(false); return; }
    const caseId = selectedCase.id;
    trackEvent('result_action', {
      caseId, action: 'reveal_clue',
      resultDwellMs: resultOpenedAtRef.current == null ? null : Date.now() - resultOpenedAtRef.current,
    });
    showRewardedAd(
      () => {
        store.revealMissedClue(caseId, clue.id);
        settle(true);
      },
      'result_clue',
      () => settle(false),
    );
  };

  const onDailyLocked = () => {
    if (adDailyCase) store.unlockDailyViaAd(adDailyCase.id);
  };

  /* ------------------- Bureau of Special Cases (IAP) --------------------- */

  /**
   * Open the Bureau on a given shelf. Live prices are localized and
   * currency-correct; the fallback rubles are only a placeholder for when the
   * catalog is unreachable (offline / off-Yandex).
   */
  const openBureau = (tab: BureauTab) => {
    setBureauTab(tab);
    void fetchPaymentsCatalog().then((products) => {
      if (products.length === 0) return;
      setPaymentsCatalog(
        Object.fromEntries(products.map((product) => [product.id, product])),
      );
    });
    trackGoal(GOAL.shopView, {
      shop: tab === 'stamps' ? 'stamp_texts' : tab === 'bundles' ? 'bundles' : 'special_archives',
    });
  };

  const openArchives = () => openBureau('archives');
  const openStampShop = () => openBureau('stamps');

  /**
   * One place where a paid click is reported. The SDK already fires the raw
   * `purchase_*` goals per product id; this adds *what was bought* (kind + item)
   * and — unlike the SDK — also records the attempts that never reach the
   * payments API at all (offline / no catalog).
   */
  const trackPurchaseAttempt = async (
    kind: 'archive' | 'stamp' | 'bundle' | 'noads',
    itemId: string,
    productId: string,
    buy: () => Promise<boolean>,
  ): Promise<boolean> => {
    const payload = { kind, itemId, productId };
    trackEvent('purchase_intent', {
      ...payload,
      paymentsAvailable: isPaymentsAvailable(),
    });
    const ok = await buy();
    trackEvent('purchase_result', { ...payload, ok });
    return ok;
  };

  /**
   * Nothing is ever charged before the platform has been asked who owns what.
   *
   * A restore can fail (offline boot, a player who signs in only now), and then
   * the shelf still shows an owned item as unowned — at the *intro* price, whose
   * product id differs from the one they actually bought. The SDK's already-owned
   * guard compares ids, so it cannot catch that: the second purchase would go
   * through and charge for an entitlement the player has. Ownership is resolved
   * here, where product id → entitlement is known.
   *
   * `false` means "not proven owned" — including when the platform is silent, in
   * which case the purchase proceeds normally.
   */
  const claimIfAlreadyOwned = async (
    owns: (productIds: readonly string[]) => boolean,
  ): Promise<boolean> => {
    const { ok, productIds } = await restorePurchases();
    if (!ok || !owns(productIds)) return false;
    store.applyRestoredPurchases(productIds);
    trackEvent('purchase_already_owned', { productIds });
    return true;
  };

  const handlePurchaseStampText = async (stamp: StampText): Promise<boolean> => {
    if (!stamp.productId) return false;
    const productId = stamp.productId;
    if (await claimIfAlreadyOwned((ids) => ids.includes(productId))) return true;
    const ok = await trackPurchaseAttempt('stamp', stamp.id, productId, () =>
      purchaseProduct(productId),
    );
    if (ok) store.grantStampTextPurchase(stamp.id);
    return ok;
  };

  /**
   * What the player is charged right now. A running offer is a *separate*
   * Yandex product at a lower price — the same entitlement — so the buy call
   * has to follow the same id the Bureau just printed on the button.
   */
  const offerContext: OfferContext = { stats, serverDay };

  const handlePurchasePack = async (pack: ThematicPack): Promise<boolean> => {
    // A pack off the shelf carries no product id — there is nothing to charge.
    const productId = resolvePrice(pack, offerContext).productId;
    if (!productId) return false;
    // Any id that maps to this pack counts — regular or intro.
    const owned = await claimIfAlreadyOwned((ids) =>
      ids.some((id) => getThematicPackIdByProductId(id) === pack.id),
    );
    if (owned) return true;
    const ok = await trackPurchaseAttempt('archive', pack.id, productId, () =>
      purchaseProduct(productId),
    );
    if (ok) store.grantArchivePurchase(pack.id);
    return ok;
  };

  const handlePurchaseBundle = async (bundleId: string): Promise<boolean> => {
    const bundle = getBundle(bundleId);
    if (!bundle) return false;
    const productId = resolvePrice(bundle, offerContext).productId;
    if (!productId) return false;
    const owned = await claimIfAlreadyOwned((ids) =>
      ids.some((id) => getBundleByProductId(id)?.id === bundle.id),
    );
    if (owned) return true;
    const ok = await trackPurchaseAttempt('bundle', bundle.id, productId, () =>
      purchaseProduct(productId),
    );
    // The bundle grants its contents — a restore later re-grants them the same
    // way, so nothing about it is a one-off side effect of this click.
    if (ok) store.grantBundlePurchase(bundle.id);
    return ok;
  };

  const handlePurchaseNoAds = async (): Promise<boolean> => {
    const productId = GAME_CONFIG.advertising.noAdsProductId;
    if (await claimIfAlreadyOwned((ids) => ids.includes(productId))) return true;
    const ok = await trackPurchaseAttempt('noads', 'no_ads', productId, () =>
      purchaseProduct(productId),
    );
    if (ok) store.grantNoAds();
    return ok;
  };

  /**
   * `ok` distinguishes "the platform answered, and this player owns nothing"
   * from "we never reached the platform" — reporting both as "0 restored" is
   * what makes a player with real purchases believe they lost them.
   */
  const handleRestorePurchases = async (): Promise<{ ok: boolean; count: number }> => {
    trackEvent('purchase_restore_click', { paymentsAvailable: isPaymentsAvailable() });
    const { ok, productIds } = await restorePurchases();
    store.applyRestoredPurchases(productIds);
    trackEvent('purchase_restore_result', { ok, count: productIds.length, productIds });
    return { ok, count: productIds.length };
  };

  /**
   * The single forced-ad gate. Both exits from a finished case (next case /
   * back to desk) run through it: it counts the case that just ended, asks the
   * pacing policy, and — only when the ad is *actually shown* — restarts the
   * cooldown from that moment. A missing SDK or an ad error therefore never
   * costs the player their next eligible ad.
   */
  const closeFinishedCaseWithAdGate = (finishedCaseId: string | null, transition: () => void) => {
    // Count the case, not the click: both exits can fire for the same finished
    // case (e.g. synthesis → desk), and a double count would make ads *more*
    // frequent than "one per two cases".
    if (finishedCaseId === null || countedCaseIdRef.current !== finishedCaseId) {
      countedCaseIdRef.current = finishedCaseId;
      casesSinceLastInterstitialRef.current += 1;
    }
    const decision = evaluateInterstitial({
      completedCasesTotal: stats.completedCaseIds.length,
      activeMs: getAnalyticsActiveTotalMs(),
      lastShownActiveMs: lastShownInterstitialActiveMsRef.current,
      casesSinceLastAd: casesSinceLastInterstitialRef.current,
      noAds: stats.noAdsPurchased,
      archiveAdFree: finishedCaseId
        ? isPurchasedArchiveCase(finishedCaseId, stats.archivePurchasedPackIds)
        : false,
      config: getAdPolicyConfig(),
    });
    if (!decision.show) {
      transition();
      return;
    }
    showFullscreenAd(transition, 'verdict', () => {
      lastShownInterstitialActiveMsRef.current = getAnalyticsActiveTotalMs();
      casesSinceLastInterstitialRef.current = 0;
      store.recordInterstitialShown();
    });
  };

  const goToNextCase = () => {
    // Inside an archive, "next case" stays inside that archive. Falling back to
    // the campaign would silently drop the player out of the dossier they paid
    // for — the pack is the unit of play once you are in it.
    const next = activePack
      ? getNextArchiveCase(stats, activePack, selectedId, unlockByCaseId)
      : getNextAvailableCase(standardCaseUnlocks, selectedId);
    trackEvent('result_action', {
      caseId: lastResult?.caseId, action: 'next_case',
      resultDwellMs: resultOpenedAtRef.current == null ? null : Date.now() - resultOpenedAtRef.current,
      nextCaseAvailable: Boolean(next),
      packId: activePack?.id ?? null,
    });
    setResultDismissed(true);
    const packWhenFinished = activePack;
    const transition = () => void store.closeCase().then(() => {
      if (!next) {
        setSelectedId(null);
        // An exhausted archive leads to the Bureau, not the campaign desk:
        // whatever is left in this pack is behind the paywall, and that is
        // where it is opened.
        if (packWhenFinished) openBureau('archives');
        return;
      }
      handleSelectCase(next);
    });
    closeFinishedCaseWithAdGate(lastResult?.caseId ?? selectedId, transition);
  };

  const handleResultNext = () => {
    if (
      selectedCase?.finalSynthesis &&
      lastResult?.verdictCorrect &&
      !stats.finalSynthesisProgress?.[selectedCase.id]?.completed &&
      !stats.finalSynthesisProgress?.[selectedCase.id]?.skipped
    ) {
      setResultDismissed(true);
      setShowFinalSynthesis(true);
      return;
    }
    goToNextCase();
  };

  // Failed case → re-open the very same case with a clean session, so the player
  // can try again without a trip through the desk.
  const handleReplayCase = () => {
    if (!selectedCase) return;
    const caseToReplay = selectedCase;
    trackEvent('result_action', {
      caseId: lastResult?.caseId, action: 'replay_case',
      resultDwellMs: resultOpenedAtRef.current == null ? null : Date.now() - resultOpenedAtRef.current,
    });
    setResultDismissed(true);
    void store.closeCase().then(() => store.startCase(caseToReplay));
  };

  const backToDesk = () => {
    if (lastResult) trackEvent('result_action', {
      caseId: lastResult.caseId, action: 'desk',
      resultDwellMs: resultOpenedAtRef.current == null ? null : Date.now() - resultOpenedAtRef.current,
    });
    setResultDismissed(true);
    setSelectedId(null);
    const transition = () => void store.closeCase();
    // Leaving without a verdict (abandoning an investigation) never shows an ad.
    if (!lastResult) {
      transition();
      return;
    }
    closeFinishedCaseWithAdGate(lastResult.caseId, transition);
  };

  const gate = selectedCase
    ? selectCaseInvestigationGate(selectedCase, { session })
    : {
        canApprove: false,
        canReject: false,
        budget: null,
        opensRemaining: null,
        budgetExhausted: false,
      };

  const modalEvidence =
    selectedCase?.evidences.find((e) => e.id === modalEvidenceId) ?? null;

  // One sheet closes a case: reaction, разбор and reward together. The closing
  // line inside it stays behind a *correct* verdict — several confess indirectly.
  const showResult = !!lastResult && !resultDismissed && !!selectedCase;

  if (!isHydrated) {
    return (
      <div
        className={`theme-${FOLDER_LOOK} flex h-full items-center justify-center bg-bg text-text-muted`}
        onContextMenu={(event) => event.preventDefault()}
      >
        …
      </div>
    );
  }

  const bureauOpen = bureauTab !== null;

  return (
    <div
      className={`theme-${FOLDER_LOOK} flex min-h-full flex-col bg-bg md:h-full md:overflow-hidden`}
      // Set inline as well as in the effect below: effects run after paint, so a
      // returning blue-ink profile would otherwise flash one archive-red frame.
      style={
        {
          '--stamp-ink': getStampInkColor(stats.activeStampInkId),
        } as React.CSSProperties
      }
      onContextMenu={(event) => event.preventDefault()}
    >
      {/* Department letterhead — the one chrome shared by the desk and the Bureau */}
      <TopBar
        lang={lang}
        xp={stats.xp}
        balance={stats.balance}
        bureauOpen={bureauOpen}
        // NEW means "you have not discovered this yet", not "you have not paid
        // yet": it clears as soon as the player engages with the Bureau at all
        // (a free sample counts), so it can never become permanent decoration.
        bureauHasNews={
          stats.archivePurchasedPackIds.length === 0 &&
          !stats.completedCaseIds.some((caseId) =>
            THEMATIC_PACKS.some((pack) =>
              getThematicPackCaseIds(pack).includes(caseId),
            ),
          )
        }
        onOpenInvestigation={() => setBureauTab(null)}
        onOpenBureau={() => openBureau('archives')}
        onRestorePurchases={handleRestorePurchases}
        paymentsAvailable={isPaymentsAvailable()}
      />

      {/* The Bureau takes over the whole workspace below the letterhead — it is
          a destination the top bar links to, not a modal over the case.
          Deliberately NOT wrapped in <AnimatePresence>: the desk below is
          revealed the instant `bureauOpen` flips, so an exiting Bureau would
          still hold its full height in this column for the length of the fade
          and then collapse — the whole investigation screen would jump up. */}
      {bureauOpen && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <BureauScreen
              key="bureau"
              lang={lang}
              stats={stats}
              caseUnlocks={standardCaseUnlocks}
              paymentsAvailable={isPaymentsAvailable()}
              catalogByProductId={paymentsCatalog}
              initialTab={bureauTab ?? 'archives'}
              onSelectCase={(summary) => {
                setBureauTab(null);
                void openCase(summary, { skipStandardGate: true, sourceSurface: 'archive' });
              }}
              onPurchasePack={handlePurchasePack}
              onPurchaseStampText={handlePurchaseStampText}
              onPurchaseBundle={handlePurchaseBundle}
              onPurchaseNoAds={handlePurchaseNoAds}
              onEquipStampText={(stampTextId) => {
                trackEvent('stamp_equip', {
                  stampTextId: stampTextId ?? DEFAULT_STAMP_TEXT_ID,
                });
                store.setActiveStampText(stampTextId);
              }}
              onPickStampInk={(stampInkId) => {
                trackEvent('stamp_ink_pick', { inkId: stampInkId ?? DEFAULT_STAMP_INK_ID });
                store.setActiveStampInk(stampInkId);
              }}
              onUnlockCaseWithAd={store.unlockArchiveCaseViaAd}
              onTabSwitch={(from, to) => {
                trackGoal(GOAL.tabSwitch, { surface: 'bureau', from, to });
                trackGoal(GOAL.shopView, {
                  shop: to === 'stamps' ? 'stamp_texts' : to === 'bundles' ? 'bundles' : 'special_archives',
                });
              }}
              onViewPack={(packId, source) =>
                trackGoal(GOAL.productView, {
                  kind: 'archive',
                  packId,
                  source,
                  purchased: stats.archivePurchasedPackIds.includes(packId),
                })
              }
              onLockedStampClick={(stampTextId, packId) =>
                trackEvent('stamp_pack_locked_click', { stampTextId, packId })
              }
              onClose={() => setBureauTab(null)}
            />
          </div>
      )}

      <div className={bureauOpen ? 'hidden' : 'contents'}>
      {/* Mobile-only grouped desk menu (replaces sidebar + folder grid on small screens) */}
      {mobileDeskMenuShown && (
        <div className="md:hidden">
          <MobileDeskMenu
            standardCaseUnlocks={standardCaseUnlocks}
            dailyCase={dailyCase}
            dailyUnlocked={daily.unlocked}
            dailyMsRemaining={daily.msUntilUnlock}
            lang={lang}
            balance={stats.balance}
            results={stats.results}
            onSelectStandardCase={handleSelectStandardCase}
            onSelect={handleSelectCase}
            onDailyLocked={onDailyLocked}
            onLanguage={store.setLanguage}
            activeStampTextId={stats.activeStampTextId}
            onOpenStampShop={openStampShop}
            archivesSlot={
              <SpecialArchivesEntry
                lang={lang}
                stats={stats}
                caseUnlocks={standardCaseUnlocks}
                onOpen={openArchives}
                compact
              />
            }
          />
        </div>
      )}

      {/* Desktop 3-column layout; also used on mobile when a case is open */}
      <div className={`flex flex-col gap-4 p-4 md:min-h-0 md:flex-1 md:flex-row ${mobileDeskMenuShown ? 'hidden md:flex' : 'flex'}`}>
        {/* Left desk column. Visible from `md` up regardless of onboarding: the
            game now boots straight into a case, so gating the columns on
            `metaUnlocked` left the whole onboarding chain without side panels. */}
        <div className="hidden md:order-1 md:block md:h-full md:w-[272px] md:shrink-0">
          <LeftSidebar
            standardCaseUnlocks={standardCaseUnlocks}
            dailyCase={dailyCase}
            dailyUnlocked={daily.unlocked}
            dailyMsRemaining={daily.msUntilUnlock}
            selectedId={selectedId}
            lang={lang}
            xp={stats.xp}
            archivePack={activePack}
            archiveCases={activePackCases}
            onSelectStandardCase={handleSelectStandardCase}
            onSelectArchiveCase={(entry) => handleSelectCase(entry.caseData)}
            onLeaveArchive={backToDesk}
            onSelect={handleSelectCase}
            onDailyLocked={onDailyLocked}
            onLanguage={store.setLanguage}
          />
        </div>

        {/* Main folder */}
        <main className="order-1 flex flex-1 items-start justify-center md:order-2 md:h-full md:overflow-y-auto md:px-1">
          {selectedCase ? (
            <CaseFile
              caseData={selectedCase}
              session={session}
              lang={lang}
              canApprove={gate.canApprove}
              canReject={gate.canReject}
              budget={gate.budget}
              opensRemaining={gate.opensRemaining}
              budgetExhausted={gate.budgetExhausted}
              balance={stats.balance}
              stampTextId={stats.activeStampTextId}
              onOpenEvidence={handleOpenEvidence}
              onBuyHint={(kind, targetEvidenceId) =>
                store.buyHint(selectedCase, kind, targetEvidenceId)
              }
              onApprove={handleApprove}
              onReject={handleReject}
              onBackToDesk={onboardingLocked ? undefined : backToDesk}
              onTabSwitch={(from, to) => trackGoal(GOAL.tabSwitch, { caseId: selectedCase.id, from, to })}
            />
          ) : (
            <CaseSelect
              standardCaseUnlocks={standardCaseUnlocks}
              dailyCase={dailyCase}
              dailyUnlocked={daily.unlocked}
              dailyMsRemaining={daily.msUntilUnlock}
              lang={lang}
              onSelectStandardCase={handleSelectStandardCase}
              onSelect={handleSelectCase}
              onDailyLocked={onDailyLocked}
            />
          )}
        </main>

        {/* Right analytics column */}
        <div className="hidden md:order-3 md:block md:h-full md:w-[272px] md:shrink-0">
          <RightSidebar
            lang={lang}
            xp={stats.xp}
            balance={stats.balance}
            accuracyPct={accuracyPct}
            solvedCount={stats.completedCaseIds.length}
            errorsCount={errorsCount}
            streak={stats.streakCount}
            perfectStreak={stats.perfectCaseStreakCount}
            unlockedAchievementIds={stats.unlockedAchievementIds}
            onOpenAchievements={() => setShowAchievements(true)}
            activeStampTextId={stats.activeStampTextId}
            onOpenStampShop={openStampShop}
            leaderboard={leaderboard}
            archivesSlot={
              <SpecialArchivesEntry
                lang={lang}
                stats={stats}
                caseUnlocks={standardCaseUnlocks}
                onOpen={openArchives}
              />
            }
          />
        </div>
      </div>
      </div>

      {/* Evidence stamping modal */}
      <StampModal
        evidence={modalEvidence}
        lang={lang}
        stamped={session?.selectedEvidenceIds.includes(modalEvidenceId ?? '') ?? false}
        revealed={session?.revealedEvidenceIds.includes(modalEvidenceId ?? '') ?? false}
        stampTextId={stats.activeStampTextId}
        interactiveProgress={modalEvidence && selectedCase
          ? stats.interactiveEvidenceProgress?.[`${selectedCase.id}/${modalEvidence.id}`]
          : undefined}
        onInteractiveProgress={(progress) => {
          if (selectedCase && modalEvidence) store.updateInteractiveProgress(selectedCase, modalEvidence.id, progress);
        }}
        position={modalEvidence ? selectedCase?.evidences.findIndex((item) => item.id === modalEvidence.id) ?? -1 : -1}
        total={selectedCase?.evidences.length ?? 0}
        onNavigate={handleNavigateEvidence}
        onToggle={() => modalEvidenceId && selectedCase && store.toggleEvidenceStamp(modalEvidenceId, selectedCase)}
        onClose={handleCloseEvidence}
      />

      {/* The single closing sheet: reaction, разбор and reward in one modal */}
      <AnimatePresence>
        {showResult && lastResult && selectedCase && (
          <ResultSheet
            result={lastResult}
            caseData={selectedCase}
            lang={lang}
            xpGained={lastResult.xpGained}
            promotedToLevel={lastResult.promotedToLevel}
            newAchievementIds={lastResult.newAchievementIds}
            streakCount={stats.streakCount}
            onMounted={() => undefined}
            onDoubleReward={handleDoubleReward}
            rewardDoubled={rewardDoubled || lastResult.rewardDoubled}
            onRevealClue={handleRevealClue}
            clueRevealed={Boolean(stats.caseClueReveals[selectedCase.id])}
            onNext={handleResultNext}
            onReplay={handleReplayCase}
            onBackToDesk={backToDesk}
            hideBack={onboardingLocked}
          />
        )}
      </AnimatePresence>

      {showFinalSynthesis && selectedCase?.finalSynthesis && (
        <EvidenceLinkBoard
          config={selectedCase.finalSynthesis}
          caseData={selectedCase}
          progress={stats.finalSynthesisProgress?.[selectedCase.id]}
          lang={lang}
          onAttempt={(links, correct) => store.completeFinalSynthesis(selectedCase, links, false, correct)}
          onSkip={(links) => {
            store.completeFinalSynthesis(selectedCase, links, true, false);
            setShowFinalSynthesis(false);
            backToDesk();
          }}
          onComplete={() => {
            setShowFinalSynthesis(false);
            backToDesk();
          }}
        />
      )}

      {/* Achievements archive */}
      <AnimatePresence>
        {showAchievements && (
          <AchievementsModal
            lang={lang}
            unlockedIds={stats.unlockedAchievementIds}
            onClose={() => setShowAchievements(false)}
          />
        )}
      </AnimatePresence>

      {/* Rating prompt */}
      <AnimatePresence>
        {showRating && (
          <RatingModal
            lang={lang}
            onRate={async () => { trackGoal(GOAL.rating, { action: 'rate' }); await requestReview(); }}
            onDismiss={() => { store.dismissRating(); setShowRating(false); }}
            onNever={() => { store.suppressRating(); setShowRating(false); }}
            onRated={() => setShowRating(false)}
          />
        )}
      </AnimatePresence>

      {/* App-level toast (daily lock, etc.) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className={`fixed left-1/2 z-[60] max-w-[86%] -translate-x-1/2 rounded-[9px] border border-stamp bg-toast px-[18px] py-3 text-center text-[13px] font-medium leading-snug text-toast-ink shadow-lift md:bottom-[22px] ${modalEvidence ? "bottom-[136px]" : selectedCase ? "bottom-[104px]" : "bottom-[22px]"}`}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low-balance offer → voluntary rewarded-ad top-up (never blocks play) */}
      <AnimatePresence>
        {showLowBalanceOffer && !showResult && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="fixed bottom-[70px] left-1/2 z-[55] w-[92%] max-w-md -translate-x-1/2"
          >
            <div className="paper-sheet flex items-center gap-3 p-4 shadow-lift">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-ink">{t('lowBalanceTitle', lang)}</div>
                <div className="mt-0.5 text-xs leading-snug text-ink/70">
                  {t('lowBalanceDesc', lang)}
                </div>
              </div>
              <button
                type="button"
                onClick={store.restoreFunds}
                className="h-12 shrink-0 rounded-[9px] bg-accent px-4 text-sm font-semibold text-white hover:brightness-110"
              >
                ▶ {t('restoreFunds', lang)} (₽{GAME_CONFIG.economy.restoreFundsTo})
              </button>
              <button
                type="button"
                aria-label={t('close', lang)}
                onClick={() => setLowBalanceOfferDismissed(true)}
                className="flex h-12 w-10 shrink-0 items-center justify-center rounded-[9px] text-lg text-ink/50 hover:text-ink"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad pause guard overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 text-text-muted">
          ⏸
        </div>
      )}
    </div>
  );
}
