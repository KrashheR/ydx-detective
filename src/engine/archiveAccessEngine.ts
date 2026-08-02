/**
 * Who may open which archive case — pure derivation over runtime stats and the
 * static pack catalog. No React, no SDK, no store.
 *
 * A story-pack case is reachable when any of these is true:
 *   • the pack was purchased (or came with a bundle),
 *   • it is the pack's first case — the permanent free sample,
 *   • it was unlocked individually with a rewarded ad,
 *   • it is also a standard-campaign case the player has already reached.
 *
 * The last clause exists because the retired expert-file packs still ship their
 * cases as campaign entries 39–50: those must never re-lock behind a paywall.
 */
import {
  THEMATIC_PACKS,
  getThematicPackCases,
  type ThematicPack,
} from "../data/thematicPacks";
import type { CaseUnlockInfo } from "./caseUnlockEngine";
import type { CaseSummary, PlayerStats } from "../types";

export type ArchiveCaseStatus = "completed" | "available" | "locked";

/** The subset of `PlayerStats` archive access actually reads. */
export type ArchiveAccessStats = Pick<
  PlayerStats,
  "archivePurchasedPackIds" | "archiveUnlockedCaseIds" | "completedCaseIds"
>;

export type UnlockByCaseId = ReadonlyMap<string, CaseUnlockInfo<CaseSummary>>;

export function indexUnlocksByCaseId(
  caseUnlocks: readonly CaseUnlockInfo<CaseSummary>[],
): UnlockByCaseId {
  return new Map(caseUnlocks.map((info) => [info.caseData.id, info]));
}

export function isPackPurchased(
  stats: Pick<PlayerStats, "archivePurchasedPackIds">,
  packId: string,
): boolean {
  return stats.archivePurchasedPackIds.includes(packId);
}

export function isCaseUnlockedByArchive(
  stats: Pick<PlayerStats, "archivePurchasedPackIds" | "archiveUnlockedCaseIds">,
  pack: ThematicPack,
  caseId: string,
  index: number,
): boolean {
  return (
    isPackPurchased(stats, pack.id) ||
    index === 0 ||
    stats.archiveUnlockedCaseIds.includes(caseId)
  );
}

export function getArchiveCaseStatus(
  stats: ArchiveAccessStats,
  pack: ThematicPack,
  caseId: string,
  index: number,
  unlockByCaseId: UnlockByCaseId,
): ArchiveCaseStatus {
  // Story-pack cases (`type: "archive"`) live outside the standard campaign, so
  // they never appear in `unlockByCaseId` — their completion lives only in the
  // store's completed list.
  if (stats.completedCaseIds.includes(caseId)) return "completed";

  const unlock = unlockByCaseId.get(caseId);
  if (unlock) {
    if (unlock.status === "completed") return "completed";
    if (unlock.status === "available") return "available";
  }

  return isCaseUnlockedByArchive(stats, pack, caseId, index)
    ? "available"
    : "locked";
}

export function countAccessibleArchiveCases(
  stats: ArchiveAccessStats,
  pack: ThematicPack,
  unlockByCaseId: UnlockByCaseId,
): number {
  return getThematicPackCases(pack).filter(
    (caseData, index) =>
      getArchiveCaseStatus(stats, pack, caseData.id, index, unlockByCaseId) !==
      "locked",
  ).length;
}

/** The first still-locked case — what a rewarded ad would open next. */
export function getNextRewardedCase(
  stats: ArchiveAccessStats,
  pack: ThematicPack,
  unlockByCaseId: UnlockByCaseId,
): CaseSummary | null {
  return (
    getThematicPackCases(pack).find(
      (caseData, index) =>
        getArchiveCaseStatus(
          stats,
          pack,
          caseData.id,
          index,
          unlockByCaseId,
        ) === "locked",
    ) ?? null
  );
}

/**
 * The free sample the shelf's primary CTA points at, and whether it has already
 * been played — which is what flips the archive page from "play free" to
 * "continue the investigation".
 */
export function getFreeSampleCase(pack: ThematicPack): CaseSummary | null {
  return getThematicPackCases(pack)[0] ?? null;
}

/** A pack case together with the position and access state the desk needs. */
export interface ArchiveCaseEntry {
  readonly caseData: CaseSummary;
  readonly index: number;
  readonly status: ArchiveCaseStatus;
}

/**
 * The shelf pack a case belongs to, or `null` for anything else.
 *
 * Deliberately scoped to `THEMATIC_PACKS`, never `ALL_THEMATIC_PACKS`: the
 * retired expert-file packs still map to standard campaign cases 40–51, so
 * matching against them would make an ordinary campaign case look like an
 * archive case and derail normal progression.
 */
export function getArchivePackForCase(caseId: string): ThematicPack | null {
  return (
    THEMATIC_PACKS.find((pack) =>
      getThematicPackCases(pack).some((caseData) => caseData.id === caseId),
    ) ?? null
  );
}

/** Every case in a pack, in shelf order, with its current access state. */
export function listArchiveCases(
  stats: ArchiveAccessStats,
  pack: ThematicPack,
  unlockByCaseId: UnlockByCaseId,
): readonly ArchiveCaseEntry[] {
  return getThematicPackCases(pack).map((caseData, index) => ({
    caseData,
    index,
    status: getArchiveCaseStatus(stats, pack, caseData.id, index, unlockByCaseId),
  }));
}

/**
 * Where "next case" leads from inside an archive: the next reachable, unplayed
 * case *of the same pack*. Looks forward from the current position first, then
 * wraps back to anything skipped earlier, so a player who opened the pack out
 * of order is never dead-ended. `null` means the pack has nothing left to
 * offer — the caller decides where to send them instead.
 */
export function getNextArchiveCase(
  stats: ArchiveAccessStats,
  pack: ThematicPack,
  currentCaseId: string | null,
  unlockByCaseId: UnlockByCaseId,
): CaseSummary | null {
  const entries = listArchiveCases(stats, pack, unlockByCaseId);
  const currentIndex = entries.findIndex(
    (entry) => entry.caseData.id === currentCaseId,
  );
  const playable = (entry: ArchiveCaseEntry): boolean =>
    entry.status === "available" && entry.caseData.id !== currentCaseId;

  return (
    entries.slice(currentIndex + 1).find(playable)?.caseData ??
    entries.slice(0, Math.max(currentIndex, 0)).find(playable)?.caseData ??
    null
  );
}

export function isFreeSamplePlayed(
  stats: Pick<PlayerStats, "completedCaseIds">,
  pack: ThematicPack,
): boolean {
  const sample = getFreeSampleCase(pack);
  return sample != null && stats.completedCaseIds.includes(sample.id);
}
