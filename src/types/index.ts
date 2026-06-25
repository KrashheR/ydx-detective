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
export type MasteryLevel = 'none' | 'bronze' | 'silver' | 'gold';
export type DepartmentId = 'archive' | 'field' | 'lab';
export type InvestigationService = 'archive_check' | 'extra_clearance' | 'expert_opinion';
export type EvidenceRelation = 'supports' | 'contradicts' | 'context';

export interface ClaimThesis {
  readonly id: string;
  readonly text: LocalizedString;
}
export type WeeklyTaskId = 'correct_3' | 'perfect_2' | 'no_hints_2' | 'efficient_1' | 'variety_3';

export interface WeeklyProgress {
  serverWeek: number;
  countedCaseIds: string[];
  correctCount: number;
  perfectCount: number;
  noHintsCount: number;
  efficientCount: number;
  difficulties: Difficulty[];
  completedTaskIds: WeeklyTaskId[];
  rewardClaimed: boolean;
}

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
  company?: LocalizedString;
  department?: LocalizedString;
  requestId?: LocalizedString;
  gpsFooter?: LocalizedString;
  // photo renderer
  filename?: string;
  imageUrl?: string;
  // camera_recording renderer
  cameraId?: string;
  cameraModel?: string;
  // document renderer
  docHeader?: LocalizedString;
  docFooter?: LocalizedString;
  // usage_log renderer
  logPrompt?: string;
  // xray renderer
  clinicName?: LocalizedString;
  // bank_statement renderer
  bankName?: LocalizedString;
  accountMask?: string;
  // phone_records renderer
  carrierName?: LocalizedString;
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
  readonly thesisId?: string;
  readonly relation?: EvidenceRelation;
}

export interface Claim {
  readonly person: LocalizedString;
  readonly story: LocalizedString;
}

/** One row in the client metadata table shown on the statement card. */
export interface ClientMetaRow {
  readonly k: LocalizedString;
  readonly v: LocalizedString;
}

/** Extended client identity block shown in the statement header. */
export interface ClientInfo {
  /** Role subtitle, e.g. "Заявитель · физ. лицо". */
  readonly role: LocalizedString;
  /** Key-value rows rendered as a grid under the client name. */
  readonly meta: ReadonlyArray<ClientMetaRow>;
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
  /** New client identity block — role subtitle + metadata table. */
  readonly client?: ClientInfo;
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
  readonly claimTheses?: readonly ClaimThesis[];
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
  /** Best mastery ever achieved; replays may improve this without rewards. */
  readonly mastery: MasteryLevel;
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
  lastDailyCaseId: string | null;
  dailyAdUnlockServerDay: number | null;
  dailyAdCaseId: string | null;
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
  /** Consecutive first-time cases closed with 100% proof accuracy (silver+). */
  perfectCaseStreakCount: number;
  /** Ids of one-time achievements the player has unlocked. */
  unlockedAchievementIds: string[];
  /**
   * How many times the player has dismissed the rating prompt ("Not now").
   * At GAME_CONFIG.rating.suppressAfterDismissals the prompt is suppressed forever.
   * "Don't ask again" sets this directly to the suppress threshold.
   */
  ratingDismissals: number;
  /** Purchased department levels, 0..3. */
  departmentLevels: Record<DepartmentId, number>;
  /** Last server-day when each level-3 free service was consumed. */
  serviceFreeUseServerDay: Partial<Record<InvestigationService, number>>;
  weeklyProgress: WeeklyProgress | null;
  collectibleStampIds: string[];
  /** Archive packs permanently unlocked via Yandex IAP. */
  archivePurchasedPackIds: string[];
  /** Individual archive cases permanently unlocked via rewarded ads. */
  archiveUnlockedCaseIds: string[];
  /** Last server-day when this archive pack granted its rewarded unlock. */
  archiveAdUnlockServerDayByPack: Record<string, number>;
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
  /** One pre-investigation service; immutable once evidence has been opened. */
  selectedService: InvestigationService | null;
  /** Number of paid/ad hints used, required for gold mastery. */
  hintsUsed: number;
  canvassUsed: boolean;
  /** Extra budget openings granted by Additional Clearance. */
  extraOpens: number;
  evidenceThesisLinks: Record<string, string>;
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
  /** How many cards were wrongly stamped — the cause of `penalty`, for display. */
  readonly falseStamps: number;
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
