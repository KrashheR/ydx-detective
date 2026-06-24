/**
 * Shared test fixtures. Factories build *valid* domain objects with sensible
 * defaults so each test only states what it actually cares about (everything
 * else is filled in). Keeping these in one place means a type change surfaces in
 * one file instead of scattered across the suite.
 */
import { SUPPORTED_LANGUAGES } from '../types';
import type {
  Case,
  CaseResult,
  Decision,
  Difficulty,
  Evidence,
  EvidenceType,
  Language,
  PlayerStats,
} from '../types';
import { GAME_CONFIG } from '../config/gameConfig';
import { getAllCases } from '../data/caseLoader';

/** Fill a `LocalizedString` for every supported language with one value. */
export function localized(value: string): Record<Language, string> {
  return Object.fromEntries(
    SUPPORTED_LANGUAGES.map((l) => [l, value]),
  ) as Record<Language, string>;
}

function localizedLines(value: string): Record<Language, string[]> {
  return Object.fromEntries(
    SUPPORTED_LANGUAGES.map((l) => [l, [value]]),
  ) as Record<Language, string[]>;
}

let evSeq = 0;

export interface EvidenceOverrides {
  id?: string;
  type?: EvidenceType;
  isContradiction?: boolean;
}

/** A valid evidence card; `isContradiction` defaults to false. */
export function makeEvidence(overrides: EvidenceOverrides = {}): Evidence {
  evSeq += 1;
  const id = overrides.id ?? `ev-${evSeq}`;
  return {
    id,
    type: overrides.type ?? 'document',
    title: localized(`Evidence ${id}`),
    content: { ...localized(`Body of ${id}`) },
    isContradiction: overrides.isContradiction ?? false,
    contradictionExplanation: localized(`Why ${id}`),
  };
}

export interface CaseOverrides {
  id?: string;
  type?: Case['type'];
  difficulty?: Difficulty;
  claimAmount?: number;
  truth?: Case['truth'];
  correctDecision?: Decision;
  /** Number of evidence cards that are real contradictions. */
  contradictions?: number;
  /** Number of evidence cards that are NOT contradictions. */
  cleanCards?: number;
  /** Provide explicit evidences instead of generating from counts. */
  evidences?: Evidence[];
  /** Optional investigation budget (max evidence opens before verdict). */
  investigationBudget?: number;
}

/**
 * A valid `Case`. By default: one standard easy case with two contradictions
 * and one clean card, correct decision = reject.
 */
export function makeCase(overrides: CaseOverrides = {}): Case {
  const contradictions = overrides.contradictions ?? 2;
  const cleanCards = overrides.cleanCards ?? 1;
  const evidences =
    overrides.evidences ??
    [
      ...Array.from({ length: contradictions }, () =>
        makeEvidence({ isContradiction: true }),
      ),
      ...Array.from({ length: cleanCards }, () =>
        makeEvidence({ isContradiction: false }),
      ),
    ];

  // A case must have at least one evidence card (schema invariant).
  const safeEvidences = evidences.length > 0 ? evidences : [makeEvidence()];

  return {
    id: overrides.id ?? `case-test-${evSeq}`,
    type: overrides.type ?? 'standard',
    difficulty: overrides.difficulty ?? 'easy',
    claimAmount: overrides.claimAmount ?? 1000,
    truth: overrides.truth ?? 'fraud',
    title: localized('Test Case'),
    claim: { person: localized('John Doe'), story: localized('A claim story.') },
    coverImage: 'covers/test.png',
    evidences: safeEvidences,
    correctDecision: overrides.correctDecision ?? 'reject',
    explanation: localizedLines('Because of the contradiction.'),
    ...(overrides.investigationBudget != null
      ? { investigationBudget: overrides.investigationBudget }
      : {}),
  };
}

/** Ids of the evidence cards that are genuine contradictions. */
export function contradictionIds(c: Case): string[] {
  return c.evidences.filter((e) => e.isContradiction).map((e) => e.id);
}

/** Ids of the evidence cards that are NOT contradictions. */
export function cleanIds(c: Case): string[] {
  return c.evidences.filter((e) => !e.isContradiction).map((e) => e.id);
}

/** Fresh default `PlayerStats` with optional overrides. */
export function makeStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return {
    balance: GAME_CONFIG.economy.startingBalance,
    language: 'ru',
    completedCaseIds: [],
    results: {},
    lastDailyClaimServerMs: null,
    lastDailyCaseId: null,
    dailyAdUnlockServerDay: null,
    dailyAdCaseId: null,
    isBankrupt: false,
    xp: 0,
    streakCount: 0,
    lastPlayedServerDay: null,
    unlockedAchievementIds: [],
    ratingDismissals: 0,
    departmentLevels: { archive: 0, field: 0, lab: 0 },
    serviceFreeUseServerDay: {},
    weeklyProgress: null,
    collectibleStampIds: [],
    ...overrides,
  };
}

/** A valid `CaseResult` with overridable fields. */
export function makeResult(overrides: Partial<CaseResult> = {}): CaseResult {
  return {
    caseId: 'case-x',
    decision: 'reject',
    verdictCorrect: true,
    correctlyMarkedContradictions: 1,
    totalContradictions: 1,
    falseStamps: 0,
    rewardEarned: 100,
    mastery: 'bronze',
    closedAtServerMs: 0,
    ...overrides,
  };
}

/** All real, Zod-validated cases shipped in the game (for flow parametrization). */
export function realCases(): Case[] {
  return getAllCases();
}
