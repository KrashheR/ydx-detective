import { motion } from "framer-motion";
import type { Case, CaseResult, Language } from "../types";
import type { CaseUnlockInfo } from "../engine/caseUnlockEngine";
import { loc, t } from "../i18n/ui";
import {
  formatCaseLabel,
  formatCaseLockMessage,
  formatCaseLockTooltip,
} from "../utils/caseDisplay";
import { asset } from "../utils/asset";
import { formatCountdown } from "./icons";
import { LanguageSelector } from "./LanguageSelector";
import { Tooltip } from "./Tooltip";

interface Props {
  standardCaseUnlocks: CaseUnlockInfo[];
  dailyCase: Case | undefined;
  dailyUnlocked: boolean;
  dailyMsRemaining: number;
  lang: Language;
  balance: number;
  results: Record<string, CaseResult>;
  onSelectStandardCase: (info: CaseUnlockInfo) => void;
  onSelect: (c: Case) => void;
  onDailyLocked: () => void;
  onLanguage: (lang: Language) => void;
}

function caseAccuracyPct(result: CaseResult): number {
  if (result.totalContradictions === 0) return 100;
  return Math.max(
    0,
    Math.round(
      (result.correctlyMarkedContradictions / result.totalContradictions) * 100,
    ),
  );
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-[9px] font-mono text-[10px] font-bold tracking-[.14em] text-text-muted uppercase">
    {children}
  </div>
);

/** Mobile-only grouped case-selection screen: Daily → Next → Solved → Locked. */
export function MobileDeskMenu({
  standardCaseUnlocks,
  dailyCase,
  dailyUnlocked,
  dailyMsRemaining,
  lang,
  balance,
  results,
  onSelectStandardCase,
  onSelect,
  onDailyLocked,
  onLanguage,
}: Props) {
  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const solvedCases = standardCaseUnlocks.filter(
    (i) => i.status === "completed",
  );
  const availableCases = standardCaseUnlocks.filter(
    (i) => i.status === "available",
  );
  const lockedCases = standardCaseUnlocks.filter((i) => i.status === "locked");
  const nextCase = availableCases[0] ?? null;
  const extraAvailable = availableCases.slice(1);

  const total = standardCaseUnlocks.length;
  const solvedCount = solvedCases.length;
  const progressPct = total > 0 ? (solvedCount / total) * 100 : 0;

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── App bar ──────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 pb-3 pt-[14px]"
        style={{
          background: "rgb(244, 233, 211)",
          borderBottom: "1px solid #ddd0b6",
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div
            className="font-sans text-[13px] font-bold tracking-[.06em]"
            style={{ color: "#3a3024" }}
          >
            {t("gameTitle", lang).toUpperCase()}
          </div>
          <LanguageSelector lang={lang} onChange={onLanguage} />
        </div>

        {/* Progress + balance */}
        <div className="mt-[11px] flex items-center gap-[10px]">
          <div className="min-w-0 flex-1">
            <div className="mb-[5px] flex items-baseline justify-between">
              <span
                className="font-mono text-[10px] font-bold tracking-[.1em]"
                style={{ color: "#a89a80" }}
              >
                {t("solved", lang).toUpperCase()}
              </span>
              <span
                className="font-mono text-[11px] font-bold"
                style={{ color: "#3a3024" }}
              >
                {solvedCount} / {total}
              </span>
            </div>
            <div
              className="h-[5px] overflow-hidden rounded-full"
              style={{ background: "#ddd0b6" }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${progressPct}%`, background: "#b3702f" }}
              />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div
              className="font-sans text-[9px] font-medium"
              style={{ color: "#9a8c6e" }}
            >
              {t("balance", lang)}
            </div>
            <div
              className="font-mono text-[13px] font-bold"
              style={{ color: "#3f8f4e" }}
            >
              ₽ {fmt(balance)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-[14px]">
        {/* ДЕЛО ДНЯ */}
        {dailyCase && (
          <section className="mb-5">
            <SectionLabel>{t("dailyCase", lang).toUpperCase()}</SectionLabel>
            <Tooltip
              className="block"
              side="bottom"
              label={dailyUnlocked ? null : t("tipDailyLocked", lang)}
            >
              <motion.button
                type="button"
                onClick={() =>
                  dailyUnlocked ? onSelect(dailyCase) : onDailyLocked()
                }
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="relative block w-full overflow-hidden text-left"
                style={{
                  background: "linear-gradient(135deg,#e6b052,#d6982f)",
                  border: "1px solid #b07d1f",
                  borderRadius: 11,
                  padding: "16px 18px",
                  boxShadow: "0 12px 26px rgba(40,28,10,.2)",
                }}
              >
                {/* СРОЧНО stamp */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute font-mono text-[9px] font-extrabold tracking-[.16em] text-white"
                  style={{
                    top: 14,
                    right: -32,
                    transform: "rotate(34deg)",
                    background: "#b4231f",
                    padding: "4px 38px",
                  }}
                >
                  {t("urgent", lang)}
                </span>
                <div
                  className="font-mono text-[10px] font-semibold tracking-[.06em]"
                  style={{ color: "#5c3f08" }}
                >
                  {dailyUnlocked
                    ? t("dailyCase", lang).toUpperCase()
                    : `${t("dailyCase", lang).toUpperCase()} · ${formatCountdown(dailyMsRemaining)}`}
                </div>
                <div
                  className="mt-[6px] max-w-[82%] font-serif text-[21px] font-bold leading-tight"
                  style={{ color: "#3a2705" }}
                >
                  {loc(dailyCase.title, lang)}
                </div>
                <div className="mt-[13px] flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-md px-[10px] py-[5px] font-sans text-[11px] font-bold"
                    style={{ background: "#3a2705", color: "#f0c46b" }}
                  >
                    {t("dailyRewardBadge", lang)}
                  </span>
                  <span
                    className="rounded-md px-[10px] py-[5px] font-sans text-[11px] font-bold"
                    style={{
                      background: "rgba(58,39,5,.16)",
                      color: "#3a2705",
                    }}
                  >
                    {t("dailyDifficultyBadge", lang)}
                  </span>
                  {dailyUnlocked ? (
                    <span
                      className="ml-auto font-mono text-[11px] font-semibold"
                      style={{ color: "#5c3f08" }}
                    >
                      {dailyCase.evidences.length} {t("documents", lang)}
                    </span>
                  ) : (
                    <span
                      className="ml-auto font-sans text-[11px] font-bold"
                      style={{ color: "#3a2705" }}
                    >
                      ▶ {t("watchAd", lang)}
                    </span>
                  )}
                </div>
              </motion.button>
            </Tooltip>
          </section>
        )}

        {/* СЛЕДУЮЩЕЕ ДЕЛО */}
        {nextCase && (
          <section className="mb-5">
            <SectionLabel>{t("nextCase", lang).toUpperCase()}</SectionLabel>
            <motion.button
              type="button"
              onClick={() => onSelectStandardCase(nextCase)}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="block w-full overflow-hidden text-left"
              style={{
                background: "#d8b95e",
                border: "1px solid #876520",
                borderRadius: 11,
                padding: 16,
                boxShadow: "0 14px 30px rgba(135,101,32,.26)",
              }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-[10px]">
                <div className="min-w-0">
                  <div
                    className="font-mono text-[10px] font-semibold tracking-[.06em]"
                    style={{ color: "#6e5a24" }}
                  >
                    {formatCaseLabel(nextCase.caseData, lang).toUpperCase()}
                  </div>
                  <div
                    className="mt-1 font-serif text-[22px] font-bold leading-tight"
                    style={{ color: "#2e2207" }}
                  >
                    {loc(nextCase.caseData.title, lang)}
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-[6px] font-mono text-[9px] font-extrabold tracking-[.06em]"
                  style={{
                    color: "#fff",
                    background: "#876520",
                    padding: "5px 9px",
                  }}
                >
                  {t("availableStatus", lang)}
                </span>
              </div>

              {/* Client row */}
              <div className="mt-[14px] flex items-center gap-[11px]">
                <div
                  className="h-[44px] w-[44px] shrink-0 overflow-hidden rounded-[6px]"
                  style={{ border: "1px solid rgba(0,0,0,.2)" }}
                >
                  {nextCase.caseData.personImage ? (
                    <img
                      src={asset(nextCase.caseData.personImage)}
                      alt={loc(nextCase.caseData.claim.person, lang)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center top",
                        display: "block",
                        filter: "saturate(.9) contrast(.97)",
                      }}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center font-mono text-[7px] font-semibold"
                      style={{
                        background:
                          "repeating-linear-gradient(135deg,#c6ad55 0 6px,#bda049 6px 12px)",
                        color: "#5c4a1a",
                      }}
                    >
                      ID
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div
                    className="font-sans text-[13px] font-semibold"
                    style={{ color: "#2e2207" }}
                  >
                    {loc(nextCase.caseData.claim.person, lang)}
                  </div>
                  <div
                    className="mt-[2px] font-mono text-[12px] font-semibold"
                    style={{ color: "#6e5a24" }}
                  >
                    {fmt(nextCase.caseData.claimAmount)} ₽ ·{" "}
                    {nextCase.caseData.evidences.length} {t("documents", lang)}
                  </div>
                </div>
              </div>

              {/* Footer row */}
              <div
                className="mt-[14px] flex items-center justify-between pt-[13px]"
                style={{ borderTop: "1px solid rgba(0,0,0,.16)" }}
              >
                <span
                  className="flex items-center gap-[6px] rounded-[4px] border font-mono text-[10px] font-semibold"
                  style={{
                    color: "#b4231f",
                    borderColor: "#b4231f",
                    padding: "3px 7px",
                  }}
                >
                  {t("confidential", lang).slice(0, 6).toUpperCase()}.
                </span>
                <span
                  className="font-sans text-[14px] font-bold"
                  style={{ color: "#2e2207" }}
                >
                  {t("openCaseAction", lang)} →
                </span>
              </div>
            </motion.button>
          </section>
        )}

        {/* Extra available cases (rare edge case) */}
        {extraAvailable.length > 0 && (
          <section className="mb-5">
            {extraAvailable.map((info) => (
              <motion.button
                key={info.caseData.id}
                type="button"
                onClick={() => onSelectStandardCase(info)}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="mb-[9px] flex w-full items-center gap-3 rounded-[10px] text-left"
                style={{
                  background: "#d8b95e",
                  border: "1px solid #876520",
                  padding: "12px 14px",
                }}
              >
                <div
                  className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
                  style={{
                    background: "rgba(135,101,32,.15)",
                    border: "1px solid rgba(135,101,32,.4)",
                    color: "#876520",
                  }}
                >
                  →
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="font-serif text-[14px] font-semibold"
                    style={{ color: "#2e2207" }}
                  >
                    {loc(info.caseData.title, lang)}
                  </div>
                  <div
                    className="font-sans text-[11px] font-medium"
                    style={{ color: "#6e5a24" }}
                  >
                    {formatCaseLabel(info.caseData, lang)} ·{" "}
                    {fmt(info.caseData.claimAmount)} ₽
                  </div>
                </div>
                <span
                  className="shrink-0 font-sans text-[11px] font-bold"
                  style={{ color: "#2e2207" }}
                >
                  →
                </span>
              </motion.button>
            ))}
          </section>
        )}

        {/* РАСКРЫТО */}
        {solvedCases.length > 0 && (
          <section className="mb-5">
            <div className="mb-[9px] flex items-baseline gap-[7px]">
              <span
                className="font-mono text-[10px] font-bold tracking-[.14em]"
                style={{ color: "#a89a80" }}
              >
                {t("solved", lang).toUpperCase()}
              </span>
              <span
                className="font-mono text-[10px] font-bold"
                style={{ color: "#4f8a4a" }}
              >
                {solvedCases.length}
              </span>
            </div>
            <div className="flex flex-col gap-[9px]">
              {solvedCases.map((info) => {
                const result = results[info.caseData.id];
                const reward = result?.rewardEarned ?? 0;
                const pct = result ? caseAccuracyPct(result) : null;
                return (
                  <Tooltip
                    key={info.caseData.id}
                    className="block"
                    side="bottom"
                    label={null}
                  >
                    <motion.button
                      type="button"
                      onClick={() => onSelectStandardCase(info)}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.1 }}
                      className="flex w-full items-center gap-3 rounded-[10px] text-left"
                      style={{
                        background: "#f3ecdd",
                        border: "1px solid #dcd0b6",
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full font-sans text-[13px] font-bold"
                        style={{
                          background: "rgba(79,138,74,.15)",
                          border: "1px solid rgba(79,138,74,.4)",
                          color: "#4f8a4a",
                        }}
                      >
                        ✓
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="font-serif text-[14px] font-semibold"
                          style={{ color: "#3a3024" }}
                        >
                          {loc(info.caseData.title, lang)}
                        </div>
                        <div
                          className="mt-[1px] font-sans text-[11px] font-medium"
                          style={{ color: "#9a8c6e" }}
                        >
                          {formatCaseLabel(info.caseData, lang)} ·{" "}
                          {loc(info.caseData.claim.person, lang)}
                        </div>
                      </div>
                      {result && (
                        <div className="shrink-0 text-right">
                          <div
                            className="font-mono text-[12px] font-bold"
                            style={{ color: "#3f8f4e" }}
                          >
                            +{fmt(reward)} ₽
                          </div>
                          {pct !== null && (
                            <div
                              className="mt-[1px] font-mono text-[10px] font-medium"
                              style={{ color: "#a89a80" }}
                            >
                              {t("accuracy", lang).slice(0, 5).toLowerCase()}.{" "}
                              {pct}%
                            </div>
                          )}
                        </div>
                      )}
                    </motion.button>
                  </Tooltip>
                );
              })}
            </div>
          </section>
        )}

        {/* ЗАБЛОКИРОВАНО */}
        {lockedCases.length > 0 && (
          <section>
            <div className="mb-[9px] flex items-baseline gap-[7px]">
              <span
                className="font-mono text-[10px] font-bold tracking-[.14em]"
                style={{ color: "#a89a80" }}
              >
                {t("lockedStatus", lang).toUpperCase()}
              </span>
              <span
                className="font-mono text-[10px] font-bold"
                style={{ color: "#b3ab98" }}
              >
                {lockedCases.length}
              </span>
            </div>
            <div className="flex flex-col gap-[9px]">
              {lockedCases.map((info) => (
                <Tooltip
                  key={info.caseData.id}
                  className="block"
                  side="bottom"
                  label={formatCaseLockTooltip(info, lang)}
                >
                  <div
                    className="flex items-center gap-3 rounded-[10px]"
                    style={{
                      background: "#e3ddcf",
                      border: "1px solid #d3ccbb",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[12px]"
                      style={{
                        background: "rgba(0,0,0,.05)",
                        border: "1px solid #c5bca6",
                        color: "#9b937f",
                      }}
                    >
                      🔒
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate font-serif text-[14px] font-semibold"
                        style={{ color: "#7a7058" }}
                      >
                        {loc(info.caseData.title, lang)}
                      </div>
                      <div
                        className="mt-[1px] font-sans text-[11px] font-medium"
                        style={{ color: "#a89a80" }}
                      >
                        {formatCaseLockMessage(info, lang)}
                      </div>
                    </div>
                    <span
                      className="shrink-0 font-mono text-[10px] font-semibold"
                      style={{ color: "#a89a80" }}
                    >
                      {formatCaseLabel(info.caseData, lang)}
                    </span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
