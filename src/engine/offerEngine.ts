/**
 * Limited-time price offers — pure derivation over runtime stats and the static
 * catalog. No React, no SDK, no store.
 *
 * A Yandex IAP price is fixed per product id: it cannot be discounted at
 * runtime. An "offer" is therefore a *second product id* at a lower price, and
 * the only decision the game makes is **which of the two ids to show and buy**.
 * That decision is this engine.
 *
 * Every rule below is derived from state the game already keeps, so an offer
 * can never disagree with what the player has actually done.
 */
import { GAME_CONFIG } from "../config/gameConfig";
import type { PlayerStats } from "../types";

/**
 * Why an offer is currently on. Adding a rule means adding a case to
 * `isOfferActive` — the exhaustive switch is what keeps the two in step.
 */
export type OfferRule =
  /** Introductory price, valid until the player owns their first archive pack. */
  | "first_archive"
  /** Unlocked once the player has closed `offers.bundleMinCompletedCases` cases. */
  | "after_cases"
  /** Unlocked from the server-day *after* the player's first session. */
  | "next_day";

/** A cheaper alternative product for a catalog entry. */
export interface Offer {
  /** Yandex IAP product id charged while the offer is active. */
  readonly productId: string;
  /** Shown when the payments catalog is unreachable (offline / dev). */
  readonly fallbackPriceRub: number;
  readonly rule: OfferRule;
}

/** Everything the rules read — a narrow slice of `PlayerStats` plus the clock. */
export interface OfferContext {
  readonly stats: Pick<
    PlayerStats,
    "archivePurchasedPackIds" | "completedCaseIds" | "firstSeenServerDay"
  >;
  /**
   * Current server-day index (`getServerTimeMs()` bucketed by the daily
   * cooldown). Device time is never acceptable here — see invariant #3.
   */
  readonly serverDay: number;
}

/** Server-time (ms) → the day index every daily/offer gate is bucketed by. */
export function toServerDay(serverTimeMs: number): number {
  return Math.floor(serverTimeMs / GAME_CONFIG.daily.cooldownMs);
}

export function isOfferActive(offer: Offer, ctx: OfferContext): boolean {
  const { stats, serverDay } = ctx;
  switch (offer.rule) {
    case "first_archive":
      // The intro price is a *first* purchase incentive: buying any archive
      // (or receiving one in a bundle) retires it for good.
      return stats.archivePurchasedPackIds.length === 0;
    case "after_cases":
      return (
        stats.completedCaseIds.length >=
        GAME_CONFIG.offers.bundleMinCompletedCases
      );
    case "next_day":
      // A brand-new profile has no first day recorded yet — the offer opens on
      // the day *after* the one the game first saw, never on day one.
      return (
        stats.firstSeenServerDay !== null &&
        serverDay - stats.firstSeenServerDay >=
          GAME_CONFIG.offers.nextDayOfferAfterDays
      );
  }
}

/**
 * The product id and price to charge for a catalog entry right now: the offer
 * when its rule is satisfied, the regular price otherwise.
 */
export interface ResolvedPrice {
  /** The id to charge, or `null` when the entry is not on sale at all. */
  readonly productId: string | null;
  readonly fallbackPriceRub: number;
  /** The struck-through "before" price — `null` when no offer is running. */
  readonly baseFallbackPriceRub: number | null;
  readonly offerActive: boolean;
}

export function resolvePrice(
  entry: {
    readonly productId: string | null;
    readonly fallbackPriceRub: number;
    readonly offer?: Offer;
  },
  ctx: OfferContext,
): ResolvedPrice {
  if (entry.offer && isOfferActive(entry.offer, ctx)) {
    return {
      productId: entry.offer.productId,
      fallbackPriceRub: entry.offer.fallbackPriceRub,
      baseFallbackPriceRub: entry.fallbackPriceRub,
      offerActive: true,
    };
  }
  return {
    productId: entry.productId,
    fallbackPriceRub: entry.fallbackPriceRub,
    baseFallbackPriceRub: null,
    offerActive: false,
  };
}

/** Whole-percent discount an offer advertises, floored (never overstated). */
export function getOfferDiscountPercent(price: ResolvedPrice): number {
  const base = price.baseFallbackPriceRub;
  if (base == null || base <= 0) return 0;
  return Math.floor(((base - price.fallbackPriceRub) / base) * 100);
}
