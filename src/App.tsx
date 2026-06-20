import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
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
import { StampModal } from './components/StampModal';
import { ResultSheet } from './components/ResultSheet';

export default function App() {
  const store = useGameStore();
  const { stats, session, isPaused, isHydrated, lastResult } = store;
  const lang = stats.language;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalEvidenceId, setModalEvidenceId] = useState<string | null>(null);
  const [resultDismissed, setResultDismissed] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[] | null>(null);

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

  // Pull the live leaderboard after hydration and whenever the balance changes
  // (a new score has just been submitted). Null result → UI falls back locally.
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
  // Rotate the daily pool by server-day so a different case surfaces each day.
  // Server time only — never the device clock (see CLAUDE.md daily gating rule).
  const serverNow = getServerTimeMs();
  const serverDay = Math.floor(serverNow / GAME_CONFIG.daily.cooldownMs);
  const dailyCase = useMemo(() => getDailyCase(serverDay), [serverDay]);
  const selectedCase = selectedId ? getCaseById(selectedId) : undefined;

  const daily = evaluateDailyAvailability(
    stats.lastDailyClaimServerMs,
    serverNow,
  );

  const accuracyPct = useMemo(() => {
    const results = Object.values(stats.results);
    if (results.length === 0) return 0;
    const correct = results.filter((r) => r.verdictCorrect).length;
    return Math.round((correct / results.length) * 100);
  }, [stats.results]);

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
      <div className="flex h-full items-center justify-center text-paper/60">
        …
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Left desk column */}
      <div className="order-2 md:order-1 md:w-[280px] md:shrink-0">
        <LeftSidebar
          standardCases={standardCases}
          dailyCase={dailyCase}
          dailyUnlocked={daily.unlocked}
          dailyMsRemaining={daily.msUntilUnlock}
          selectedId={selectedId}
          completedIds={stats.completedCaseIds}
          lang={lang}
          onSelect={handleSelectCase}
          onLanguage={store.setLanguage}
        />
      </div>

      {/* Main folder */}
      <main className="order-1 flex flex-1 items-start justify-center overflow-y-auto p-4 md:order-2 md:p-8">
        {selectedCase ? (
          <CaseFile
            caseData={selectedCase}
            session={session}
            lang={lang}
            canApprove={gate.canApprove}
            onOpenEvidence={handleOpenEvidence}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : (
          <div className="mt-20 text-center text-paper/40">
            <div className="text-5xl">🗂️</div>
            <p className="mt-3">{t('cases', lang)}</p>
          </div>
        )}
      </main>

      {/* Right analytics column */}
      <div className="order-3 md:w-[280px] md:shrink-0">
        <RightSidebar
          lang={lang}
          balance={stats.balance}
          accuracyPct={accuracyPct}
          solvedCount={stats.completedCaseIds.length}
          leaderboard={leaderboard}
        />
      </div>

      {/* Evidence stamping modal */}
      <StampModal
        evidence={modalEvidence}
        lang={lang}
        stamped={session?.selectedEvidenceIds.includes(modalEvidenceId ?? '') ?? false}
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
            onMounted={() => undefined}
            onNext={goToNextCase}
            onBackToDesk={backToDesk}
          />
        )}
      </AnimatePresence>

      {/* Bankruptcy gate → rewarded-ad restore */}
      {stats.isBankrupt && !showResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="paper-sheet w-full max-w-sm p-6 text-center">
            <h2 className="text-xl font-bold text-ink">{t('bankruptTitle', lang)}</h2>
            <p className="mt-2 text-sm text-ink/70">{t('bankruptDesc', lang)}</p>
            <button
              type="button"
              onClick={store.restoreFunds}
              className="mt-5 h-12 w-full rounded-md bg-accent font-semibold text-white hover:bg-accent/90"
            >
              ▶ {t('restoreFunds', lang)} (₽{GAME_CONFIG.economy.restoreFundsTo})
            </button>
          </div>
        </div>
      )}

      {/* Ad pause guard overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 text-paper/70">
          ⏸
        </div>
      )}
    </div>
  );
}
