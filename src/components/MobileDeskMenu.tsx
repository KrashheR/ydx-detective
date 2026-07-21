import { motion } from "framer-motion";
import type { CaseResult, CaseSummary, Language, PlayerStats } from "../types";
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
import { SpecialArchivesEntry } from "./SpecialArchivesEntry";

interface Props {
  standardCaseUnlocks: CaseUnlockInfo<CaseSummary>[];
  dailyCase: CaseSummary | undefined;
  dailyUnlocked: boolean;
  dailyMsRemaining: number;
  lang: Language;
  balance: number;
  archiveStats: Pick<
    PlayerStats,
    "archivePurchasedPackIds" | "archiveUnlockedCaseIds"
  >;
  results: Record<string, CaseResult>;
  onSelectStandardCase: (info: CaseUnlockInfo<CaseSummary>) => void;
  onSelect: (c: CaseSummary) => void;
  onDailyLocked: () => void;
  onLanguage: (lang: Language) => void;
  onOpenSpecialArchives: () => void;
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
  <div className="mb-[9px] font-mono text-[12px] font-bold tracking-[.14em] text-text-muted uppercase">
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
  archiveStats,
  results,
  onSelectStandardCase,
  onSelect,
  onDailyLocked,
  onLanguage,
  onOpenSpecialArchives,
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
      <div className="shrink-0 border-b border-mobile-bar-border bg-mobile-bar px-4 pb-3 pt-[14px]">
        <div className="flex items-center justify-between gap-2">
          <div className="font-sans text-[13px] font-bold tracking-[.06em] text-mobile-ink">
            {t("gameTitle", lang).toUpperCase()}
          </div>
          <LanguageSelector lang={lang} onChange={onLanguage} />
        </div>

        {/* Progress + balance */}
        <div className="mt-[11px] flex items-center gap-[10px]">
          <div className="min-w-0 flex-1">
            <div className="mb-[5px] flex items-baseline justify-between">
              <span
                className="font-mono text-[12px] font-bold tracking-[.1em] text-mobile-muted"
              >
                {t("solved", lang).toUpperCase()}
              </span>
              <span
                className="font-mono text-[12px] font-bold text-mobile-ink"
              >
                {solvedCount} / {total}
              </span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-full bg-mobile-bar-border">
              <div
                style={{ width: `${progressPct}%` }}
                className="h-full rounded-full bg-accent transition-[width] duration-500"
              />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div
              className="font-sans text-[12px] font-medium text-mobile-muted-strong"
            >
              {t("balance", lang)}
            </div>
            <div
              className="font-mono text-[13px] font-bold text-mobile-success"
            >
              $ {fmt(balance)}
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
                className="relative block w-full overflow-hidden rounded-[11px] border border-daily-border bg-gold bg-daily-card px-[18px] py-4 text-left shadow-mobile-daily"
              >
                {/* СРОЧНО stamp */}
                <span
                  aria-hidden
                  style={{
                    top: 14,
                    right: -32,
                    transform: "rotate(34deg)",
                    padding: "4px 38px",
                  }}
                  className="pointer-events-none absolute bg-danger font-mono text-[9px] font-extrabold tracking-[.16em] text-white"
                >
                  {t("urgent", lang)}
                </span>
                <div
                  className="font-mono text-[12px] font-semibold tracking-[.06em] text-daily-copy"
                >
                  {dailyUnlocked
                    ? t("dailyCase", lang).toUpperCase()
                    : `${t("dailyCase", lang).toUpperCase()} · ${formatCountdown(dailyMsRemaining)}`}
                </div>
                <div
                  className="mt-[6px] max-w-[82%] font-serif text-[21px] font-bold leading-tight text-daily-ink"
                >
                  {loc(dailyCase.title, lang)}
                </div>
                <div className="mt-[13px] flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-md bg-daily-ink px-[10px] py-[5px] font-sans text-[12px] font-bold text-gold-text"
                  >
                    {t("dailyRewardBadge", lang)}
                  </span>
                  <span
                    className="rounded-md bg-daily-ink/15 px-[10px] py-[5px] font-sans text-[12px] font-bold text-daily-ink"
                  >
                    {t("dailyDifficultyBadge", lang)}
                  </span>
                  {dailyUnlocked ? (
                    <span
                      className="ml-auto font-mono text-[12px] font-semibold text-daily-copy"
                    >
                      {dailyCase.evidenceCount} {t("documents", lang)}
                    </span>
                  ) : (
                    <span
                      className="ml-auto font-sans text-[12px] font-bold text-daily-ink"
                    >
                      ▶ {t("watchAd", lang)}
                    </span>
                  )}
                </div>
              </motion.button>
            </Tooltip>
          </section>
        )}

        <section className="mb-5">
          <SpecialArchivesEntry
            lang={lang}
            stats={archiveStats}
            caseUnlocks={standardCaseUnlocks}
            onOpen={onOpenSpecialArchives}
            compact
          />
        </section>

        {/* СЛЕДУЮЩЕЕ ДЕЛО */}
        {nextCase && (
          <section className="mb-5">
            <SectionLabel>{t("nextCase", lang).toUpperCase()}</SectionLabel>
            <motion.button
              type="button"
              onClick={() => onSelectStandardCase(nextCase)}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="block w-full overflow-hidden rounded-[11px] border border-gold border-folder-gold-edge bg-gold bg-folder-gold p-4 text-left shadow-mobile-folder"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-[10px]">
                <div className="min-w-0">
                  <div
                    className="font-mono text-[12px] font-semibold tracking-[.06em] text-folder-gold-copy"
                  >
                    {formatCaseLabel(nextCase.caseData, lang).toUpperCase()}
                  </div>
                  <div
                    className="mt-1 font-serif text-[22px] font-bold leading-tight text-folder-gold-ink"
                  >
                    {loc(nextCase.caseData.title, lang)}
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-[6px] bg-folder-gold-edge px-[9px] py-[5px] font-mono text-[12px] font-extrabold tracking-[.06em] text-white"
                >
                  {t("availableStatus", lang)}
                </span>
              </div>

              {/* Client row */}
              <div className="mt-[14px] flex items-center gap-[11px]">
                <div
                  className="h-[44px] w-[44px] shrink-0 overflow-hidden rounded-[6px] border border-black/20"
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
                      className="flex h-full w-full items-center justify-center bg-folder-sealed font-mono text-[7px] font-semibold text-folder-gold-pattern"
                    >
                      ID
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div
                    className="font-sans text-[13px] font-semibold text-folder-gold-ink"
                  >
                    {loc(nextCase.caseData.claim.person, lang)}
                  </div>
                  <div
                    className="mt-[2px] font-mono text-[12px] font-semibold text-folder-gold-copy"
                  >
                    {fmt(nextCase.caseData.claimAmount)} $ ·{" "}
                    {nextCase.caseData.evidenceCount} {t("documents", lang)}
                  </div>
                </div>
              </div>

              {/* Footer row */}
              <div
                className="mt-[14px] flex items-center justify-between border-t border-black/15 pt-[13px]"
              >
                <span
                  className="flex items-center gap-[6px] rounded-[4px] border border-danger px-[7px] py-[3px] font-mono text-[10px] font-semibold text-danger"
                >
                  {t("confidential", lang).slice(0, 6).toUpperCase()}.
                </span>
                <span
                  className="font-sans text-[14px] font-bold text-folder-gold-ink"
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
                className="mb-[9px] flex w-full items-center gap-3 rounded-[10px] border border-gold border-folder-gold-edge bg-gold bg-folder-gold px-[14px] py-3 text-left"
              >
                <div
                  className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-folder-gold-edge/40 bg-folder-gold-edge/15 font-mono text-[12px] font-bold text-folder-gold-edge"
                >
                  →
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="font-serif text-[14px] font-semibold text-folder-gold-ink"
                  >
                    {loc(info.caseData.title, lang)}
                  </div>
                  <div
                    className="font-sans text-[12px] font-medium text-folder-gold-copy"
                  >
                    {formatCaseLabel(info.caseData, lang)} ·{" "}
                    {fmt(info.caseData.claimAmount)} $
                  </div>
                </div>
                <span
                  className="shrink-0 font-sans text-[12px] font-bold text-folder-gold-ink"
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
                className="font-mono text-[12px] font-bold tracking-[.14em] text-mobile-muted"
              >
                {t("solved", lang).toUpperCase()}
              </span>
              <span
                className="font-mono text-[12px] font-bold text-mobile-success-soft"
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
                      className="flex w-full items-center gap-3 rounded-[10px] border border-border border-mobile-solved-border bg-surface bg-mobile-solved px-[14px] py-3 text-left"
                    >
                      <div
                        className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-mobile-success-soft/40 bg-mobile-success-soft/15 font-sans text-[13px] font-bold text-mobile-success-soft"
                      >
                        ✓
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="font-serif text-[14px] font-semibold text-mobile-ink"
                        >
                          {loc(info.caseData.title, lang)}
                        </div>
                        <div
                          className="mt-[1px] font-sans text-[12px] font-medium text-mobile-muted-strong"
                        >
                          {formatCaseLabel(info.caseData, lang)} ·{" "}
                          {loc(info.caseData.claim.person, lang)}
                        </div>
                      </div>
                      {result && (
                        <div className="shrink-0 text-right">
                          <div
                            className="font-mono text-[12px] font-bold text-mobile-success"
                          >
                            +{fmt(reward)} $
                          </div>
                          {pct !== null && (
                            <div
                              className="mt-[1px] font-mono text-[12px] font-medium text-mobile-muted"
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
                className="font-mono text-[12px] font-bold tracking-[.14em] text-mobile-muted"
              >
                {t("lockedStatus", lang).toUpperCase()}
              </span>
              <span
                className="font-mono text-[12px] font-bold text-mobile-locked-count"
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
                    className="flex items-center gap-3 rounded-[10px] border border-border border-mobile-locked-border bg-surface-2 bg-mobile-locked px-[14px] py-3"
                  >
                    <div
                      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-mobile-locked-icon bg-black/5 text-[12px] text-mobile-locked-muted"
                    >
                      🔒
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate font-serif text-[14px] font-semibold text-mobile-locked-text"
                      >
                        {loc(info.caseData.title, lang)}
                      </div>
                      <div
                        className="mt-[1px] font-sans text-[12px] font-medium text-mobile-muted"
                      >
                        {formatCaseLockMessage(info, lang)}
                      </div>
                    </div>
                    <span
                      className="shrink-0 font-mono text-[12px] font-semibold text-mobile-muted"
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
