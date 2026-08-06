/**
 * The closing sheet of a case — one folder on the desk, three outcomes.
 *
 * Rebuilt from the approved references in
 * `big-update/detective_final_windows_package/`. One component, never two
 * screens: the mode is decided by `result.success` (see `caseSuccessEngine`).
 *
 *   solved      → the case is closed. Money kept, accuracy, key evidence, the
 *                 voluntary rewarded double, then «Следующее дело».
 *   failure     → wrong verdict. The exact missed contradiction stays hidden;
 *                 only a general signal is free. A rewarded video opens one
 *                 clue, and «Повторить без подсказки» is always free.
 *   incomplete  → the verdict was right but the mandatory contradictions were
 *                 never stamped. Same shape as failure, different wording.
 *
 * The hierarchy is fixed by the reference: вердикт → деньги → ключевая
 * информация → действие. No portraits, no long quotes — the closing line and
 * Vera's note moved into the collapsible разбор, where nothing is lost but
 * nothing competes with the verdict either.
 *
 * Rewarded video never gates progression. It doubles a reward that is already
 * banked, or opens a hint — the next case is unlocked by play alone.
 */
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Case, Language, RewardBreakdown } from "../types";
import type { CaseSuccessEvaluation } from "../engine/caseSuccessEngine";
import { clueEvidenceFor } from "../engine/caseSuccessEngine";
import { GAME_CONFIG } from "../config/gameConfig";
import { ACHIEVEMENTS_BY_ID } from "../data/achievements";
import { formatInvestigatorLevel, loc, t } from "../i18n/ui";
import { useCountUp } from "../hooks/useCountUp";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Paper, inner rule and drop shadow of the closed folder. */
const SHEET_SURFACE = {
  border: "1px solid #D8CDBB",
  background:
    "radial-gradient(circle at 20% 12%,rgba(92,68,34,.05) 0 1px,transparent 1.3px) 0 0/8px 8px," +
    "linear-gradient(145deg,rgba(255,255,255,.55),transparent 38%),#F3EDDF",
  boxShadow: "0 30px 90px rgba(0,0,0,.58),0 2px 0 rgba(255,255,255,.53) inset",
} as const;

/** Where the rewarded video stands right now. Persisted grants live in the store. */
type AdState = "idle" | "loading" | "error";

/** One rewarded attempt: the caller runs the ad and settles it exactly once. */
export type AdRunner = (settle: (granted: boolean) => void) => void;

interface Props {
  result: RewardBreakdown & {
    xpGained: number;
    promotedToLevel: number | null;
    newAchievementIds: string[];
    stampedEvidenceIds: string[];
    mastery: "none" | "bronze" | "silver" | "gold";
    success: CaseSuccessEvaluation;
  };
  caseData: Case;
  lang: Language;
  xpGained: number;
  promotedToLevel: number | null;
  newAchievementIds: string[];
  /** Daily streak, shown as a compact chip when the player has one running. */
  streakCount: number;
  onMounted: () => void;
  /** Runs the rewarded video for the ×2 payout; settles true only on a full view. */
  onDoubleReward: AdRunner;
  rewardDoubled: boolean;
  /** Runs the rewarded video that opens one missed contradiction. */
  onRevealClue: AdRunner;
  /** True once the clue for this case has been opened (persisted across replays). */
  clueRevealed: boolean;
  onNext: () => void;
  /** Restart the same case from scratch (the free path after a failure). */
  onReplay: () => void;
  onBackToDesk: () => void;
  hideBack?: boolean;
}

export function ResultSheet({
  result,
  caseData,
  lang,
  xpGained,
  promotedToLevel,
  newAchievementIds,
  streakCount,
  onMounted,
  onDoubleReward,
  rewardDoubled,
  onRevealClue,
  clueRevealed,
  onNext,
  onReplay,
  onBackToDesk,
  hideBack = false,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onBackToDeskRef = useRef(onBackToDesk);
  const safeId = caseData.id.replace(/[^a-zA-Z0-9_-]/g, "-");
  const titleId = `result-sheet-title-${safeId}`;
  const descId = `result-sheet-desc-${safeId}`;
  const reduceMotion = useReducedMotion();

  const solved = result.success.solved;
  /** Right verdict, missing proof — its own state, never dressed as a failure. */
  const incomplete = !solved && result.success.verdictCorrect;

  const unlocked = newAchievementIds
    .map((id) => ACHIEVEMENTS_BY_ID.get(id))
    .filter((a): a is NonNullable<typeof a> => a != null);

  useEffect(onMounted, [onMounted]);

  useEffect(() => {
    onBackToDeskRef.current = onBackToDesk;
  }, [onBackToDesk]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onBackToDeskRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => dialogRef.current?.focus(), 0);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [caseData.id]);

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => !element.hasAttribute("disabled"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && (document.activeElement === dialog || document.activeElement === first)) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /* ── Numbers ─────────────────────────────────────────────────────────── */

  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const base =
    GAME_CONFIG.reward.baseByDifficulty[caseData.difficulty] *
      result.dailyMultiplierApplied || 1;
  const accuracyPct = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((result.verdictComponent + result.proofComponent + result.efficiencyComponent) /
          base) *
          100,
      ),
    ),
  );

  const money = solved || incomplete ? Math.abs(result.total) : caseData.claimAmount;
  const displayMoney = useCountUp(reduceMotion ? 0 : money, 900, 0);
  const shownMoney = reduceMotion ? money : displayMoney;

  const [barFill, setBarFill] = useState(reduceMotion ? accuracyPct : 0);
  useEffect(() => {
    if (reduceMotion) {
      setBarFill(accuracyPct);
      return;
    }
    const id = window.setTimeout(() => setBarFill(accuracyPct), 420);
    return () => window.clearTimeout(id);
  }, [accuracyPct, reduceMotion]);

  /* ── Evidence shown on the sheet ─────────────────────────────────────── */

  const stampedIds = result.stampedEvidenceIds ?? [];
  const contradictions = caseData.evidences.filter((e) => e.isContradiction);
  const correctlyStamped = contradictions.filter((e) => stampedIds.includes(e.id));
  const keyEvidence = correctlyStamped[0] ?? contradictions[0] ?? null;
  const clueEvidence = clueEvidenceFor(caseData, result.success, stampedIds);

  /* ── The разбор: chain, authored explanation, and the human layer ────── */

  const resolution = caseData.resolution ?? null;
  const chain = resolution?.reasoningChain?.length ? resolution.reasoningChain : null;
  const fallbackLines = chain ? null : loc(caseData.explanation, lang);
  // The closing line confesses indirectly in several cases — it stays sealed
  // until the case is actually closed.
  const story = solved ? resolution : null;
  const hasDebrief =
    !!chain || (fallbackLines?.length ?? 0) > 0 || !!story?.finalLine;
  const [debriefOpen, setDebriefOpen] = useState(false);

  /* ── Rewarded video: one runner shape, two placements ────────────────── */

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [doubleState, setDoubleState] = useState<AdState>("idle");
  const [clueState, setClueState] = useState<AdState>("idle");

  /**
   * One guarded launcher for both placements: it refuses a second click while a
   * video is in flight, ignores a callback that arrives after unmount, and
   * never leaves the button stuck in "loading" when the ad does not pay out.
   */
  const runAd = useCallback(
    (
      runner: AdRunner,
      state: AdState,
      setState: (next: AdState) => void,
      alreadyGranted: boolean,
    ) => {
      if (state === "loading" || alreadyGranted) return;
      setState("loading");
      let settled = false;
      runner((granted) => {
        if (settled) return;
        settled = true;
        if (!mountedRef.current) return;
        setState(granted ? "idle" : "error");
      });
    },
    [],
  );

  /* ── Chrome ──────────────────────────────────────────────────────────── */

  const tone = solved ? "#147A4A" : "#BD2925";
  const toneDeep = solved ? "#0E5B39" : "#821E21";
  const caseNumber =
    caseData.campaignOrder != null
      ? t("caseNumber", lang).replace("{n}", `№${caseData.campaignOrder}`)
      : loc(caseData.title, lang);
  const tabText = `${caseNumber} · ${t(solved ? "caseTabClosed" : "caseTabNotClosed", lang)}`;

  const kicker = solved
    ? t("resultKickerConfirmed", lang)
    : incomplete
      ? t("resultKickerIncomplete", lang)
      : t("resultKickerWrong", lang);
  const headline = solved
    ? caseData.truth === "fraud"
      ? t("resultTitleFraudExposed", lang)
      : t("resultTitleCaseClosed", lang)
    : incomplete
      ? t("resultTitleIncomplete", lang)
      : t("resultTitleWrong", lang);

  const sectionX = "mx-[22px] sm:mx-[34px]";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center px-[9px] pb-[10px] pt-[66px] sm:items-center sm:px-[18px] sm:py-[24px]"
      style={{ background: "rgba(4,8,15,.76)", backdropFilter: "blur(2px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative flex max-h-full w-full max-w-[520px] flex-col overflow-hidden rounded-t-[14px] rounded-b-[8px] focus:outline-none sm:rounded-[14px]"
        style={SHEET_SURFACE}
        initial={reduceMotion ? false : { y: 15, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.36, ease: [0.2, 0.8, 0.2, 1] }}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        {/* The thin inner rule of a paper folder — decorative only. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[9px] z-[1] rounded-[9px]"
          style={{ border: "1px solid rgba(107,84,53,.13)" }}
        />

        {/* Folder tab: which case, and whether it is closed. */}
        <span
          className="absolute left-[26px] top-0 z-[2] rounded-b-[7px] px-[14px] pb-[8px] pt-[7px] font-mono text-[10px] font-extrabold uppercase leading-none tracking-[0.11em]"
          style={{ background: "#D7C7AA", color: "#655B4D" }}
        >
          {tabText}
        </span>

        {!hideBack && (
          <button
            type="button"
            onClick={onBackToDesk}
            aria-label={t("resultBackToDeskLink", lang)}
            className="absolute right-[13px] top-[13px] z-[3] grid h-[44px] w-[44px] place-items-center rounded-full text-[20px] leading-none transition-colors hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ border: "1px solid #CFC1AA", background: "#F8F2E6", color: "#716B62" }}
          >
            ×
          </button>
        )}

        <div className="relative z-[2] min-h-0 flex-1 overflow-y-auto">
          {/* ── Status line: icon, kicker, headline, case name, stamp ──── */}
          <header
            className="px-[22px] pb-[15px] pt-[39px] sm:px-[34px] sm:pb-[17px] sm:pt-[42px]"
            style={{ borderBottom: "1px dashed #CBBDA7" }}
          >
            <div className="flex items-start gap-[11px] pr-[36px] sm:gap-[14px] sm:pr-[42px]">
              <motion.span
                aria-hidden
                className="grid h-[44px] w-[44px] flex-none place-items-center rounded-full text-[24px] font-black sm:h-[50px] sm:w-[50px]"
                style={{ border: `2px solid ${tone}`, color: tone, rotate: "-4deg" }}
                initial={reduceMotion ? false : { scale: 1.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
              >
                {solved ? "✓" : "×"}
              </motion.span>
              <div className="min-w-0">
                <p
                  className="mb-[7px] mt-[2px] font-mono text-[10px] font-extrabold uppercase leading-none tracking-[0.14em]"
                  style={{ color: "#7A746B" }}
                >
                  {kicker}
                </p>
                <h1
                  id={titleId}
                  className="m-0 font-serif text-[20px] font-black leading-[1.1] tracking-[-0.025em] sm:text-[23px]"
                  style={{ color: toneDeep, overflowWrap: "anywhere" }}
                >
                  {headline}
                </h1>
                <p
                  id={descId}
                  className="mt-[8px] font-serif text-[12px] font-semibold leading-[1.35]"
                  style={{ color: "#69665F", overflowWrap: "anywhere" }}
                >
                  «{loc(caseData.title, lang)}»
                  {solved &&
                    ` · ${t(caseData.correctDecision === "reject" ? "resultPayoutRejected" : "resultPayoutApproved", lang)}`}
                </p>
              </div>
            </div>
            {solved && (
              <span
                className="ml-[58px] mt-[12px] inline-block rounded-[3px] px-[9px] pb-[4px] pt-[5px] font-mono text-[10px] font-black uppercase leading-none tracking-[0.09em] opacity-70 sm:ml-[64px]"
                style={{ border: `2px solid ${tone}`, color: tone, rotate: "-3deg" }}
              >
                {t("resultStampJustified", lang)}
              </span>
            )}
          </header>

          {/* ── The financial consequence ───────────────────────────────── */}
          <div
            className={`${sectionX} mt-[18px] grid grid-cols-[1fr_auto] items-center gap-[16px] rounded-[11px] px-[16px] py-[14px] sm:mt-[20px] sm:px-[18px] sm:py-[16px]`}
            style={{ border: "1px solid #D1C4AE", background: "rgba(255,255,255,.36)" }}
          >
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold" style={{ color: "#716D65" }}>
                {solved || incomplete ? t("resultCompanySaved", lang) : t("resultDamageLabel", lang)}
              </div>
              <div
                className="mt-[3px] font-serif text-[26px] font-black leading-none tracking-[-0.035em] sm:text-[31px]"
                style={{ color: solved || incomplete ? "#147A4A" : "#BD2925" }}
              >
                {solved || incomplete ? "+" : "−"}
                {fmt(shownMoney)} ₽
              </div>
            </div>
            {result.mastery !== "none" && (
              <div
                className="grid min-w-[72px] place-items-center px-[10px] py-[9px] text-center"
                style={{ borderLeft: "1px solid #D1C4AE", color: "#745A28" }}
              >
                <small className="text-[9px] font-extrabold uppercase tracking-[0.11em]">
                  {t("mastery", lang)}
                </small>
                <b className="font-serif text-[15px] font-black">
                  {t(
                    result.mastery === "gold"
                      ? "masteryGold"
                      : result.mastery === "silver"
                        ? "masterySilver"
                        : "masteryBronze",
                    lang,
                  )}
                </b>
              </div>
            )}
          </div>

          {solved ? (
            <SuccessBody
              lang={lang}
              caseData={caseData}
              accuracyPct={accuracyPct}
              barFill={barFill}
              keyEvidenceTitle={keyEvidence ? loc(keyEvidence.title, lang) : null}
              proofLine={t("resultProofCount", lang)
                .replace("{n}", String(correctlyStamped.length))
                .replace("{total}", String(contradictions.length))}
              xpGained={xpGained}
              streakCount={streakCount}
              sectionX={sectionX}
              adState={doubleState}
              rewardDoubled={rewardDoubled}
              bonus={Math.abs(result.total)}
              fmt={fmt}
              onDouble={() =>
                runAd(onDoubleReward, doubleState, setDoubleState, rewardDoubled)
              }
              offerDouble={result.total > 0}
            />
          ) : (
            <FailureBody
              lang={lang}
              incomplete={incomplete}
              success={result.success}
              sectionX={sectionX}
              clueTitle={clueEvidence ? loc(clueEvidence.title, lang) : null}
              clueBody={
                clueEvidence
                  ? loc(
                      clueEvidence.contradictionTarget?.reason ??
                        clueEvidence.contradictionExplanation,
                      lang,
                    )
                  : null
              }
              clueRevealed={clueRevealed}
              adState={clueState}
              onRevealClue={() =>
                runAd(onRevealClue, clueState, setClueState, clueRevealed)
              }
            />
          )}

          {/* ── Разбор: the reasoning chain and the human layer, on demand ─ */}
          {hasDebrief && (
            <div className={`${sectionX} mt-[13px]`}>
              <Drawer
                label={t("resultDebrief", lang)}
                open={debriefOpen}
                onToggle={() => setDebriefOpen((v) => !v)}
              >
                <div className="flex flex-col gap-[9px]">
                  {story?.finalLine && (
                    <p
                      className="m-0 rounded-[5px] px-[13px] py-[11px] font-serif text-[13px] leading-[1.5]"
                      style={{
                        background: "#FFFAF0",
                        borderLeft: `3px solid ${tone}`,
                        color: "#3A3024",
                      }}
                    >
                      <b className="mr-[6px] font-sans text-[12px] font-bold">
                        {loc(story.speaker.displayName, lang)}:
                      </b>
                      «{loc(story.finalLine, lang)}»
                    </p>
                  )}
                  {chain?.map((link, index) => (
                    <div key={index} className="min-w-0">
                      <div
                        className="font-mono text-[11px] font-bold uppercase tracking-[0.06em]"
                        style={{ color: toneDeep }}
                      >
                        {index + 1}. {loc(link.label, lang)}
                      </div>
                      <p
                        className="m-0 mt-[3px] font-serif text-[12px] leading-[1.5]"
                        style={{ color: "#4A4030", overflowWrap: "anywhere" }}
                      >
                        {loc(link.text, lang)}
                      </p>
                    </div>
                  ))}
                  {fallbackLines?.map((line, index) => (
                    <p
                      key={index}
                      className="m-0 font-serif text-[12px] leading-[1.5]"
                      style={{ color: "#4A4030", overflowWrap: "anywhere" }}
                    >
                      {index + 1}. {line}
                    </p>
                  ))}
                  {story?.veraLine && (
                    <p
                      className="m-0 font-sans text-[12px] leading-[1.45]"
                      style={{ color: "#7A6C54" }}
                    >
                      <b style={{ color: "#5D5240" }}>{t("resolutionVeraLabel", lang)}:</b>{" "}
                      {loc(story.veraLine, lang)}
                    </p>
                  )}
                </div>
              </Drawer>
            </div>
          )}

          {/* ── What this case added to the archive — only when it really did ── */}
          {solved && story?.arcReveal && (
            <p
              className={`${sectionX} mt-[12px] text-[10px] font-extrabold`}
              style={{ color: "#6E674F", overflowWrap: "anywhere" }}
            >
              <span aria-hidden style={{ color: "#B8822D" }}>
                ◆
              </span>{" "}
              {t("resolutionArchiveEntry", lang)}: «{loc(story.arcReveal.title, lang)}»
            </p>
          )}

          {promotedToLevel != null && (
            <p
              className={`${sectionX} mt-[10px] text-[10px] font-extrabold`}
              style={{ color: "#6E674F" }}
            >
              <span aria-hidden style={{ color: "#B8822D" }}>
                ◆
              </span>{" "}
              {t("promotion", lang)}: {formatInvestigatorLevel(promotedToLevel, lang)}
            </p>
          )}

          {unlocked.map((achievement) => (
            <p
              key={achievement.id}
              className={`${sectionX} mt-[10px] text-[10px] font-extrabold`}
              style={{ color: "#6E674F" }}
            >
              <span aria-hidden style={{ color: "#B8822D" }}>
                ◆
              </span>{" "}
              {t("achievementUnlocked", lang)}: {loc(achievement.title, lang)}
            </p>
          ))}

          {/* A failed case is left open on purpose — say so before they leave. */}
          {!solved && (
            <footer className="px-[22px] pb-[18px] pt-[13px] text-center sm:px-[34px] sm:pb-[21px]">
              {!hideBack && (
                <button
                  type="button"
                  onClick={onBackToDesk}
                  className="min-h-[44px] cursor-pointer border-0 bg-transparent px-[8px] text-[11px] font-extrabold underline underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ color: "#7D756B" }}
                >
                  {t("resultBackToDeskLink", lang)}
                </button>
              )}
              <span className="block text-[9px]" style={{ color: "#8A8378" }}>
                {t("resultUnfinishedNotice", lang)}
              </span>
            </footer>
          )}
        </div>

        {/* ── Pinned actions ───────────────────────────────────────────
              Only a closed case moves forward. On an open one the pinned
              action is the *free* retry — the rewarded clue above is an offer,
              never a toll gate, and the primary CTA must stay reachable even
              on a 360×640 screen. ── */}
        {!solved && (
          <div
            className="relative z-[2] flex-shrink-0 px-[22px] pb-[16px] pt-[13px] sm:px-[34px] sm:pb-[18px]"
            style={{
              borderTop: "1px solid rgba(125,105,76,.2)",
              background: "rgba(221,209,190,.34)",
            }}
          >
            <button
              type="button"
              onClick={onReplay}
              className="block min-h-[51px] w-full cursor-pointer rounded-[9px] border-0 px-[12px] text-[14px] font-black text-white transition hover:brightness-[1.12] active:translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "linear-gradient(#293B59,#17243A)",
                boxShadow: "0 3px 0 #09111E,0 1px 0 rgba(255,255,255,.18) inset",
              }}
            >
              ↻ {t(clueRevealed ? "resultRetryWithHint" : "resultRetryNoHint", lang)}
            </button>
          </div>
        )}

        {solved && (
          <div
            className="relative z-[2] flex flex-shrink-0 flex-col gap-[10px] px-[22px] pb-[21px] pt-[14px] sm:grid sm:grid-cols-[1fr_2.15fr] sm:px-[34px] sm:pb-[24px] sm:pt-[16px]"
            style={{
              borderTop: "1px solid rgba(125,105,76,.2)",
              background: "rgba(221,209,190,.34)",
            }}
          >
            {!hideBack && (
              <button
                type="button"
                onClick={onBackToDesk}
                className="order-2 min-h-[50px] cursor-pointer rounded-[9px] px-[12px] text-[13px] font-black transition hover:brightness-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:order-1"
                style={{ border: "1px solid #C9B99D", background: "#F8F2E6", color: "#676055" }}
              >
                {t("backToDesk", lang)}
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              className="order-1 min-h-[50px] cursor-pointer rounded-[9px] border-0 px-[12px] text-[14px] font-black text-white transition hover:brightness-[1.12] active:translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:order-2"
              style={{
                background: "linear-gradient(#263650,#152136)",
                boxShadow: "0 3px 0 #09111E,0 1px 0 rgba(255,255,255,.14) inset",
              }}
            >
              {t("nextCase", lang)} →
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Success body                                                              */
/* -------------------------------------------------------------------------- */

function SuccessBody({
  lang,
  accuracyPct,
  barFill,
  keyEvidenceTitle,
  proofLine,
  xpGained,
  streakCount,
  sectionX,
  adState,
  rewardDoubled,
  bonus,
  fmt,
  onDouble,
  offerDouble,
}: {
  lang: Language;
  caseData: Case;
  accuracyPct: number;
  barFill: number;
  keyEvidenceTitle: string | null;
  proofLine: string;
  xpGained: number;
  streakCount: number;
  sectionX: string;
  adState: AdState;
  rewardDoubled: boolean;
  bonus: number;
  fmt: (n: number) => string;
  onDouble: () => void;
  offerDouble: boolean;
}) {
  return (
    <>
      {/* Accuracy */}
      <div className={`${sectionX} mt-[15px]`}>
        <div
          className="flex justify-between text-[11px] font-extrabold"
          style={{ color: "#5C5B58" }}
        >
          <span>{t("resultAccuracy", lang)}</span>
          <b style={{ color: "#147A4A" }}>{accuracyPct}%</b>
        </div>
        <div
          className="mt-[7px] h-[7px] overflow-hidden rounded-[10px]"
          style={{ background: "#DFD5C5" }}
        >
          <span
            className="block h-full rounded-[inherit]"
            style={{
              width: `${barFill}%`,
              background: "linear-gradient(90deg,#147A4A,#2EA56C)",
              transition: "width .9s cubic-bezier(.2,.8,.2,1)",
            }}
          />
        </div>
      </div>

      {/* The one piece of evidence that carried the verdict */}
      {keyEvidenceTitle && (
        <article
          className={`${sectionX} mt-[17px] rounded-[10px] px-[16px] py-[15px] sm:px-[20px]`}
          style={{
            border: "1px solid #C9BCA6",
            background: "#FFFAF0",
            boxShadow: "0 2px 8px rgba(70,49,21,.05)",
          }}
        >
          <div
            className="font-mono text-[10px] font-black uppercase leading-none tracking-[0.12em]"
            style={{ color: "#0E5B39" }}
          >
            {t("resultKeyEvidence", lang)}
          </div>
          <p
            className="m-0 mt-[7px] font-serif text-[13px] font-semibold leading-[1.48]"
            style={{ color: "#383C43", overflowWrap: "anywhere" }}
          >
            <b>{keyEvidenceTitle}.</b> {proofLine}
          </p>
        </article>
      )}

      {/* Only real data becomes a chip. */}
      <div
        className={`${sectionX} mt-[13px] flex flex-wrap items-center gap-[8px] text-[11px] font-extrabold`}
        style={{ color: "#65635E" }}
      >
        {xpGained > 0 && (
          <span
            className="rounded-full px-[10px] py-[7px]"
            style={{ border: "1px solid #D2C5B0", background: "#F9F4E9" }}
          >
            {t("xpLabel", lang)} <b style={{ color: "#147A4A" }}>+{xpGained}</b>
          </span>
        )}
        {streakCount > 1 && (
          <span
            className="rounded-full px-[10px] py-[7px]"
            style={{ border: "1px solid #D2C5B0", background: "#F9F4E9" }}
          >
            {t("streak", lang)} <b style={{ color: "#147A4A" }}>×{streakCount}</b>
          </span>
        )}
      </div>

      {/* Voluntary rewarded double — visible, but never louder than «Далее». */}
      {offerDouble && (
        <div className={`${sectionX} mt-[11px]`}>
          {rewardDoubled ? (
            <p
              className="m-0 grid min-h-[50px] place-items-center rounded-[11px] text-[13px] font-extrabold"
              style={{
                border: "1px solid rgba(20,122,74,.4)",
                background: "rgba(20,122,74,.08)",
                color: "#0E5B39",
              }}
              role="status"
            >
              ✓ {t("rewardDoubled", lang)}
            </p>
          ) : (
            <AdOffer
              lang={lang}
              adState={adState}
              onClick={onDouble}
              title={t("resultAdDoubleTitle", lang)}
              badge={`+${fmt(bonus)} ₽`}
              badgeTone="green"
            />
          )}
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Failure / insufficient-evidence body                                      */
/* -------------------------------------------------------------------------- */

function FailureBody({
  lang,
  incomplete,
  success,
  sectionX,
  clueTitle,
  clueBody,
  clueRevealed,
  adState,
  onRevealClue,
}: {
  lang: Language;
  incomplete: boolean;
  success: CaseSuccessEvaluation;
  sectionX: string;
  clueTitle: string | null;
  clueBody: string | null;
  clueRevealed: boolean;
  adState: AdState;
  onRevealClue: () => void;
}) {
  const hasClue = clueTitle != null && clueBody != null;

  return (
    <>
      {/* The free signal: something was missed. Never *which* card. */}
      <p
        className={`${sectionX} mt-[15px] text-center font-serif text-[12px] font-bold leading-[1.45] sm:text-[13px]`}
        style={{ color: "#3F434B" }}
      >
        {incomplete ? t("resultIncompleteIntro", lang) : t("resultMissedIntro", lang)}
      </p>

      {incomplete && success.mandatoryTotal > 0 && (
        <p
          className={`${sectionX} mt-[8px] text-center font-mono text-[11px] font-bold`}
          style={{ color: "#821E21" }}
        >
          {t("resultProofProgress", lang)
            .replace("{n}", String(success.mandatoryFound))
            .replace("{total}", String(success.mandatoryTotal))}
        </p>
      )}

      {/* The locked clue — the only thing a rewarded video buys here. */}
      {hasClue && (
        <article
          aria-live="polite"
          className={`${sectionX} relative mt-[13px] overflow-hidden rounded-[12px] p-[15px] text-center sm:p-[17px]`}
          style={
            clueRevealed
              ? {
                  border: "1px solid #93BBA6",
                  background: "linear-gradient(150deg,#F1FBF5,#D9EDE1)",
                }
              : {
                  border: "1px solid #BEA45E",
                  background: "linear-gradient(150deg,#FFF8D9,#EEE0AE)",
                  boxShadow: "0 4px 15px rgba(78,54,10,.10),0 1px 0 #fff inset",
                }
          }
        >
          {!clueRevealed && (
            <span
              aria-hidden
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "repeating-linear-gradient(-45deg,transparent 0 12px,#B29145 13px 14px)",
              }}
            />
          )}
          <div className="relative">
            <span
              aria-hidden
              className="mx-auto mb-[8px] grid h-[44px] w-[44px] place-items-center rounded-full text-[21px]"
              style={
                clueRevealed
                  ? {
                      border: "1px solid #147A4A",
                      background: "#147A4A",
                      color: "#fff",
                      boxShadow: "0 2px 0 #0C402B",
                    }
                  : {
                      border: "1px solid #A17B25",
                      background: "#FFF7D4",
                      color: "#7B5818",
                      boxShadow: "0 2px 0 #B38D39",
                    }
              }
            >
              {clueRevealed ? "✓" : "🔒"}
            </span>
            <div
              className="font-mono text-[10px] font-black uppercase leading-none tracking-[0.13em]"
              style={{ color: clueRevealed ? "#147A4A" : "#6D4C12" }}
            >
              {t(clueRevealed ? "resultClueRevealedLabel" : "resultClueLockedLabel", lang)}
            </div>
            <h2
              className={`mb-[4px] mt-[7px] font-serif font-black ${clueRevealed ? "text-[15px] leading-[1.28]" : "text-[18px] leading-[1.15]"}`}
              style={{ color: "#342B1E", overflowWrap: "anywhere" }}
            >
              {clueRevealed ? clueTitle : t("resultClueLockedTitle", lang)}
            </h2>
            <p
              className={`mx-auto m-0 max-w-[330px] ${clueRevealed ? "font-serif text-[12px] font-semibold leading-[1.45]" : "text-[11px] leading-[1.42]"}`}
              style={{
                color: clueRevealed ? "#3D4B42" : "#716348",
                overflowWrap: "anywhere",
              }}
            >
              {clueRevealed ? clueBody : t("resultClueLockedCopy", lang)}
            </p>
            {!clueRevealed && (
              <div className="mt-[14px]">
                <AdOffer
                  lang={lang}
                  adState={adState}
                  onClick={onRevealClue}
                  title={t("resultClueOpen", lang)}
                  badge={t("resultAdBadge", lang)}
                  badgeTone="dark"
                />
              </div>
            )}
          </div>
        </article>
      )}

      {/* Non-interactive: the next case exists, it is simply not open yet.
          No «или» divider stands above it — the free alternative it would point
          at lives in the pinned footer, so a divider here would read as
          "clue card or locked notice", which is not a choice at all. */}
      <div
        className={`${sectionX} mt-[14px] flex items-center gap-[10px] rounded-[9px] px-[13px] py-[11px]`}
        style={{
          border: "1px solid #D0C2AA",
          background: "rgba(225,214,195,.52)",
          color: "#6A655E",
        }}
      >
        <span
          aria-hidden
          className="grid h-[30px] w-[30px] flex-none place-items-center rounded-full text-[14px]"
          style={{ background: "#E4D9C7" }}
        >
          🔒
        </span>
        <span className="min-w-0">
          <b className="block text-[10px]" style={{ color: "#4E4D4B" }}>
            {t("resultNextLockedTitle", lang)}
          </b>
          <small className="mt-[2px] block text-[9px] leading-[1.35]">
            {t("resultNextLockedCopy", lang)}
          </small>
        </span>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared pieces                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The one gold surface on the sheet: a rewarded video offer. It owns all four
 * ad states — idle, loading (disabled, announced), error (announced, retryable)
 * and, from the caller, the granted state that replaces it entirely.
 */
function AdOffer({
  lang,
  adState,
  onClick,
  title,
  badge,
  badgeTone,
}: {
  lang: Language;
  adState: AdState;
  onClick: () => void;
  title: string;
  badge: string;
  badgeTone: "green" | "dark";
}) {
  const loading = adState === "loading";
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
        // Below ~380px the badge drops onto its own row instead of squeezing
        // the title into three wrapped lines.
        className="grid min-h-[56px] w-full grid-cols-[34px_minmax(0,1fr)] items-center gap-[8px] rounded-[11px] py-[8px] pl-[12px] pr-[10px] text-left transition hover:brightness-[1.04] active:translate-y-[2px] disabled:cursor-wait disabled:saturate-[.65] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 min-[380px]:grid-cols-[36px_minmax(0,1fr)_auto] min-[380px]:gap-[9px]"
        style={{
          border: "1px solid #A67B2A",
          background: "linear-gradient(180deg,#FFF4BD,#ECD47C)",
          color: "#25301F",
          boxShadow: "0 3px 0 #9A7225,0 1px 0 #fff inset",
        }}
      >
        <span
          aria-hidden
          className="grid h-[34px] w-[34px] place-items-center rounded-full text-[13px] text-white"
          style={{ background: "#166342", boxShadow: "0 2px 0 #0B412B" }}
        >
          ▶
        </span>
        <span className="min-w-0">
          <b className="block text-[13px] leading-[1.15]">
            {loading ? t("resultAdLoading", lang) : title}
          </b>
          <small className="mt-[3px] block text-[9px] font-extrabold" style={{ color: "#6A5B2D" }}>
            {t("resultAdWatchShort", lang)}
          </small>
        </span>
        <span
          className="col-start-2 justify-self-start whitespace-nowrap rounded-[8px] px-[7px] py-[5px] text-[11px] font-black uppercase text-white min-[380px]:col-start-3 min-[380px]:px-[9px] min-[380px]:py-[7px]"
          style={{ background: badgeTone === "green" ? "#166342" : "#6A5119" }}
        >
          {badge}
        </span>
      </button>
      {/* Ad outcomes are announced, never colour-only. */}
      <p role="status" aria-live="polite" className="m-0">
        {adState === "error" && (
          <span
            className="mt-[7px] block text-[10px] font-bold"
            style={{ color: "#821E21" }}
          >
            {t("resultAdFailed", lang)}
          </span>
        )}
      </p>
    </>
  );
}

/** A 44px header that opens the разбор in place; the header never disappears. */
function Drawer({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const panelId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <div style={{ borderTop: "1px solid #CFC2AE", borderBottom: "1px solid #CFC2AE" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-[44px] w-full cursor-pointer items-center gap-[10px] border-0 bg-transparent text-left text-[11px] font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ color: "#54545A" }}
      >
        <span className="min-w-0 flex-1">{label}</span>
        <span aria-hidden className="text-[17px] font-normal" style={{ color: "#867E72" }}>
          {open ? "−" : "＋"}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-[13px] pt-[2px]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
