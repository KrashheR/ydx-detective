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

export const evidenceSchema = z
  .object({
    id: z.string().min(1),
    type: evidenceType,
    title: localizedString,
    content: localizedContent,
    isContradiction: z.boolean(),
    contradictionExplanation: localizedString,
    meta: evidenceMetaSchema.optional(),
    relation: z.enum(['supports', 'contradicts', 'context']).optional(),
  })
  .strict();

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
