/**
 * Remote configuration — the live, console-tunable half of `GAME_CONFIG`.
 *
 * Ad pacing must be adjustable without a rebuild, so the four interstitial
 * timings are published as Yandex flags (Game Console → Remote configuration).
 * Everything here is best-effort: until the async fetch lands — and forever on
 * a portal without flags — `getAdPolicyConfig()` returns the local defaults
 * from `GAME_CONFIG.advertising`.
 *
 * Flag values arrive as strings and are attacker/typo-proofed: anything that is
 * not a finite number in range falls back to its local default, never `NaN`.
 * Flags are **never** persisted — they are cached in module state for the page
 * session only, exactly like the Metrica aggregates.
 */
import { GAME_CONFIG } from '../config/gameConfig';
import type { AdPolicyConfig } from '../engine/adPolicyEngine';
import { getRemoteFlags } from './platformAdapter';

/**
 * Flag keys as created in the Yandex console. Durations are expressed in
 * **seconds** so the console values stay human-editable.
 */
export const AD_FLAG = {
  firstMinCompletedCases: 'ad_first_min_cases',
  firstMinActiveSec: 'ad_first_min_active_sec',
  repeatMinActiveSec: 'ad_repeat_min_active_sec',
  minCasesBetween: 'ad_min_cases_between',
} as const;

/** Sanity rails: a bad remote value must never lock ads on or off forever. */
const MAX_CASES = 20;
const MAX_ACTIVE_MS = 60 * 60 * 1000;

function localDefaults(): AdPolicyConfig {
  const { advertising } = GAME_CONFIG;
  return {
    firstMinCompletedCases: advertising.firstMinCompletedCases,
    firstMinActiveMs: advertising.firstMinActiveMs,
    repeatMinActiveMs: advertising.repeatMinActiveMs,
    minCasesBetweenInterstitials: advertising.minCasesBetweenInterstitials,
  };
}

let adPolicy: AdPolicyConfig = localDefaults();

/** `Number('')` is 0, so an empty flag must be treated as absent, not as zero. */
function toNumber(raw: string | undefined): number | null {
  const text = raw?.trim();
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function clampNumber(raw: string | undefined, fallback: number, max: number): number {
  const value = toNumber(raw);
  return value === null ? fallback : Math.min(value, max);
}

function clampSeconds(raw: string | undefined, fallbackMs: number): number {
  const seconds = toNumber(raw);
  return seconds === null ? fallbackMs : Math.min(Math.round(seconds * 1000), MAX_ACTIVE_MS);
}

/** Exported for tests: pure flags → policy mapping. */
export function parseAdPolicyFlags(flags: Record<string, string>): AdPolicyConfig {
  const defaults = localDefaults();
  return {
    firstMinCompletedCases: clampNumber(
      flags[AD_FLAG.firstMinCompletedCases], defaults.firstMinCompletedCases, MAX_CASES,
    ),
    firstMinActiveMs: clampSeconds(flags[AD_FLAG.firstMinActiveSec], defaults.firstMinActiveMs),
    repeatMinActiveMs: clampSeconds(flags[AD_FLAG.repeatMinActiveSec], defaults.repeatMinActiveMs),
    minCasesBetweenInterstitials: clampNumber(
      flags[AD_FLAG.minCasesBetween], defaults.minCasesBetweenInterstitials, MAX_CASES,
    ),
  };
}

/** Local defaults published to the portal so the console shows real values. */
function defaultFlagPayload(): Record<string, string> {
  const defaults = localDefaults();
  return {
    [AD_FLAG.firstMinCompletedCases]: String(defaults.firstMinCompletedCases),
    [AD_FLAG.firstMinActiveSec]: String(Math.round(defaults.firstMinActiveMs / 1000)),
    [AD_FLAG.repeatMinActiveSec]: String(Math.round(defaults.repeatMinActiveMs / 1000)),
    [AD_FLAG.minCasesBetween]: String(defaults.minCasesBetweenInterstitials),
  };
}

/**
 * Fire-and-forget fetch from the boot path. Never throws and never blocks the
 * game: callers keep reading `getAdPolicyConfig()` through the whole session.
 */
export async function initRemoteConfig(): Promise<void> {
  const flags = await getRemoteFlags(defaultFlagPayload());
  adPolicy = parseAdPolicyFlags(flags);
}

/** Live ad pacing — remote values when they landed, local defaults until then. */
export function getAdPolicyConfig(): AdPolicyConfig {
  return adPolicy;
}

/** Test-only reset back to the local defaults. */
export function resetRemoteConfig(): void {
  adPolicy = localDefaults();
}
