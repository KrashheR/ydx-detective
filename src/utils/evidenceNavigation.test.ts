import { describe, expect, it } from "vitest";
import { getAdjacentEvidenceId } from "./evidenceNavigation";

const evidences = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("getAdjacentEvidenceId", () => {
  it("moves in case evidence order", () => {
    expect(getAdjacentEvidenceId(evidences, "b", -1)).toBe("a");
    expect(getAdjacentEvidenceId(evidences, "b", 1)).toBe("c");
  });

  it("does not wrap and rejects an unknown current id", () => {
    expect(getAdjacentEvidenceId(evidences, "a", -1)).toBeNull();
    expect(getAdjacentEvidenceId(evidences, "c", 1)).toBeNull();
    expect(getAdjacentEvidenceId(evidences, "missing", 1)).toBeNull();
  });
});
