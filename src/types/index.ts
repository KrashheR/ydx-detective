/**
 * Где ложь? Симулятор детектива — Core domain types.
 *
 * These types describe two strictly separated concerns:
 *
 *  1. STATIC CASE DATA  — immutable content authored as JSON files and validated
 *     at load time by Zod (see `src/data/caseSchema.ts`). Nothing here is ever
 *     mutated at runtime. Adding a case or a language = editing JSON only.
 *
 *  2. RUNTIME PLAYER STATE — mutable, persisted to the cloud (Yandex) or
 *     LocalStorage. Lives entirely inside the Zustand store.
 *
 * Keep this boundary sacred: never store a `Case` object inside `PlayerStats`,
 * and never store player progress inside a `Case`. The persistence layer only
 * ever serializes the runtime slice.
 */

/* -------------------------------------------------------------------------- */
/*  Localization                                                              */
/* -------------------------------------------------------------------------- */

/** ISO-ish language codes supported by the game. Order is not significant. */
export const SUPPORTED_LANGUAGES = ['ru', 'en', 'tr', 'ar', 'kk'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'ru';

/**
 * A scalar string translated into every supported language.
 * Using a mapped type guarantees that a missing language is a *compile* error
 * for hand-written content and a *runtime* (Zod) error for imported JSON.
 */
export type LocalizedString = Record<Language, string>;

/**
 * Evidence bodies may be a single paragraph or an ordered list of lines
 * (e.g. a GPS track or a chat log), per language.
 */
export type LocalizedContent = Record<Language, string | string[]>;

/** Explanations are always presented as bullet lines. */
export type LocalizedLines = Record<Language, string[]>;

/* -------------------------------------------------------------------------- */
/*  Static case data                                                         */
/* -------------------------------------------------------------------------- */

export type CaseType = 'standard' | 'daily';
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Ground truth of the claim — used for analytics / authoring, not scoring. */
export type Truth = 'valid' | 'fraud';

/** What the player is asked to decide. */
export type Decision = 'approve' | 'reject';

export type EvidenceType =
  | 'photo'
  | 'gps'
  | 'document'
  | 'witness_statement'
  | 'camera_recording'
  | 'usage_log'
  | 'xray'
  | 'bank_statement'
  | 'phone_records'
  | 'social_media';

/**
 * Per-evidence renderer metadata. All fields are optional; renderers fall back
 * to built-in defaults so existing cases without `meta` continue to work.
 */
export interface EvidenceMeta {
  // gps renderer
  company?: string;
  department?: string;
  requestId?: string;
  gpsFooter?: string;
  // photo renderer
  filename?: string;
  // camera_recording renderer
  cameraId?: string;
  cameraModel?: string;
  // document renderer
  docHeader?: string;
  docFooter?: string;
  // usage_log renderer
  logPrompt?: string;
  // xray renderer
  clinicName?: string;
  // bank_statement renderer
  bankName?: string;
  accountMask?: string;
  // phone_records renderer
  carrierName?: string;
  phoneMask?: string;
  // social_media renderer
  socialPlatform?: string;
}

export interface Evidence {
  readonly id: string;
  readonly type: EvidenceType;
  readonly title: LocalizedString;
  readonly content: LocalizedContent;
  /** Authoritative flag: is this card *actually* a contradiction? */
  readonly isContradiction: boolean;
  /** Shown post-verdict to teach the player why it was (not) a contradiction. */
  readonly contradictionExplanation: LocalizedString;
  /** Per-renderer display metadata — makes each evidence visually unique. */
  readonly meta?: EvidenceMeta;
}

export interface Claim {
  readonly person: LocalizedString;
  readonly story: LocalizedString;
}

export interface Case {
  readonly id: string;
  readonly type: CaseType;
  readonly difficulty: Difficulty;
  readonly claimAmount: number;
  readonly truth: Truth;
  readonly title: LocalizedString;
  readonly claim: Claim;
  /** Folder cover art (path under `public/`). */
  readonly coverImage: string;
  /** Optional client photo-ID portrait (path under `public/`). */
  readonly personImage?: string;
  readonly evidences: readonly Evidence[];
  readonly correctDecision: Decision;
  readonly explanation: LocalizedLines;
  /**
   * Maximum number of evidence cards the player may *open* before they must
   * render a verdict — the "investigation budget". When set, information becomes
   * a scarce resource: the player chooses which cards to inspect and decides
   * under uncertainty (and may earn an efficiency bonus for deciding early).
   * Omitted ⇒ unlimited opens and the classic "review everything" gate.
   */
  readonly investigationBudget?: number;
}

/* -------------------------------------------------------------------------- */
/*  Runtime player state                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Everything below is persisted. Bump `SCHEMA_VERSION` (see persistence layer)
 * whenever the shape changes so old cloud saves can be migrated.
 */

/** A finished case and how the player performed on it. */
export interface CaseResult {
  readonly caseId: string;
  readonly decision: Decision;
  readonly verdictCorrect: boolean;
  readonly correctlyMarkedContradictions: number;
  readonly totalContradictions: number;
  readonly falseStamps: number;
  readonly rewardEarned: number;
  /** Yandex *server* time (ms) at closure — never device time. */
  readonly closedAtServerMs: number;
}

/** Persisted progression / economy for a single player. */
export interface PlayerStats {
  balance: number;
  language: Language;
  /** Case ids the player has fully completed (for unlock gates / streaks). */
  completedCaseIds: string[];
  /** Map of caseId -> result, for "case file" history screens. */
  results: Record<string, CaseResult>;
  /**
   * Server-time (ms) of the last claimed daily case, used by the daily
   * evaluator to decide whether today's daily is available again.
   */
  lastDailyClaimServerMs: number | null;
  /** True once balance hit <= 0 and the player must watch a rewarded ad. */
  isBankrupt: boolean;
  /**
   * Career experience. Permanent (never spent) — drives the investigator rank
   * ladder. Distinct from `balance`, which is the spendable currency.
   */
  xp: number;
  /** Consecutive *server*-days the player has closed at least one case. */
  streakCount: number;
  /** Server-day index of the last closed case — used by the streak evaluator. */
  lastPlayedServerDay: number | null;
  /** Ids of one-time achievements the player has unlocked. */
  unlockedAchievementIds: string[];
  /**
   * How many times the player has dismissed the rating prompt ("Not now").
   * At GAME_CONFIG.rating.suppressAfterDismissals the prompt is suppressed forever.
   * "Don't ask again" sets this directly to the suppress threshold.
   */
  ratingDismissals: number;
}

/**
 * The active, in-progress investigation. Persisted alongside `PlayerStats` so
 * that quitting mid-case restores the player exactly where they left off.
 * `null` when no case is open (e.g. on the case-select screen).
 */
export interface ActiveSession {
  readonly caseId: string;
  /** Evidence cards stamped by the player as contradictions. */
  selectedEvidenceIds: string[];
  /** Evidence cards the player has opened/read at least once. */
  viewedEvidenceIds: string[];
  /**
   * Evidence cards whose true contradiction status was revealed by a hint
   * (paid Inspector Note or ad-funded Witness Canvass). Persisted so a mid-case
   * quit/resume keeps the reveal.
   */
  revealedEvidenceIds: string[];
  /** Server-time (ms) the investigation began — drives daily timers. */
  readonly startedAtServerMs: number;
}

/* -------------------------------------------------------------------------- */
/*  Reward engine result (transient, returned by submitVerdict)              */
/* -------------------------------------------------------------------------- */

export interface RewardBreakdown {
  readonly verdictCorrect: boolean;
  readonly verdictComponent: number;
  readonly proofComponent: number;
  /**
   * Reward for deciding correctly with investigation budget unspent. Always 0
   * for un-budgeted cases or a wrong verdict. (See `Case.investigationBudget`.)
   */
  readonly efficiencyComponent: number;
  readonly penalty: number;
  readonly dailyMultiplierApplied: number;
  /** Extra reward from rank + streak bonuses applied to the positive base. */
  readonly bonusComponent: number;
  /** Total bonus percentage applied (rank + streak), for display. */
  readonly bonusPct: number;
  /** Net delta applied to balance (may be negative). */
  readonly total: number;
}

/* -------------------------------------------------------------------------- */
/*  Persistable runtime snapshot                                             */
/* -------------------------------------------------------------------------- */

/** Exactly what gets written to Yandex cloud / LocalStorage. */
export interface PersistedState {
  readonly version: number;
  readonly stats: PlayerStats;
  readonly session: ActiveSession | null;
}
