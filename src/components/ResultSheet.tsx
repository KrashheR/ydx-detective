import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import type { Case, Language, RewardBreakdown } from "../types";
import { ACHIEVEMENTS_BY_ID } from "../data/achievements";
import { formatInvestigatorLevel, loc, t } from "../i18n/ui";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface Props {
  result: RewardBreakdown;
  caseData: Case;
  lang: Language;
  /** Career XP earned for this case. */
  xpGained: number;
  /** Investigator level the player was promoted to, or null if no promotion. */
  promotedToLevel: number | null;
  /** Achievement ids unlocked by closing this case. */
  newAchievementIds: string[];
  /** Fired on mount so the host can flush an immediate cloud save. */
  onMounted: () => void;
  /** Called when player taps "Double reward" — host handles the rewarded-ad flow. */
  onDoubleReward: () => void;
  /** True once the double has been claimed for this result — hides the button. */
  rewardDoubled: boolean;
  onNext: () => void;
  onBackToDesk: () => void;
}

/** Post-verdict resolution overlay with reward breakdown + explanation memo. */
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
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onBackToDeskRef = useRef(onBackToDesk);
  const resultTitleId = `result-sheet-title-${caseData.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const resultDescId = `result-sheet-desc-${caseData.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  const unlocked = newAchievementIds
    .map((id) => ACHIEVEMENTS_BY_ID.get(id))
    .filter((a): a is NonNullable<typeof a> => a != null);

  // Case closure = critical save moment (un-debounced cloud write).
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
    : t("investigatorError", lang);

  // Reconstruct the reward-quality percentage from currency components.
  const base = caseData.claimAmount * result.dailyMultiplierApplied || 1;
  const verdictPct = Math.round((result.verdictComponent / base) * 100);
  const proofPct = Math.round((result.proofComponent / base) * 100);
  const efficiencyPct = Math.round((result.efficiencyComponent / base) * 100);
  const rewardPct = verdictPct + proofPct + efficiencyPct;

  // Animate the progress bar from 0 → rewardPct shortly after mount.
  const [barFill, setBarFill] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setBarFill(rewardPct), 110);
    return () => window.clearTimeout(id);
  }, [rewardPct]);

  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const sign = (n: number) => (n >= 0 ? "+ " : "− ");

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

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-[22px]"
      style={{ background: "rgba(8,11,17,.86)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resultTitleId}
        aria-describedby={resultDescId}
        className="relative max-h-full w-full max-w-[430px] overflow-auto bg-paper"
        style={{ borderRadius: 10, boxShadow: "0 30px 80px rgba(0,0,0,.7)" }}
        initial={{ y: 16, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        {/* Resolution stamp */}
        <div className="border-b border-[#d8d3c7] px-[22px] pb-[26px] pt-[36px] text-center">
          <motion.span
            id={resultTitleId}
            className={`inline-block rounded-md border-4 px-8 py-4 font-mono text-[19px] font-bold uppercase tracking-wide ${
              win ? "border-success text-success" : "border-danger text-danger"
            }`}
            style={{ opacity: 0.94 }}
            initial={{ scale: 2.2, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 0.94, rotate: -8 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 18,
              delay: 0.1,
            }}
          >
            {stampText}
          </motion.span>
          <div id={resultDescId} className="mt-6 text-[13px] text-text-dim">
            {win ? t("resultWinSub", lang) : t("resultLoseSub", lang)}
          </div>
        </div>

        <div className="p-[22px]">
          {/* Reward percentage + bar */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-text-dim">
              {t("rewardRevealed", lang)}
            </span>
            <span className="font-mono text-[20px] font-bold text-ink">
              {rewardPct}%
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-md bg-[#e5e7eb]">
            <div
              className="h-full rounded-md"
              style={{
                width: `${barFill}%`,
                background: "linear-gradient(90deg,rgb(var(--accent)),#5c7a33)",
                transition: "width .9s cubic-bezier(.2,.8,.2,1)",
              }}
            />
          </div>

          {/* Dot breakdown */}
          <div className="mt-4 flex flex-col gap-2.5">
            <DotRow
              got={win}
              label={t("verdictReward", lang)}
              value={`+${verdictPct}%`}
            />
            <DotRow
              got={result.proofComponent > 0}
              label={t("proofReward", lang)}
              value={`+${proofPct}%`}
            />
            {result.efficiencyComponent > 0 && (
              <DotRow
                got
                label={t("efficiencyReward", lang)}
                value={`+${efficiencyPct}%`}
              />
            )}
            {result.bonusComponent > 0 && (
              <DotRow
                got
                gold
                label={`${t("bonus", lang)}`}
                value={`+${result.bonusPct}%`}
              />
            )}
            {result.penalty > 0 && (
              <DotRow
                got={false}
                danger
                label={`${t("penaltyFalseStamps", lang)} ×${result.falseStamps}`}
                value={`− ${fmt(result.penalty)} ₽`}
              />
            )}
          </div>

          {/* Why money was deducted — shown only when a false-stamp penalty applied. */}
          {result.penalty > 0 && (
            <p className="mt-2.5 rounded border-l-[3px] border-danger bg-danger/5 px-3 py-2 text-[12px] leading-snug text-danger">
              {t("penaltyFalseStampsHint", lang)}
            </p>
          )}

          {/* Fee + company balance tiles */}
          <div className="mt-[18px] flex gap-2.5">
            <Tile
              label={t("fee", lang)}
              value={`${sign(result.total)}${fmt(Math.abs(result.total))} ₽`}
              positive={result.total >= 0}
            />
            <Tile
              label={t("companyBalance", lang)}
              value={`${win ? "+ " : "− "}${fmt(caseData.claimAmount)} ₽`}
              positive={win}
            />
          </div>

          <div className="mt-2.5 flex justify-between rounded-md border border-black/10 bg-white px-3 py-2 text-sm">
            <span className="text-text-dim">{t("xpGained", lang)}</span>
            <span className="font-mono font-semibold text-accent">
              +{xpGained}
            </span>
          </div>

          {/* Promotion banner (extended feature) */}
          {promotedToLevel && (
            <motion.div
              className="mt-3 flex justify-center"
              initial={{ scale: 1.3, opacity: 0, rotate: -3 }}
              animate={{ scale: 1, opacity: 1, rotate: -3 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 18,
                delay: 0.6,
              }}
            >
              <span className="ink-stamp rounded-md border-4 border-gold px-4 py-1.5 text-center text-sm font-bold text-gold">
                {t("promotion", lang)}
                <span className="mt-0.5 block text-base">
                  {formatInvestigatorLevel(promotedToLevel, lang)}
                </span>
              </span>
            </motion.div>
          )}

          {/* Newly unlocked achievements (extended feature) */}
          {unlocked.length > 0 && (
            <div className="mt-3 space-y-2">
              {unlocked.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-md border border-gold/40 bg-gold/10 px-3 py-2"
                >
                  <span className="text-2xl" aria-hidden>
                    {a.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">
                      {t("achievementUnlocked", lang)}
                    </p>
                    <p className="font-semibold text-ink">
                      {loc(a.title, lang)}
                    </p>
                  </div>
                  <span className="ml-auto whitespace-nowrap font-mono text-xs text-ink/55">
                    +{a.xpBonus} · +₽{a.rubBonus}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Truth of the case */}
          <div className="mt-[18px] rounded border-l-[3px] border-stamp bg-white p-3.5">
            <div className="mb-1.5 text-[11px] font-semibold tracking-[1px] text-text-muted">
              {t("truthOfCase", lang)}
            </div>
            <ol className="m-0 list-decimal space-y-1 pl-5 font-serif text-[13px] leading-relaxed text-ink/90">
              {loc(caseData.explanation, lang).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </div>

          {result.total > 0 && (
            <div className="mt-[18px]">
              {rewardDoubled ? (
                <div className="flex h-[46px] items-center justify-center rounded-[9px] border border-success/40 bg-success/10 text-sm font-semibold text-success">
                  {t("rewardDoubled", lang)}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onDoubleReward}
                  className="h-[46px] w-full rounded-[9px] border border-gold/50 bg-gold/10 text-sm font-semibold text-gold hover:bg-gold/20"
                >
                  {t("doubleReward", lang)} (+
                  {Math.abs(result.total).toLocaleString("ru-RU")} ₽)
                </button>
              )}
            </div>
          )}

          <div className="mt-[14px] flex gap-2.5">
            <button
              type="button"
              onClick={onBackToDesk}
              className="h-[50px] flex-1 rounded-[9px] border border-ink/20 text-sm font-semibold text-ink hover:bg-black/5"
            >
              {t("backToDesk", lang)}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="h-[50px] flex-[2] rounded-[9px] bg-folder-edge text-sm font-bold text-white hover:brightness-110"
            >
              {t("nextCase", lang)} →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DotRow({
  got,
  label,
  value,
  gold,
  danger,
}: {
  got: boolean;
  label: string;
  value: string;
  gold?: boolean;
  danger?: boolean;
}) {
  const color = danger
    ? "#b23a2e"
    : gold
      ? "#c98a2e"
      : got
        ? "#5c7a33"
        : "#9ca3af";
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: color }}
      >
        {danger ? "!" : got ? "✓" : "—"}
      </span>
      <span className="flex-1 text-xs font-medium text-ink/80">{label}</span>
      <span className="font-mono text-xs font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function Tile({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="flex-1 rounded-lg border border-black/10 bg-white p-[11px] text-center">
      <div className="text-[10px] font-medium text-text-dim">{label}</div>
      <div
        className={`mt-0.5 font-mono text-sm font-bold ${
          positive ? "text-success" : "text-danger"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
