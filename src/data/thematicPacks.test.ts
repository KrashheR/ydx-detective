import { describe, expect, it } from "vitest";
import {
  ALL_THEMATIC_PACKS,
  RETIRED_THEMATIC_PACKS,
  THEMATIC_PACKS,
  getThematicPackCaseIds,
  getThematicPackCases,
  getThematicPackIdByProductId,
  getThematicPackOpenedCases,
  getThematicPackTotalCases,
  isPurchasedArchiveCase,
} from "./thematicPacks";

describe("thematic packs", () => {
  it("lists exactly the three story packs on the archives shelf", () => {
    expect(THEMATIC_PACKS.map((pack) => pack.id)).toEqual([
      "dacha-romashka",
      "night-train",
      "sanatorium-priboy",
    ]);
    // Retired packs stay in the codebase but never reach the shelf.
    expect(RETIRED_THEMATIC_PACKS.length).toBeGreaterThan(0);
    for (const retired of RETIRED_THEMATIC_PACKS) {
      expect(THEMATIC_PACKS.some((pack) => pack.id === retired.id)).toBe(false);
    }
  });

  it("ships ten archive cases per listed pack", () => {
    for (const pack of THEMATIC_PACKS) {
      expect(getThematicPackCases(pack)).toHaveLength(10);
      expect(getThematicPackCases(pack).every((c) => c.type === "archive")).toBe(true);
    }
  });

  it("resolves archive cases from shipped case JSON", () => {
    for (const pack of ALL_THEMATIC_PACKS) {
      const caseIds = getThematicPackCaseIds(pack);
      const cases = getThematicPackCases(pack);

      expect(caseIds.length).toBeGreaterThan(0);
      expect(cases.map((caseData) => caseData.id)).toEqual(caseIds);
      expect(getThematicPackTotalCases(pack)).toBe(cases.length);
      expect(getThematicPackOpenedCases(pack)).toBeLessThanOrEqual(cases.length);
    }
  });

  it("maps a product id back to its pack, ignoring blank ids", () => {
    expect(getThematicPackIdByProductId("archive_night_train")).toBe("night-train");
    // A retired pack still resolves so an old purchase keeps restoring.
    expect(getThematicPackIdByProductId("archive_closed_collegium")).toBe("closed-collegium");
    expect(getThematicPackIdByProductId("noads_forever")).toBeNull();
    // Packs off the shelf carry no product id, so nothing blank may resolve.
    expect(getThematicPackIdByProductId("  ")).toBeNull();
    expect(getThematicPackIdByProductId("")).toBeNull();
  });

  it("recognizes cases inside a purchased pack (forced ads are off there)", () => {
    const pack = ALL_THEMATIC_PACKS.find((item) => item.id === "closed-collegium")!;
    const firstCaseId = getThematicPackCaseIds(pack)[0]!;

    expect(isPurchasedArchiveCase(firstCaseId, [pack.id])).toBe(true);
    expect(isPurchasedArchiveCase(firstCaseId, [])).toBe(false);
    expect(isPurchasedArchiveCase("case-001", [pack.id])).toBe(false);
  });
});
