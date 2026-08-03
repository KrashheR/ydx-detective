/**
 * Cross-catalog invariant: every Yandex IAP product id the game can ever ask
 * `payments.purchase()` for must be creatable in the Yandex Games console.
 *
 * The console rejects a dot in a product id, and an id that cannot be created
 * there is an id nobody can buy — the purchase simply throws at runtime. The
 * safe subset is lowercase letters, digits and underscores, so that is what is
 * asserted here rather than "no dots": it also rules out spaces, uppercase and
 * punctuation before they reach a release.
 *
 * Catalogued in `docs/10-iap-catalog.md` — update it when this list changes.
 */
import { describe, expect, it } from "vitest";
import { BUNDLES } from "./bundles";
import { STAMP_TEXTS } from "./stampTexts";
import { ALL_THEMATIC_PACKS } from "./thematicPacks";
import { GAME_CONFIG } from "../config/gameConfig";

const CONSOLE_SAFE_ID = /^[a-z0-9_]+$/;

/** Every purchasable id: catalog entries plus the offer id each may carry. */
function collectProductIds(): string[] {
  const ids: string[] = [GAME_CONFIG.advertising.noAdsProductId];
  for (const pack of ALL_THEMATIC_PACKS) {
    // A null id marks a pack that is not on sale (see `RETIRED_THEMATIC_PACKS`).
    if (pack.productId) ids.push(pack.productId);
    if (pack.offer) ids.push(pack.offer.productId);
  }
  for (const bundle of BUNDLES) {
    ids.push(bundle.productId);
    if (bundle.offer) ids.push(bundle.offer.productId);
  }
  for (const stamp of STAMP_TEXTS) {
    if (stamp.productId) ids.push(stamp.productId);
  }
  return ids;
}

describe("Yandex product ids", () => {
  it("only uses characters the Yandex console accepts", () => {
    for (const productId of collectProductIds()) {
      expect(productId, `product id "${productId}"`).toMatch(CONSOLE_SAFE_ID);
    }
  });

  it("never reuses one product id for two entitlements", () => {
    const ids = collectProductIds();
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps bundle product ids separate from the persisted bundle ids", () => {
    // `purchasedBundleIds` stores `bundle.id`; renaming a product id for the
    // console must never reach the save file.
    for (const bundle of BUNDLES) {
      expect(bundle.productId).not.toBe(bundle.id);
      expect(bundle.id).toContain(".");
    }
  });
});
