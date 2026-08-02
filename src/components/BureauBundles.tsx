import {
  COMPLETE_BUNDLE_ID,
  getBundle,
  getBundleDiscountPercent,
  getBundleListPriceRub,
} from "../data/bundles";
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
  /** Formats a plain ruble amount — used for the struck-out list price. */
  formatRub: (value: number) => string;
  onPurchaseBundle: (bundleId: string) => void;
}

/**
 * The Bureau's headline offer: every archive plus every novelty caption. The
 * "before" price and the discount are both derived from the contents, so the
 * advertised saving can never contradict what the purchase actually contains.
 */
export function BureauBundles({
  lang,
  stats,
  paymentsAvailable,
  busy,
  bundlePriceLabel,
  formatRub,
  onPurchaseBundle,
}: Props) {
  const bundle = getBundle(COMPLETE_BUNDLE_ID);
  if (!bundle) return null;

  const listPrice = getBundleListPriceRub(bundle);
  const saving = listPrice - bundle.fallbackPriceRub;
  const owned =
    bundle.packIds.every((id) => stats.archivePurchasedPackIds.includes(id)) &&
    bundle.stampTextIds.every((id) => stats.ownedStampTextIds.includes(id));

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

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3.5">
        <s className="font-serif text-[16px] text-bureau-dim">
          {formatRub(listPrice)}
        </s>
        <b className="font-serif text-[32px] font-bold text-bureau-gold md:text-[35px]">
          {bundlePriceLabel(bundle.id)}
        </b>
        <span className="bg-[#763528] px-2 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[.04em] text-bureau-ink">
          {t("bundleSavings", lang).replace("{amount}", formatRub(saving))} ·
          −{getBundleDiscountPercent(bundle)}%
        </span>
      </div>

      <button
        type="button"
        disabled={owned || busy || !paymentsAvailable}
        onClick={() => onPurchaseBundle(bundle.id)}
        className="mt-6 min-h-[54px] min-w-[220px] rounded-[3px] bg-bureau-gold px-6 text-[12px] font-black uppercase tracking-[.02em] text-ink shadow-[0_4px_0_rgba(55,24,13,.18)] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
      >
        {owned ? t("bundleOwned", lang) : busy ? "…" : t("bundleHeroCta", lang)}
      </button>
    </section>
  );
}
