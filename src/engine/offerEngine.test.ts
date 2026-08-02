import { describe, it, expect } from 'vitest';
import {
  getOfferDiscountPercent,
  isOfferActive,
  resolvePrice,
  toServerDay,
  type Offer,
  type OfferContext,
} from './offerEngine';
import { GAME_CONFIG } from '../config/gameConfig';

const ctx = (over: Partial<OfferContext['stats']> & { serverDay?: number } = {}): OfferContext => ({
  stats: {
    archivePurchasedPackIds: over.archivePurchasedPackIds ?? [],
    completedCaseIds: over.completedCaseIds ?? [],
    firstSeenServerDay: over.firstSeenServerDay ?? null,
  },
  serverDay: over.serverDay ?? 100,
});

const offer = (rule: Offer['rule']): Offer => ({
  productId: 'x.offer',
  fallbackPriceRub: 99,
  rule,
});

describe('isOfferActive', () => {
  it('runs the first-archive intro price only until a pack is owned', () => {
    expect(isOfferActive(offer('first_archive'), ctx())).toBe(true);
    expect(
      isOfferActive(offer('first_archive'), ctx({ archivePurchasedPackIds: ['night-train'] })),
    ).toBe(false);
  });

  it('opens the after-cases offer exactly at the configured threshold', () => {
    const { bundleMinCompletedCases: min } = GAME_CONFIG.offers;
    const cases = (n: number) => Array.from({ length: n }, (_, i) => `case-${i}`);
    expect(isOfferActive(offer('after_cases'), ctx({ completedCaseIds: cases(min - 1) }))).toBe(false);
    expect(isOfferActive(offer('after_cases'), ctx({ completedCaseIds: cases(min) }))).toBe(true);
  });

  it('never opens the next-day offer on the first day', () => {
    const day = 100;
    expect(
      isOfferActive(offer('next_day'), ctx({ firstSeenServerDay: day, serverDay: day })),
    ).toBe(false);
    expect(
      isOfferActive(offer('next_day'), ctx({ firstSeenServerDay: day, serverDay: day + 1 })),
    ).toBe(true);
  });

  it('keeps the next-day offer shut for a profile with no recorded first day', () => {
    expect(isOfferActive(offer('next_day'), ctx({ firstSeenServerDay: null }))).toBe(false);
  });
});

describe('resolvePrice', () => {
  const entry = { productId: 'x', fallbackPriceRub: 149, offer: offer('first_archive') };

  it('charges the offer product while the offer runs', () => {
    const price = resolvePrice(entry, ctx());
    expect(price.productId).toBe('x.offer');
    expect(price.fallbackPriceRub).toBe(99);
    expect(price.baseFallbackPriceRub).toBe(149);
    expect(getOfferDiscountPercent(price)).toBe(33);
  });

  it('falls back to the regular product once the offer closes', () => {
    const price = resolvePrice(entry, ctx({ archivePurchasedPackIds: ['night-train'] }));
    expect(price.productId).toBe('x');
    expect(price.fallbackPriceRub).toBe(149);
    expect(price.baseFallbackPriceRub).toBeNull();
    expect(getOfferDiscountPercent(price)).toBe(0);
  });

  it('leaves an entry without an offer untouched', () => {
    const price = resolvePrice({ productId: 'y', fallbackPriceRub: 49 }, ctx());
    expect(price.offerActive).toBe(false);
    expect(price.productId).toBe('y');
  });
});

describe('toServerDay', () => {
  it('buckets server time by the daily cooldown', () => {
    const { cooldownMs } = GAME_CONFIG.daily;
    expect(toServerDay(cooldownMs * 3 + 5)).toBe(3);
  });
});
