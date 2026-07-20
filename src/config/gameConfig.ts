/**
 * Centralized game-balance tuning. Pure data — no logic, no React, no Zustand.
 * Designers can adjust the economy here without touching the engine.
 */
export const GAME_CONFIG = {
  /** Schema version of the persisted runtime snapshot. Bump on shape changes. */
  saveVersion: 9,

  reward: {
    /** Fixed payout by difficulty; claimAmount remains a narrative stake. */
    baseByDifficulty: { easy: 1200, medium: 2500, hard: 5000 } as const,
    /** Share of BaseReward awarded for a correct macro-verdict. */
    verdictShare: 0.5,
    /** Share of BaseReward scaled by contradiction-flagging precision. */
    proofShare: 0.5,
    /**
     * Reward split for *budgeted* cases (those with `Case.investigationBudget`).
     * Some verdict/proof weight is reallocated to an efficiency component that
     * rewards deciding correctly with budget to spare. The three shares sum to
     * 1.0, so the positive ceiling stays at 100% of BaseReward — un-budgeted
     * cases are unaffected and keep the classic 50/50 split above.
     */
    budgeted: {
      verdictShare: 0.4,
      proofShare: 0.4,
      efficiencyShare: 0.2,
    },
    /** Penalty per evidence card wrongly stamped as a contradiction. */
    falseStampPenalty: 50,
    /** Reward multiplier applied to `type === 'daily'` cases. */
    dailyMultiplier: 2,
  },

  /**
   * Career XP & investigator levels (meta-progression). XP is permanent and
   * never spent. Level gives a small additive % bonus on the positive reward.
   */
  progression: {
    /** Base XP weight by case difficulty. */
    xpDifficultyWeight: { easy: 10, medium: 20, hard: 35 } as const,
    /** XP granted for a wrong verdict (small participation award). */
    wrongVerdictXp: 2,
    /** XP multiplier for daily cases. */
    dailyXpMultiplier: 2,
    /**
     * Level ladder, ascending by `xpThreshold`. `rewardBonusPct` is an additive
     * percentage applied to the positive reward (verdict + proof) of a case.
     */
    ranks: [
      { id: 'level_01', xpThreshold: 0, rewardBonusPct: 0 },
      { id: 'level_02', xpThreshold: 10, rewardBonusPct: 1 },
      { id: 'level_03', xpThreshold: 25, rewardBonusPct: 2 },
      { id: 'level_04', xpThreshold: 45, rewardBonusPct: 3 },
      { id: 'level_05', xpThreshold: 65, rewardBonusPct: 4 },
      { id: 'level_06', xpThreshold: 90, rewardBonusPct: 5 },
      { id: 'level_07', xpThreshold: 115, rewardBonusPct: 6 },
      { id: 'level_08', xpThreshold: 140, rewardBonusPct: 7 },
      { id: 'level_09', xpThreshold: 165, rewardBonusPct: 8 },
      { id: 'level_10', xpThreshold: 190, rewardBonusPct: 9 },
      { id: 'level_11', xpThreshold: 215, rewardBonusPct: 10 },
      { id: 'level_12', xpThreshold: 240, rewardBonusPct: 11 },
      { id: 'level_13', xpThreshold: 265, rewardBonusPct: 12 },
      { id: 'level_14', xpThreshold: 285, rewardBonusPct: 13 },
      { id: 'level_15', xpThreshold: 295, rewardBonusPct: 14 },
      { id: 'level_16', xpThreshold: 360, rewardBonusPct: 15 },
      { id: 'level_17', xpThreshold: 430, rewardBonusPct: 16 },
      { id: 'level_18', xpThreshold: 510, rewardBonusPct: 17 },
      { id: 'level_19', xpThreshold: 600, rewardBonusPct: 18 },
      { id: 'level_20', xpThreshold: 700, rewardBonusPct: 19 },
      { id: 'level_21', xpThreshold: 820, rewardBonusPct: 20 },
      { id: 'level_22', xpThreshold: 960, rewardBonusPct: 21 },
      { id: 'level_23', xpThreshold: 1120, rewardBonusPct: 22 },
      { id: 'level_24', xpThreshold: 1300, rewardBonusPct: 23 },
      { id: 'level_25', xpThreshold: 1500, rewardBonusPct: 24 },
      { id: 'level_26', xpThreshold: 1720, rewardBonusPct: 25 },
      { id: 'level_27', xpThreshold: 1960, rewardBonusPct: 26 },
      { id: 'level_28', xpThreshold: 2220, rewardBonusPct: 27 },
      { id: 'level_29', xpThreshold: 2500, rewardBonusPct: 28 },
      { id: 'level_30', xpThreshold: 2800, rewardBonusPct: 30 },
    ],
  },

  /**
   * Standard-case campaign gates. Availability is derived at render time from
   * immutable case data + PlayerStats, so no case content is persisted.
   */
  caseUnlocks: {
    /** Fallback for newly authored standard cases before designers tune them. */
    defaultRequiredLevel: 30,
    /**
     * Minimum investigator level needed to access each bundled standard case.
     *
     * This map ALSO defines the canonical campaign order: cases are sorted by
     * (requiredLevel, caseNumber) — see `compareCasesByUnlockCriteria`. The
     * required level is therefore a *complexity tier*, not a hard XP wall:
     * levels stay low (max 16, always reachable) so the strict sequence gate is
     * the real lock and a linear player is never blocked by under-leveling.
     *
     * The tiers encode the progressive-difficulty curve (player retention):
     * evidence count is non-decreasing along the campaign order, so each level
     * band introduces harder cases with more evidence to inspect:
     *   L1     → 2-evidence onboarding   (case-001, 009)
     *   L2-3   → 3-evidence basics       (case-013, 018, 019, 020, 021)
     *   L4-11  → 4-evidence standard     (case-003..024)
     *   L12-13 → 5-evidence advanced     (case-025..028)
     *   L14-16 → 6-evidence expert       (case-029..051)
     * New evidence types debut late: bank_statement (case-023, ~pos 22),
     * phone_records (case-024, ~pos 23), social_media (case-025, ~pos 24).
     */
    standardCaseRequiredLevelById: {
      // L1 — 2-evidence onboarding
      'case-001': 1,
      'case-009': 1,
      // L2-3 — 3-evidence basics
      'case-013': 2,
      'case-018': 2,
      'case-019': 3,
      'case-020': 3,
      'case-021': 3,
      // L4-11 — 4-evidence standard
      'case-003': 4,
      'case-004': 4,
      'case-005': 5,
      'case-006': 5,
      'case-007': 6,
      'case-008': 6,
      'case-010': 7,
      'case-011': 7,
      'case-012': 8,
      'case-014': 8,
      'case-015': 9,
      'case-016': 9,
      'case-017': 10,
      'case-022': 10,
      'case-023': 11,
      'case-024': 11,
      // L12-13 — 5-evidence advanced
      'case-025': 12,
      'case-026': 12,
      'case-027': 13,
      'case-028': 13,
      // L14-16 — 6-evidence expert
      'case-029': 14,
      'case-030': 14,
      'case-031': 15,
      'case-032': 15,
      'case-033': 16,
      'case-034': 16,
      'case-035': 16,
      'case-036': 16,
      'case-037': 16,
      'case-038': 16,
      'case-039': 16,
      'case-040': 16,
      'case-041': 16,
      'case-042': 16,
      'case-043': 16,
      'case-044': 16,
      'case-045': 16,
      'case-046': 16,
      'case-047': 16,
      'case-048': 16,
      'case-049': 16,
      'case-050': 16,
      'case-051': 16,
    } as const,
  },

  /** Daily-engagement streak: consecutive server-days with a closed case. */
  streak: {
    /** Reward bonus added per consecutive day. */
    bonusPctPerDay: 5,
    /** Maximum streak bonus (cap). */
    bonusCapPct: 50,
  },

  /** Consecutive first-time cases solved with 100% proof accuracy (silver+). */
  perfectCaseStreak: {
    /** Reward bonus added per consecutive flawless case. */
    bonusPctPerCase: 3,
    /** Maximum flawless-case streak bonus (cap). */
    bonusCapPct: 30,
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

  services: {
    archive_check: { department: 'archive', pricePct: 0.15 },
    extra_clearance: { department: 'field', pricePct: 0.25 },
    expert_opinion: { department: 'lab', pricePct: 0.5 },
    discountAtLevel: 2,
    discountPct: 20,
    freeDailyAtLevel: 3,
  },

  departments: {
    archive: [10_000, 30_000, 60_000],
    field: [15_000, 40_000, 80_000],
    lab: [25_000, 60_000, 120_000],
  },

  weekly: {
    unlockAfterStandardCases: 5,
    reward: 7_500,
    tasksRequired: 3,
    msPerWeek: 7 * 24 * 60 * 60 * 1000,
  },

  economy: {
    /**
     * Balance at/below which the informational `bankruptcy` analytics marker
     * fires. Never blocks play — the game has no hard bankruptcy gate.
     */
    bankruptcyThreshold: 0,
    /** Balance below which the voluntary "restore funds" ad offer is shown. */
    lowBalanceOfferThreshold: 500,
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

  specialArchives: {
    /** One rewarded archive-case unlock per archive pack per server day. */
    adUnlocksPerPackPerDay: 1,
  },

  rating: {
    /** Minimum completed cases before the rating prompt is eligible to appear. */
    minCasesForPrompt: 3,
    /** After this many "Not now" dismissals the prompt is suppressed forever. */
    suppressAfterDismissals: 3,
  },

  advertising: {
    interstitialMinCompletedCases: 3,
    interstitialMinActiveMs: 10 * 60 * 1000,
  },

  analytics: {
    /** Stable release dimensions attached to every goal and user profile. */
    economyVersion: 'legacy-v1',
    contentVersion: 'campaign-50-v3',
    experimentGroup: 'baseline',
    /**
     * Yandex Metrica counter ID. Replace the placeholder with the real counter
     * created in the Metrica console (https://metrika.yandex.ru). A falsy id
     * (0) keeps tracking a silent no-op — safe for local dev and non-Yandex
     * builds where the counter script never loads. `src/services/metrica.ts`
     * owns both the deferred script loader and the `ym(id, 'init', …)` call.
     */
    counterId: 110041851,
    /** Enable Webvisor session recording on init. */
    webvisor: true,
  },
} as const;

export type GameConfig = typeof GAME_CONFIG;
