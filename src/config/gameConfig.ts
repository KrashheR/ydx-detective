/**
 * Centralized game-balance tuning. Pure data — no logic, no React, no Zustand.
 * Designers can adjust the economy here without touching the engine.
 */
export const GAME_CONFIG = {
  /** Schema version of the persisted runtime snapshot. Bump on shape changes. */
  saveVersion: 2,

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

  /**
   * Career XP & investigator ranks (meta-progression). XP is permanent and
   * never spent. Rank gives a small additive % bonus on the positive reward.
   */
  progression: {
    /** Base XP weight by case difficulty. */
    xpDifficultyWeight: { easy: 10, medium: 20, hard: 35 } as const,
    /** XP granted for a wrong verdict (small participation award). */
    wrongVerdictXp: 2,
    /** XP multiplier for daily cases. */
    dailyXpMultiplier: 2,
    /**
     * Rank ladder, ascending by `xpThreshold`. `rewardBonusPct` is an additive
     * percentage applied to the positive reward (verdict + proof) of a case.
     * Titles are localized in `src/i18n/ui.ts` keyed by `rank_<id>`.
     */
    ranks: [
      { id: 'trainee', xpThreshold: 0, rewardBonusPct: 0 },
      { id: 'junior', xpThreshold: 50, rewardBonusPct: 2 },
      { id: 'inspector', xpThreshold: 150, rewardBonusPct: 5 },
      { id: 'senior', xpThreshold: 350, rewardBonusPct: 8 },
      { id: 'lead', xpThreshold: 700, rewardBonusPct: 12 },
      { id: 'chief', xpThreshold: 1200, rewardBonusPct: 18 },
    ],
  },

  /** Daily-engagement streak: consecutive server-days with a closed case. */
  streak: {
    /** Reward bonus added per consecutive day. */
    bonusPctPerDay: 5,
    /** Maximum streak bonus (cap). */
    bonusCapPct: 50,
  },

  /**
   * Investigation hints. Both reveal one evidence card's true status; they
   * differ only in how they're unlocked:
   *   • Inspector Note  — paid with `balance` (the primary currency sink).
   *   • Witness Canvass — free, unlocked by watching a rewarded Yandex video.
   */
  hints: {
    /** Inspector Note cost as a fraction of the case's claim amount (20%). */
    inspectorNoteClaimPct: 0.2,
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
