import { motion } from "framer-motion";
import { RTL_LANGUAGES, loc, t } from "../i18n/ui";
import {
  THEMATIC_PACKS,
  getThematicPackCases,
  getThematicPackTotalCases,
} from "../data/thematicPacks";
import type { CaseUnlockInfo } from "../engine/caseUnlockEngine";
import type { Language, PlayerStats } from "../types";

interface Props {
  lang: Language;
  stats: Pick<
    PlayerStats,
    "archivePurchasedPackIds" | "archiveUnlockedCaseIds"
  >;
  caseUnlocks?: readonly CaseUnlockInfo[];
  onOpen: () => void;
  compact?: boolean;
}

function countAccessibleCases(
  stats: Pick<PlayerStats, "archivePurchasedPackIds" | "archiveUnlockedCaseIds">,
  pack: (typeof THEMATIC_PACKS)[number],
  caseUnlocks: readonly CaseUnlockInfo[],
): number {
  const archiveCases = getThematicPackCases(pack);
  if (archiveCases.length === 0) return 0;

  const unlockByCaseId = new Map(
    caseUnlocks.map((info) => [info.caseData.id, info.status]),
  );
  return archiveCases.filter(
    (caseData, index) => {
      const campaignStatus = unlockByCaseId.get(caseData.id);
      if (campaignStatus && campaignStatus !== "locked") return true;
      return (
        stats.archivePurchasedPackIds.includes(pack.id) ||
        index === 0 ||
        stats.archiveUnlockedCaseIds.includes(caseData.id)
      );
    },
  ).length;
}

export function SpecialArchivesEntry({
  lang,
  stats,
  caseUnlocks = [],
  onOpen,
  compact = false,
}: Props) {
  const pack = THEMATIC_PACKS[0];
  const opened = pack ? countAccessibleCases(stats, pack, caseUnlocks) : 0;
  const total = pack ? getThematicPackTotalCases(pack) : 0;
  const isRTL = RTL_LANGUAGES.has(lang);
  const isComplete = total > 0 && opened >= total;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="group relative mt-2 block w-full text-start"
    >
      {/* Background folder 1 — olive sage, peeks above the main folder */}
      <div
        className={`absolute rounded-[3px_8px_0_0] border ${
          compact ? "h-[62px]" : "h-[58px]"
        }`}
        style={{
          top: "-6px",
          [isRTL ? "right" : "left"]: compact ? "12px" : "11px",
          [isRTL ? "left" : "right"]: "-5px",
          background: "#6E8475",
          borderColor: "#3A5141",
        }}
        aria-hidden
      />
      {/* Background folder 2 — warm sienna, peeks above the main folder */}
      <div
        className={`absolute rounded-[3px_8px_0_0] border ${
          compact ? "h-[66px]" : "h-[62px]"
        }`}
        style={{
          top: "-3px",
          [isRTL ? "right" : "left"]: "6px",
          [isRTL ? "left" : "right"]: "-2px",
          background: "#b98f73",
          borderColor: "#7a5a52",
        }}
        aria-hidden
      />

      {/* Main folder cover */}
      <div
        className={`relative border border-folder-edge bg-folder text-folder-ink ${
          compact
            ? "rounded-[2px_11px_11px_11px] px-[15px] py-[14px]"
            : "rounded-[2px_10px_10px_10px] px-[13px] py-3"
        }`}
        style={{
          boxShadow: compact
            ? "0 12px 24px rgba(40,28,10,0.24)"
            : "0 10px 22px rgba(40,28,10,0.22)",
        }}
      >
        {/* Folder tab that protrudes above the cover */}
        <span
          className={`absolute rounded-t-[6px] bg-folder-edge ${
            compact ? "h-[15px] w-[104px]" : "h-[14px] w-[92px]"
          }`}
          style={{
            top: "-9px",
            [isRTL ? "right" : "left"]: compact ? "16px" : "14px",
          }}
          aria-hidden
        />

        {/* "NEW" badge in the top-right corner */}
        {!isComplete ? (
          <span
            className={`absolute rounded-[4px] bg-accent font-mono font-bold uppercase tracking-[.12em] text-paper ${
              compact
                ? "top-[13px] px-2 py-[3px] text-[9px]"
                : "top-[11px] px-[7px] py-[3px] text-[8px]"
            }`}
            style={{ [isRTL ? "left" : "right"]: compact ? "13px" : "11px" }}
          >
            {t("newArchive", lang)}
          </span>
        ) : null}

        {/* Title + subtitle */}
        <div className={compact ? "max-w-[78%]" : "max-w-[175px]"}>
          <div
            className={`font-serif font-bold text-ink ${
              compact ? "text-[17px]" : "text-[15px]"
            }`}
          >
            {t("specialArchives", lang)}
          </div>
          <p
            className={`mt-[3px] leading-[1.4] text-folder-ink ${
              compact ? "text-[12px]" : "text-[11px]"
            }`}
          >
            {pack ? loc(pack.title, lang) : t("specialArchivesSubtitle", lang)}
          </p>
        </div>

        {/* Bottom row: case counter + CTA pill */}
        <div
          className={`flex items-center justify-between gap-2 border-t border-folder-edge/45 ${
            compact ? "mt-[13px] pt-[11px]" : "mt-[11px] pt-[10px]"
          }`}
        >
          <span
            className={`font-mono font-semibold uppercase tracking-[.07em] text-folder-ink ${
              compact ? "text-[10px]" : "text-[9px]"
            }`}
          >
            {t("openedCases", lang)
              .replace("{opened}", String(opened))
              .replace("{total}", String(total))}
          </span>
          <span
            className={`shrink-0 whitespace-nowrap font-mono font-semibold ${
              compact
                ? "rounded-[5px] px-2 py-[4px] text-[10px]"
                : "rounded-[4px] px-[7px] py-[3px] text-[9px]"
            } ${
              isComplete
                ? "border border-success text-success"
                : "bg-accent text-paper"
            }`}
          >
            {isComplete ? t("purchased", lang) : t("firstCaseFree", lang)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
