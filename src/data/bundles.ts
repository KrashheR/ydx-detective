/**
 * Bundle IAPs — static catalog data for the Bureau's "Наборы" shelf.
 *
 * A bundle is not a product of its own in the game's model: it is a single
 * Yandex product id that, once purchased, grants the *contents* of several
 * other catalog entries (archive packs and/or stamp captions). Ownership of the
 * contents is what the rest of the game reads, so a bundle never needs special
 * cases in the gameplay code — only in the store's grant/restore path.
 *
 * The list price is always derived from the contents' own fallback prices, so
 * the advertised discount can never contradict what is actually included.
 */
import { THEMATIC_PACKS } from "./thematicPacks";
import { PURCHASABLE_STAMP_TEXTS } from "./stampTexts";
import type { UIKey } from "../i18n/ui";

export interface Bundle {
  readonly id: string;
  /** Yandex IAP product id. */
  readonly productId: string;
  /** Shown when the payments catalog is unreachable (offline / dev). */
  readonly fallbackPriceRub: number;
  /** Archive pack ids the purchase unlocks. */
  readonly packIds: readonly string[];
  /** Stamp-caption ids the purchase unlocks. */
  readonly stampTextIds: readonly string[];
  readonly titleKey: UIKey;
}

const ALL_PACK_IDS = THEMATIC_PACKS.map((pack) => pack.id);
const ALL_STAMP_TEXT_IDS = PURCHASABLE_STAMP_TEXTS.map((stamp) => stamp.id);

/** Every novelty caption in one purchase — sold inside the stamp workshop. */
export const STAMP_BUNDLE_ID = "bundle.stamps";
/** All three archives plus every caption — the Bureau's headline offer. */
export const COMPLETE_BUNDLE_ID = "bundle.complete";

export const BUNDLES: readonly Bundle[] = [
  {
    id: STAMP_BUNDLE_ID,
    productId: STAMP_BUNDLE_ID,
    fallbackPriceRub: 199,
    packIds: [],
    stampTextIds: ALL_STAMP_TEXT_IDS,
    titleKey: "bundleStampsTitle",
  },
  {
    id: COMPLETE_BUNDLE_ID,
    productId: COMPLETE_BUNDLE_ID,
    fallbackPriceRub: 899,
    packIds: ALL_PACK_IDS,
    stampTextIds: ALL_STAMP_TEXT_IDS,
    titleKey: "bundleHeroTitle",
  },
];

export function getBundle(id: string): Bundle | undefined {
  return BUNDLES.find((bundle) => bundle.id === id);
}

export function getBundleByProductId(productId: string): Bundle | undefined {
  return BUNDLES.find((bundle) => bundle.productId === productId);
}

/**
 * What the bundle's contents cost when bought one by one — the honest "before"
 * price. Derived, never authored, so it always matches `packIds`/`stampTextIds`.
 */
export function getBundleListPriceRub(bundle: Bundle): number {
  const packs = bundle.packIds.reduce((sum, packId) => {
    const pack = THEMATIC_PACKS.find((item) => item.id === packId);
    return sum + (pack?.fallbackPriceRub ?? 0);
  }, 0);
  const stamps = bundle.stampTextIds.reduce((sum, stampId) => {
    const stamp = PURCHASABLE_STAMP_TEXTS.find((item) => item.id === stampId);
    return sum + (stamp?.fallbackPriceRub ?? 0);
  }, 0);
  return packs + stamps;
}

/** Whole-percent discount off the list price, floored (never overstated). */
export function getBundleDiscountPercent(bundle: Bundle): number {
  const list = getBundleListPriceRub(bundle);
  if (list <= 0) return 0;
  return Math.floor(((list - bundle.fallbackPriceRub) / list) * 100);
}

/** Largest advertised discount across the shelf — the tab badge. */
export function getMaxBundleDiscountPercent(): number {
  return BUNDLES.reduce(
    (max, bundle) => Math.max(max, getBundleDiscountPercent(bundle)),
    0,
  );
}
