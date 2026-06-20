/**
 * Centralized game-balance tuning. Pure data — no logic, no React, no Zustand.
 * Designers can adjust the economy here without touching the engine.
 */
export const GAME_CONFIG = {
  /** Schema version of the persisted runtime snapshot. Bump on shape changes. */
  saveVersion: 1,

  reward: {
    /** Share of BaseReward awarded for a correct macro-verdict. */
    verdictShare: 0.5,
    /** Share of BaseReward scaled by contradiction-flagging precision. */
    proofShare: 0.5,
    /** Penalty per evidence card wrongly stamped as a contradiction. */
    falseStampPenalty: 50,
    /** Reward multiplier applied to `type === 'daily'` cases. */
    dailyMultiplier: 5,
  },

  economy: {
    /** Balance at/below which progression is locked. */
    bankruptcyThreshold: 0,
    /** Balance restored when the rewarded "restore funds" ad completes. */
    restoreFundsTo: 2000,
    /** Starting balance for a brand-new player. */
    startingBalance: 2000,
  },

  sync: {
    /** Cloud sync is debounced to at most once per this interval (ms). */
    debounceMs: 10_000,
  },

  daily: {
    /** A daily case resets every N ms of *server* time (24h). */
    cooldownMs: 24 * 60 * 60 * 1000,
  },
} as const;

export type GameConfig = typeof GAME_CONFIG;
