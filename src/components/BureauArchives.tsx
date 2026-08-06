import { useState } from "react";
import { motion } from "framer-motion";
import { ArchivePurchaseModal } from "./ArchivePurchaseModal";
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
  return [0, 1, 2].map((slot) => THEMATIC_PACKS[slot % THEMATIC_PACKS.length]!);
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
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="group relative cursor-pointer rounded-[2px] border border-bureau-gold/45 bg-bureau-paper text-ink shadow-folder focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-bureau-gold"
          >
            {/* Archive tape holding the cover to the folder */}
            <span
              className="absolute -top-[5px] end-4 z-[3] h-[9px] w-[54px] rotate-1 bg-bureau-gold-dim shadow-card"
              aria-hidden
            />
            <div className="relative aspect-square overflow-hidden">
              <PackCover
                pack={pack}
                className="h-full w-full group-hover:scale-[1.025]"
              />
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

/**
 * Three drawer tints, cycled by position, so a row of sealed files has rhythm
 * instead of reading as one flat block.
 */
const CASE_BAND_TINTS = [
  "from-bureau-2 to-bureau",
  "from-topbar-tab-on to-bureau",
  "from-bureau-copper/35 to-bureau",
] as const;

/**
 * One file in the archive's contents strip.
 *
 * The whole tile is the hit target — an open case starts, a sealed one opens
 * the purchase dialog. Sealed tiles used to render no control at all, which
 * left the biggest surface of the page dead exactly where intent is highest.
 */
function CaseTile({
  caseData,
  index,
  status,
  isFinal,
  isFreeSample,
  lang,
  onActivate,
}: {
  caseData: CaseSummary;
  index: number;
  status: ArchiveCaseStatus;
  isFinal: boolean;
  isFreeSample: boolean;
  lang: Language;
  onActivate: () => void;
}) {
  const open = status !== "locked";
  // The accessible name has to say *which* case (the tile is one of ten) and
  // what pressing it does — a sealed tile opens the purchase, it is not inert.
  const label = open
    ? `${loc(caseData.title, lang)} — ${t("archiveCasePlay", lang)}`
    : `${loc(caseData.title, lang)} — ${t("archiveCaseLocked", lang)} · ${t("archiveDetailOpenWhole", lang)}`;

  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={label}
      className={`group relative flex min-w-[172px] snap-start flex-col overflow-hidden rounded-[3px] text-start shadow-card transition-transform hover:-translate-y-[3px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bureau-gold sm:min-w-0 ${
        open
          ? "border border-bureau-gold/55 bg-bureau-paper text-ink"
          : "border border-bureau-line/60 bg-bureau-3 text-bureau-muted hover:border-bureau-gold/50"
      }`}
    >
      {/* Drawer band — the lit slot the file sits in. Deliberately drawn, not
          photographic: pack case art is a shared placeholder, so ten thumbnails
          would read as ten identical grey rectangles. */}
      <span
        className={`relative block h-[86px] w-full overflow-hidden bg-gradient-to-br ${
          open
            ? "from-surface-2 to-bureau-paper"
            : (CASE_BAND_TINTS[index % CASE_BAND_TINTS.length] ??
              CASE_BAND_TINTS[0])
        }`}
      >
        {/* Folder spine — what you see of a file standing in the drawer */}
        <span
          className={`pointer-events-none absolute inset-y-0 start-0 w-[9px] ${
            open ? "bg-bureau-copper/70" : "bg-bureau-gold-dim/45"
          }`}
          aria-hidden
        />
        {/* Ruled lines of the form inside, and the file number on its tab */}
        <span
          className={`pointer-events-none absolute inset-y-5 start-[26px] end-16 flex flex-col justify-between ${
            open ? "text-ink/20" : "text-bureau-paper/[.14]"
          }`}
          aria-hidden
        >
          <b className="block h-[3px] w-full bg-current" />
          <b className="block h-[3px] w-[74%] bg-current" />
          <b className="block h-[3px] w-[88%] bg-current" />
        </span>
        <span
          className={`pointer-events-none absolute -bottom-2 end-2 font-serif text-[46px] font-black leading-none ${
            open ? "text-ink/[.09]" : "text-bureau-paper/[.09]"
          }`}
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {isFreeSample && open && (
          <span className="absolute start-2 top-2 bg-bureau-copper px-2 py-[5px] font-mono text-[8px] font-black uppercase tracking-[.08em] text-white">
            {t("archiveCaseFreeRibbon", lang)}
          </span>
        )}
        {!open && (
          <span
            className="absolute end-2 top-2 grid h-[26px] w-[26px] place-items-center rounded-full bg-bureau/85 text-[12px] text-bureau-gold-dim"
            aria-hidden
          >
            {/* Keyhole — the locked-drawer motif from the archive room */}
            <span className="block h-[13px] w-[8px] rounded-t-[7px] rounded-b-[2px] bg-bureau-gold-dim/90" />
          </span>
        )}
        {isFinal && (
          <span className="absolute bottom-0 end-0 bg-bureau-copper px-2 py-[5px] font-mono text-[7px] font-black uppercase tracking-[.1em] text-white">
            {t("archiveFinalCaseRibbon", lang)}
          </span>
        )}
      </span>

      <span className="flex flex-1 flex-col p-3.5">
        <span
          className={`font-mono text-[9px] font-black uppercase tracking-[.13em] ${
            open ? "text-bureau-copper" : "text-bureau-gold-dim"
          }`}
        >
          {t("archiveCaseNumber", lang).replace(
            "{n}",
            String(index + 1).padStart(2, "0"),
          )}
        </span>
        <span
          className={`mt-1.5 font-serif text-[14px] font-bold leading-snug ${
            open ? "text-ink" : "text-bureau-paper"
          }`}
        >
          {loc(caseData.title, lang)}
        </span>
        <span
          className={`mt-auto pt-2.5 font-mono text-[9px] leading-snug ${
            open ? "text-text-muted" : "text-bureau-dim"
          }`}
        >
          {status === "completed"
            ? t("archiveCaseSolvedLabel", lang)
            : open
              ? `${caseData.evidenceCount} ${t("documents", lang)}`
              : t("archiveCaseInArchiveLabel", lang)}
        </span>
      </span>
    </button>
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

  // The sealed file the player pressed — what the purchase dialog is about.
  const [lockedPick, setLockedPick] = useState<{
    caseData: CaseSummary;
    index: number;
  } | null>(null);

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
          {/* Ink stamp across the cover — the file is closed to outsiders */}
          {!purchased && (
            <span
              className="absolute end-2 top-5 z-[2] rotate-[9deg] rounded-[3px] border-[3px] border-bureau-copper/70 px-2.5 py-1.5 font-serif text-[13px] font-bold uppercase tracking-[.18em] text-bureau-copper/85 md:text-[16px]"
              aria-hidden
            >
              {t("archiveSecretStamp", lang)}
            </span>
          )}
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

          {pack.epigraph && (
            <blockquote className="mt-5 border-s-[3px] border-bureau-copper ps-4 font-serif text-[14px] italic leading-relaxed text-bureau-ink/85 md:text-[16px]">
              {loc(pack.epigraph, lang)}
            </blockquote>
          )}

          <div className="mt-5 grid grid-cols-3 gap-2 md:flex md:gap-3.5">
            <Feature
              value={String(cases.length)}
              label={t("archiveDetailFeatureCases", lang)}
            />
            <Feature
              value={`${pack.evidenceCount ?? cases.length * 3}+`}
              label={t("archiveDetailFeatureEvidence", lang)}
            />
            <Feature value="1" label={t("archiveDetailFeatureStamp", lang)} />
          </div>

          {/* The offer, as one framed docket line: what is bought, then the
              single price button, then the two promises that close the sale. */}
          <div className="relative mt-6 max-w-[680px] overflow-hidden rounded-[10px] border border-bureau-gold/40 bg-bureau-2 p-4 shadow-card">
            <span
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(210,164,81,.14),transparent_36%)]"
              aria-hidden
            />
            <div className="relative flex items-center justify-between gap-4">
              <span className="font-serif text-[13px] font-bold text-bureau-ink">
                {purchased
                  ? t("purchased", lang)
                  : t("archivePurchaseCardLabel", lang).replace(
                      "{total}",
                      String(cases.length),
                    )}
              </span>
              <span className="shrink-0 rounded-full border border-bureau-gold/35 px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-[.12em] text-bureau-dim">
                {purchased
                  ? t("openedCases", lang)
                      .replace("{opened}", String(opened))
                      .replace("{total}", String(cases.length))
                  : t("archivePurchaseBadgeOnce", lang)}
              </span>
            </div>

            {!purchased && (
              <button
                type="button"
                disabled={purchaseBusy || !paymentsAvailable}
                onClick={onPurchase}
                className="relative mt-3 flex min-h-[58px] w-full items-center justify-center gap-3 rounded-[9px] bg-gradient-to-b from-bureau-gold-lit to-bureau-gold px-5 text-ink shadow-[0_6px_0_rgba(55,24,13,.28)] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-[13px] font-black uppercase leading-tight tracking-[.02em]">
                  {samplePlayed
                    ? t("archiveDetailContinue", lang)
                    : t("archiveDetailOpenWhole", lang)}
                </span>
                <span className="h-1 w-1 rounded-full bg-ink/35" aria-hidden />
                <span className="whitespace-nowrap font-serif text-[24px] font-bold leading-none">
                  {purchaseBusy ? "…" : priceLabel(pack)}
                </span>
              </button>
            )}

            <div className="relative mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 font-mono text-[10px] text-bureau-muted">
              <PurchasePromise label={t("archivePerkNoAds", lang)} />
              <PurchasePromise label={t("archivePerkForever", lang)} />
            </div>
          </div>

          {/* The free way in stays a quiet link — it must not compete with the
              price button, but it must never disappear either. */}
          {!purchased && freeSample && !samplePlayed && (
            <button
              type="button"
              onClick={() => onSelectCase(freeSample)}
              className="mt-3 min-h-11 text-[12px] text-bureau-gold underline underline-offset-4"
            >
              {t("archiveDetailPlayFreeFirst", lang)}
            </button>
          )}

          {/* Rewarded-ad unlock — the free path deeper into a paid archive */}
          {!purchased && nextRewarded && (
            <button
              type="button"
              disabled={rewardedSpentToday}
              onClick={() => onUnlockWithAd(nextRewarded)}
              className="mt-3 block min-h-11 w-full max-w-[680px] rounded-[3px] border border-bureau-gold/35 px-4 text-[12px] font-semibold text-bureau-gold disabled:cursor-not-allowed disabled:opacity-55"
            >
              {rewardedSpentToday
                ? t("nextUnlockTomorrow", lang)
                : t("unlockNextWithAd", lang)}
            </button>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1380px] border-t border-bureau-gold/25 px-4 pt-7 md:px-[5vw]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[9px] font-black uppercase tracking-[.13em] text-bureau-gold-dim">
              {t("archiveProgressEyebrow", lang)}
            </div>
            <h2 className="mt-1 font-serif text-[22px] font-bold text-bureau-ink md:text-[26px]">
              {t("archiveContentsTitle", lang)}
            </h2>
          </div>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[.1em] text-bureau-dim">
            {t("openedCases", lang)
              .replace("{opened}", String(opened))
              .replace("{total}", String(cases.length))}
          </span>
        </div>

        {/* How far the file drawer is open — the one number the section is about */}
        <div
          className="mt-3.5 h-[5px] overflow-hidden rounded-full bg-bureau-3"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={cases.length}
          aria-valuenow={opened}
        >
          <span
            className="block h-full rounded-full bg-gradient-to-r from-bureau-copper to-bureau-gold transition-[width] duration-500"
            style={{
              width: `${cases.length ? (opened / cases.length) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Mobile keeps the files in one swipeable drawer; desktop lays the
            whole archive out at once. */}
        <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 xl:grid-cols-5">
          {cases.map((caseData, index) => {
            const status = getArchiveCaseStatus(
              stats,
              pack,
              caseData.id,
              index,
              unlockByCaseId,
            );
            return (
              <CaseTile
                key={caseData.id}
                caseData={caseData}
                index={index}
                status={status}
                isFinal={index === cases.length - 1}
                isFreeSample={
                  index === 0 && !purchased && status !== "completed"
                }
                lang={lang}
                onActivate={() =>
                  status === "locked"
                    ? setLockedPick({ caseData, index })
                    : onSelectCase(caseData)
                }
              />
            );
          })}
        </div>
      </section>

      <ArchivePurchaseModal
        lockedCase={lockedPick?.caseData ?? null}
        lockedCaseIndex={lockedPick?.index ?? 0}
        pack={pack}
        totalCases={cases.length}
        lang={lang}
        priceLabel={priceLabel(pack)}
        purchaseBusy={purchaseBusy}
        paymentsAvailable={paymentsAvailable}
        rewardedSpentToday={rewardedSpentToday}
        onPurchase={() => {
          setLockedPick(null);
          onPurchase();
        }}
        onUnlockWithAd={(caseData) => {
          setLockedPick(null);
          onUnlockWithAd(caseData);
        }}
        onClose={() => setLockedPick(null)}
      />
    </div>
  );
}

function PurchasePromise({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <i className="not-italic font-black text-bureau-gold" aria-hidden>
        ✓
      </i>
      {label}
    </span>
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
