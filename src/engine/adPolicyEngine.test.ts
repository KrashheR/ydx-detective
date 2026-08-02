import { describe, expect, it } from 'vitest';
import { evaluateInterstitial, type InterstitialInput } from './adPolicyEngine';

const CONFIG = {
  firstMinCompletedCases: 2,
  firstMinActiveMs: 7 * 60 * 1000,
  repeatMinActiveMs: 6 * 60 * 1000,
  minCasesBetweenInterstitials: 2,
};

const MIN = 60 * 1000;

function input(overrides: Partial<InterstitialInput> = {}): InterstitialInput {
  return {
    completedCasesTotal: 5,
    activeMs: 20 * MIN,
    lastShownActiveMs: null,
    casesSinceLastAd: 1,
    noAds: false,
    archiveAdFree: false,
    config: CONFIG,
    ...overrides,
  };
}

describe('evaluateInterstitial — entitlements', () => {
  it('never shows a forced ad to a No Ads owner', () => {
    expect(evaluateInterstitial(input({ noAds: true }))).toEqual({
      show: false,
      reason: 'no_ads_purchased',
    });
  });

  it('never shows a forced ad inside a purchased archive', () => {
    expect(evaluateInterstitial(input({ archiveAdFree: true }))).toEqual({
      show: false,
      reason: 'archive_purchased',
    });
  });

  it('puts entitlements ahead of every pacing rule', () => {
    const decision = evaluateInterstitial(
      input({ noAds: true, activeMs: 0, completedCasesTotal: 0 }),
    );
    expect(decision.reason).toBe('no_ads_purchased');
  });
});

describe('evaluateInterstitial — first ad', () => {
  it('waits for the lifetime completed-cases floor', () => {
    expect(evaluateInterstitial(input({ completedCasesTotal: 1 }))).toEqual({
      show: false,
      reason: 'too_few_cases_total',
    });
  });

  it('waits for the warm-up window even with cases done', () => {
    expect(evaluateInterstitial(input({ activeMs: 6 * MIN }))).toEqual({
      show: false,
      reason: 'warmup',
    });
  });

  it('shows exactly at the warm-up boundary', () => {
    expect(evaluateInterstitial(input({ activeMs: 7 * MIN, completedCasesTotal: 2 }))).toEqual({
      show: true,
      reason: 'eligible',
    });
  });

  it('does not require cases-since-last-ad before the first ad of a session', () => {
    // Returning player: nothing shown yet this session, only one case finished.
    expect(evaluateInterstitial(input({ casesSinceLastAd: 1 })).show).toBe(true);
  });
});

describe('evaluateInterstitial — repeat ads', () => {
  it('holds the time cooldown from the last shown ad', () => {
    const decision = evaluateInterstitial(
      input({ lastShownActiveMs: 10 * MIN, activeMs: 15 * MIN, casesSinceLastAd: 4 }),
    );
    expect(decision).toEqual({ show: false, reason: 'cooldown' });
  });

  it('holds the two-cases rule even after the cooldown elapsed', () => {
    const decision = evaluateInterstitial(
      input({ lastShownActiveMs: 10 * MIN, activeMs: 30 * MIN, casesSinceLastAd: 1 }),
    );
    expect(decision).toEqual({ show: false, reason: 'too_few_cases_since_ad' });
  });

  it('shows once both the cooldown and the case gap are satisfied', () => {
    const decision = evaluateInterstitial(
      input({ lastShownActiveMs: 10 * MIN, activeMs: 16 * MIN, casesSinceLastAd: 2 }),
    );
    expect(decision).toEqual({ show: true, reason: 'eligible' });
  });
});
