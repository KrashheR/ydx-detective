/**
 * Forced-ad (interstitial) pacing — pure decision logic, no SDK, no store.
 *
 * The only placements are "verdict submitted → next case" and "leaving a
 * finished case for the desk"; this engine answers whether that moment may
 * carry an interstitial. Rules:
 *   • entitlements first — a No Ads purchase, or an archive pack the player
 *     bought, never shows a forced ad;
 *   • the first ad of a session needs a lifetime floor of completed cases *and*
 *     a warm-up of active play time;
 *   • every later ad needs both a time cooldown and a minimum number of
 *     finished cases since the previous one.
 *
 * All timings are measured in **active** play time (see
 * `getAnalyticsActiveTotalMs`), and the cooldown clock starts from an ad that
 * was actually *shown* — never from one that was merely requested, so a
 * missing SDK or an ad error costs the player nothing.
 *
 * Tuning defaults live in `GAME_CONFIG.advertising`; live values come from
 * `getAdPolicyConfig()` (remote configuration).
 */

export interface AdPolicyConfig {
  firstMinCompletedCases: number;
  firstMinActiveMs: number;
  repeatMinActiveMs: number;
  minCasesBetweenInterstitials: number;
}

export interface InterstitialInput {
  /** Lifetime distinct completed cases (`stats.completedCaseIds.length`). */
  completedCasesTotal: number;
  /** Active play time so far in this session (ms). */
  activeMs: number;
  /** Active-time stamp of the last *shown* ad; null when none was shown yet. */
  lastShownActiveMs: number | null;
  /** Cases finished since the last shown ad (or since the session started). */
  casesSinceLastAd: number;
  /** Player owns the permanent No Ads product. */
  noAds: boolean;
  /** The finished case belongs to an archive pack the player purchased. */
  archiveAdFree: boolean;
  config: AdPolicyConfig;
}

export type InterstitialReason =
  | 'eligible'
  | 'no_ads_purchased'
  | 'archive_purchased'
  | 'too_few_cases_total'
  | 'warmup'
  | 'cooldown'
  | 'too_few_cases_since_ad';

export interface InterstitialDecision {
  show: boolean;
  reason: InterstitialReason;
}

export function evaluateInterstitial(input: InterstitialInput): InterstitialDecision {
  const { config } = input;

  if (input.noAds) return { show: false, reason: 'no_ads_purchased' };
  if (input.archiveAdFree) return { show: false, reason: 'archive_purchased' };
  if (input.completedCasesTotal < config.firstMinCompletedCases) {
    return { show: false, reason: 'too_few_cases_total' };
  }

  // First ad of the session: gated by warm-up time only. The per-two-cases rule
  // measures the gap *between* ads, so it cannot apply before the first one —
  // otherwise a returning player would owe two fresh cases every session.
  if (input.lastShownActiveMs === null) {
    return input.activeMs >= config.firstMinActiveMs
      ? { show: true, reason: 'eligible' }
      : { show: false, reason: 'warmup' };
  }

  if (input.activeMs - input.lastShownActiveMs < config.repeatMinActiveMs) {
    return { show: false, reason: 'cooldown' };
  }
  if (input.casesSinceLastAd < config.minCasesBetweenInterstitials) {
    return { show: false, reason: 'too_few_cases_since_ad' };
  }
  return { show: true, reason: 'eligible' };
}
