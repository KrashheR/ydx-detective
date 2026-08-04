/**
 * The single closing sheet of a case — story and receipt in one modal.
 *
 * One sheet, read top to bottom (see docs/03-gameplay.md):
 *   1. the verdict stamp — one stamp, four outcomes;
 *   2. the human reaction — portrait, closing line, Vera's note (a *correct*
 *      verdict only: several closing lines contain an indirect confession);
 *   3. the receipt — payout, XP, mastery, double-or-nothing. It sits directly
 *      under the reaction so neither the money nor the rewarded-ad CTA can be
 *      scrolled past on a phone;
 *   4. the accuracy breakdown, or what was missed;
 *   5. «Почему?» — the compact разбор, on demand, on a win *and* on a loss;
 *   6. the archive entry, promotion and achievements, then the pinned actions.
 *
 * There is no second sheet: rewards used to live here and the reaction in a
 * separate `CaseResolutionSheet`, which made every case end twice.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Case, Language, RewardBreakdown } from "../types";
import { GAME_CONFIG } from "../config/gameConfig";
import { ACHIEVEMENTS_BY_ID } from "../data/achievements";
import { formatInvestigatorLevel, loc, t } from "../i18n/ui";
import { useCountUp } from "../hooks/useCountUp";
import { asset } from "../utils/asset";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Portrait framing per emotional mode — grave cases get no playful tilt. */
const MOOD_TILT: Record<string, number> = {
  relief: -1.2,
  humour: -2.4,
  bittersweet: -1,
  defeat: 1.4,
  grave: 0,
  threat: 0.8,
};

/**
 * One reveal ladder for the whole sheet. Merging two modals merged two
 * timelines; without a single ladder every beat would fire at once.
 */
const BEAT = {
  stamp: 0.1,
  story: 0.34,
  payout: 0.5,
  ledger: 0.78,
  spoils: 1.15,
} as const;

interface Props {
  result: RewardBreakdown & {
    xpGained: number;
    promotedToLevel: number | null;
    newAchievementIds: string[];
    stampedEvidenceIds: string[];
    mastery: "none" | "bronze" | "silver" | "gold";
  };
  caseData: Case;
  lang: Language;
  xpGained: number;
  promotedToLevel: number | null;
  newAchievementIds: string[];
  onMounted: () => void;
  onDoubleReward: () => void;
  rewardDoubled: boolean;
  onNext: () => void;
  /** Restart the same case from scratch (offered after a failed verdict). */
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
  onMounted,
  onDoubleReward,
  rewardDoubled,
  onNext,
  onReplay,
  onBackToDesk,
  hideBack = false,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onBackToDeskRef = useRef(onBackToDesk);
  const resultTitleId = `result-sheet-title-${caseData.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const resultDescId = `result-sheet-desc-${caseData.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  const unlocked = newAchievementIds
    .map((id) => ACHIEVEMENTS_BY_ID.get(id))
    .filter((a): a is NonNullable<typeof a> => a != null);

  useEffect(onMounted, [onMounted]);

  useEffect(() => {
    onBackToDeskRef.current = onBackToDesk;
  }, [onBackToDesk]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

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

  const win = result.verdictCorrect;
  const stampText = win
    ? caseData.truth === "fraud"
      ? t("fraudExposed", lang)
      : t("caseClosed", lang)
    : caseData.truth === "fraud"
      ? t("fraudMissed", lang)
      : t("investigatorError", lang);

  const accent = win ? "#15803d" : "#b4231f";

  /* ── The human layer. Never on a wrong verdict: several closing lines
        contain an indirect confession and would hand over the answer. ── */
  const resolution = caseData.resolution ?? null;
  const story = win ? resolution : null;
  const grave = resolution?.emotionalMode === "grave";
  const tilt = MOOD_TILT[resolution?.emotionalMode ?? ""] ?? 0;
  const storyBeat = grave ? BEAT.story + 0.16 : BEAT.story;
  /** The разбор is authored per case and explains the verdict — useful either way. */
  const chain = resolution?.reasoningChain?.length ? resolution.reasoningChain : null;
  /**
   * Archive/pack cases carry no `resolution`, so their разбор falls back to the
   * authored `explanation` lines — on demand, never as a standing "truth" block.
   */
  const fallbackLines = chain ? null : loc(caseData.explanation, lang);
  const hasDebrief = !!chain || (fallbackLines?.length ?? 0) > 0;
  // Both post-mortems are drawers, closed by default: the sheet opens on the
  // outcome and the money, and the player pulls out the analysis when ready.
  const [chainOpen, setChainOpen] = useState(false);
  const [missedOpen, setMissedOpen] = useState(false);

  const base = GAME_CONFIG.reward.baseByDifficulty[caseData.difficulty] * result.dailyMultiplierApplied || 1;
  const verdictPct = Math.round((result.verdictComponent / base) * 100);
  const proofPct = Math.round((result.proofComponent / base) * 100);
  const efficiencyPct = Math.round((result.efficiencyComponent / base) * 100);
  const rewardPct = verdictPct + proofPct + efficiencyPct;

  const [barFill, setBarFill] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setBarFill(rewardPct), BEAT.ledger * 1000);
    return () => window.clearTimeout(id);
  }, [rewardPct]);

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  // The count-up must start when the payout band appears, not on mount —
  // otherwise most of it is spent behind an opacity-0 section.
  const [payoutArmed, setPayoutArmed] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setPayoutArmed(true), BEAT.payout * 1000);
    return () => window.clearTimeout(id);
  }, []);
  const displayPayout = useCountUp(
    payoutArmed ? (win ? Math.abs(result.total) : caseData.claimAmount) : 0,
    900,
    0,
  );

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => !element.hasAttribute("disabled"));
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (!firstElement || !lastElement) return;
    if (event.shiftKey && document.activeElement === dialog) {
      event.preventDefault();
      lastElement.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  // Evidence breakdown for accuracy section
  const stampedIds = result.stampedEvidenceIds ?? [];
  const allContradictions = caseData.evidences.filter((e) => e.isContradiction);
  const correctlyStamped = allContradictions.filter((e) =>
    stampedIds.includes(e.id),
  );
  const missedContradictions = allContradictions.filter(
    (e) => !stampedIds.includes(e.id),
  );

  // Per-evidence proof share (split equally across correct stamps)
  const proofPerEvidence =
    correctlyStamped.length > 0
      ? Math.round(proofPct / allContradictions.length)
      : 0;

  // Per-missed evidence penalty weight
  const missedEvidencePct =
    allContradictions.length > 0
      ? Math.round(proofPct / allContradictions.length)
      : 0;

  const divider = `1px solid ${win ? "#e7ddc9" : "#ecddd6"}`;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-[16px]"
      style={{ background: "rgba(8,11,17,.86)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* The sheet is a column: one scrolling body, one pinned action row.
          A merged sheet is long — the verdict must never be a scroll hunt. */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resultTitleId}
        aria-describedby={resultDescId}
        className="relative flex max-h-full w-full max-w-[430px] flex-col focus:outline-none"
        style={{
          background: "#f5f1e8",
          borderRadius: 11,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,.5)",
        }}
        initial={{ y: 16, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* ── Hero / stamp section ─────────────────────────────── */}
          <div
            style={{
              padding: "26px 24px 20px",
              textAlign: "center",
              background: win
                ? "linear-gradient(#f7f3ea,#f1ece0)"
                : "linear-gradient(#f7efe9,#f2e8e1)",
              borderBottom: `1px dashed ${win ? "#d8cdb5" : "#e0c9bf"}`,
            }}
          >
            <motion.span
              id={resultTitleId}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transform: "rotate(-7deg)",
                border: `3.5px solid ${accent}`,
                color: accent,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 1,
                padding: "9px 17px",
                borderRadius: 7,
                opacity: 0.94,
                background: win
                  ? "rgba(21,128,61,.05)"
                  : "rgba(180,35,31,.05)",
              }}
              initial={{ scale: 2.1, opacity: 0, rotate: -7 }}
              animate={{ scale: 1, opacity: 0.94, rotate: -7 }}
              transition={{ type: "spring", stiffness: 380, damping: 18, delay: BEAT.stamp }}
            >
              {/* Shape + glyph + text: never colour alone (a11y). */}
              <span aria-hidden>{win ? "✓" : "✕"}</span>
              {stampText}
            </motion.span>
            <div
              id={resultDescId}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: win ? "#9a8c70" : "#a98379",
                marginTop: 15,
                letterSpacing: 0.2,
              }}
            >
              {loc(caseData.title, lang)}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: win ? "#2a6b4a" : "#b4231f",
                marginTop: 4,
                letterSpacing: 0.2,
              }}
            >
              {win ? t("resultWinSub", lang) : t("resultLoseSub", lang)}
            </div>
          </div>

          {/* ── The person and their closing line (correct verdict only) ── */}
          {story && (
            <motion.div
              style={{
                display: "flex",
                gap: 14,
                padding: "18px 24px 14px",
                alignItems: "flex-start",
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: storyBeat, duration: 0.3 }}
            >
              {caseData.personImage && (
                <img
                  src={asset(caseData.personImage)}
                  alt=""
                  style={{
                    width: 82,
                    height: 82,
                    flexShrink: 0,
                    objectFit: "cover",
                    border: "4px solid #fffdf8",
                    borderRadius: 3,
                    boxShadow: "0 3px 10px rgba(0,0,0,.22)",
                    transform: `rotate(${tilt}deg)`,
                    filter: grave ? "saturate(.85)" : undefined,
                  }}
                />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#3a3024",
                  }}
                >
                  {loc(story.speaker.displayName, lang)}
                </div>
                {/* Transcript card, not a cartoon speech bubble. */}
                <div
                  style={{
                    marginTop: 7,
                    background: "#fffdf8",
                    borderLeft: `3px solid ${accent}`,
                    borderRadius: 4,
                    padding: "11px 13px",
                    fontFamily: "'IBM Plex Serif', serif",
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "#3a3024",
                  }}
                >
                  «{loc(story.finalLine, lang)}»
                </div>
                {story.veraLine && (
                  <div
                    style={{
                      marginTop: 9,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      lineHeight: 1.45,
                      color: "#7a6c54",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "#5d5240" }}>
                      {t("resolutionVeraLabel", lang)}:
                    </span>{" "}
                    {loc(story.veraLine, lang)}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Payout / loss hero ───────────────────────────────── */}
          <motion.div
            style={{
              padding: "20px 24px 18px",
              textAlign: "center",
              borderTop: divider,
              borderBottom: divider,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT.payout, duration: 0.28 }}
          >
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 2,
                color: win ? "#8a7c64" : "#a98379",
              }}
            >
              {win ? t("yourFee", lang) : t("companyLoss", lang)}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 36,
                fontWeight: 700,
                lineHeight: 1,
                color: accent,
                marginTop: 8,
                letterSpacing: -0.5,
              }}
            >
              {win ? "+" : "− "}
              {fmt(displayPayout)} ₽
            </div>

            {/* One chip row carries everything the payout earned: XP always,
                mastery and the ideal-case bonus when they exist. */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 8,
                marginTop: 14,
              }}
            >
              <Chip
                label={t("xpLabel", lang)}
                value={`+${xpGained}`}
                color={win ? "#2f8f83" : "#9a8c70"}
                border={win ? "#cfe0dc" : "#e3d9d5"}
              />
              {result.mastery !== "none" && (
                <Chip
                  label={t("mastery", lang)}
                  value={t(
                    result.mastery === "gold"
                      ? "masteryGold"
                      : result.mastery === "silver"
                        ? "masterySilver"
                        : "masteryBronze",
                    lang,
                  )}
                  color="#8a6515"
                  border="rgba(199,154,58,.5)"
                />
              )}
              {win && result.bonusComponent > 0 && (
                <Chip
                  label={`★ ${t("bonusIdealCase", lang)}`}
                  value={`×${(1 + result.bonusPct / 100).toFixed(2)}`}
                  color="#8a6515"
                  border="rgba(199,154,58,.5)"
                />
              )}
            </div>

            {/* Double or nothing lives with the payout — it is the one CTA
                that must never be scrolled past. */}
            {win && result.total > 0 && (
              <div style={{ marginTop: 14 }}>
                {rewardDoubled ? (
                  <div
                    style={{
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      border: "1px solid rgba(21,128,61,.4)",
                      background: "rgba(21,128,61,.08)",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#15803d",
                    }}
                  >
                    {t("rewardDoubled", lang)}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onDoubleReward}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 13,
                      padding: "13px 14px",
                      border: "1.5px dashed #2f8f83",
                      borderRadius: 12,
                      background: "rgba(47,143,131,.07)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        borderRadius: "50%",
                        background: "#2f8f83",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 15,
                        paddingLeft: 2,
                      }}
                    >
                      ▶
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#2a6b62",
                          }}
                        >
                          {t("doubleReward", lang)}
                        </span>
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#15803d",
                          }}
                        >
                          +{fmt(Math.abs(result.total))} ₽
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: 0.8,
                            color: "#7a6c54",
                            background: "#e7ddc9",
                            padding: "2px 6px",
                            borderRadius: 4,
                            flexShrink: 0,
                          }}
                        >
                          {t("watchAd", lang)}
                        </span>
                      </div>
                    </div>
                    <span style={{ color: "#2f8f83", fontSize: 16, flexShrink: 0 }}>
                      →
                    </span>
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* ── Accuracy section ─────────────────────────────────── */}
          <div style={{ padding: "18px 24px 20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#5d5240",
                }}
              >
                {t("accuracyBreakdown", lang)}
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 18,
                  fontWeight: 700,
                  color: accent,
                }}
              >
                {rewardPct}
                <span style={{ fontSize: 12 }}>%</span>
              </span>
            </div>
            <div
              style={{
                height: 10,
                background: win ? "#e6ddca" : "#ecddd6",
                borderRadius: 6,
                marginTop: 9,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${barFill}%`,
                  background: win
                    ? "linear-gradient(90deg,#2f8f83,#1f9d54)"
                    : "#b4231f",
                  borderRadius: 6,
                  transition: "width .9s cubic-bezier(.2,.8,.2,1)",
                }}
              />
            </div>

            {/* Win: show correct stamps — staggered so the breakdown reads like a
                receipt printing one line at a time. */}
            {win && (
              <motion.div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                }}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.09, delayChildren: BEAT.ledger } },
                }}
              >
                {/* Verdict row */}
                <AccuracyRow
                  success
                  label={t("verdictItem", lang)}
                  value={`+${verdictPct}%`}
                />
                {/* Per correctly-stamped evidence */}
                {correctlyStamped.map((e) => (
                  <AccuracyRow
                    key={e.id}
                    success
                    label={`${e.statementLink
                      ? loc(caseData.claimStatements?.find((statement) => statement.id === e.statementLink?.statementId)?.text ?? e.title, lang)
                      : loc(e.title, lang)} ↔ ${loc(e.title, lang)}`}
                    value={`+${proofPerEvidence}%`}
                  />
                ))}
                {efficiencyPct > 0 && (
                  <AccuracyRow
                    success
                    label={t("efficiencyReward", lang)}
                    value={`+${efficiencyPct}%`}
                  />
                )}
                {result.falseStamps > 0 && (
                  <AccuracyRow
                    fail
                    label={`${t("penaltyFalseStamps", lang)} ×${result.falseStamps}`}
                    value={`− ${fmt(result.penalty)} ₽`}
                  />
                )}
              </motion.div>
            )}

            {/* ── What you missed (lose only) — a drawer, closed by default.
                  The loss lands as one number; the post-mortem is opened when
                  the player is ready for it, not pushed at them. ── */}
            {!win && (
              <div style={{ marginTop: 16 }}>
                <Drawer
                  label={t("whatYouMissed", lang)}
                  tracking={1.5}
                  open={missedOpen}
                  onToggle={() => setMissedOpen((v) => !v)}
                  tone={{
                    border: "#d9a49b",
                    text: "#b4231f",
                    openBg: "rgba(180,35,31,.05)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    {/* Missed contradiction evidences */}
                    {missedContradictions.map((e) => (
                      <MissedRow
                        key={e.id}
                        title={loc(e.title, lang)}
                        desc={loc(e.contradictionExplanation, lang)}
                        pct={missedEvidencePct}
                      />
                    ))}
                    {/* Wrong verdict row */}
                    <MissedRow
                      title={t("verdictItem", lang)}
                      desc={t("resultLoseSub", lang)}
                      pct={verdictPct}
                    />
                  </div>
                </Drawer>
              </div>
            )}
          </div>

          {/* ── The разбор, on demand — right where the player asks «почему?».
                On a loss it follows "what you missed"; it is the only
                explanation of the case that a wrong verdict now gets. ── */}
          {hasDebrief && (
            <div style={{ padding: "0 24px 16px" }}>
              <Drawer
                label={t("resolutionWhy", lang)}
                open={chainOpen}
                onToggle={() => setChainOpen((v) => !v)}
                tone={{
                  border: win ? "#d6c9ad" : "#d3b0a8",
                  text: win ? "#5d5240" : "#8a4b42",
                  openBg: win ? "rgba(58,48,36,.04)" : "rgba(180,35,31,.04)",
                }}
              >
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {chain
                      ? chain.map((link, index) => (
                          <div
                            key={index}
                            style={{
                              background: "#fffdf8",
                              border: "1px solid #e7ddc9",
                              borderRadius: 5,
                              padding: "10px 12px",
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 0.6,
                                textTransform: "uppercase",
                                color: accent,
                              }}
                            >
                              {index + 1}. {loc(link.label, lang)}
                            </div>
                            <div
                              style={{
                                marginTop: 3,
                                fontFamily: "'IBM Plex Serif', serif",
                                fontSize: 13,
                                lineHeight: 1.5,
                                color: "#3a3024",
                              }}
                            >
                              {loc(link.text, lang)}
                            </div>
                            {link.evidenceIds.length > 0 && (
                              <div
                                style={{
                                  marginTop: 6,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 6,
                                }}
                              >
                                {link.evidenceIds.map((evidenceId) => {
                                  const ev = caseData.evidences.find((e) => e.id === evidenceId);
                                  if (!ev) return null;
                                  return (
                                    <span
                                      key={evidenceId}
                                      style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: 12,
                                        color: "#7a6c54",
                                        background: "#f0e9d8",
                                        borderRadius: 4,
                                        padding: "2px 7px",
                                      }}
                                    >
                                      {loc(ev.title, lang)}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))
                      : /* Cases without an authored chain (archive packs) fall
                           back to their `explanation` lines — same place, same
                           on-demand behaviour, никакой отдельной «истины». */
                        fallbackLines?.map((line, index) => (
                          <div
                            key={index}
                            style={{
                              background: "#fffdf8",
                              border: "1px solid #e7ddc9",
                              borderRadius: 5,
                              padding: "10px 12px",
                              display: "flex",
                              gap: 10,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 12,
                                fontWeight: 700,
                                color: accent,
                                flexShrink: 0,
                              }}
                            >
                              {index + 1}.
                            </span>
                            <span
                              style={{
                                fontFamily: "'IBM Plex Serif', serif",
                                fontSize: 13,
                                lineHeight: 1.5,
                                color: "#3a3024",
                              }}
                            >
                              {line}
                            </span>
                          </div>
                        ))}
                  </div>
              </Drawer>
            </div>
          )}

          {/* ── The arc discovery, visually its own thing ─────────── */}
          {story?.arcReveal && (
            <motion.div
              style={{ padding: "0 24px 16px" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BEAT.spoils, duration: 0.3 }}
            >
              <div
                style={{
                  border: "1px dashed #9a8c70",
                  borderRadius: 6,
                  background: "rgba(58,48,36,.05)",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: "#7a6c54",
                  }}
                >
                  {t("resolutionArchiveEntry", lang)}
                </div>
                <div
                  style={{
                    marginTop: 5,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#3a3024",
                  }}
                >
                  {loc(story.arcReveal.title, lang)}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontFamily: "'IBM Plex Serif', serif",
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "#4a4030",
                  }}
                >
                  {loc(story.arcReveal.text, lang)}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Promotion banner ─────────────────────────────────── */}
          {promotedToLevel && (
            <div style={{ padding: "0 24px 14px" }}>
              <motion.div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
                initial={{ scale: 1.3, opacity: 0, rotate: -3 }}
                animate={{ scale: 1, opacity: 1, rotate: -3 }}
                transition={{ type: "spring", stiffness: 380, damping: 18, delay: BEAT.spoils }}
              >
                <span
                  style={{
                    display: "inline-block",
                    borderRadius: 7,
                    border: "3.5px solid #c9a23e",
                    padding: "6px 16px",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#c9a23e",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {t("promotion", lang)}
                  <span style={{ marginTop: 2, display: "block", fontSize: 15 }}>
                    {formatInvestigatorLevel(promotedToLevel, lang)}
                  </span>
                </span>
              </motion.div>
            </div>
          )}

          {/* ── Achievements ─────────────────────────────────────── */}
          {unlocked.length > 0 && (
            <motion.div
              style={{ padding: "0 24px 16px", display: "flex", flexDirection: "column", gap: 8 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BEAT.spoils, duration: 0.3 }}
            >
              {unlocked.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderRadius: 8,
                    border: "1px solid rgba(201,162,62,.4)",
                    background: "rgba(201,162,62,.1)",
                    padding: "8px 12px",
                  }}
                >
                  <span style={{ fontSize: 22 }} aria-hidden>
                    {a.icon}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#c9a23e",
                      }}
                    >
                      {t("achievementUnlocked", lang)}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#3a3024",
                      }}
                    >
                      {loc(a.title, lang)}
                    </p>
                  </div>
                  <span
                    style={{
                      marginLeft: "auto",
                      whiteSpace: "nowrap",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      color: "#7a6c54",
                    }}
                  >
                    +{a.xpBonus} · +₽{a.rubBonus}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* ── Action row — pinned, never scrolled past ──────────── */}
        {/* Win: [← desk] [next case]. Loss: the two real choices side by side —
            re-run the same case, or move on — with the desk as a quiet link. */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "14px 24px 16px",
            background: "#f5f1e8",
            borderTop: divider,
            boxShadow: "0 -8px 18px -14px rgba(58,48,36,.7)",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {win && !hideBack && (
              <button
                type="button"
                onClick={onBackToDesk}
                style={{
                  flexShrink: 0,
                  padding: "0 18px",
                  height: 50,
                  border: "1.5px solid #d6c9ad",
                  borderRadius: 10,
                  background: "transparent",
                  color: "#7a6c54",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ← {t("backToDesk", lang)}
              </button>
            )}
            {!win && (
              <button
                type="button"
                onClick={onReplay}
                style={{
                  flex: 1,
                  height: 50,
                  padding: "0 12px",
                  border: "none",
                  borderRadius: 10,
                  background: "#b4231f",
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  cursor: "pointer",
                }}
              >
                {t("replayCase", lang)}
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              style={{
                flex: 1,
                height: 50,
                padding: "0 12px",
                border: win ? "none" : "1.5px solid #d3b0a8",
                borderRadius: 10,
                background: win ? "#3a3024" : "transparent",
                color: win ? "#fff" : "#8a4b42",
                fontFamily: "'Inter', sans-serif",
                fontSize: win ? 16 : 14,
                fontWeight: 700,
                letterSpacing: 0.3,
                cursor: "pointer",
              }}
            >
              {t("nextCase", lang)} →
            </button>
          </div>
          {!win && !hideBack && (
            <button
              type="button"
              onClick={onBackToDesk}
              style={{
                height: 34,
                border: "none",
                background: "transparent",
                color: "#a98379",
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← {t("backToDesk", lang)}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * A closed drawer on the sheet: one 44px row that opens and closes in place.
 * The header never disappears, so whatever the player opened they can shut.
 */
function Drawer({
  label,
  open,
  onToggle,
  tone,
  tracking = 0.3,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  tone: { border: string; text: string; openBg: string };
  tracking?: number;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  return (
    <div
      style={{
        border: `1.5px solid ${tone.border}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          width: "100%",
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "0 14px",
          border: "none",
          background: open ? tone.openBg : "transparent",
          color: tone.text,
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: tracking,
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span>{label}</span>
        <span
          aria-hidden
          style={{
            flexShrink: 0,
            fontSize: 11,
            lineHeight: 1,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s ease-out",
          }}
        >
          ▼
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            ref={panelRef}
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
            // The drawers sit at the bottom of the scrolling sheet, so an opened
            // panel would otherwise unfold below the fold: the player taps, the
            // chevron flips and nothing appears. `nearest` never jumps a panel
            // that is already fully visible.
            onAnimationComplete={() => {
              if (!open) return;
              panelRef.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
            }}
          >
            <div style={{ padding: "13px 14px 15px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Compact label+value pill — the payout's earned extras, one row, no tiles. */
function Chip({
  label,
  value,
  color,
  border,
}: {
  label: string;
  value: string;
  color: string;
  border: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        padding: "5px 11px",
        background: "#fffdf8",
        border: `1px solid ${border}`,
        borderRadius: 20,
      }}
    >
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 500,
          color: "#8a7c64",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13,
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </span>
    </span>
  );
}

function AccuracyRow({
  success,
  fail,
  label,
  value,
}: {
  success?: boolean;
  fail?: boolean;
  label: string;
  value: string;
}) {
  const color = fail ? "#b4231f" : success ? "#15803d" : "#9ca3af";
  return (
    <motion.div
      style={{ display: "flex", alignItems: "center", gap: 10 }}
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <span
        style={{
          width: 17,
          height: 17,
          flexShrink: 0,
          borderRadius: "50%",
          background: color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {fail ? "✗" : "✓"}
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 500,
          color: "#4a4030",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          fontWeight: 600,
          color,
        }}
      >
        {value}
      </span>
    </motion.div>
  );
}

function MissedRow({
  title,
  desc,
  pct,
}: {
  title: string;
  desc: string;
  pct: number;
}) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <span
        style={{
          width: 17,
          height: 17,
          flexShrink: 0,
          marginTop: 1,
          borderRadius: "50%",
          background: "#b4231f",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        ✗
      </span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: "#3a3024",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            lineHeight: 1.45,
            color: "#7a6c54",
          }}
        >
          {desc}
        </div>
      </div>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          fontWeight: 600,
          color: "#b4231f",
          flexShrink: 0,
        }}
      >
        −{pct}%
      </span>
    </div>
  );
}
