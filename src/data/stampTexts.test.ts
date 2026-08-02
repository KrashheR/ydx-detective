import { describe, it, expect } from "vitest";
import { SUPPORTED_LANGUAGES } from "../types";
import { t } from "../i18n/ui";
import { THEMATIC_PACKS } from "./thematicPacks";
import {
  DEFAULT_STAMP_TEXT_ID,
  PACK_STAMP_TEXTS,
  PURCHASABLE_STAMP_TEXTS,
  STAMP_TEXTS,
  getStampCaption,
  getStampSubline,
  getStampText,
  getStampTextByProductId,
  isStampTextUnlocked,
} from "./stampTexts";

describe("stamp caption catalog", () => {
  it("keeps ids and product ids unique", () => {
    const ids = STAMP_TEXTS.map((stamp) => stamp.id);
    expect(new Set(ids).size).toBe(ids.length);
    const productIds = PURCHASABLE_STAMP_TEXTS.map((stamp) => stamp.productId);
    expect(new Set(productIds).size).toBe(productIds.length);
  });

  it("localizes every purchasable caption into all supported languages", () => {
    for (const stamp of PURCHASABLE_STAMP_TEXTS) {
      for (const lang of SUPPORTED_LANGUAGES) {
        expect(getStampCaption(stamp.id, lang).trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("prices every purchasable caption for the offline fallback", () => {
    for (const stamp of PURCHASABLE_STAMP_TEXTS) {
      expect(stamp.fallbackPriceRub).toBeGreaterThan(0);
    }
  });

  it("resolves the free default through the shared i18n key", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(getStampCaption(DEFAULT_STAMP_TEXT_ID, lang)).toBe(
        t("contradiction", lang),
      );
      // An unknown or absent id must never break the printed stamp.
      expect(getStampCaption(null, lang)).toBe(t("contradiction", lang));
      expect(getStampCaption("gone", lang)).toBe(t("contradiction", lang));
    }
    expect(getStampSubline(DEFAULT_STAMP_TEXT_ID)).toBe("CONTRADICTION");
  });

  it("maps a platform product id back onto its caption", () => {
    expect(getStampTextByProductId("stamp.storyteller")?.id).toBe("storyteller");
    expect(getStampTextByProductId("noads.forever")).toBeUndefined();
    expect(getStampText("storyteller").productId).toBe("stamp.storyteller");
  });

  it("keeps pack captions out of every priced shelf", () => {
    expect(PACK_STAMP_TEXTS.length).toBeGreaterThan(0);
    for (const stamp of PACK_STAMP_TEXTS) {
      expect(stamp.productId).toBeNull();
      // A pack caption must map onto a real archive, or nothing can unlock it.
      expect(THEMATIC_PACKS.some((pack) => pack.id === stamp.packId)).toBe(true);
      expect(
        PURCHASABLE_STAMP_TEXTS.some((entry) => entry.id === stamp.id),
      ).toBe(false);
      for (const lang of SUPPORTED_LANGUAGES) {
        expect(getStampCaption(stamp.id, lang).trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("unlocks a pack caption with the archive, not with a purchase", () => {
    const packStamp = PACK_STAMP_TEXTS[0]!;
    const packId = packStamp.packId!;
    expect(isStampTextUnlocked(packStamp.id, [], [])).toBe(false);
    // Listing it as "owned" must not be enough — the archive is the entitlement.
    expect(isStampTextUnlocked(packStamp.id, [packStamp.id], [])).toBe(false);
    expect(isStampTextUnlocked(packStamp.id, [], [packId])).toBe(true);
  });

  it("unlocks bought captions and the default, and nothing unknown", () => {
    expect(isStampTextUnlocked(DEFAULT_STAMP_TEXT_ID, [], [])).toBe(true);
    expect(isStampTextUnlocked("storyteller", [], [])).toBe(false);
    expect(isStampTextUnlocked("storyteller", ["storyteller"], [])).toBe(true);
    expect(isStampTextUnlocked("gone", ["gone"], [])).toBe(false);
  });

  it("never sells the free default", () => {
    expect(getStampText(DEFAULT_STAMP_TEXT_ID).productId).toBeNull();
    expect(
      PURCHASABLE_STAMP_TEXTS.some((stamp) => stamp.id === DEFAULT_STAMP_TEXT_ID),
    ).toBe(false);
  });
});
