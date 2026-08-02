import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { THEMATIC_PACKS, type ThematicPack } from "../data/thematicPacks";
import { getBundle, getMaxBundleDiscountPercent } from "../data/bundles";
import { STAMP_TEXTS, type StampText } from "../data/stampTexts";
import { indexUnlocksByCaseId } from "../engine/archiveAccessEngine";
import {
  resolvePrice,
  toServerDay,
  type Offer,
  type OfferContext,
} from "../engine/offerEngine";
import { GAME_CONFIG } from "../config/gameConfig";
import { loc, t } from "../i18n/ui";
import { getServerTimeMs, type PaymentsProduct } from "../services/platformAdapter";
import type { CaseUnlockInfo } from "../engine/caseUnlockEngine";
import type { CaseSummary, Language, PlayerStats } from "../types";
import { BureauArchiveDetail, BureauArchiveShelf } from "./BureauArchives";
import { BureauWorkshop } from "./BureauWorkshop";
import { BureauBundles } from "./BureauBundles";

export type BureauTab = "archives" | "stamps" | "bundles";

interface Props {
  lang: Language;
  stats: PlayerStats;
  caseUnlocks?: readonly CaseUnlockInfo<CaseSummary>[];
  paymentsAvailable: boolean;
  catalogByProductId: Record<string, PaymentsProduct>;
  /** Tab the Bureau opens on — the entry point decides. */
  initialTab?: BureauTab;
  onSelectCase: (caseData: CaseSummary) => void;
  onPurchasePack: (pack: ThematicPack) => Promise<boolean>;
  onPurchaseStampText: (stamp: StampText) => Promise<boolean>;
  onPurchaseBundle: (bundleId: string) => Promise<boolean>;
  onPurchaseNoAds: () => Promise<boolean>;
  onEquipStampText: (stampTextId: string | null) => void;
  onPickStampInk: (stampInkId: string | null) => void;
  onUnlockCaseWithAd: (packId: string, caseId: string) => boolean;
  /* --- Analytics hooks: the Bureau reports, `App.tsx` owns the adapter --- */
  onTabSwitch?: (from: BureauTab, to: BureauTab) => void;
  /** An archive's own page was opened, from wherever. */
  onViewPack?: (packId: string, source: "shelf" | "stamp_lock") => void;
  /** A pack-gated caption was tapped while still locked. */
  onLockedStampClick?: (stampTextId: string, packId: string) => void;
  onClose: () => void;
}

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  ru: "ru-RU",
  en: "en-US",
  tr: "tr-TR",
  ar: "ar-EG",
  kk: "kk-KZ",
};

/**
 * The Bureau of Special Cases — the whole commercial part of the game under a
 * single dark frame: archives shelf, an archive's own page, the stamp workshop
 * and the bundle offer. It is a full screen rather than a modal, because the
 * shelf is a destination the top bar links to, not an interruption of a case.
 */
export function BureauScreen({
  lang,
  stats,
  caseUnlocks = [],
  paymentsAvailable,
  catalogByProductId,
  initialTab = "archives",
  onSelectCase,
  onPurchasePack,
  onPurchaseStampText,
  onPurchaseBundle,
  onPurchaseNoAds,
  onEquipStampText,
  onPickStampInk,
  onUnlockCaseWithAd,
  onTabSwitch,
  onViewPack,
  onLockedStampClick,
  onClose,
}: Props) {
  const [tab, setTab] = useState<BureauTab>(initialTab);
  const [openPackId, setOpenPackId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Moving between shelves swaps the content of one scroll container, so the
  // previous screen's offset would otherwise carry over and drop the player
  // into the middle of the next one.
  useEffect(() => {
    let node = rootRef.current?.parentElement ?? null;
    while (node) {
      if (node.scrollHeight > node.clientHeight) {
        node.scrollTop = 0;
        return;
      }
      node = node.parentElement;
    }
    window.scrollTo(0, 0);
  }, [tab, openPackId]);

  const unlockByCaseId = useMemo(
    () => indexUnlocksByCaseId(caseUnlocks),
    [caseUnlocks],
  );
  const openPackIndex = THEMATIC_PACKS.findIndex((p) => p.id === openPackId);
  const openPack = openPackIndex >= 0 ? THEMATIC_PACKS[openPackIndex] : null;

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const formatRub = (value: number): string =>
    new Intl.NumberFormat(LOCALE_BY_LANGUAGE[lang], {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);

  // One rewarded archive unlock per pack per server day — same rule the store
  // enforces; mirrored here only so the button can explain itself.
  const today = toServerDay(getServerTimeMs());
  const offerContext: OfferContext = { stats, serverDay: today };

  /**
   * A catalog entry's live price label. Offers are a *different product id*, so
   * the label has to follow the id the player would actually be charged for —
   * showing the regular product's price next to an offer button would lie.
   */
  const priceLabelFor = (entry: {
    productId: string;
    fallbackPriceRub: number;
    offer?: Offer;
  }): string => {
    const price = resolvePrice(entry, offerContext);
    return (
      catalogByProductId[price.productId]?.price ??
      formatRub(price.fallbackPriceRub)
    );
  };

  const packPriceLabel = (pack: ThematicPack): string => priceLabelFor(pack);

  const stampPriceLabel = (stamp: StampText): string =>
    (stamp.productId ? catalogByProductId[stamp.productId]?.price : undefined) ??
    formatRub(stamp.fallbackPriceRub);

  const packTitle = (packId: string): string => {
    const pack = THEMATIC_PACKS.find((entry) => entry.id === packId);
    return pack ? loc(pack.title, lang) : "";
  };

  const bundlePriceLabel = (bundleId: string): string => {
    const bundle = getBundle(bundleId);
    return bundle ? priceLabelFor(bundle) : "";
  };

  const runPurchase = async (id: string, purchase: () => Promise<boolean>) => {
    if (!paymentsAvailable) {
      setNotice(t("stampPurchaseUnavailable", lang));
      return;
    }
    setBusyId(id);
    const ok = await purchase();
    setBusyId(null);
    // A falsy result covers both a real failure and the player simply backing
    // out of the payment dialog, and the adapter cannot tell them apart — so
    // the message stays neutral rather than blaming the platform.
    setNotice(ok ? t("purchased", lang) : t("purchaseNotCompleted", lang));
  };

  const rewardedSpentToday =
    openPack != null &&
    stats.archiveAdUnlockServerDayByPack[openPack.id] === today;

  const tabs: readonly { id: BureauTab; label: string; badge: string }[] = [
    {
      id: "archives",
      label: t("bureauTabArchives", lang),
      badge: String(THEMATIC_PACKS.length),
    },
    {
      id: "stamps",
      label: t("bureauTabStamps", lang),
      // The tab advertises the size of the shelf, not how much of it is owned.
      badge: String(STAMP_TEXTS.length),
    },
    {
      id: "bundles",
      label: t("bureauTabBundles", lang),
      badge: t("bureauTabBundlesBadge", lang).replace(
        "{percent}",
        String(getMaxBundleDiscountPercent()),
      ),
    },
  ];

  return (
    <motion.div
      className="relative min-h-full bg-bureau text-bureau-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="region"
      aria-label={t("navBureau", lang)}
      ref={rootRef}
    >
      {/* Night-office light: a single warm pool from above, nothing else */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(170,119,55,.18),transparent_42%)]"
        aria-hidden
      />

      <div className="relative">
        {tab === "archives" && openPack ? (
          <BureauArchiveDetail
            pack={openPack}
            packIndex={openPackIndex}
            lang={lang}
            stats={stats}
            unlockByCaseId={unlockByCaseId}
            priceLabel={packPriceLabel}
            purchaseBusy={busyId === openPack.id}
            paymentsAvailable={paymentsAvailable}
            rewardedSpentToday={rewardedSpentToday}
            onBack={() => setOpenPackId(null)}
            onSelectCase={onSelectCase}
            onPurchase={() =>
              void runPurchase(openPack.id, () => onPurchasePack(openPack))
            }
            onUnlockWithAd={(caseData) => {
              const started = onUnlockCaseWithAd(openPack.id, caseData.id);
              if (!started) setNotice(t("adUnavailableTryLater", lang));
            }}
          />
        ) : (
          <>
            <section className="mx-auto max-w-[1500px] px-4 pb-6 pt-8 md:px-[5vw]">
              <button
                type="button"
                onClick={onClose}
                className="mb-6 min-h-11 font-mono text-[10px] font-black uppercase tracking-[.06em] text-bureau-muted"
              >
                {t("bureauBackToCase", lang)}
              </button>
              <div className="font-mono text-[9px] font-black uppercase tracking-[.13em] text-bureau-gold-dim">
                {t("bureauEyebrow", lang)}
              </div>
              <h1 className="mt-2 max-w-[820px] font-serif text-[clamp(28px,3.1vw,54px)] font-bold leading-[1.05] tracking-[-.02em]">
                {t("bureauHeroTitle", lang)}
              </h1>
              <p className="mt-3.5 max-w-[620px] text-[13px] leading-[1.7] text-bureau-muted">
                {t("bureauHeroLead", lang)}
              </p>
            </section>

            <div
              className="flex h-[58px] items-center gap-1 overflow-x-auto border-y border-bureau-gold/25 px-2 md:px-[5vw]"
              role="tablist"
            >
              {tabs.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === entry.id}
                  onClick={() => {
                    if (entry.id !== tab) onTabSwitch?.(tab, entry.id);
                    setTab(entry.id);
                    setOpenPackId(null);
                  }}
                  className={`flex h-full shrink-0 items-center gap-1.5 whitespace-nowrap px-4 text-[13px] transition-colors md:px-6 ${
                    tab === entry.id
                      ? "border-b-[3px] border-bureau-gold text-bureau-ink"
                      : "text-bureau-dim hover:text-bureau-muted"
                  }`}
                >
                  {entry.label}
                  <span
                    className={`px-1.5 py-0.5 font-mono text-[8px] font-black ${
                      entry.id === "bundles"
                        ? "bg-[#6C3425] text-bureau-gold"
                        : "bg-white/[.08]"
                    }`}
                  >
                    {entry.badge}
                  </span>
                </button>
              ))}
            </div>

            {tab === "archives" && (
              <BureauArchiveShelf
                lang={lang}
                stats={stats}
                unlockByCaseId={unlockByCaseId}
                priceLabel={packPriceLabel}
                onOpenPack={(packId) => {
                  onViewPack?.(packId, "shelf");
                  setOpenPackId(packId);
                }}
              />
            )}

            {tab === "stamps" && (
              <BureauWorkshop
                lang={lang}
                ownedStampTextIds={stats.ownedStampTextIds}
                purchasedPackIds={stats.archivePurchasedPackIds}
                activeStampTextId={stats.activeStampTextId}
                activeStampInkId={stats.activeStampInkId}
                paymentsAvailable={paymentsAvailable}
                priceLabel={stampPriceLabel}
                bundlePriceLabel={bundlePriceLabel}
                packTitle={packTitle}
                busyId={busyId}
                onOpenPack={(packId, stampTextId) => {
                  // The caption is not sold here — the archive that carries it
                  // is, so the tile hands the player over to its page.
                  onLockedStampClick?.(stampTextId, packId);
                  onViewPack?.(packId, "stamp_lock");
                  setTab("archives");
                  setOpenPackId(packId);
                }}
                onPurchase={(stamp) =>
                  void runPurchase(stamp.id, () => onPurchaseStampText(stamp))
                }
                onEquip={onEquipStampText}
                onPickInk={onPickStampInk}
                onPurchaseBundle={(bundleId) =>
                  void runPurchase(bundleId, () => onPurchaseBundle(bundleId))
                }
              />
            )}

            {tab === "bundles" && (
              <BureauBundles
                lang={lang}
                stats={stats}
                paymentsAvailable={paymentsAvailable}
                busy={busyId !== null}
                bundlePriceLabel={bundlePriceLabel}
                noAdsPriceLabel={
                  catalogByProductId[GAME_CONFIG.advertising.noAdsProductId]
                    ?.price ??
                  formatRub(GAME_CONFIG.advertising.noAdsFallbackPriceRub)
                }
                formatRub={formatRub}
                offerContext={offerContext}
                onPurchaseBundle={(bundleId) =>
                  void runPurchase(bundleId, () => onPurchaseBundle(bundleId))
                }
                onPurchaseNoAds={() =>
                  void runPurchase(
                    GAME_CONFIG.advertising.noAdsProductId,
                    onPurchaseNoAds,
                  )
                }
              />
            )}
          </>
        )}
      </div>

      {notice && (
        <div
          className="fixed bottom-5 start-1/2 z-50 -translate-x-1/2 rounded-[8px] border border-bureau-gold/40 bg-bureau-2 px-4 py-2.5 text-[12px] font-semibold text-bureau-ink shadow-lift"
          role="status"
        >
          {notice}
        </div>
      )}
    </motion.div>
  );
}
