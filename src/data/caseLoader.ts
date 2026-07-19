/**
 * Data-driven case registry with lazy content loading.
 *
 * Adding a case = dropping a JSON file anywhere under `./cases/` — both the
 * summary manifest and the lazy chunk map below pick it up automatically; no
 * registry edits needed.
 *
 * Two layers, so the entry bundle stays light:
 *   • `CaseSummary[]` — build-time previews from `virtual:case-summaries`
 *     (Zod-validated at build by the vite plugin). Always available, sync;
 *     everything the desk shelf / menus render.
 *   • Full `Case` content — one lazy chunk per JSON via `import.meta.glob`,
 *     fetched by `loadCaseById()` when the player opens (or is about to open)
 *     a case, re-validated with Zod on arrival, then cached in `registry`.
 *
 * The sync full-case getters (`getCaseById`, `getStandardCases`, …) only see
 * cases already loaded; tests preload everything via `loadAllCases()` in
 * `src/test/setup.ts`.
 */
import rawSummaries from 'virtual:case-summaries';
import { compareCasesByUnlockCriteria } from '../engine/caseUnlockEngine';
import type { Case, CaseSummary } from '../types';

/** One lazy chunk per case JSON; keys match the summaries' `path` field. */
const caseModules = import.meta.glob('./cases/**/*.json', { import: 'default' });

const chunkPathById = new Map<string, string>(
  rawSummaries.map((s) => [s.id, s.path]),
);

const summaries: CaseSummary[] = rawSummaries.map(
  ({ path: _path, ...summary }) => summary,
);
const summaryById = new Map(summaries.map((s) => [s.id, s]));

/* ------------------------- Summaries (sync, eager) ------------------------ */

export function getAllCaseSummaries(): CaseSummary[] {
  return [...summaries];
}

export function getCaseSummaryById(id: string): CaseSummary | undefined {
  return summaryById.get(id);
}

export function getStandardCaseSummaries(): CaseSummary[] {
  return summaries
    .filter((s) => s.type === 'standard')
    .sort(compareCasesByUnlockCriteria);
}

/** All daily summaries, deterministically ordered by id so rotation is stable. */
export function getDailyCaseSummaries(): CaseSummary[] {
  return summaries
    .filter((s) => s.type === 'daily')
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * The daily case preview for a given rotation index (e.g. server-day number).
 * With no index — or no dailies — falls back to the first daily. The index
 * must be derived from *server* time, never the device clock.
 */
export function getDailyCaseSummary(dayIndex?: number): CaseSummary | undefined {
  const dailies = getDailyCaseSummaries();
  if (dailies.length === 0) return undefined;
  if (dayIndex === undefined) return dailies[0];
  // Normalize to a non-negative index before the modulo so negatives are safe.
  const i = ((Math.floor(dayIndex) % dailies.length) + dailies.length) % dailies.length;
  return dailies[i];
}

/* ---------------------- Full cases (lazy, on demand) ---------------------- */

/** Fully loaded + validated cases, indexed by id. */
const registry = new Map<string, Case>();
const inflight = new Map<string, Promise<Case | undefined>>();

/**
 * Fetch, validate, and cache one case's full content. Resolves `undefined`
 * for unknown ids and for invalid content (logged, never thrown) so a broken
 * case degrades to "folder does not open" instead of crashing the desk.
 */
export function loadCaseById(id: string): Promise<Case | undefined> {
  const cached = registry.get(id);
  if (cached) return Promise.resolve(cached);

  const pending = inflight.get(id);
  if (pending) return pending;

  const chunkPath = chunkPathById.get(id);
  const importCase = chunkPath ? caseModules[chunkPath] : undefined;
  if (!importCase) return Promise.resolve(undefined);

  const promise = (async () => {
    try {
      const [raw, { parseCase }] = await Promise.all([
        importCase(),
        // Lazy so Zod stays out of the entry bundle.
        import('./caseSchema'),
      ]);
      const parsed = parseCase(raw);
      registry.set(id, parsed);
      return parsed;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[caseLoader] Failed to load case "${id}":`, error);
      return undefined;
    } finally {
      inflight.delete(id);
    }
  })();
  inflight.set(id, promise);
  return promise;
}

/** Fire-and-forget warm-up of the given cases (e.g. available + next + daily). */
export function preloadCases(ids: readonly string[]): void {
  for (const id of ids) void loadCaseById(id);
}

/** Load every case (test setup / tooling — defeats laziness by design). */
export async function loadAllCases(): Promise<Case[]> {
  const loaded = await Promise.all(summaries.map((s) => loadCaseById(s.id)));
  return loaded.filter((c): c is Case => c !== undefined);
}

/* ------------------- Loaded-case getters (sync views) --------------------- */

/** All *loaded* cases. Complete only after `loadAllCases()` (tests/tooling). */
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

/** All *loaded* daily cases, ordered by id so rotation is stable. */
export function getDailyCases(): Case[] {
  return getAllCases()
    .filter((c) => c.type === 'daily')
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * The loaded daily case for a rotation index — see `getDailyCaseSummary` for
 * the rotation contract. Prefer the summary variant in UI code.
 */
export function getDailyCase(dayIndex?: number): Case | undefined {
  const dailies = getDailyCases();
  if (dailies.length === 0) return undefined;
  if (dayIndex === undefined) return dailies[0];
  const i = ((Math.floor(dayIndex) % dailies.length) + dailies.length) % dailies.length;
  return dailies[i];
}
