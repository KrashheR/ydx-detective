import type { Case, Language, PlayerStats } from "../types";
import type { CaseUnlockInfo } from "../engine/caseUnlockEngine";
import { summarizeCaseUnlocks } from "../engine/caseUnlockEngine";
import { formatInvestigatorLevel, loc, t } from "../i18n/ui";
import {
  formatCaseLabel,
  formatCaseLockMessage,
  formatCaseLockTooltip,
  tDifficulty,
} from "../utils/caseDisplay";
import { evaluateRank } from "../engine/rankEngine";
import { LanguageSelector } from "./LanguageSelector";
import { Tooltip } from "./Tooltip";
import { SpecialArchivesEntry } from "./SpecialArchivesEntry";

interface Props {
  standardCaseUnlocks: CaseUnlockInfo[];
  dailyCase: Case | undefined;
  dailyUnlocked: boolean;
  dailyMsRemaining: number;
  selectedId: string | null;
  lang: Language;
  /** Cumulative career XP — drives the investigator progress card. */
  xp: number;
  archiveStats: Pick<
    PlayerStats,
    "archivePurchasedPackIds" | "archiveUnlockedCaseIds"
  >;
  onSelect: (c: Case) => void;
  onSelectStandardCase: (info: CaseUnlockInfo) => void;
  onDailyLocked: () => void;
  onLanguage: (lang: Language) => void;
  onOpenSpecialArchives: () => void;
}

/** Left investigation-desk column: brand, language, case list, progress. */
export function LeftSidebar({
  standardCaseUnlocks,
  dailyCase,
  dailyUnlocked,
  dailyMsRemaining,
  selectedId,
  lang,
  xp,
  archiveStats,
  onSelect,
  onSelectStandardCase,
  onDailyLocked,
  onLanguage,
  onOpenSpecialArchives,
}: Props) {
  const rank = evaluateRank(xp);
  const levelTitle = formatInvestigatorLevel(rank.level, lang);
  const unlockSummary = summarizeCaseUnlocks(standardCaseUnlocks);

  return (
    <aside className="flex h-full w-full flex-col rounded-xl border border-border bg-surface p-4 md:p-[18px]">
      {/* Brand */}
      <div className="shrink-0">
        <div className="text-[13px] font-bold leading-snug tracking-wide text-text-light">
          {t("gameTitle", lang)}
        </div>
        <div className="mt-0.5 text-[11px] font-medium tracking-[1px] text-text-dim">
          {t("department", lang)}
        </div>
      </div>

      {/* Language selector */}
      <div className="mt-[15px] shrink-0">
        <LanguageSelector lang={lang} onChange={onLanguage} />
      </div>

      <div className="mt-[15px] shrink-0 border-t border-border" />
      <div className="mt-[15px] shrink-0 text-[11px] font-semibold tracking-[1.5px] text-text-dim">
        {t("casesInWork", lang)}
      </div>

      {/* Scrollable case list — keeps daily card from being crushed by flex shrink */}
      <div className="mt-[15px] flex min-h-0 max-h-[600px] flex-1 flex-col gap-[15px] overflow-y-auto md:max-h-none pr-4">
        {/* Special archives — pinned first */}
        <SpecialArchivesEntry
          lang={lang}
          stats={archiveStats}
          caseUnlocks={standardCaseUnlocks}
          onOpen={onOpenSpecialArchives}
        />

        {/* Daily case — gold URGENT stamp */}
        {dailyCase && (
          <Tooltip
            className="block shrink-0"
            side="bottom"
            label={dailyUnlocked ? null : t("tipDailyLocked", lang)}
          >
            <button
              type="button"
              onClick={() =>
                dailyUnlocked ? onSelect(dailyCase) : onDailyLocked()
              }
              className={`relative block w-full rounded-[9px] border p-3 pr-10 text-left overflow-hidden ${
                dailyUnlocked
                  ? "border-[#c79a3a]"
                  : "border-border opacity-[0.55]"
              } ${dailyCase.id === selectedId ? "ring-1 ring-gold" : ""}`}
              style={
                dailyUnlocked
                  ? { background: "linear-gradient(135deg,#e6c87e,#d29e44)" }
                  : { background: "#d7c6a5" }
              }
            >
              {dailyUnlocked && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 top-[9px] rotate-[34deg] bg-stamp px-[26px] py-0.5 font-mono text-[9px] font-bold tracking-wider text-white"
                >
                  {t("urgent", lang)}
                </span>
              )}
              <div className="text-xs font-bold tracking-[0.5px] text-[#5c3f08]">
                {t("dailyCase", lang)}
              </div>
              <div className="mt-[7px] flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[11px] font-semibold text-[#7a5410]">
                  {dailyUnlocked
                    ? t("openCaseAction", lang)
                    : `▶ ${t("watchAd", lang)}`}
                </span>
                <span className="shrink-0 rounded-[5px] bg-gold px-[7px] py-0.5 text-[11px] font-bold text-gold-dark">
                  ×5
                </span>
              </div>
            </button>
          </Tooltip>
        )}

        {standardCaseUnlocks.map((info) => {
          const c = info.caseData;
          const active = c.id === selectedId;
          const done = info.status === "completed";
          const locked = info.status === "locked";
          return (
            <Tooltip
              key={c.id}
              className="block shrink-0"
              side="bottom"
              label={locked ? formatCaseLockTooltip(info, lang) : null}
            >
              <button
                type="button"
                onClick={() => onSelectStandardCase(info)}
                aria-disabled={locked}
                className={`block w-full rounded-[9px] border bg-surface-2 p-3 text-left transition-colors ${
                  active
                    ? "border-accent"
                    : locked
                      ? "border-border opacity-[0.55]"
                      : "border-border hover:border-black/15"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-text-light">
                    {loc(c.title, lang)}
                  </span>
                  {active ? (
                    <span
                      className="h-[7px] w-[7px] shrink-0 rounded-full bg-accent"
                      aria-hidden
                    />
                  ) : done ? (
                    <span
                      className="inline-flex h-[7px] w-[7px] shrink-0 items-center justify-center text-[12px] font-bold leading-none text-success"
                      aria-hidden
                    >
                      ✓
                    </span>
                  ) : locked ? (
                    <span className="shrink-0 font-mono text-[10px] text-text-dim">
                      {t("lockedStatus", lang)}
                    </span>
                  ) : null}
                </div>
                <div className="mt-[3px] text-[11px] font-medium text-text-dim">
                  {formatCaseLabel(c, lang)} ·{" "}
                  {locked
                    ? formatCaseLockMessage(info, lang)
                    : active
                      ? t("active", lang)
                      : done
                        ? t("completedCase", lang)
                        : tDifficulty(c.difficulty, lang)}
                </div>
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Investigator progress — mobile only; desktop shows in RightSidebar */}
      <div className="mt-[15px] shrink-0 rounded-[9px] border border-border bg-surface-2 p-[13px] md:hidden">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-text-light">
            {t("rank", lang)}
          </span>
          <span className="text-xs font-bold text-accent">{levelTitle}</span>
        </div>
        <div className="mt-[9px] h-[7px] overflow-hidden rounded bg-surface">
          <div
            className="h-full rounded bg-accent transition-[width] duration-500"
            style={{ width: `${Math.round(rank.progress * 100)}%` }}
          />
        </div>
        <div className="mt-1.5 text-[10px] font-medium text-text-dim">
          {rank.isMax || rank.xpForNext === null
            ? `${xp} ${t("xpGained", lang)}`
            : `${rank.xpIntoRank} / ${rank.xpForNext} ${t("xpToPromote", lang)}`}
        </div>
        <div className="mt-1 text-[10px] font-medium text-text-dim">
          {t("unlockedCases", lang)
            .replace("{unlocked}", String(unlockSummary.unlocked))
            .replace("{total}", String(unlockSummary.total))}
        </div>
      </div>

      {/* Campaign unlock count — desktop, below case list */}
      <div className="mt-[15px] hidden shrink-0 rounded-[9px] border border-border bg-surface-2 p-[13px] md:block">
        <div className="text-[10px] font-medium text-text-dim">
          {t("unlockedCases", lang)
            .replace("{unlocked}", String(unlockSummary.unlocked))
            .replace("{total}", String(unlockSummary.total))}
        </div>
      </div>
    </aside>
  );
}
