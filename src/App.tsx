import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getDailyCase,
  getStandardCases,
  getCaseById,
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
  type LeaderboardRow,
} from './services/yandexSDK';
import { GOAL, getAnalyticsActiveTotalMs, trackGoal } from './services/metrica';
import { GAME_CONFIG } from './config/gameConfig';
import { RTL_LANGUAGES, t } from './i18n/ui';
import type { Case } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { CaseFile } from './components/CaseFile';
import { CaseSelect } from './components/CaseSelect';
import { MobileDeskMenu } from './components/MobileDeskMenu';
import { StampModal } from './components/StampModal';
import { ResultSheet } from './components/ResultSheet';
import { AchievementsModal } from './components/AchievementsModal';
import { RatingModal } from './components/RatingModal';
import { formatCountdown } from './components/icons';
import { formatCaseLockMessage } from './utils/caseDisplay';

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rewardDoubled, setRewardDoubled] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const lastInterstitialActiveMsRef = useRef(0);
  // Gate: show rating modal at most once per session.
  const ratingShownRef = useRef(false);

  const flashToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3800);
  };

  // Boot the engine once: SDK init → pause-guard wiring → cloud/local hydrate.
  useEffect(() => {
    void store.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    }
  }, [lastResult]);

  useEffect(() => {
    if (stats.isBankrupt) trackAdOffer('rewarded', 'restore_funds');
  }, [stats.isBankrupt]);

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

  // Pull the live leaderboard after hydration and whenever the balance changes.
  useEffect(() => {
    if (!isHydrated) return;
    let active = true;
    void fetchLeaderboard().then((rows) => {
      if (active) setLeaderboard(rows);
    });
    return () => {
      active = false;
    };
  }, [isHydrated, stats.balance]);

  const standardCases = useMemo(() => getStandardCases(), []);
  const standardCaseUnlocks = useMemo(
    () => evaluateCaseUnlocks(standardCases, stats),
    [standardCases, stats],
  );
  // Rotate the daily pool by server-day. Server time only (see CLAUDE.md).
  // State-driven so the countdown timer re-renders every second.
  const [serverNow, setServerNow] = useState(() => getServerTimeMs());
  useEffect(() => {
    const id = window.setInterval(() => setServerNow(getServerTimeMs()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const serverDay = Math.floor(serverNow / GAME_CONFIG.daily.cooldownMs);
  const baseDailyCase = useMemo(() => getDailyCase(serverDay), [serverDay]);
  const adDailyCase = useMemo(
    () => getDailyCase(serverDay + 1),
    [serverDay],
  );
  const dailyCase = stats.dailyAdUnlockServerDay === serverDay && stats.dailyAdCaseId
    ? getCaseById(stats.dailyAdCaseId) ?? baseDailyCase
    : baseDailyCase;
  const selectedCase = selectedId ? getCaseById(selectedId) : undefined;

  const daily = evaluateDailyAvailability(
    stats.lastDailyClaimServerMs,
    serverNow,
  );

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

  const formatLockedCaseMessage = (info: CaseUnlockInfo): string =>
    formatCaseLockMessage(info, lang);

  const handleSelectCase = (c: Case) => {
    if (c.type === 'standard') {
      const unlock = standardCaseUnlocks.find((info) => info.caseData.id === c.id);
      const isResumingActiveCase = session?.caseId === c.id;
      if (unlock && !isCaseUnlocked(unlock) && !isResumingActiveCase) {
        flashToast(formatLockedCaseMessage(unlock));
        return;
      }
    }

    setSelectedId(c.id);
    store.startCase(c);
    trackGoal(GOAL.serviceView, { caseId: c.id, service: 'inspector_note' });
    trackGoal(GOAL.serviceView, { caseId: c.id, service: 'witness_canvass' });
    trackAdOffer('rewarded', 'witness_canvass');
  };

  const handleSelectStandardCase = (info: CaseUnlockInfo) => {
    if (!isCaseUnlocked(info)) {
      flashToast(formatLockedCaseMessage(info));
      return;
    }
    handleSelectCase(info.caseData);
  };

  const handleOpenEvidence = (id: string) => {
    if (!selectedCase) return;
    // On budgeted cases, opening a *new* card may be refused once the budget is
    // spent. Re-opening an already-viewed card always succeeds.
    const opened = store.markEvidenceAsViewed(id, selectedCase);
    if (!opened) {
      flashToast(t('budgetExhausted', lang));
      return;
    }
    setModalEvidenceId(id);
  };

  const submitWithAdGate = (decision: 'approve' | 'reject') => {
    if (!selectedCase) return;
    store.submitVerdict(selectedCase, decision);
  };

  const handleApprove = () => submitWithAdGate('approve');

  /** Returns false (→ show prompt) when rejecting without any stamped proof. */
  const handleReject = (): boolean => {
    if (!selectedCase) return true;
    if ((session?.selectedEvidenceIds.length ?? 0) === 0) return false;
    submitWithAdGate('reject');
    return true;
  };

  const handleDoubleReward = () => {
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
      showFullscreenAd(transition, 'verdict');
    } else transition();
  };

  const backToDesk = () => {
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
      showFullscreenAd(transition, 'verdict');
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
      {!selectedCase && (
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
          />
        </div>
      )}

      {/* Desktop 3-column layout; also used on mobile when a case is open */}
      <div className={`flex flex-col gap-4 p-4 md:h-full md:flex-row ${!selectedCase ? 'hidden md:flex' : 'flex'}`}>
        {/* Left desk column */}
        <div className="order-2 md:order-1 md:h-full md:w-[272px] md:shrink-0">
          <LeftSidebar
            standardCaseUnlocks={standardCaseUnlocks}
            dailyCase={dailyCase}
            dailyUnlocked={daily.unlocked}
            dailyMsRemaining={daily.msUntilUnlock}
            selectedId={selectedId}
            lang={lang}
            xp={stats.xp}
            onSelectStandardCase={handleSelectStandardCase}
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
              onOpenEvidence={handleOpenEvidence}
              onBuyHint={(kind) => store.buyHint(selectedCase, kind)}
              onApprove={handleApprove}
              onReject={handleReject}
              onBackToDesk={backToDesk}
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
        <div className="order-3 md:h-full md:w-[272px] md:shrink-0">
          <RightSidebar
            lang={lang}
            xp={stats.xp}
            balance={stats.balance}
            accuracyPct={accuracyPct}
            solvedCount={stats.completedCaseIds.length}
            errorsCount={errorsCount}
            streak={stats.streakCount}
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
        theses={selectedCase?.claimTheses}
        linkedThesisId={modalEvidenceId ? session?.evidenceThesisLinks[modalEvidenceId] : undefined}
        onToggle={(thesisId) => modalEvidenceId && store.toggleEvidenceStamp(modalEvidenceId, thesisId)}
        onClose={() => setModalEvidenceId(null)}
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
            onNext={goToNextCase}
            onBackToDesk={backToDesk}
          />
        )}
      </AnimatePresence>

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
            className="fixed bottom-[22px] left-1/2 z-[60] max-w-[86%] -translate-x-1/2 rounded-[9px] border border-stamp bg-[#2b2018] px-[18px] py-3 text-center text-[13px] font-medium leading-snug text-[#fee2e2] shadow-lift"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bankruptcy gate → rewarded-ad restore */}
      {stats.isBankrupt && !showResult && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-5"
          style={{ background: 'rgba(8,11,17,.8)' }}
        >
          <div className="paper-sheet w-full max-w-sm p-6 text-center">
            <h2 className="text-xl font-bold text-ink">{t('bankruptTitle', lang)}</h2>
            <p className="mt-2 text-sm text-ink/70">{t('bankruptDesc', lang)}</p>
            <button
              type="button"
              onClick={store.restoreFunds}
              className="mt-5 h-12 w-full rounded-[9px] bg-accent font-semibold text-white hover:brightness-110"
            >
              ▶ {t('restoreFunds', lang)} (₽{GAME_CONFIG.economy.restoreFundsTo})
            </button>
          </div>
        </div>
      )}

      {/* Ad pause guard overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 text-text-muted">
          ⏸
        </div>
      )}
    </div>
  );
}
