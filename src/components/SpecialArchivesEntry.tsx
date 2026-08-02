import { motion } from "framer-motion";
import { loc, t } from "../i18n/ui";
import {
  THEMATIC_PACKS,
  getThematicPackCases,
  getThematicPackTotalCases,
} from "../data/thematicPacks";
import {
  countAccessibleArchiveCases,
  indexUnlocksByCaseId,
  isPackPurchased,
} from "../engine/archiveAccessEngine";
import { FAN_SLOT_CLASSES, PackCover, getFanPacks } from "./BureauArchives";
import type { CaseUnlockInfo } from "../engine/caseUnlockEngine";
import type { CaseSummary, Language, PlayerStats } from "../types";

interface Props {
  lang: Language;
  stats: Pick<
    PlayerStats,
    "archivePurchasedPackIds" | "archiveUnlockedCaseIds" | "completedCaseIds"
  >;
  caseUnlocks?: readonly CaseUnlockInfo<CaseSummary>[];
  onOpen: () => void;
  compact?: boolean;
}

/**
 * The Bureau's shop window on the desk: three archive covers fanned out like
 * folders pulled from a drawer, under one CTA. It advertises the *featured*
 * archive — the first pack still offering its free sample — and never competes
 * visually with the open case, which is why it lives in the side column.
 */
export function SpecialArchivesEntry({
  lang,
  stats,
  caseUnlocks = [],
  onOpen,
  compact = false,
}: Props) {
  const unlockByCaseId = indexUnlocksByCaseId(caseUnlocks);
  // Feature the first archive the player has not bought yet; once everything is
  // owned the card becomes a library entrance rather than an offer.
  const featured =
    THEMATIC_PACKS.find((pack) => !isPackPurchased(stats, pack.id)) ??
    THEMATIC_PACKS[0];
  const allOwned = THEMATIC_PACKS.every((pack) => isPackPurchased(stats, pack.id));

  const opened = featured
    ? countAccessibleArchiveCases(
        { ...stats, completedCaseIds: stats.completedCaseIds },
        featured,
        unlockByCaseId,
      )
    : 0;
  const total = featured ? getThematicPackTotalCases(featured) : 0;
  const fanPacks = getFanPacks();

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      // `shrink-0`: the promo is the tallest card in a scrolling flex column and
      // would otherwise be squeezed down to its cover strip.
      className="relative mt-2 block w-full shrink-0 overflow-hidden rounded-[5px] border border-bureau-gold-dim bg-gradient-to-br from-bureau-2 to-bureau text-center text-white shadow-folder"
    >
      <span
        className="pointer-events-none absolute inset-[7px] border border-bureau-gold/30"
        aria-hidden
      />

      {/* Fanned covers */}
      <span className="relative mt-2.5 block h-[126px]" aria-hidden>
        {fanPacks.map((pack, index) => (
          <span
            key={`${pack.id}-${index}`}
            className={`absolute start-1/2 top-4 block h-[92px] w-[92px] overflow-hidden border-2 border-bureau-gold-dim shadow-card ${FAN_SLOT_CLASSES[index]}`}
          >
            <PackCover pack={pack} className="h-full w-full" />
          </span>
        ))}
      </span>

      <span className={`block px-4 pb-4 pt-1 ${compact ? "text-[13px]" : ""}`}>
        <span className="block font-mono text-[8px] font-black uppercase leading-relaxed tracking-[.14em] text-bureau-gold">
          {allOwned
            ? t("specialArchives", lang)
            : `${t("newArchive", lang)} · ${t("archiveOneCaseFree", lang)}`}
        </span>
        <span className="mt-1.5 block font-serif text-[17px] font-bold leading-tight">
          {featured ? loc(featured.title, lang) : t("specialArchives", lang)}
        </span>
        <span className="mt-1 block font-mono text-[10px] text-bureau-muted">
          {featured
            ? t("openedCases", lang)
                .replace("{opened}", String(opened))
                .replace("{total}", String(total || getThematicPackCases(featured).length))
            : t("specialArchivesSubtitle", lang)}
        </span>
        <span className="mx-auto mt-3 block max-w-[170px] bg-bureau-copper px-3 py-2.5 font-mono text-[9px] font-black uppercase tracking-[.04em] text-white">
          {allOwned ? t("openCaseAction", lang) : t("archiveDetailPlayFree", lang)}
        </span>
      </span>
    </motion.button>
  );
}
