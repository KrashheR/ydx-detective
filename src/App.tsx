import { useEffect, useMemo, useState } from 'react';
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
import { evaluateDailyAvailability } from './engine/rewardEngine';
import {
  getServerTimeMs,
  fetchLeaderboard,
  type LeaderboardRow,
} from './services/yandexSDK';
import { GAME_CONFIG } from './config/gameConfig';
import { RTL_LANGUAGES, t } from './i18n/ui';
import type { Case } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { CaseFile } from './components/CaseFile';
import { CaseSelect } from './components/CaseSelect';
import { StampModal } from './components/StampModal';
import { ResultSheet } from './components/ResultSheet';
import { AchievementsModal } from './components/AchievementsModal';
import { formatCountdown } from './components/icons';

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

  const flashToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3800);
  };

  // Boot the engine once: SDK init → pause-guard wiring → cloud/local hydrate.
  useEffect(() => {
    void store.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Document direction + lang follow the active language (RTL for Arabic).
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  // Resume an in-progress session after hydration so quitting mid-case restores.
  useEffect(() => {
    if (isHydrated && session && !selectedId) setSelectedId(session.caseId);
  }, [isHydrated, session, selectedId]);

  // A fresh verdict re-opens the result sheet.
  useEffect(() => {
    if (lastResult) setResultDismissed(false);
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
  // Rotate the daily pool by server-day. Server time only (see CLAUDE.md).
  const serverNow = getServerTimeMs();
  const serverDay = Math.floor(serverNow / GAME_CONFIG.daily.cooldownMs);
  const dailyCase = useMemo(() => getDailyCase(serverDay), [serverDay]);
  const selectedCase = selectedId ? getCaseById(selectedId) : undefined;

  const daily = evaluateDailyAvailability(
    stats.lastDailyClaimServerMs,
    serverNow,
  );

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

  const handleSelectCase = (c: Case) => {
    setSelectedId(c.id);
    store.startCase(c);
  };

  const handleOpenEvidence = (id: string) => {
    store.markEvidenceAsViewed(id);
    setModalEvidenceId(id);
  };

  const handleApprove = () => {
    if (selectedCase) store.submitVerdict(selectedCase, 'approve');
  };

  /** Returns false (→ show prompt) when rejecting without any stamped proof. */
  const handleReject = (): boolean => {
    if (!selectedCase) return true;
    if ((session?.selectedEvidenceIds.length ?? 0) === 0) return false;
    store.submitVerdict(selectedCase, 'reject');
    return true;
  };

  const onDailyLocked = () =>
    flashToast(`${t('returnsIn', lang)} ${formatCountdown(daily.msUntilUnlock)}`);

  const goToNextCase = () => {
    const ordered = [...standardCases, ...(dailyCase ? [dailyCase] : [])];
    const idx = ordered.findIndex((c) => c.id === selectedId);
    const next = ordered[(idx + 1) % ordered.length];
    setResultDismissed(true);
    void store.closeCase().then(() => next && handleSelectCase(next));
  };

  const backToDesk = () => {
    setResultDismissed(true);
    setSelectedId(null);
    void store.closeCase();
  };

  const gate = selectedCase
    ? selectCaseInvestigationGate(selectedCase, { session })
    : { canApprove: false, canReject: false };

  const modalEvidence =
    selectedCase?.evidences.find((e) => e.id === modalEvidenceId) ?? null;

  const showResult = !!lastResult && !resultDismissed && !!selectedCase;

  if (!isHydrated) {
    return (
      <div className={`theme-${FOLDER_LOOK} flex h-full items-center justify-center bg-bg text-text-muted`}>
        …
      </div>
    );
  }

  return (
    <div className={`theme-${FOLDER_LOOK} min-h-full bg-bg md:h-full md:overflow-hidden`}>
      <div className="flex flex-col gap-4 p-4 md:h-full md:flex-row">
        {/* Left desk column */}
        <div className="order-2 md:order-1 md:h-full md:w-[272px] md:shrink-0">
          <LeftSidebar
            standardCases={standardCases}
            dailyCase={dailyCase}
            dailyUnlocked={daily.unlocked}
            dailyMsRemaining={daily.msUntilUnlock}
            selectedId={selectedId}
            completedIds={stats.completedCaseIds}
            lang={lang}
            xp={stats.xp}
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
              balance={stats.balance}
              onOpenEvidence={handleOpenEvidence}
              onBuyHint={(kind) => store.buyHint(selectedCase, kind)}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ) : (
            <CaseSelect
              standardCases={standardCases}
              dailyCase={dailyCase}
              dailyUnlocked={daily.unlocked}
              dailyMsRemaining={daily.msUntilUnlock}
              lang={lang}
              onSelect={handleSelectCase}
              onDailyLocked={onDailyLocked}
            />
          )}
        </main>

        {/* Right analytics column */}
        <div className="order-3 md:h-full md:w-[272px] md:shrink-0">
          <RightSidebar
            lang={lang}
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
        onToggle={() => modalEvidenceId && store.toggleEvidenceStamp(modalEvidenceId)}
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
            promotedToRankId={lastResult.promotedToRankId}
            newAchievementIds={lastResult.newAchievementIds}
            onMounted={() => undefined}
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

      {/* App-level toast (daily lock, etc.) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="fixed bottom-[22px] left-1/2 z-[60] max-w-[86%] -translate-x-1/2 rounded-[9px] border border-stamp bg-surface-2 px-[18px] py-3 text-center text-[13px] font-medium leading-snug text-[#fee2e2] shadow-lift"
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
