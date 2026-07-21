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
import {
  getServerTimeMs,
  fetchLeaderboard,
  showFullscreenAd,
  showRewardedAd,
  trackAdOffer,
  canReview,
  requestReview,
  isPaymentsAvailable,
  fetchPaymentsCatalog,
  purchaseProduct,
  restorePurchasedProductIds,
  notifyGameplayStart,
  notifyGameplayStop,
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
  type ThematicPack,
} from './data/thematicPacks';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { CaseFile } from './components/CaseFile';
import { CaseSelect } from './components/CaseSelect';
import { MobileDeskMenu } from './components/MobileDeskMenu';
import { StampModal } from './components/StampModal';
import { ResultSheet } from './components/ResultSheet';
import { AchievementsModal } from './components/AchievementsModal';
import { RatingModal } from './components/RatingModal';
import { ThematicPacksModal } from './components/ThematicPacksModal';
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
  const [showSpecialArchives, setShowSpecialArchives] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rewardDoubled, setRewardDoubled] = useState(false);
  const [lowBalanceOfferDismissed, setLowBalanceOfferDismissed] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showFinalSynthesis, setShowFinalSynthesis] = useState(false);
  const [archiveCatalog, setArchiveCatalog] = useState<Record<string, PaymentsProduct>>({});
  const lastInterstitialActiveMsRef = useRef(0);
  // Gate: show rating modal at most once per session.
  const ratingShownRef = useRef(false);
  // Gate: fire `reject_blocked` at most once per case investigation.
  const rejectBlockedCaseIdRef = useRef<string | null>(null);
  const evidenceOpenedAtRef = useRef<{ id: string; openedAt: number } | null>(null);
  const resultOpenedAtRef = useRef<number | null>(null);
  const deskViewedRef = useRef(false);

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

  useEffect(() => {
    if (!showSpecialArchives) return;
    trackGoal(GOAL.shopView, { surface: 'special_archives' });
    if (!isPaymentsAvailable()) {
      setArchiveCatalog({});
      return;
    }
    let active = true;
    void fetchPaymentsCatalog().then((products) => {
      if (!active) return;
      setArchiveCatalog(
        Object.fromEntries(products.map((product) => [product.id, product])),
      );
    });
    return () => {
      active = false;
    };
  }, [showSpecialArchives]);

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

  const openCase = async (
    summary: CaseSummary,
    opts?: { skipStandardGate?: boolean },
  ) => {
    if (summary.type === 'standard' && !opts?.skipStandardGate) {
      const unlock = standardCaseUnlocks.find((info) => info.caseData.id === summary.id);
      const isResumingActiveCase = session?.caseId === summary.id;
      if (unlock && !isCaseUnlocked(unlock) && !isResumingActiveCase) {
        flashToast(formatLockedCaseMessage(unlock));
        return;
      }
    }

    trackEvent('case_card_click', {
      caseId: summary.id,
      caseType: summary.type,
      campaignPosition: summary.campaignOrder ?? null,
      sourceSurface: opts?.skipStandardGate ? 'archive' : 'desk',
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

  const onboardingLocked = !stats.metaUnlocked;

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

  const handleSelectArchiveCase = (c: CaseSummary) => {
    setShowSpecialArchives(false);
    void openCase(c, { skipStandardGate: true });
  };

  const handlePurchaseArchive = async (pack: ThematicPack): Promise<boolean> => {
    trackGoal(GOAL.productView, { productId: pack.productId, archiveId: pack.id });
    const purchased = await purchaseProduct(pack.productId);
    if (purchased) store.grantArchivePurchase(pack.id);
    return purchased;
  };

  const handleRestoreArchivePurchases = async (): Promise<number> => {
    const purchasedProductIds = await restorePurchasedProductIds();
    const packIds = THEMATIC_PACKS
      .filter((pack) => purchasedProductIds.includes(pack.productId))
      .map((pack) => pack.id);
    store.grantArchivePurchases(packIds);
    return packIds.length;
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

  const handleDoubleReward = () => {
    trackEvent('result_action', {
      caseId: lastResult?.caseId, action: 'double_reward',
      resultDwellMs: resultOpenedAtRef.current == null ? null : Date.now() - resultOpenedAtRef.current,
    });
    showRewardedAd(() => {
      store.doubleLastReward();
      setRewardDoubled(true);
    }, 'double_reward');
  };

  const onDailyLocked = () => {
    if (adDailyCase) store.unlockDailyViaAd(adDailyCase.id);
  };

  const goToNextCase = () => {
    const next = getNextAvailableCase(standardCaseUnlocks, selectedId);
    trackEvent('result_action', {
      caseId: lastResult?.caseId, action: 'next_case',
      resultDwellMs: resultOpenedAtRef.current == null ? null : Date.now() - resultOpenedAtRef.current,
      nextCaseAvailable: Boolean(next),
    });
    setResultDismissed(true);
    const transition = () => void store.closeCase().then(() => {
      if (!next) {
        setSelectedId(null);
        return;
      }
      handleSelectCase(next);
    });
    const activeMs = getAnalyticsActiveTotalMs();
    if (
      stats.completedCaseIds.length >= GAME_CONFIG.advertising.interstitialMinCompletedCases &&
      activeMs - lastInterstitialActiveMsRef.current >= GAME_CONFIG.advertising.interstitialMinActiveMs
    ) {
      lastInterstitialActiveMsRef.current = activeMs;
      showFullscreenAd(transition, 'verdict', () => store.recordInterstitialShown());
    } else transition();
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

  const backToDesk = () => {
    if (lastResult) trackEvent('result_action', {
      caseId: lastResult.caseId, action: 'desk',
      resultDwellMs: resultOpenedAtRef.current == null ? null : Date.now() - resultOpenedAtRef.current,
    });
    setResultDismissed(true);
    setSelectedId(null);
    const transition = () => void store.closeCase();
    const activeMs = getAnalyticsActiveTotalMs();
    if (
      lastResult &&
      stats.completedCaseIds.length >= GAME_CONFIG.advertising.interstitialMinCompletedCases &&
      activeMs - lastInterstitialActiveMsRef.current >= GAME_CONFIG.advertising.interstitialMinActiveMs
    ) {
      lastInterstitialActiveMsRef.current = activeMs;
      showFullscreenAd(transition, 'verdict', () => store.recordInterstitialShown());
    } else transition();
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

  return (
    <div
      className={`theme-${FOLDER_LOOK} min-h-full bg-bg md:h-full md:overflow-hidden`}
      onContextMenu={(event) => event.preventDefault()}
    >
      {/* Mobile-only grouped desk menu (replaces sidebar + folder grid on small screens) */}
      {!selectedCase && !onboardingLocked && (
        <div className="md:hidden">
          <MobileDeskMenu
            standardCaseUnlocks={standardCaseUnlocks}
            dailyCase={dailyCase}
            dailyUnlocked={daily.unlocked}
            dailyMsRemaining={daily.msUntilUnlock}
            lang={lang}
            balance={stats.balance}
            archiveStats={stats}
            results={stats.results}
            onSelectStandardCase={handleSelectStandardCase}
            onSelect={handleSelectCase}
            onDailyLocked={onDailyLocked}
            onLanguage={store.setLanguage}
            onOpenSpecialArchives={() => setShowSpecialArchives(true)}
          />
        </div>
      )}

      {/* Desktop 3-column layout; also used on mobile when a case is open */}
      <div className={`flex flex-col gap-4 p-4 md:h-full md:flex-row ${!selectedCase ? 'hidden md:flex' : 'flex'}`}>
        {/* Left desk column */}
        <div className={`${onboardingLocked ? 'hidden' : 'hidden md:order-1 md:block'} md:h-full md:w-[272px] md:shrink-0`}>
          <LeftSidebar
            standardCaseUnlocks={standardCaseUnlocks}
            dailyCase={dailyCase}
            dailyUnlocked={daily.unlocked}
            dailyMsRemaining={daily.msUntilUnlock}
            selectedId={selectedId}
            lang={lang}
            xp={stats.xp}
            archiveStats={stats}
            onSelectStandardCase={handleSelectStandardCase}
            onSelect={handleSelectCase}
            onDailyLocked={onDailyLocked}
            onLanguage={store.setLanguage}
            onOpenSpecialArchives={() => setShowSpecialArchives(true)}
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
        <div className={`${onboardingLocked ? 'hidden' : 'hidden md:order-3 md:block'} md:h-full md:w-[272px] md:shrink-0`}>
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
            leaderboard={leaderboard}
          />
        </div>
      </div>

      {/* Evidence stamping modal */}
      <StampModal
        evidence={modalEvidence}
        lang={lang}
        stamped={session?.selectedEvidenceIds.includes(modalEvidenceId ?? '') ?? false}
        revealed={session?.revealedEvidenceIds.includes(modalEvidenceId ?? '') ?? false}
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

      {/* Result sheet */}
      <AnimatePresence>
        {showResult && lastResult && selectedCase && (
          <ResultSheet
            result={lastResult}
            caseData={selectedCase}
            lang={lang}
            xpGained={lastResult.xpGained}
            promotedToLevel={lastResult.promotedToLevel}
            newAchievementIds={lastResult.newAchievementIds}
            onMounted={() => undefined}
            onDoubleReward={handleDoubleReward}
            rewardDoubled={rewardDoubled}
            onNext={handleResultNext}
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

      {/* Special archives prototype shelf */}
      <AnimatePresence>
        {showSpecialArchives && (
          <ThematicPacksModal
            lang={lang}
            stats={stats}
            caseUnlocks={standardCaseUnlocks}
            paymentsAvailable={isPaymentsAvailable()}
            catalogByProductId={archiveCatalog}
            onSelectCase={handleSelectArchiveCase}
            onPurchasePack={handlePurchaseArchive}
            onRestorePurchases={handleRestoreArchivePurchases}
            onUnlockCaseWithAd={(packId, caseId) => store.unlockArchiveCaseViaAd(packId, caseId)}
            onClose={() => setShowSpecialArchives(false)}
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
