import { describe, it, expect } from 'vitest';
import {
  getArchivePackForCase,
  getNextArchiveCase,
  indexUnlocksByCaseId,
  listArchiveCases,
} from './archiveAccessEngine';
import { THEMATIC_PACKS, getThematicPackCaseIds } from '../data/thematicPacks';
import { makeStats } from '../test/fixtures';

const pack = THEMATIC_PACKS[0]!;
const packCaseIds = getThematicPackCaseIds(pack);
const noUnlocks = indexUnlocksByCaseId([]);

describe('getArchivePackForCase', () => {
  it('finds the shelf pack a story-pack case belongs to', () => {
    expect(getArchivePackForCase(packCaseIds[0]!)?.id).toBe(pack.id);
  });

  it('never claims a standard campaign case', () => {
    expect(getArchivePackForCase('case-001')).toBeNull();
    // Retired expert-file packs still map to campaign cases 40–51: treating
    // those as archive cases would derail normal campaign progression.
    expect(getArchivePackForCase('case-044')).toBeNull();
  });
});

describe('getNextArchiveCase', () => {
  it('stays inside the pack, moving to the next reachable file', () => {
    const stats = makeStats({ archivePurchasedPackIds: [pack.id] });
    const next = getNextArchiveCase(stats, pack, packCaseIds[0]!, noUnlocks);
    expect(next?.id).toBe(packCaseIds[1]);
  });

  it('returns null when only the free sample is reachable', () => {
    // No purchase, no ad unlock: index 0 is the only open file, and it is the
    // one just played.
    const stats = makeStats();
    expect(getNextArchiveCase(stats, pack, packCaseIds[0]!, noUnlocks)).toBeNull();
  });

  it('wraps back to a file skipped earlier rather than dead-ending', () => {
    const stats = makeStats({ archivePurchasedPackIds: [pack.id] });
    const last = packCaseIds[packCaseIds.length - 1]!;
    expect(getNextArchiveCase(stats, pack, last, noUnlocks)?.id).toBe(packCaseIds[0]);
  });

  it('skips files the player has already completed', () => {
    const stats = makeStats({
      archivePurchasedPackIds: [pack.id],
      completedCaseIds: [packCaseIds[1]!],
    });
    expect(getNextArchiveCase(stats, pack, packCaseIds[0]!, noUnlocks)?.id).toBe(
      packCaseIds[2],
    );
  });
});

describe('listArchiveCases', () => {
  it('opens only the free sample for a player who has not paid', () => {
    const entries = listArchiveCases(makeStats(), pack, noUnlocks);
    expect(entries).toHaveLength(packCaseIds.length);
    expect(entries[0]!.status).toBe('available');
    expect(entries.slice(1).every((entry) => entry.status === 'locked')).toBe(true);
  });

  it('opens every file once the pack is bought', () => {
    const entries = listArchiveCases(
      makeStats({ archivePurchasedPackIds: [pack.id] }),
      pack,
      noUnlocks,
    );
    expect(entries.every((entry) => entry.status === 'available')).toBe(true);
  });
});
