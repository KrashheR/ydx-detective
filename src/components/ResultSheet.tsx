import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import type { Case, Language, RewardBreakdown } from "../types";
import { GAME_CONFIG } from "../config/gameConfig";
import { ACHIEVEMENTS_BY_ID } from "../data/achievements";
import { formatInvestigatorLevel, loc, t } from "../i18n/ui";
import { useCountUp } from "../hooks/useCountUp";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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

  const base = GAME_CONFIG.reward.baseByDifficulty[caseData.difficulty] * result.dailyMultiplierApplied || 1;
  const verdictPct = Math.round((result.verdictComponent / base) * 100);
  const proofPct = Math.round((result.proofComponent / base) * 100);
  const efficiencyPct = Math.round((result.efficiencyComponent / base) * 100);
  const rewardPct = verdictPct + proofPct + efficiencyPct;

  const [barFill, setBarFill] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setBarFill(rewardPct), 110);
    return () => window.clearTimeout(id);
  }, [rewardPct]);

  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const sign = (n: number) => (n >= 0 ? "+" : "−");

  const displayPayout = useCountUp(
    win ? Math.abs(result.total) : caseData.claimAmount,
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

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-[16px]"
      style={{ background: "rgba(8,11,17,.86)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Neutral wrapper: the cream result sheet stands on its own without a dark frame. */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resultTitleId}
        aria-describedby={resultDescId}
        className="relative max-h-full w-full max-w-[430px] overflow-auto focus:outline-none"
        style={{
          background: "transparent",
          borderRadius: 11,
          padding: 0,
          boxShadow: "0 24px 60px rgba(0,0,0,.5)",
        }}
        initial={{ y: 16, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        {/* Inner cream card */}
        <div
          style={{
            background: "#f5f1e8",
            borderRadius: 11,
            overflow: "hidden",
            boxShadow: "0 1px 0 rgba(255,255,255,.5) inset",
          }}
        >
          {/* ── Hero / stamp section ─────────────────────────────── */}
          <div
            style={{
              padding: "28px 24px 22px",
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
                display: "inline-block",
                transform: "rotate(-7deg)",
                border: `3.5px solid ${win ? "#15803d" : "#b4231f"}`,
                color: win ? "#15803d" : "#b4231f",
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
              transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.1 }}
            >
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

          {/* ── Payout / loss hero ───────────────────────────────── */}
          <div
            style={{
              padding: "22px 24px 20px",
              textAlign: "center",
              borderBottom: `1px solid ${win ? "#e7ddc9" : "#ecddd6"}`,
            }}
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
                color: win ? "#15803d" : "#b4231f",
                marginTop: 8,
                letterSpacing: -0.5,
              }}
            >
              {win ? "+" : "− "}
              {fmt(displayPayout)} ₽
            </div>

            {result.mastery !== "none" && (
              <div className="mx-auto mt-3 w-fit rotate-[-2deg] border-2 border-folder-edge px-3 py-1 font-mono text-xs font-bold uppercase tracking-[.18em] text-folder-edge">
                {t("mastery", lang)} · {t(
                  result.mastery === "gold"
                    ? "masteryGold"
                    : result.mastery === "silver"
                      ? "masterySilver"
                      : "masteryBronze",
                  lang,
                )}
              </div>
            )}

            {/* Bonus badge (win + bonus) */}
            {win && result.bonusComponent > 0 && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 11,
                  padding: "4px 11px",
                  background: "rgba(199,154,58,.16)",
                  border: "1px solid rgba(199,154,58,.5)",
                  borderRadius: 20,
                }}
              >
                <span style={{ color: "#a9781f", fontSize: 11 }}>★</span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#8a6515",
                  }}
                >
                  {t("bonusIdealCase", lang)} · ×{(1 + result.bonusPct / 100).toFixed(2)}
                </span>
              </div>
            )}

            {/* Sub-tiles: budget/fee + XP */}
            <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
              <div
                style={{
                  flex: 1,
                  padding: "9px 8px",
                  background: win ? "#fffdf8" : "#fffaf8",
                  border: `1px solid ${win ? "#ebe2cf" : "#efd9d2"}`,
                  borderRadius: 9,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    color: win ? "#8a7c64" : "#a98379",
                  }}
                >
                  {win ? t("budgetSaved", lang) : t("fee", lang)}
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: win ? "#15803d" : "#9a6a60",
                    marginTop: 2,
                  }}
                >
                  {win
                    ? `+${fmt(caseData.claimAmount)} ₽`
                    : `0 ₽`}
                </div>
              </div>
              <div
                style={{
                  flexShrink: 0,
                  width: 84,
                  padding: "9px 8px",
                  background: win ? "#fffdf8" : "#fffaf8",
                  border: `1px solid ${win ? "#ebe2cf" : "#efd9d2"}`,
                  borderRadius: 9,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    color: win ? "#8a7c64" : "#a98379",
                  }}
                >
                  {t("xpLabel", lang)}
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: win ? "#2f8f83" : "#9a8c70",
                    marginTop: 2,
                  }}
                >
                  +{xpGained} XP
                </div>
              </div>
            </div>
          </div>

          {/* ── Accuracy section ─────────────────────────────────── */}
          <div
            style={{
              padding: "18px 24px 20px",
              borderBottom: `1px solid ${win ? "#e7ddc9" : "#ecddd6"}`,
            }}
          >
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
                  color: win ? "#15803d" : "#b4231f",
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
                  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
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
          </div>

          {/* ── What you missed (lose only) ───────────────────────── */}
          {!win && (
            <div
              style={{
                padding: "18px 24px 16px",
                borderBottom: "1px solid #ecddd6",
              }}
            >
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  color: "#a98379",
                  marginBottom: 11,
                }}
              >
                {t("whatYouMissed", lang)}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 11 }}
              >
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
            </div>
          )}

          {/* ── Double or nothing (win only) ──────────────────────── */}
          {win && result.total > 0 && (
            <div
              style={{
                padding: "16px 24px 18px",
                borderBottom: "1px solid #e7ddc9",
              }}
            >
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

          {/* ── Promotion banner ─────────────────────────────────── */}
          {promotedToLevel && (
            <div style={{ padding: "10px 24px 0" }}>
              <motion.div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
                initial={{ scale: 1.3, opacity: 0, rotate: -3 }}
                animate={{ scale: 1, opacity: 1, rotate: -3 }}
                transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.6 }}
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
            <div style={{ padding: "10px 24px 0", display: "flex", flexDirection: "column", gap: 8 }}>
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
            </div>
          )}

          {/* ── Truth / case outcome ─────────────────────────────── */}
          <div style={{ padding: "18px 24px 14px" }}>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                color: "#9a8c70",
                marginBottom: 9,
              }}
            >
              {!win ? t("howItWas", lang) : t("truthOfCase", lang)}
            </div>
            <div
              style={{
                background: "#fffdf8",
                borderLeft: `3px solid ${win ? "#15803d" : "#b4231f"}`,
                borderRadius: 5,
                padding: "13px 15px",
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              {loc(caseData.explanation, lang).map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      color: win ? "#15803d" : "#b4231f",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}.
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
          </div>

          {/* ── Action buttons ───────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "6px 24px 22px",
            }}
          >
            {!hideBack && <button
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
              {win ? `← ${t("backToDesk", lang)}` : t("backToDesk", lang)}
            </button>}
            <button
              type="button"
              onClick={win ? onNext : onBackToDesk}
              style={{
                flex: 1,
                height: 50,
                border: "none",
                borderRadius: 10,
                background: win ? "#3a3024" : "#b4231f",
                color: "#fff",
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.3,
                cursor: "pointer",
              }}
            >
              {win ? `${t("nextCase", lang)} →` : t("replayCase", lang)}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
