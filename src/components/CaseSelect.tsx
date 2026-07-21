import { motion } from "framer-motion";
import type { CaseSummary, Difficulty, Language } from "../types";
import type { CaseUnlockInfo } from "../engine/caseUnlockEngine";
import { loc, t, tDifficulty } from "../i18n/ui";
import {
  formatCaseLabel,
  formatCaseLockMessage,
  formatCaseLockTooltip,
} from "../utils/caseDisplay";
import { formatCountdown } from "./icons";
import { Tooltip } from "./Tooltip";

interface Props {
  standardCaseUnlocks: CaseUnlockInfo<CaseSummary>[];
  dailyCase: CaseSummary | undefined;
  dailyUnlocked: boolean;
  dailyMsRemaining: number;
  lang: Language;
  onSelectStandardCase: (info: CaseUnlockInfo<CaseSummary>) => void;
  onSelect: (c: CaseSummary) => void;
  onDailyLocked: () => void;
}

type FolderKind = "daily" | "active" | "locked";

const folderColors = (k: FolderKind) =>
  k === "daily"
    ? {
        bg: "linear-gradient(135deg,#e6b052,#d6982f)",
        edge: "#b07d1f",
        ink: "#3a2705",
        sub: "#7a5410",
      }
    : k === "active"
      ? { bg: "#d4b558", edge: "#a98a33", ink: "#2e2207", sub: "#6e5a24" }
      : { bg: "#d3ccbb", edge: "#b3ab98", ink: "#6b6350", sub: "#8b8470" };

const diffPipCount = (d: Difficulty): number =>
  d === "easy" ? 1 : d === "medium" ? 2 : 3;

/** Case-selection screen: physical folder covers laid out on the desk. */
export function CaseSelect({
  standardCaseUnlocks,
  dailyCase,
  dailyUnlocked,
  dailyMsRemaining,
  lang,
  onSelectStandardCase,
  onSelect,
  onDailyLocked,
}: Props) {
  const fmt = (n: number) => n.toLocaleString("ru-RU");

  return (
    <>
      {/* ── Mobile layout (unchanged) ─────────────────────────────────── */}
      <div className="flex w-full max-w-[480px] flex-col gap-[18px] pt-1.5 md:hidden">
        <div className="text-[11px] font-semibold tracking-[1.5px] text-text-muted">
          {t("selectCasePrompt", lang)}
        </div>

        {dailyCase && (
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
              whileHover={{ y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative block w-full text-left"
            >
              <span className="absolute -top-[13px] left-[26px] h-6 w-[130px] rounded-t-[7px] bg-[#a9781b]" />
              <div
                className="relative overflow-hidden border border-[#a9781b] p-[24px_22px_26px]"
                style={{
                  borderRadius: "3px 12px 12px 12px",
                  background: "linear-gradient(135deg,#dca54a,#c98a2e)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute -right-[30px] top-3.5 rotate-[34deg] bg-stamp px-10 py-1 font-mono text-[11px] font-bold tracking-[2px] text-white"
                >
                  {t("urgent", lang)}
                </span>
                <div className="font-mono text-[11px] font-semibold tracking-[1px] text-[#5c3f08]">
                  {t("dailyCase", lang)}
                </div>
                <div className="mt-2 max-w-[78%] font-serif text-[22px] font-semibold text-[#3a2705]">
                  {loc(dailyCase.title, lang)}
                </div>
                <div className="mt-4 flex gap-2.5">
                  <span className="rounded-md bg-[#3a2705] px-2.5 py-[5px] text-xs font-bold text-gold-text">
                    {t("dailyRewardBadge", lang)}
                  </span>
                  <span className="rounded-md bg-[#3a2705]/20 px-2.5 py-[5px] text-xs font-bold text-[#3a2705]">
                    {t("dailyDifficultyBadge", lang)}
                  </span>
                </div>
                <div className="my-[14px] mt-[18px] h-px bg-[#3a2705]/20" />
                <div className="flex items-center justify-between">
                  {dailyUnlocked ? (
                    <>
                      <span className="font-mono text-xs font-semibold text-[#5c3f08]">
                        {dailyCase.evidenceCount} {t("documents", lang)}
                      </span>
                      <span className="text-xs font-bold text-[#3a2705]">
                        {t("openCaseAction", lang)} →
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-xs font-semibold text-[#5c3f08]">
                        ▶ {t("watchAd", lang)}
                      </span>
                      <span className="text-xs font-bold text-[#3a2705]">
                        →
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.button>
          </Tooltip>
        )}

        {standardCaseUnlocks.map((info) => {
          const c = info.caseData;
          const locked = info.status === "locked";
          const completed = info.status === "completed";
          const actionText = locked
            ? formatCaseLockMessage(info, lang)
            : completed
              ? t("completedCase", lang)
              : t("openCaseAction", lang);

          return (
            <Tooltip
              key={c.id}
              className="block"
              side="bottom"
              label={locked ? formatCaseLockTooltip(info, lang) : null}
            >
              <motion.button
                type="button"
                onClick={() => onSelectStandardCase(info)}
                aria-disabled={locked}
                whileHover={locked ? undefined : { y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={`relative block w-full text-left ${locked ? "opacity-55" : ""}`}
              >
                <span className="absolute -top-[13px] left-[26px] h-6 w-[130px] rounded-t-[7px] bg-folder-edge" />
                <div
                  className={`paper-grain relative overflow-hidden border bg-folder p-[24px_22px_26px] ${
                    locked ? "border-border grayscale" : "border-folder-edge"
                  }`}
                  style={{ borderRadius: "3px 12px 12px 12px" }}
                >
                  <span
                    aria-hidden
                    className={`absolute right-3.5 top-[18px] rotate-[-7deg] rounded-sm border-2 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider opacity-85 ${
                      completed
                        ? "border-success text-success"
                        : locked
                          ? "border-folder-ink-soft text-folder-ink-soft"
                          : "border-stamp text-stamp"
                    }`}
                  >
                    {completed
                      ? t("completedCase", lang)
                      : locked
                        ? t("caseLocked", lang)
                        : t("confidential", lang)}
                  </span>
                  <div className="font-mono text-[11px] font-semibold tracking-[1px] text-folder-ink-soft">
                    {formatCaseLabel(c, lang)}
                  </div>
                  <div className="mt-2 max-w-[80%] font-serif text-[22px] font-semibold text-folder-ink">
                    {loc(c.title, lang)}
                  </div>
                  <div className="mt-4 flex items-center gap-2.5">
                    <span className="h-[38px] w-[38px] shrink-0 rounded-full border border-black/25 bg-black/[0.18]" />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-folder-ink">
                        {loc(c.claim.person, lang)}
                      </div>
                      <div className="text-[11px] font-medium text-folder-ink-soft">
                        {fmt(c.claimAmount)} $
                      </div>
                    </div>
                  </div>
                  <div className="my-[14px] mt-[18px] h-px bg-black/[0.18]" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] font-medium text-folder-ink-soft">
                      {c.evidenceCount} {t("documents", lang)}
                    </span>
                    <span className="text-right text-xs font-bold text-folder-ink">
                      {actionText}
                      {locked ? "" : " →"}
                    </span>
                  </div>
                </div>
              </motion.button>
            </Tooltip>
          );
        })}
      </div>

      {/* ── Desktop layout — Концепт C: герой + сетка папок ─────────── */}
      <div className="hidden w-full max-w-[700px] flex-col md:flex md:rounded-[10px] md:border md:border-border md:bg-surface md:p-[22px]">
        <div className="mb-4 text-[11px] font-semibold tracking-[1.5px] text-text-muted">
          {t("selectCasePrompt", lang)}
        </div>

        {/* Hero: Дело дня */}
        {dailyCase && (
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
              whileHover={{ y: -5 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="relative block w-full cursor-pointer text-left"
            >
              {/* Folder tab */}
              <div
                className="ml-[14px] h-[15px] w-[130px] rounded-t-[6px]"
                style={{ background: folderColors("daily").edge }}
              />
              {/* Folder body */}
              <div
                className="relative overflow-hidden p-5"
                style={{
                  background: folderColors("daily").bg,
                  border: `1px solid ${folderColors("daily").edge}`,
                  borderRadius: "2px 9px 9px 9px",
                  boxShadow: "0 12px 28px rgba(40,28,10,.2)",
                }}
              >
                {/* СРОЧНО ribbon */}
                <span
                  aria-hidden
                  className="absolute bg-stamp font-mono text-[11px] font-bold tracking-[2px] text-white"
                  style={{
                    top: 15,
                    right: -34,
                    transform: "rotate(34deg)",
                    padding: "5px 44px",
                  }}
                >
                  {t("urgent", lang)}
                </span>
                {/* Sub-header */}
                <div className="font-mono text-[11px] font-semibold tracking-[1px] text-[#5c3f08]">
                  {t("dailyCase", lang).toUpperCase()}
                  {!dailyUnlocked && ` · ${formatCountdown(dailyMsRemaining)}`}
                </div>
                {/* Title */}
                <div
                  className="mt-2 max-w-[78%] font-serif text-[24px] font-bold leading-tight"
                  style={{ color: folderColors("daily").ink }}
                >
                  {loc(dailyCase.title, lang)}
                </div>
                {/* Chips */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-md px-2.5 py-[5px] text-xs font-bold"
                    style={{
                      background: folderColors("daily").ink,
                      color: "#f0c46b",
                    }}
                  >
                    {t("dailyRewardBadge", lang)}
                  </span>
                  <span
                    className="rounded-md px-2.5 py-[5px] text-xs font-bold"
                    style={{
                      background: "rgba(58,39,5,.16)",
                      color: folderColors("daily").ink,
                    }}
                  >
                    {t("dailyDifficultyBadge", lang)}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#5c3f08]">
                    {dailyCase.evidenceCount} {t("documents", lang)}
                  </span>
                </div>
              </div>
            </motion.button>
          </Tooltip>
        )}

        {/* Сетка папок 2-в-ряд */}
        <div className="mt-[14px] grid grid-cols-2 gap-[13px]">
          {standardCaseUnlocks.map((info) => {
            const c = info.caseData;
            const locked = info.status === "locked";
            const completed = info.status === "completed";
            const kind: FolderKind = locked ? "locked" : "active";
            const colors = folderColors(kind);
            const pips = diffPipCount(c.difficulty);

            return (
              <Tooltip
                key={c.id}
                className="block"
                side="top"
                label={locked ? formatCaseLockTooltip(info, lang) : null}
              >
                <motion.button
                  type="button"
                  onClick={() => onSelectStandardCase(info)}
                  aria-disabled={locked}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className={`relative block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a98a33] ${
                    locked
                      ? "cursor-not-allowed opacity-[.72]"
                      : "cursor-pointer"
                  }`}
                >
                  {/* Folder tab */}
                  <div
                    className="ml-[14px] h-[15px] w-24 rounded-t-[6px]"
                    style={{ background: colors.edge }}
                  />
                  {/* Folder body */}
                  <div
                    className="relative overflow-hidden p-4"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.edge}`,
                      borderRadius: "2px 8px 8px 8px",
                      boxShadow: "0 7px 16px rgba(40,28,10,.16)",
                    }}
                  >
                    {/* Top row: num+title / status chip */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div
                          className="font-mono text-[9px]"
                          style={{ color: colors.sub }}
                        >
                          {formatCaseLabel(c, lang)}
                        </div>
                        <div
                          className="mt-0.5 font-serif text-[15px] font-bold leading-tight"
                          style={{ color: colors.ink }}
                        >
                          {loc(c.title, lang)}
                        </div>
                      </div>
                      {locked ? (
                        <span
                          className="shrink-0 rounded-[4px] border px-1.5 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-wider"
                          style={{
                            color: "#8b8470",
                            background: "rgba(0,0,0,.05)",
                            borderColor: "rgba(0,0,0,.10)",
                          }}
                        >
                          {lang === "ru" ? "ЗАКРЫТО" : "LOCKED"}
                        </span>
                      ) : (
                        <span
                          className="shrink-0 rounded-[4px] border px-1.5 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-wider"
                          style={{
                            color: "#2e6b3f",
                            background: "rgba(46,107,63,.12)",
                            borderColor: "rgba(46,107,63,.3)",
                          }}
                        >
                          {completed
                            ? lang === "ru"
                              ? "ЗАВЕРШЕНО"
                              : "DONE"
                            : lang === "ru"
                              ? "ДОСТУПНО"
                              : "OPEN"}
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div
                      className="mt-1.5 truncate text-[11px] leading-snug"
                      style={{ color: colors.sub }}
                    >
                      {locked
                        ? formatCaseLockMessage(info, lang)
                        : `${loc(c.claim.person, lang)} · ${fmt(c.claimAmount)} $`}
                    </div>

                    {/* Bottom: difficulty pips + CTA */}
                    <div
                      className="mt-3 flex items-center justify-between pt-2"
                      style={{
                        borderTop: `1px solid ${locked ? "rgba(0,0,0,.10)" : "rgba(0,0,0,.15)"}`,
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-[4px]">
                          {[1, 2, 3].map((p) => (
                            <div
                              key={p}
                              className="h-[6px] w-[6px] rounded-full"
                              style={{
                                background:
                                  p <= pips
                                    ? locked
                                      ? "#9b937f"
                                      : "#7a5410"
                                    : "rgba(0,0,0,.12)",
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="font-mono text-[9px]"
                          style={{ color: colors.sub }}
                        >
                          {tDifficulty(c.difficulty, lang)}
                        </span>
                      </div>
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: locked ? "#9b937f" : colors.ink }}
                      >
                        {locked
                          ? lang === "ru"
                            ? "заблокировано"
                            : "locked"
                          : `${t("openCaseAction", lang)} →`}
                      </span>
                    </div>
                  </div>
                </motion.button>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </>
  );
}
