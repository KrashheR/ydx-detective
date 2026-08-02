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

export function isFreeSamplePlayed(
  stats: Pick<PlayerStats, "completedCaseIds">,
  pack: ThematicPack,
): boolean {
  const sample = getFreeSampleCase(pack);
  return sample != null && stats.completedCaseIds.includes(sample.id);
}
