import { motion } from "framer-motion";
import {
  THEMATIC_PACKS,
  getThematicPackCases,
  type ThematicPack,
} from "../data/thematicPacks";
import {
  countAccessibleArchiveCases,
  getArchiveCaseStatus,
  getNextRewardedCase,
  isFreeSamplePlayed,
  isPackPurchased,
  type ArchiveCaseStatus,
  type UnlockByCaseId,
} from "../engine/archiveAccessEngine";
import { loc, t } from "../i18n/ui";
import { asset } from "../utils/asset";
import type { CaseSummary, Language, PlayerStats } from "../types";

/* ------------------------------- Shelf ----------------------------------- */

interface ShelfProps {
  lang: Language;
  stats: PlayerStats;
  unlockByCaseId: UnlockByCaseId;
  priceLabel: (pack: ThematicPack) => string;
  onOpenPack: (packId: string) => void;
}

/** Archive cover art, or a folder-spine placeholder for packs without artwork. */
export function PackCover({
  pack,
  className,
}: {
  pack: ThematicPack;
  className: string;
}) {
  if (!pack.coverImage) {
    return (
      <div
        className={`relative bg-gradient-to-br from-bureau-2 to-bureau ${className}`}
        aria-hidden
      >
        <span className="absolute inset-y-0 start-0 w-[18%] bg-bureau-gold-dim/60" />
      </div>
    );
  }
  return (
    <img
      src={asset(pack.coverImage)}
      alt=""
      loading="lazy"
      className={`object-cover transition-transform duration-500 ${className}`}
    />
  );
}

/**
 * The three shelf slots a cover fan draws — always exactly three, cycling the
 * shelf when it is shorter, so the fan never collapses to a lopsided stack or
 * an empty band if packs are retired or ship without artwork.
 */
export function getFanPacks(): readonly ThematicPack[] {
  if (THEMATIC_PACKS.length === 0) return [];
  return [0, 1, 2].map(
    (slot) => THEMATIC_PACKS[slot % THEMATIC_PACKS.length]!,
  );
}

/** Rotation/offset of each fan slot — shared by the desk promo and the bundle. */
export const FAN_SLOT_CLASSES = [
  "-translate-x-[88%] -rotate-[8deg]",
  "z-[2] -translate-x-1/2",
  "-translate-x-[12%] rotate-[8deg]",
] as const;

export function BureauArchiveShelf({
  lang,
  stats,
  unlockByCaseId,
  priceLabel,
  onOpenPack,
}: ShelfProps) {
  return (
    <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 pb-14 pt-7 sm:grid-cols-2 md:px-[5vw] lg:grid-cols-3">
      {THEMATIC_PACKS.map((pack, index) => {
        const purchased = isPackPurchased(stats, pack.id);
        const opened = countAccessibleArchiveCases(stats, pack, unlockByCaseId);
        const total = getThematicPackCases(pack).length;
        return (
          <motion.article
            key={pack.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpenPack(pack.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenPack(pack.id);
              }
            }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="group relative cursor-pointer rounded-[2px] border border-bureau-gold/45 bg-bureau-paper text-ink shadow-folder focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-bureau-gold"
          >
            {/* Archive tape holding the cover to the folder */}
            <span
              className="absolute -top-[5px] end-4 z-[3] h-[9px] w-[54px] rotate-1 bg-bureau-gold-dim shadow-card"
              aria-hidden
            />
            <div className="relative aspect-square overflow-hidden">
              <PackCover pack={pack} className="h-full w-full group-hover:scale-[1.025]" />
              <span
                className="pointer-events-none absolute inset-0 shadow-[inset_0_-45px_55px_rgba(11,11,9,.55)]"
                aria-hidden
              />
              <span className="absolute bottom-3.5 start-4 z-[2] bg-bureau-gold px-2.5 py-[7px] font-mono text-[9px] font-black uppercase tracking-[.04em] text-ink shadow-card">
                {purchased
                  ? t("purchased", lang)
                  : t("archiveOneCaseFree", lang)}
              </span>
            </div>
            <div className="p-5">
              <div className="font-mono text-[9px] font-black uppercase tracking-[.13em] text-bureau-copper">
                {t("archiveCardEyebrow", lang)
                  .replace("{number}", String(index + 1).padStart(2, "0"))
                  .replace("{total}", String(total))}
              </div>
              <h2 className="mt-1.5 font-serif text-[20px] font-bold leading-tight">
                {loc(pack.title, lang)}
              </h2>
              <p className="mt-2 min-h-[54px] text-[12px] leading-[1.65] text-text-muted">
                {loc(pack.hook, lang)}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="font-serif text-[19px] font-bold">
                  {purchased
                    ? t("openedCases", lang)
                        .replace("{opened}", String(opened))
                        .replace("{total}", String(total))
                    : priceLabel(pack)}
                </span>
                <span className="min-h-11 shrink-0 rounded-[3px] bg-bureau-copper px-4 py-3 text-[11px] font-bold uppercase tracking-[.02em] text-white">
                  {t("archiveCardMore", lang)}
                </span>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

/* ---------------------------- Archive page -------------------------------- */

interface DetailProps {
  pack: ThematicPack;
  packIndex: number;
  lang: Language;
  stats: PlayerStats;
  unlockByCaseId: UnlockByCaseId;
  priceLabel: (pack: ThematicPack) => string;
  purchaseBusy: boolean;
  paymentsAvailable: boolean;
  /** True once today's rewarded archive unlock has been spent for this pack. */
  rewardedSpentToday: boolean;
  onBack: () => void;
  onSelectCase: (caseData: CaseSummary) => void;
  onPurchase: () => void;
  onUnlockWithAd: (caseData: CaseSummary) => void;
}

function CaseTile({
  caseData,
  index,
  status,
  lang,
  onSelect,
}: {
  caseData: CaseSummary;
  index: number;
  status: ArchiveCaseStatus;
  lang: Language;
  onSelect: () => void;
}) {
  const open = status !== "locked";
  return (
    <article
      className={`relative flex min-h-[176px] flex-col p-4 ${
        open
          ? "border border-bureau-gold/60 bg-bureau-paper text-ink"
          : "border border-bureau-line/50 bg-bureau-3 text-bureau-muted shadow-[inset_4px_0_rgba(185,148,82,.1)]"
      }`}
    >
      <span
        className={`font-serif text-[30px] leading-none ${
          open ? "text-bureau-copper" : "text-bureau-line"
        }`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      {!open && (
        // Keyhole — the locked-drawer motif from the archive room
        <span
          className="absolute end-4 top-4 h-[14px] w-[9px] rounded-t-[7px] rounded-b-[2px] bg-bureau-dim/80"
          aria-hidden
        />
      )}
      <div className="mt-2 flex-1">
        <div
          className={`font-mono text-[8px] font-black uppercase tracking-[.1em] ${
            open ? "text-bureau-copper" : "text-bureau-dim"
          }`}
        >
          {open
            ? t("archiveCaseFreeLabel", lang)
            : t("archiveCaseInArchiveLabel", lang)}
        </div>
        <h3
          className={`mt-1.5 font-serif text-[14px] font-bold leading-snug ${
            open ? "text-ink" : "text-bureau-paper"
          }`}
        >
          {loc(caseData.title, lang)}
        </h3>
      </div>
      {open && (
        <button
          type="button"
          onClick={onSelect}
          // The visible label is the short call to action; the accessible name
          // has to say *which* case, since the tile is one of ten identical ones.
          aria-label={`${loc(caseData.title, lang)} — ${t("archiveCasePlay", lang)}`}
          className="mt-3 min-h-11 border-t border-border pt-2.5 text-start text-[12px] font-black text-bureau-copper"
        >
          {t("archiveCasePlay", lang)}
        </button>
      )}
    </article>
  );
}

export function BureauArchiveDetail({
  pack,
  packIndex,
  lang,
  stats,
  unlockByCaseId,
  priceLabel,
  purchaseBusy,
  paymentsAvailable,
  rewardedSpentToday,
  onBack,
  onSelectCase,
  onPurchase,
  onUnlockWithAd,
}: DetailProps) {
  const cases = getThematicPackCases(pack);
  const purchased = isPackPurchased(stats, pack.id);
  const opened = countAccessibleArchiveCases(stats, pack, unlockByCaseId);
  const samplePlayed = isFreeSamplePlayed(stats, pack);
  const nextRewarded = getNextRewardedCase(stats, pack, unlockByCaseId);
  const freeSample = cases[0] ?? null;

  // Before the sample is played the free CTA is primary; afterwards the purchase
  // takes the lead, exactly as the shelf's commercial hierarchy intends.
  const freeCtaPrimary = !purchased && !samplePlayed;

  return (
    <div className="pb-14">
      <button
        type="button"
        onClick={onBack}
        className="mx-4 mt-6 mb-1 min-h-11 font-mono text-[10px] font-black uppercase tracking-[.06em] text-bureau-muted md:mx-[5vw]"
      >
        {t("bureauBackToArchives", lang)}
      </button>

      <section className="mx-auto grid max-w-[1380px] grid-cols-1 items-center gap-8 px-4 pb-10 pt-3 md:px-[5vw] lg:grid-cols-[minmax(300px,440px)_1fr] lg:gap-[clamp(40px,6vw,100px)]">
        <div className="relative mx-auto w-full max-w-[420px] -rotate-1 border-4 border-bureau-gold-dim shadow-folder">
          <div className="relative aspect-square overflow-hidden">
            <PackCover pack={pack} className="h-full w-full" />
          </div>
          <span
            className="pointer-events-none absolute inset-2.5 border border-bureau-gold/50"
            aria-hidden
          />
          <span
            className="absolute -end-6 bottom-9 z-[2] grid h-[75px] w-[75px] place-items-center rounded-full border-[5px] border-double border-[#C27655] bg-[#8E3225] text-center font-serif text-[15px] font-black text-bureau-gold shadow-folder"
            aria-hidden
          >
            AR
            <small className="block text-[9px]">
              {String(packIndex + 1).padStart(2, "0")}
            </small>
          </span>
        </div>

        <div className="min-w-0">
          <div className="font-mono text-[9px] font-black uppercase tracking-[.13em] text-bureau-gold-dim">
            {t("archiveCardEyebrow", lang)
              .replace("{number}", String(packIndex + 1).padStart(2, "0"))
              .replace("{total}", String(cases.length))}
            {pack.era ? ` · ${loc(pack.era, lang)}` : ""}
          </div>
          <h1 className="mt-1.5 font-serif text-[clamp(30px,3.9vw,58px)] font-bold leading-[1.05] text-bureau-ink">
            {loc(pack.title, lang)}
          </h1>
          <p className="mt-2.5 max-w-[700px] text-[15px] leading-[1.65] text-bureau-muted md:text-[17px]">
            {loc(pack.hook, lang)}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 md:flex md:gap-3.5">
            <Feature value={String(cases.length)} label={t("archiveDetailFeatureCases", lang)} />
            <Feature
              value={`${pack.evidenceCount ?? cases.length * 3}+`}
              label={t("archiveDetailFeatureEvidence", lang)}
            />
            <Feature value="1" label={t("archiveDetailFeatureStamp", lang)} />
          </div>

          {pack.epigraph && (
            <blockquote className="my-6 border-s-2 border-bureau-gold-dim ps-4 text-[13px] italic leading-relaxed text-bureau-dim">
              {loc(pack.epigraph, lang)}
            </blockquote>
          )}

          <div className="mt-5 flex max-w-[680px] flex-col gap-3 md:flex-row">
            {!purchased && freeSample && (
              <button
                type="button"
                onClick={() => onSelectCase(freeSample)}
                className={`min-h-[54px] flex-1 rounded-[3px] px-5 text-[12px] font-black uppercase tracking-[.02em] transition-transform hover:-translate-y-px ${
                  freeCtaPrimary
                    ? "bg-bureau-gold text-ink shadow-[0_4px_0_rgba(55,24,13,.18)]"
                    : "border border-bureau-gold/50 bg-transparent text-bureau-gold"
                }`}
              >
                {t("archiveDetailPlayFree", lang)}
              </button>
            )}
            <button
              type="button"
              disabled={purchased || purchaseBusy || !paymentsAvailable}
              onClick={onPurchase}
              className={`min-h-[54px] rounded-[3px] px-5 text-start transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 md:min-w-[205px] ${
                freeCtaPrimary || purchased
                  ? "border border-bureau-gold-dim/70 bg-bureau-2 text-bureau-ink"
                  : "flex-1 bg-bureau-gold text-ink shadow-[0_4px_0_rgba(55,24,13,.18)]"
              }`}
            >
              <span className="block font-mono text-[9px] font-bold uppercase tracking-[.06em] opacity-75">
                {purchased
                  ? t("purchased", lang)
                  : samplePlayed
                    ? t("archiveDetailContinue", lang)
                    : t("archiveDetailOpenWhole", lang)}
              </span>
              <span className="mt-0.5 block font-serif text-[23px] font-bold">
                {purchased
                  ? t("openedCases", lang)
                      .replace("{opened}", String(opened))
                      .replace("{total}", String(cases.length))
                  : purchaseBusy
                    ? "…"
                    : priceLabel(pack)}
              </span>
            </button>
          </div>

          {/* Rewarded-ad unlock — the free path deeper into a paid archive */}
          {!purchased && nextRewarded && (
            <button
              type="button"
              disabled={rewardedSpentToday}
              onClick={() => onUnlockWithAd(nextRewarded)}
              className="mt-3 min-h-11 max-w-[680px] rounded-[3px] border border-bureau-gold/35 px-4 text-[12px] font-semibold text-bureau-gold disabled:cursor-not-allowed disabled:opacity-55"
            >
              {rewardedSpentToday
                ? t("nextUnlockTomorrow", lang)
                : t("unlockNextWithAd", lang)}
            </button>
          )}

          <div className="mt-5 max-w-[680px]">
            <div className="flex justify-between font-mono text-[8px] font-bold uppercase tracking-[.1em] text-bureau-dim">
              <span>{t("archiveIncludedTitle", lang)}</span>
              <span className="hidden font-normal tracking-normal sm:inline">
                {t("archiveIncludedDuration", lang)}
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <IncludedItem
                kicker={t("evidence", lang)}
                title={t("archiveIncludedEvidence", lang).replace(
                  "{count}",
                  String(pack.evidenceCount ?? cases.length * 3),
                )}
                note={t("archiveIncludedEvidenceNote", lang)}
              />
              <IncludedItem
                kicker={t("archiveIncludedHeroesKicker", lang)}
                title={t("archiveIncludedHeroes", lang)}
                note={t("archiveIncludedHeroesNote", lang)}
              />
              <IncludedItem
                kicker={t("archiveIncludedBonus", lang)}
                title={loc(pack.stampTitle, lang)}
                note={t("archiveDetailFeatureStamp", lang)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1380px] border-t border-bureau-gold/25 px-4 pt-7 md:px-[5vw]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[9px] font-black uppercase tracking-[.13em] text-bureau-gold-dim">
              {t("archiveContentsEyebrow", lang)}
            </div>
            <h2 className="mt-1 font-serif text-[22px] font-bold text-bureau-ink md:text-[24px]">
              {t("archiveContentsTitle", lang)}
            </h2>
          </div>
          <span className="shrink-0 font-mono text-[10px] text-bureau-dim">
            {t("openedCases", lang)
              .replace("{opened}", String(opened))
              .replace("{total}", String(cases.length))}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cases.map((caseData, index) => (
            <CaseTile
              key={caseData.id}
              caseData={caseData}
              index={index}
              status={getArchiveCaseStatus(
                stats,
                pack,
                caseData.id,
                index,
                unlockByCaseId,
              )}
              lang={lang}
              onSelect={() => onSelectCase(caseData)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Feature({ value, label }: { value: string; label: string }) {
  return (
    <span className="border border-bureau-line bg-bureau-2 px-3 py-2.5 text-center font-mono text-[10px] text-bureau-muted md:px-4 md:text-start">
      <b className="block font-serif text-[17px] font-black text-bureau-gold md:me-1.5 md:inline">
        {value}
      </b>
      {label}
    </span>
  );
}

function IncludedItem({
  kicker,
  title,
  note,
}: {
  kicker: string;
  title: string;
  note: string;
}) {
  return (
    <div className="relative min-h-[92px] overflow-hidden bg-bureau-paper px-3 py-3 text-ink shadow-card">
      <span className="absolute end-3 top-0 h-1.5 w-9 bg-bureau-gold-dim" aria-hidden />
      <div className="font-mono text-[7px] font-black uppercase tracking-[.1em] text-bureau-copper">
        {kicker}
      </div>
      <b className="mt-4 block text-[11px] font-bold leading-snug">{title}</b>
      <small className="mt-1 block text-[8px] leading-[1.35] text-text-muted">
        {note}
      </small>
    </div>
  );
}
