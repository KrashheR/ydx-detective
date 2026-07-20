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
export type EvidenceRelation =
  | 'supports'
  | 'contradicts'
  | 'contextualizes'
  | 'reveals_season_clue';
export type EvidenceTier = 'core' | 'supporting' | 'bonus' | 'arc';

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
  | 'social_media'
  | 'document_scan'
  | 'thermal_scan'
  | 'shadow_time_check'
  | 'seal_match'
  | 'surface_reveal';

export interface StatementLink {
  readonly statementId: string;
  readonly relation: EvidenceRelation;
  readonly reason: LocalizedString;
}

export interface ClaimStatement {
  readonly id: string;
  readonly text: LocalizedString;
  readonly stampable: boolean;
}

export interface InteractiveEvidenceHints {
  readonly showReset: boolean;
  readonly allowZoom: boolean;
  readonly highlightAfterHint: boolean;
  readonly transparencyMode?: boolean;
}

export interface InteractiveEvidenceDesign {
  readonly why: LocalizedString;
  readonly playerAction: LocalizedString;
  readonly conclusion: LocalizedString;
}

export type ScanMode = 'normal' | 'uv' | 'backlight' | 'contrast' | 'side_light';

export interface DocumentScanData {
  readonly initialMode: ScanMode;
  readonly modes: readonly ScanMode[];
  readonly anomalyZones: ReadonlyArray<{
    readonly id: string;
    readonly mode: ScanMode;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly label: string;
    readonly labelEn?: string;
    readonly isContradiction: boolean;
  }>;
  readonly referenceFields?: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly labelEn?: string;
    readonly value: string;
  }>;
  readonly successCondition:
    | { readonly type: 'select_zone'; readonly zoneId: string }
    | {
        readonly type: 'select_then_compare';
        readonly zoneId: string;
        readonly referenceFieldId: string;
      };
}

export interface ThermalScanData {
  readonly ambientTemperature: number;
  readonly observationTime: string;
  readonly claimedLastUseBefore: string;
  readonly elapsedSinceClaimedUseMinutes: number;
  readonly coolingReference: string;
  readonly coolingReferenceEn?: string;
  readonly initialMode: 'normal' | 'thermal';
  readonly heatZones: ReadonlyArray<{
    readonly id: string;
    readonly shape: 'circle' | 'ellipse' | 'polygon';
    readonly x?: number;
    readonly y?: number;
    readonly width?: number;
    readonly height?: number;
    readonly points?: ReadonlyArray<
      { readonly x: number; readonly y: number } | readonly [number, number]
    >;
    readonly temperature: number;
    readonly intensity: number;
    readonly label: string;
    readonly labelEn?: string;
    readonly isContradiction?: boolean;
    readonly isTarget?: boolean;
  }>;
  readonly successCondition: {
    readonly type: 'select_any' | 'select_all';
    readonly zoneIds: readonly string[];
  };
}

export interface ShadowTimeCheckData {
  readonly claimedTime: string;
  readonly orientationSource: string;
  readonly orientationSourceEn?: string;
  readonly slider: { readonly from: string; readonly to: string; readonly stepMinutes: number };
  readonly shadowOrigin: { readonly x: number; readonly y: number };
  readonly referenceShadow: {
    readonly baseAngle: number;
    readonly baseLength: number;
    readonly width: number;
    readonly opacity: number;
  };
  readonly timeSamples: ReadonlyArray<{
    readonly time: string;
    readonly angle: number;
    readonly length: number;
  }>;
  readonly validTimeRanges: ReadonlyArray<{ readonly from: string; readonly to: string }>;
  readonly matchTolerance: { readonly angle: number; readonly length: number };
}

export interface SealMatchData {
  readonly movableFragment: 'A' | 'B';
  readonly allowRotation: boolean;
  readonly rotationStep: number;
  readonly initialTransform: { readonly x: number; readonly y: number; readonly rotation: number };
  readonly targetTransform: { readonly x: number; readonly y: number; readonly rotation: number };
  readonly tolerance: { readonly position: number; readonly rotation: number };
  readonly expectedMatch: boolean;
  readonly sourceSeed: number;
  readonly fragmentASeed: number;
  readonly fragmentBSeed: number;
  readonly comparisonMarkers: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly labelEn?: string;
  }>;
}

export interface SurfaceRevealData {
  readonly mode: 'erase' | 'apply' | 'light_reveal';
  readonly coverType: 'dust' | 'condensation' | 'dirt' | 'soot' | 'frost' | 'sand' | 'powder' | 'custom';
  readonly brush: {
    readonly radius: number;
    readonly hardness: number;
    readonly opacity: number;
    readonly spacing?: number;
  };
  readonly completion: {
    readonly type: 'reveal_percentage' | 'discover_any' | 'discover_all';
    readonly requiredRevealPercent?: number;
    readonly requiredTraceIds?: readonly string[];
  };
  readonly traces: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly labelEn?: string;
    readonly mask?: string;
    readonly shape: 'mask';
    readonly requiredRevealPercent: number;
    readonly isContradiction: boolean;
    readonly conclusion: string;
    readonly conclusionEn?: string;
  }>;
}

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
  /** Exact claim statement and evidentiary relation established by this card. */
  readonly statementLink?: StatementLink;
  readonly contradictionTarget?: { readonly statementId: string; readonly reason: LocalizedString } | null;
  readonly evidenceTier?: EvidenceTier;
  readonly unlocksAfterEvidenceIds?: readonly string[];
  readonly revealsEvidenceIds?: readonly string[];
  readonly requiredForVerdict?: boolean;
  readonly rewardWeight?: number;
  readonly order?: number;
  readonly narrativeRole?: string;
  readonly description?: LocalizedString;
  readonly instruction?: LocalizedString;
  readonly assets?: Record<string, string | readonly string[]>;
  readonly uiHints?: InteractiveEvidenceHints;
  readonly interactiveDesign?: InteractiveEvidenceDesign;
  readonly previousType?: string;
}

export interface DocumentScanEvidence extends Evidence { readonly type: 'document_scan'; readonly data: DocumentScanData }
export interface ThermalScanEvidence extends Evidence { readonly type: 'thermal_scan'; readonly data: ThermalScanData }
export interface ShadowTimeCheckEvidence extends Evidence { readonly type: 'shadow_time_check'; readonly data: ShadowTimeCheckData }
export interface SealMatchEvidence extends Evidence { readonly type: 'seal_match'; readonly data: SealMatchData }
export interface SurfaceRevealEvidence extends Evidence { readonly type: 'surface_reveal'; readonly data: SurfaceRevealData }
export type InteractiveEvidence =
  | DocumentScanEvidence
  | ThermalScanEvidence
  | ShadowTimeCheckEvidence
  | SealMatchEvidence
  | SurfaceRevealEvidence;

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
  readonly campaignOrder?: number;
  readonly requiredLevel?: number;
  readonly act?: number;
  readonly actTitle?: LocalizedString;
  readonly claimStatements?: readonly ClaimStatement[];
  readonly contentVersion?: string;
  readonly schemaVersion?: number;
  readonly revisionVersion?: string;
  readonly narrative?: {
    readonly preBrief: LocalizedString;
    readonly postVerdictNote: LocalizedString;
    readonly nextCaseTeaser: LocalizedString;
    readonly seasonClue: null | {
      readonly id: string;
      readonly label: LocalizedString;
      readonly description: LocalizedString;
      readonly progressIndex: number;
      readonly progressTotal: number;
    };
    readonly epilogue: LocalizedContent | null;
  };
  readonly onboarding?: {
    readonly phase: string;
    readonly targetDurationSeconds: number;
    readonly teaches: readonly string[];
    readonly successEmotion: LocalizedString;
    readonly menuUnlockAfterVerdict: boolean;
    readonly unlocks?: readonly string[];
  };
  readonly finalSynthesis?: FinalSynthesis;
}

export interface FinalSynthesis {
  readonly id: string;
  readonly title: LocalizedString;
  readonly instruction: LocalizedString;
  readonly unlockAfter: 'correct_verdict';
  readonly nodes: ReadonlyArray<{
    readonly id: string;
    readonly label: LocalizedString;
    readonly evidenceIds: readonly string[];
  }>;
  readonly requiredLinks: ReadonlyArray<readonly [string, string]>;
  readonly evidenceUnlockIds: readonly string[];
  readonly arcEvidenceAccess: 'post_verdict_free';
  readonly successConclusion: LocalizedString;
  readonly skippableAfterAttempts: number;
  readonly analyticsEvent: string;
}

/**
 * Lightweight case preview shipped in the entry bundle. Carries only what the
 * desk shelf / menus render (folder cover, client row, document count); the
 * full `Case` — evidences, claim story, solution — lives in a lazy per-case
 * chunk loaded on demand via `loadCaseById()`. Built at bundle time by the
 * `case-summaries` Vite plugin from the same JSON files (see vite.config.ts),
 * so it can never drift from the case content.
 */
export interface CaseSummary {
  readonly id: string;
  readonly type: CaseType;
  readonly difficulty: Difficulty;
  readonly claimAmount: number;
  readonly title: LocalizedString;
  readonly claim: { readonly person: LocalizedString };
  readonly coverImage: string;
  readonly personImage?: string;
  /** `evidences.length` of the full case — shown as the document count. */
  readonly evidenceCount: number;
  readonly investigationBudget?: number;
  readonly campaignOrder?: number;
  readonly requiredLevel?: number;
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
  /**
   * Informational marker: balance last landed at <= 0. Never blocks play (the
   * hard bankruptcy gate was removed in saveVersion 8) — kept for analytics
   * (`bankruptcy` goal, userParams) and save-compat.
   */
  isBankrupt: boolean;
  /**
   * Cumulative count of fullscreen interstitials the player has ever seen.
   * Persisted so ad-pressure is measurable across sessions (Metrica).
   */
  interstitialsSeenTotal: number;
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
  /** Interactive examination progress, keyed by `${caseId}/${evidenceId}`. */
  interactiveEvidenceProgress: Record<string, InteractiveEvidenceProgress>;
  /** Post-verdict synthesis progress, keyed by stable case id. */
  finalSynthesisProgress: Record<string, FinalSynthesisProgress>;
  /** Fresh-player prologue gate; old profiles are migrated to unlocked. */
  metaUnlocked: boolean;
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
  /** Exact statement/evidence pairs; selectedEvidenceIds remains for save compatibility. */
  stamps: EvidenceStamp[];
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
  /** Extra budget openings granted by Additional Clearance. */
  extraOpens: number;
  /** Server-time (ms) the investigation began — drives daily timers. */
  readonly startedAtServerMs: number;
}

export interface EvidenceStamp {
  readonly caseId: string;
  readonly statementId: string;
  readonly evidenceId: string;
}

export interface InteractiveEvidenceProgress {
  readonly evidenceId: string;
  opened: boolean;
  analysisCompleted: boolean;
  discoveredAnomalyIds: string[];
  discoveredTraceIds: string[];
  revealPercentByTrace: Record<string, number>;
  selectedContradiction: boolean;
  hintLevel: number;
  attempts: number;
  resetCount: number;
}

export interface FinalSynthesisProgress {
  completed: boolean;
  skipped: boolean;
  attempts: number;
  links: Array<readonly [string, string]>;
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
