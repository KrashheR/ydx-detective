/**
 * Runtime validation for imported case JSON.
 *
 * Every `Case` that enters the engine — whether bundled, fetched, or authored
 * by a designer — passes through `parseCase`. This is the *only* trust boundary
 * for static content: if a translation key is missing or a field is mistyped,
 * the case is rejected loudly instead of corrupting gameplay or scoring.
 *
 * The schema is derived from the same source of truth as `src/types/index.ts`;
 * `satisfies` checks below keep the two in lockstep at compile time.
 */
import { z } from 'zod';
import {
  SUPPORTED_LANGUAGES,
  type Case,
  type ClientInfo,
  type ClientMetaRow,
  type Evidence,
  type EvidenceMeta,
  type Language,
} from '../types';

/* -------------------------------------------------------------------------- */
/*  Localized field builders                                                  */
/* -------------------------------------------------------------------------- */

/** Builds a Zod object requiring an entry for *every* supported language. */
function localizedShape<T extends z.ZodTypeAny>(value: T) {
  const shape = Object.fromEntries(
    SUPPORTED_LANGUAGES.map((lang) => [lang, value]),
  ) as Record<Language, T>;
  // `.strict()` rejects unknown language codes so typos surface immediately.
  return z.object(shape).strict();
}

const localizedString = localizedShape(z.string().min(1));
const localizedLines = localizedShape(z.array(z.string()));
const localizedContent = localizedShape(
  z.union([z.string(), z.array(z.string())]),
);

/* -------------------------------------------------------------------------- */
/*  Enums                                                                     */
/* -------------------------------------------------------------------------- */

const caseType = z.enum(['standard', 'daily']);
const difficulty = z.enum(['easy', 'medium', 'hard']);
const truth = z.enum(['valid', 'fraud']);
const decision = z.enum(['approve', 'reject']);
const evidenceType = z.enum([
  'photo',
  'gps',
  'document',
  'witness_statement',
  'camera_recording',
  'usage_log',
  'xray',
  'bank_statement',
  'phone_records',
  'social_media',
  'document_scan',
  'thermal_scan',
  'shadow_time_check',
  'seal_match',
  'surface_reveal',
]);

/* -------------------------------------------------------------------------- */
/*  Composite schemas                                                         */
/* -------------------------------------------------------------------------- */

const evidenceMetaSchema = z
  .object({
    company: localizedString.optional(),
    department: localizedString.optional(),
    requestId: localizedString.optional(),
    gpsFooter: localizedString.optional(),
    filename: z.string().optional(),
    imageUrl: z.string().optional(),
    cameraId: z.string().optional(),
    cameraModel: z.string().optional(),
    docHeader: localizedString.optional(),
    docFooter: localizedString.optional(),
    logPrompt: z.string().optional(),
    clinicName: localizedString.optional(),
    bankName: localizedString.optional(),
    accountMask: z.string().optional(),
    carrierName: localizedString.optional(),
    phoneMask: z.string().optional(),
    socialPlatform: z.string().optional(),
  })
  .strict();

// Compile-time guard: schema inferred type must be assignable to EvidenceMeta.
type _EvidenceMetaCheck = AssertAssignable<EvidenceMeta, z.infer<typeof evidenceMetaSchema>>;

const statementLinkSchema = z.object({
  statementId: z.string().min(1),
  relation: z.enum(['supports', 'contradicts', 'contextualizes', 'reveals_season_clue']),
  reason: localizedString,
}).strict();

const evidenceBaseShape = {
    id: z.string().min(1),
    type: evidenceType,
    title: localizedString,
    content: localizedContent,
    isContradiction: z.boolean(),
    contradictionExplanation: localizedString,
    meta: evidenceMetaSchema.optional(),
    order: z.number().int().positive().optional(),
    narrativeRole: z.string().optional(),
    statementLink: statementLinkSchema.optional(),
    contradictionTarget: z.object({ statementId: z.string().min(1), reason: localizedString }).strict().nullable().optional(),
    evidenceTier: z.enum(['core', 'supporting', 'bonus', 'arc']).optional(),
    unlocksAfterEvidenceIds: z.array(z.string().min(1)).optional(),
    revealsEvidenceIds: z.array(z.string().min(1)).optional(),
    requiredForVerdict: z.boolean().optional(),
    rewardWeight: z.number().nonnegative().optional(),
    previousType: z.string().optional(),
    description: localizedString.optional(),
    instruction: localizedString.optional(),
    assets: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
    uiHints: z.object({
      showReset: z.boolean(), allowZoom: z.boolean(), highlightAfterHint: z.boolean(),
      transparencyMode: z.boolean().optional(),
    }).strict().optional(),
    interactiveDesign: z.object({
      why: localizedString, playerAction: localizedString, conclusion: localizedString,
    }).strict().optional(),
};

const percent = z.number().min(0).max(100);
const scanMode = z.enum(['normal', 'uv', 'backlight', 'contrast', 'side_light']);
const documentScanData = z.object({
  initialMode: scanMode,
  modes: z.array(scanMode).min(1),
  anomalyZones: z.array(z.object({
    id: z.string().min(1), mode: scanMode, x: percent, y: percent,
    width: percent, height: percent, label: z.string().min(1), labelEn: z.string().optional(),
    isContradiction: z.boolean(),
  }).strict()).min(1),
  referenceFields: z.array(z.object({
    id: z.string().min(1), label: z.string().min(1), labelEn: z.string().optional(), value: z.string().min(1),
  }).strict()).optional(),
  successCondition: z.union([
    z.object({ type: z.literal('select_zone'), zoneId: z.string().min(1) }).strict(),
    z.object({ type: z.literal('select_then_compare'), zoneId: z.string().min(1), referenceFieldId: z.string().min(1) }).strict(),
  ]),
}).strict();

const thermalScanData = z.object({
  ambientTemperature: z.number(), observationTime: z.string(), claimedLastUseBefore: z.string(),
  elapsedSinceClaimedUseMinutes: z.number().nonnegative(), coolingReference: z.string().min(1),
  coolingReferenceEn: z.string().optional(), initialMode: z.enum(['normal', 'thermal']),
  heatZones: z.array(z.object({
    id: z.string().min(1), shape: z.enum(['circle', 'ellipse', 'polygon']),
    x: percent.optional(), y: percent.optional(), width: percent.optional(), height: percent.optional(),
    points: z.array(z.union([
      z.object({ x: percent, y: percent }).strict(),
      z.tuple([percent, percent]),
    ])).optional(),
    temperature: z.number(), intensity: z.number().min(0).max(1), label: z.string().min(1),
    labelEn: z.string().optional(), isContradiction: z.boolean().optional(), isTarget: z.boolean().optional(),
  }).strict()).min(1),
  successCondition: z.object({ type: z.enum(['select_any', 'select_all']), zoneIds: z.array(z.string()).min(1) }).strict(),
}).strict();

const transform = z.object({ x: z.number(), y: z.number(), rotation: z.number() }).strict();
const shadowTimeData = z.object({
  claimedTime: z.string(), orientationSource: z.string(), orientationSourceEn: z.string().optional(),
  slider: z.object({ from: z.string(), to: z.string(), stepMinutes: z.number().positive() }).strict(),
  shadowOrigin: z.object({ x: percent, y: percent }).strict(),
  referenceShadow: z.object({ baseAngle: z.number(), baseLength: z.number(), width: z.number(), opacity: z.number().min(0).max(1) }).strict(),
  timeSamples: z.array(z.object({ time: z.string(), angle: z.number(), length: z.number() }).strict()).min(2),
  validTimeRanges: z.array(z.object({ from: z.string(), to: z.string() }).strict()).min(1),
  matchTolerance: z.object({ angle: z.number().nonnegative(), length: z.number().nonnegative() }).strict(),
}).strict();
const sealMatchData = z.object({
  movableFragment: z.enum(['A', 'B']), allowRotation: z.boolean(), rotationStep: z.number().positive(),
  initialTransform: transform, targetTransform: transform,
  tolerance: z.object({ position: z.number().nonnegative(), rotation: z.number().nonnegative() }).strict(),
  expectedMatch: z.boolean(), sourceSeed: z.number().int(), fragmentASeed: z.number().int(), fragmentBSeed: z.number().int(),
  comparisonMarkers: z.array(z.object({ id: z.string(), label: z.string(), labelEn: z.string().optional() }).strict()).min(1),
}).strict();
const surfaceRevealData = z.object({
  mode: z.enum(['erase', 'apply', 'light_reveal']),
  coverType: z.enum(['dust', 'condensation', 'dirt', 'soot', 'frost', 'sand', 'powder', 'custom']),
  brush: z.object({ radius: z.number().positive(), hardness: z.number().min(0).max(1), opacity: z.number().min(0).max(1), spacing: z.number().positive().optional() }).strict(),
  completion: z.object({
    type: z.enum(['reveal_percentage', 'discover_any', 'discover_all']),
    requiredRevealPercent: percent.optional(), requiredTraceIds: z.array(z.string()).optional(),
  }).strict(),
  traces: z.array(z.object({
    id: z.string().min(1), label: z.string().min(1), labelEn: z.string().optional(), mask: z.string().optional(),
    shape: z.literal('mask'), requiredRevealPercent: percent, isContradiction: z.boolean(),
    conclusion: z.string().min(1), conclusionEn: z.string().optional(),
  }).strict()).min(1),
}).strict().superRefine((data, ctx) => {
  const ids = new Set(data.traces.map((trace) => trace.id));
  if (ids.size !== data.traces.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate surface trace id' });
  for (const id of data.completion.requiredTraceIds ?? []) {
    if (!ids.has(id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown required trace "${id}"` });
  }
  for (const [index, trace] of data.traces.entries()) {
    if (!trace.mask) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mask trace requires mask path', path: ['traces', index, 'mask'] });
  }
});

const standardEvidenceSchema = z.object(evidenceBaseShape).strict();
const interactiveCommon = {
  ...evidenceBaseShape,
  description: localizedString,
  instruction: localizedString,
  assets: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  statementLink: statementLinkSchema,
  uiHints: evidenceBaseShape.uiHints.unwrap(),
  interactiveDesign: evidenceBaseShape.interactiveDesign.unwrap(),
};

export const evidenceSchema = z.union([
  standardEvidenceSchema.refine((value) => !['document_scan','thermal_scan','shadow_time_check','seal_match','surface_reveal'].includes(value.type)),
  z.object({ ...interactiveCommon, type: z.literal('document_scan'), data: documentScanData }).strict(),
  z.object({ ...interactiveCommon, type: z.literal('thermal_scan'), data: thermalScanData }).strict(),
  z.object({ ...interactiveCommon, type: z.literal('shadow_time_check'), data: shadowTimeData }).strict(),
  z.object({ ...interactiveCommon, type: z.literal('seal_match'), data: sealMatchData }).strict(),
  z.object({ ...interactiveCommon, type: z.literal('surface_reveal'), data: surfaceRevealData }).strict(),
]);

export const claimSchema = z
  .object({
    person: localizedString,
    story: localizedString,
  })
  .strict();

const clientMetaRowSchema = z
  .object({ k: localizedString, v: localizedString })
  .strict();

type _ClientMetaRowCheck = AssertAssignable<ClientMetaRow, z.infer<typeof clientMetaRowSchema>>;

export const clientInfoSchema = z
  .object({
    role: localizedString,
    meta: z.array(clientMetaRowSchema),
  })
  .strict();

type _ClientInfoCheck = AssertAssignable<ClientInfo, z.infer<typeof clientInfoSchema>>;

export const caseSchema = z
  .object({
    id: z.string().min(1),
    type: caseType,
    difficulty,
    claimAmount: z.number().finite().nonnegative(),
    truth,
    title: localizedString,
    claim: claimSchema,
    coverImage: z.string().min(1),
    personImage: z.string().min(1).optional(),
    client: clientInfoSchema.optional(),
    evidences: z.array(evidenceSchema).min(1),
    correctDecision: decision,
    explanation: localizedLines,
    // Optional "investigation budget": max evidence cards the player may open
    // before deciding. Omitted ⇒ unlimited (classic review-everything flow).
    investigationBudget: z.number().int().positive().optional(),
    campaignOrder: z.number().int().min(1).max(50).optional(),
    requiredLevel: z.number().int().positive().optional(),
    act: z.number().int().positive().optional(),
    actTitle: localizedString.optional(),
    claimStatements: z.array(z.object({ id: z.string().min(1), text: localizedString, stampable: z.boolean() }).strict()).optional(),
    contentVersion: z.string().optional(),
    schemaVersion: z.number().int().positive().optional(),
    revisionVersion: z.string().optional(),
    narrative: z.object({
      preBrief: localizedString, postVerdictNote: localizedString, nextCaseTeaser: localizedString,
      seasonClue: z.object({ id: z.string(), label: localizedString, description: localizedString, progressIndex: z.number().int(), progressTotal: z.number().int() }).strict().nullable(),
      epilogue: localizedContent.nullable(),
    }).strict().optional(),
    onboarding: z.object({
      phase: z.string(), targetDurationSeconds: z.number().positive(), teaches: z.array(z.string()),
      successEmotion: localizedString, menuUnlockAfterVerdict: z.boolean(), unlocks: z.array(z.string()).optional(),
    }).strict().optional(),
    finalSynthesis: z.object({
      id: z.string(), title: localizedString, instruction: localizedString, unlockAfter: z.literal('correct_verdict'),
      nodes: z.array(z.object({ id: z.string(), label: localizedString, evidenceIds: z.array(z.string()) }).strict()).min(2),
      requiredLinks: z.array(z.tuple([z.string(), z.string()])), evidenceUnlockIds: z.array(z.string()),
      arcEvidenceAccess: z.literal('post_verdict_free'), successConclusion: localizedString,
      skippableAfterAttempts: z.number().int().positive(), analyticsEvent: z.string(),
    }).strict().optional(),
  })
  .strict()
  // Cross-field invariant: evidence ids must be unique within a case so the
  // store can safely use id-based selection sets.
  .superRefine((data, ctx) => {
    const ids = new Set<string>();
    for (const ev of data.evidences) {
      if (ids.has(ev.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate evidence id "${ev.id}" in case "${data.id}"`,
          path: ['evidences'],
        });
      }
      ids.add(ev.id);
    }
    for (const [index, ev] of data.evidences.entries()) {
      for (const dependencyId of ev.unlocksAfterEvidenceIds ?? []) {
        if (!ids.has(dependencyId) || dependencyId === ev.id) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid evidence dependency "${dependencyId}"`, path: ['evidences', index, 'unlocksAfterEvidenceIds'] });
        }
      }
      for (const revealedId of ev.revealsEvidenceIds ?? []) {
        if (!ids.has(revealedId) || revealedId === ev.id) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid revealed evidence "${revealedId}"`, path: ['evidences', index, 'revealsEvidenceIds'] });
        }
      }
    }
    if (data.investigationBudget != null && data.investigationBudget > data.evidences.filter((ev) => ev.evidenceTier !== 'arc').length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Investigation budget exceeds accessible evidence count', path: ['investigationBudget'] });
    }
    if (data.claimStatements) {
      const statementIds = new Set<string>();
      for (const [index, statement] of data.claimStatements.entries()) {
        if (statementIds.has(statement.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate statement id "${statement.id}"`, path: ['claimStatements', index] });
        statementIds.add(statement.id);
      }
      const main = data.claimStatements.find((statement) => statement.id === 'claim_main');
      if (!main || main.stampable) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'claim_main must exist and be non-stampable', path: ['claimStatements'] });
      for (const [index, ev] of data.evidences.entries()) {
        const link = ev.statementLink;
        if (link && !statementIds.has(link.statementId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown statement link "${link.statementId}"`, path: ['evidences', index, 'statementLink'] });
        if (link?.relation === 'contradicts' !== ev.isContradiction) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'relation/isContradiction mismatch', path: ['evidences', index] });
        if (link?.relation === 'contradicts' && !data.claimStatements.find((s) => s.id === link.statementId)?.stampable) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Contradiction must target a stampable statement', path: ['evidences', index] });
      }
    }
    if (data.truth === 'valid' && data.evidences.some((ev) => ev.isContradiction)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid case cannot contain contradictions', path: ['evidences'] });
    if (data.truth === 'fraud' && !data.evidences.some((ev) => ev.isContradiction)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Fraud case requires a contradiction', path: ['evidences'] });
  });

/* -------------------------------------------------------------------------- */
/*  Compile-time alignment guards                                            */
/* -------------------------------------------------------------------------- */
// If the Zod output ever drifts from the hand-written interfaces, these aliases
// fail to compile (mutable inferred types are assignable to readonly targets,
// so the only failures are genuine shape mismatches).

/** Compiles only if `U` is assignable to `T`. */
type AssertAssignable<T, U extends T> = U;

type _EvidenceCheck = AssertAssignable<Evidence, z.infer<typeof evidenceSchema>>;
type _CaseCheck = AssertAssignable<Case, z.infer<typeof caseSchema>>;

/* -------------------------------------------------------------------------- */
/*  Public parsers                                                            */
/* -------------------------------------------------------------------------- */

/** Validate & return a single case, throwing a descriptive error on failure. */
export function parseCase(raw: unknown): Case {
  return caseSchema.parse(raw) as Case;
}

/** Non-throwing variant for batch loading; logs and skips invalid entries. */
export function safeParseCases(raws: unknown[]): {
  cases: Case[];
  errors: { index: number; error: z.ZodError }[];
} {
  const cases: Case[] = [];
  const errors: { index: number; error: z.ZodError }[] = [];
  raws.forEach((raw, index) => {
    const result = caseSchema.safeParse(raw);
    if (result.success) {
      cases.push(result.data as Case);
    } else {
      errors.push({ index, error: result.error });
    }
  });
  return { cases, errors };
}
