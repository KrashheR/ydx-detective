import {
  ARCHIVES_BUNDLE_ID,
  COMPLETE_BUNDLE_ID,
  getBundle,
  getBundleListPriceRub,
  type Bundle,
} from "../data/bundles";
import { resolvePrice, type OfferContext } from "../engine/offerEngine";
import { t } from "../i18n/ui";
import { FAN_SLOT_CLASSES, PackCover, getFanPacks } from "./BureauArchives";
import type { Language, PlayerStats } from "../types";

interface Props {
  lang: Language;
  stats: PlayerStats;
  paymentsAvailable: boolean;
  busy: boolean;
  /** Live catalog price, falling back to the bundle's own ruble price. */
  bundlePriceLabel: (bundleId: string) => string;
  /** Live catalog price of the permanent ad-free product. */
  noAdsPriceLabel: string;
  /** Formats a plain ruble amount — used for the struck-out list price. */
  formatRub: (value: number) => string;
  /** Which limited-price offers are currently running. */
  offerContext: OfferContext;
  onPurchaseBundle: (bundleId: string) => void;
  onPurchaseNoAds: () => void;
}

/**
 * Struck-out list price, the price actually charged, the saving between them,
 * and — only while a limited-price offer runs — a "special offer" tag.
 *
 * Every number comes from the *resolved* price, i.e. the product id the button
 * will charge. Deriving the percent from the regular price while printing the
 * offer price is how a storefront ends up advertising two different discounts
 * on one card.
 */
function PriceRow({
  bundle,
  lang,
  offerContext,
  priceLabel,
  formatRub,
  big,
}: {
  bundle: Bundle;
  lang: Language;
  offerContext: OfferContext;
  priceLabel: string;
  formatRub: (value: number) => string;
  big?: boolean;
}) {
  const now = resolvePrice(bundle, offerContext);
  const listPrice = getBundleListPriceRub(bundle);
  const saving = listPrice - now.fallbackPriceRub;
  const percent = listPrice > 0 ? Math.floor((saving / listPrice) * 100) : 0;

  return (
    <div
      className={`mt-4 flex flex-wrap items-center gap-2.5 ${
        big ? "justify-center gap-3.5" : ""
      }`}
    >
      <s className={`font-serif text-bureau-dim ${big ? "text-[16px]" : "text-[14px]"}`}>
        {formatRub(listPrice)}
      </s>
      <b
        className={`font-serif font-bold text-bureau-gold ${
          big ? "text-[32px] md:text-[35px]" : "text-[24px]"
        }`}
      >
        {priceLabel}
      </b>
      {saving > 0 && (
        <span className="bg-[#763528] px-2 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[.04em] text-bureau-ink">
          {t("bundleSavings", lang).replace("{amount}", formatRub(saving))} ·
          −{percent}%
        </span>
      )}
      {now.offerActive && (
        <span className="bg-bureau-gold px-2 py-1.5 font-mono text-[9px] font-black uppercase tracking-[.04em] text-ink">
          {t("offerBadge", lang)}
        </span>
      )}
    </div>
  );
}

/**
 * The Bureau's "Наборы" shelf: the headline complete collection, the
 * archives-only set, and the permanent ad-free unlock.
 *
 * Every bundle's "before" price and discount are derived from its contents, so
 * the advertised saving can never contradict what the purchase actually
 * contains. A running *offer* is a separate, cheaper product id rather than a
 * discount on the same one — Yandex prices are fixed per product — so the price
 * label always follows the id the button will charge.
 */
export function BureauBundles({
  lang,
  stats,
  paymentsAvailable,
  busy,
  bundlePriceLabel,
  noAdsPriceLabel,
  formatRub,
  offerContext,
  onPurchaseBundle,
  onPurchaseNoAds,
}: Props) {
  const bundle = getBundle(COMPLETE_BUNDLE_ID);
  const archives = getBundle(ARCHIVES_BUNDLE_ID);
  if (!bundle) return null;

  const ownsBundle = (entry: Bundle): boolean =>
    entry.packIds.every((id) => stats.archivePurchasedPackIds.includes(id)) &&
    entry.stampTextIds.every((id) => stats.ownedStampTextIds.includes(id));
  const owned = ownsBundle(bundle);

  return (
    <section className="mx-auto max-w-[880px] px-4 pb-16 pt-8 text-center md:px-5">
      <small className="font-mono text-[9px] font-black uppercase tracking-[.13em] text-bureau-gold-dim">
        {t("bundleHeroEyebrow", lang)}
      </small>
      <h1 className="mt-2 font-serif text-[clamp(30px,4.4vw,52px)] font-bold leading-tight text-bureau-ink">
        {t("bundleHeroTitle", lang)}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-bureau-muted">
        {t("bundleHeroLead", lang)}
      </p>

      {/* Fanned covers — the whole shelf in one image */}
      <div className="relative mx-auto mt-7 h-[220px] max-w-[600px] md:h-[330px]">
        {getFanPacks().map((pack, index) => (
          <span
            key={`${pack.id}-${index}`}
            className={`absolute start-1/2 top-4 block h-[190px] w-[190px] overflow-hidden border-4 border-bureau-gold-dim shadow-folder md:h-[300px] md:w-[300px] ${FAN_SLOT_CLASSES[index]}`}
          >
            <PackCover pack={pack} className="h-full w-full" />
          </span>
        ))}
      </div>

      <PriceRow
        big
        bundle={bundle}
        lang={lang}
        offerContext={offerContext}
        priceLabel={bundlePriceLabel(bundle.id)}
        formatRub={formatRub}
      />

      <button
        type="button"
        disabled={owned || busy || !paymentsAvailable}
        onClick={() => onPurchaseBundle(bundle.id)}
        className="mt-6 min-h-[54px] min-w-[220px] rounded-[3px] bg-bureau-gold px-6 text-[12px] font-black uppercase tracking-[.02em] text-ink shadow-[0_4px_0_rgba(55,24,13,.18)] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
      >
        {owned ? t("bundleOwned", lang) : busy ? "…" : t("bundleHeroCta", lang)}
      </button>

      {/* The two smaller entries: archives without the captions, and ad-free */}
      <div className="mt-12 grid gap-4 text-start md:grid-cols-2">
        {archives && (
          <article className="flex flex-col border border-bureau-gold/25 bg-white/[.03] p-5">
            <h2 className="font-serif text-[19px] font-bold text-bureau-ink">
              {t("bundleArchivesTitle", lang)}
            </h2>
            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-bureau-muted">
              {t("bundleArchivesLead", lang)}
            </p>
            <PriceRow
              bundle={archives}
              lang={lang}
              offerContext={offerContext}
              priceLabel={bundlePriceLabel(archives.id)}
              formatRub={formatRub}
            />
            <button
              type="button"
              disabled={ownsBundle(archives) || busy || !paymentsAvailable}
              onClick={() => onPurchaseBundle(archives.id)}
              className="mt-4 min-h-11 rounded-[3px] border border-bureau-gold px-5 text-[11px] font-black uppercase tracking-[.02em] text-bureau-gold transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
            >
              {ownsBundle(archives)
                ? t("bundleOwned", lang)
                : busy
                  ? "…"
                  : t("bundleArchivesCta", lang)}
            </button>
          </article>
        )}

        <article className="flex flex-col border border-bureau-gold/25 bg-white/[.03] p-5">
          <h2 className="font-serif text-[19px] font-bold text-bureau-ink">
            {t("noAdsTitle", lang)}
          </h2>
          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-bureau-muted">
            {t("noAdsLead", lang)}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <b className="font-serif text-[24px] font-bold text-bureau-gold">
              {noAdsPriceLabel}
            </b>
          </div>
          <button
            type="button"
            disabled={stats.noAdsPurchased || busy || !paymentsAvailable}
            onClick={onPurchaseNoAds}
            className="mt-4 min-h-11 rounded-[3px] border border-bureau-gold px-5 text-[11px] font-black uppercase tracking-[.02em] text-bureau-gold transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          >
            {stats.noAdsPurchased
              ? t("noAdsOwned", lang)
              : busy
                ? "…"
                : t("noAdsCta", lang)}
          </button>
        </article>
      </div>
    </section>
  );
}
