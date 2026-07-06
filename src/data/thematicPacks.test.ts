import { describe, expect, it } from "vitest";
import {
  THEMATIC_PACKS,
  getThematicPackCaseIds,
  getThematicPackCases,
  getThematicPackOpenedCases,
  getThematicPackTotalCases,
} from "./thematicPacks";

describe("thematic packs", () => {
  it("resolves archive cases from shipped case JSON", () => {
    for (const pack of THEMATIC_PACKS) {
      const caseIds = getThematicPackCaseIds(pack);
      const cases = getThematicPackCases(pack);

      expect(caseIds.length).toBeGreaterThan(0);
      expect(cases.map((caseData) => caseData.id)).toEqual(caseIds);
      expect(getThematicPackTotalCases(pack)).toBe(cases.length);
      expect(getThematicPackOpenedCases(pack)).toBeLessThanOrEqual(cases.length);
    }
  });
});
