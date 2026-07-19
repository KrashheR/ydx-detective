import type { Evidence } from "../types";

/** Resolve a semantic previous/next evidence id without wrapping at the ends. */
export function getAdjacentEvidenceId(
  evidences: readonly Pick<Evidence, "id">[],
  currentId: string,
  direction: -1 | 1,
): string | null {
  const currentIndex = evidences.findIndex((item) => item.id === currentId);
  if (currentIndex < 0) return null;
  return evidences[currentIndex + direction]?.id ?? null;
}
