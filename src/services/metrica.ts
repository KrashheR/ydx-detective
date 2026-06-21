/**
 * Yandex Metrica boundary.
 *
 * The engine NEVER touches `window.ym` directly. Everything funnels through
 * this adapter — the analytics twin of `yandexSDK.ts` — so that:
 *   • the store stays unit-testable (the counter is a spy / no-op in tests);
 *   • a missing / unloaded counter degrades to a silent no-op (local dev,
 *     non-Yandex host, blocked script) and never blocks gameplay;
 *   • the goal/param vocabulary lives in one place, in lockstep with
 *     docs/06-yandex-platform.md.
 *
 * Counter surface used:
 *   ym(id, 'init', opts)               → bring up the counter
 *   ym(id, 'reachGoal', name, params)  → per-event funnel goals
 *   ym(id, 'userParams', params)       → per-player profile (level/balance/…)
 *
 * The counter ID is single-sourced in GAME_CONFIG.analytics — index.html only
 * defines the `window.ym` loader; the `init` call happens here.
 */
import { GAME_CONFIG } from '../config/gameConfig';

/* ----------------------------- Minimal typings --------------------------- */
// The real Metrica `ym` accepts many overloads; we type only what we call.
type YmFn = (
  counterId: number,
  method: string,
  ...args: unknown[]
) => void;

declare global {
  interface Window {
    ym?: YmFn;
  }
}

/* ------------------------------- Goal catalog ---------------------------- */

/**
 * Canonical Metrica goal names (`reachGoal` targets). Single source of truth —
 * keep aligned with the goal table in docs/06-yandex-platform.md. Stable string
 * values: renaming one orphans its history in the Metrica console.
 */
export const GOAL = {
  caseStart: 'case_start',
  evidenceView: 'evidence_view',
  evidenceStamp: 'evidence_stamp',
  hintBuy: 'hint_buy',
  verdictSubmit: 'verdict_submit',
  rewardDouble: 'reward_double',
  fundsRestore: 'funds_restore',
  achievement: 'achievement_unlock',
  rankUp: 'rank_up',
  bankruptcy: 'bankruptcy',
  dailyClaim: 'daily_claim',
  rating: 'rating_action',
} as const;

export type GoalName = (typeof GOAL)[keyof typeof GOAL];

/* --------------------------------- State --------------------------------- */

/** Set once init runs; false keeps every track call a silent no-op. */
let enabled = false;
let initialized = false;

/** Safe access to the counter; null when the loader script never defined it. */
function ym(): YmFn | null {
  return typeof window !== 'undefined' && typeof window.ym === 'function'
    ? window.ym
    : null;
}

/* ------------------------------- Lifecycle ------------------------------- */

/**
 * Initialize the Metrica counter. Safe to call repeatedly (idempotent). A falsy
 * `counterId` or a missing `window.ym` flips the adapter to silent no-op mode —
 * tracking calls simply do nothing, exactly like the SDK's offline fallback.
 */
export function initMetrica(): void {
  if (initialized) return;
  initialized = true;

  const { counterId, webvisor } = GAME_CONFIG.analytics;
  const counter = ym();
  if (!counterId || !counter) {
    enabled = false;
    return;
  }

  try {
    counter(counterId, 'init', {
      webvisor,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
    });
    enabled = true;
  } catch {
    enabled = false;
  }
}

/* ------------------------------- Tracking -------------------------------- */

/**
 * Fire a Metrica goal with optional parameters. No-op when tracking is disabled
 * or the counter never loaded. Never throws — analytics must not break play.
 */
export function trackGoal(
  name: GoalName,
  params?: Record<string, unknown>,
): void {
  const counter = ym();
  if (!enabled || !counter) return;
  try {
    counter(GAME_CONFIG.analytics.counterId, 'reachGoal', name, params);
  } catch {
    /* swallow — analytics is best-effort */
  }
}

/**
 * Update the per-player profile (visit/user params: level, balance, xp, …) so
 * each player's standing is visible in the Metrica console. No-op when disabled.
 */
export function setUserParams(params: Record<string, unknown>): void {
  const counter = ym();
  if (!enabled || !counter) return;
  try {
    counter(GAME_CONFIG.analytics.counterId, 'userParams', params);
  } catch {
    /* swallow — analytics is best-effort */
  }
}
