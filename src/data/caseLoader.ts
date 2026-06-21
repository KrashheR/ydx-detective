/**
 * Data-driven case registry.
 *
 * Adding a case = dropping a JSON file in `./cases/` and listing it here (or
 * using a glob importer such as Vite's `import.meta.glob('./cases/*.json')`).
 * No engine, store, or component code changes. Every file is Zod-validated at
 * load time so malformed content fails fast and never reaches gameplay.
 */
import { compareCasesByUnlockCriteria } from '../engine/caseUnlockEngine';
import { parseCase, safeParseCases } from './caseSchema';
import type { Case } from '../types';

// Static imports keep cases in the bundle. Swap for `import.meta.glob` to make
// the directory fully drop-in without editing this array.
// Standard cases live in ./cases/; daily cases live in ./cases/daily/.
import case001 from './cases/case-001.json';
import case003 from './cases/case-003.json';
import case004 from './cases/case-004.json';
import case005 from './cases/case-005.json';
import case006 from './cases/case-006.json';
import case007 from './cases/case-007.json';
import case008 from './cases/case-008.json';
import case009 from './cases/case-009.json';
import case010 from './cases/case-010.json';
import case011 from './cases/case-011.json';
import case012 from './cases/case-012.json';
import case013 from './cases/case-013.json';
import case014 from './cases/case-014.json';
import case015 from './cases/case-015.json';
import case016 from './cases/case-016.json';
// Easter-egg recurring arc — Anatoly Stepanovich & Zhorik the raccoon (all valid).
import case017 from './cases/case-017.json';
import case018 from './cases/case-018.json';
import case019 from './cases/case-019.json';
// Easter-egg recurring arc — Splintovich vs. Shredderov ("Ninja" dojo / TMNT parody).
import case020 from './cases/case-020.json';
import case021 from './cases/case-021.json';
import case022 from './cases/case-022.json';
// Expert tier — progressive curve cases introducing bank_statement / phone_records / social_media.
import case023 from './cases/case-023.json';
import case024 from './cases/case-024.json';
import case025 from './cases/case-025.json';
import case026 from './cases/case-026.json';
import case027 from './cases/case-027.json';
import case028 from './cases/case-028.json';
import case029 from './cases/case-029.json';
import case030 from './cases/case-030.json';
import case031 from './cases/case-031.json';
import case032 from './cases/case-032.json';
import case033 from './cases/case-033.json';
import case034 from './cases/case-034.json';

// Daily cases — one surfaces per server-day via getDailyCase() rotation.
import daily002 from './cases/daily/case-002-daily.json';
import daily101 from './cases/daily/case-101-daily.json';
import daily102 from './cases/daily/case-102-daily.json';
import daily103 from './cases/daily/case-103-daily.json';
import daily104 from './cases/daily/case-104-daily.json';
import daily105 from './cases/daily/case-105-daily.json';

const RAW_CASES: unknown[] = [
  case001, case003, case004, case005, case006,
  case007, case008, case009, case010, case011,
  case012, case013, case014, case015, case016,
  case017, case018, case019, case020, case021,
  case022, case023, case024, case025, case026,
  case027, case028, case029, case030, case031,
  case032, case033, case034,
  daily002, daily101, daily102, daily103, daily104, daily105,
];

/** All valid cases, indexed by id. Invalid files are logged and skipped. */
const registry: Map<string, Case> = (() => {
  const { cases, errors } = safeParseCases(RAW_CASES);
  for (const { index, error } of errors) {
    // eslint-disable-next-line no-console
    console.error(`[caseLoader] Skipped invalid case at index ${index}:`, error.format());
  }
  return new Map(cases.map((c) => [c.id, c]));
})();

export function getAllCases(): Case[] {
  return [...registry.values()];
}

export function getCaseById(id: string): Case | undefined {
  return registry.get(id);
}

export function getStandardCases(): Case[] {
  return getAllCases()
    .filter((c) => c.type === 'standard')
    .sort(compareCasesByUnlockCriteria);
}

/** All daily cases, deterministically ordered by id so rotation is stable. */
export function getDailyCases(): Case[] {
  return getAllCases()
    .filter((c) => c.type === 'daily')
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * The daily case for a given rotation index (e.g. server-day number). With no
 * index — or no dailies — falls back to the first daily so existing callers and
 * the offline path keep working. The pool rotates so a fresh case appears each
 * day; the index must be derived from *server* time, never the device clock.
 */
export function getDailyCase(dayIndex?: number): Case | undefined {
  const dailies = getDailyCases();
  if (dailies.length === 0) return undefined;
  if (dayIndex === undefined) return dailies[0];
  // Normalize to a non-negative index before the modulo so negatives are safe.
  const i = ((Math.floor(dayIndex) % dailies.length) + dailies.length) % dailies.length;
  return dailies[i];
}

/** Validate a single externally-fetched case (e.g. server-pushed daily). */
export { parseCase };
