/**
 * Cosmetic ink captions for the contradiction stamp — static catalog data.
 *
 * The caption is what the player prints on an evidence card when marking it as
 * a contradiction. `classic` is the free default and deliberately reuses the
 * `contradiction` UI key, so the shipped stamp text stays in one place (i18n);
 * every other entry is a permanent Yandex IAP unlock.
 *
 * Runtime ownership lives in `PlayerStats.ownedStampTextIds` /
 * `activeStampTextId` — this file never holds player state.
 */
import { t } from "../i18n/ui";
import type { Language, LocalizedString } from "../types";

export interface StampText {
  readonly id: string;
  /**
   * Yandex IAP product id; `null` for the free default *and* for the captions
   * that come with an archive pack — those are never sold on their own.
   */
  readonly productId: string | null;
  /**
   * Archive pack that grants this caption. Set only on pack captions: ownership
   * is derived from `PlayerStats.archivePurchasedPackIds`, never persisted into
   * `ownedStampTextIds`, so buying the pack (or a bundle containing it) is the
   * single source of truth.
   */
  readonly packId?: string;
  /** Shown when the payments catalog is unavailable (offline / dev). */
  readonly fallbackPriceRub: number;
  /**
   * The printed ink caption. `null` on the default entry — it resolves through
   * the `contradiction` UI key instead of duplicating the translation here.
   */
  readonly caption: LocalizedString | null;
}

/** Free caption every player owns; never purchasable, never removable. */
export const DEFAULT_STAMP_TEXT_ID = "classic";

/**
 * Sticker price of every paid caption, in rubles. Captions are the Bureau's
 * cheapest impulse buy — they are primarily earned as a bundle bonus, and only
 * secondarily sold one at a time — so they all carry the same low price rather
 * than being individually tiered.
 */
export const STAMP_TEXT_PRICE_RUB = 49;

const l = (
  ru: string,
  en: string,
  tr: string,
  ar: string,
  kk: string,
): LocalizedString => ({ ru, en, tr, ar, kk });

export const STAMP_TEXTS: readonly StampText[] = [
  {
    id: DEFAULT_STAMP_TEXT_ID,
    productId: null,
    fallbackPriceRub: 0,
    caption: null,
  },
  {
    id: "storyteller",
    productId: "stamp.storyteller",
    fallbackPriceRub: STAMP_TEXT_PRICE_RUB,
    caption: l(
      "СКАЗОЧНИК",
      "STORYTELLER",
      "MASALCI",
      "راوي حكايات",
      "ЕРТЕКШІ",
    ),
  },
  {
    id: "cardboard-alibi",
    productId: "stamp.cardboard-alibi",
    fallbackPriceRub: STAMP_TEXT_PRICE_RUB,
    caption: l(
      "АЛИБИ ИЗ КАРТОНА",
      "CARDBOARD ALIBI",
      "KARTONDAN MAZERET",
      "حجة من ورق",
      "КАРТОН АЛИБИ",
    ),
  },
  {
    id: "well-well",
    productId: "stamp.well-well",
    fallbackPriceRub: STAMP_TEXT_PRICE_RUB,
    caption: l(
      "НУ-НУ…",
      "SURE, SURE…",
      "HADİ CANIM…",
      "حسنًا… حسنًا",
      "ИӘ, ИӘ…",
    ),
  },
  {
    id: "smells-fishy",
    productId: "stamp.smells-fishy",
    fallbackPriceRub: STAMP_TEXT_PRICE_RUB,
    caption: l(
      "ПАХНЕТ ЖАРЕНЫМ",
      "SMELLS FISHY",
      "İŞİN İÇİNDE İŞ VAR",
      "رائحة مريبة",
      "КҮМӘН ИІСІ",
    ),
  },
  {
    id: "doesnt-add-up",
    productId: "stamp.doesnt-add-up",
    fallbackPriceRub: STAMP_TEXT_PRICE_RUB,
    caption: l(
      "НЕ СХОДИТСЯ",
      "DOESN'T ADD UP",
      "HESAP TUTMUYOR",
      "لا يستقيم",
      "СӘЙКЕС ЕМЕС",
    ),
  },
  {
    id: "gotcha",
    productId: "stamp.gotcha",
    fallbackPriceRub: STAMP_TEXT_PRICE_RUB,
    caption: l(
      "ПОПАЛСЯ",
      "GOTCHA",
      "YAKALANDIN",
      "أمسكتك",
      "ҰСТАЛДЫҢ",
    ),
  },
  {
    id: "oops",
    productId: "stamp.oops",
    fallbackPriceRub: STAMP_TEXT_PRICE_RUB,
    caption: l(
      "ОПАНЬКИ",
      "OOPSIE",
      "HOPPALA",
      "أوبس",
      "ОЙПЫРМАЙ",
    ),
  },
  /* ---- Pack captions: no price of their own, unlocked with the archive ---- */
  {
    id: "pack-dacha-romashka",
    productId: null,
    packId: "dacha-romashka",
    fallbackPriceRub: 0,
    caption: l(
      "СОСЕДИ ВИДЕЛИ",
      "THE NEIGHBOURS SAW",
      "KOMŞULAR GÖRDÜ",
      "الجيران رأوا",
      "КӨРШІЛЕР КӨРДІ",
    ),
  },
  {
    id: "pack-night-train",
    productId: null,
    packId: "night-train",
    fallbackPriceRub: 0,
    caption: l(
      "БИЛЕТ НЕ ТОТ",
      "WRONG TICKET",
      "BİLET YANLIŞ",
      "التذكرة خاطئة",
      "БИЛЕТ БАСҚА",
    ),
  },
  {
    id: "pack-sanatorium-priboy",
    productId: null,
    packId: "sanatorium-priboy",
    fallbackPriceRub: 0,
    caption: l(
      "ДЕЛО НЕ СМОЕТ",
      "THE TIDE WON'T WASH IT",
      "DALGA SİLEMEZ",
      "الموج لا يمحوه",
      "ТОЛҚЫН ШАЙМАЙДЫ",
    ),
  },
];

/* --------------------------------- Ink ----------------------------------- */

/**
 * Ink colours the stamp impression can be cut in — catalog data, not a design
 * token: the value is picked by a runtime id, so it is applied as an inline
 * colour on the three impression sites (stamp modal, evidence card, workshop
 * preview) and never remaps the `stamp` token, which also paints unrelated
 * chrome (budget warnings, toasts, anomaly zones).
 *
 * Every ink is free — the paid axis is the caption, not the colour.
 */
export interface StampInk {
  readonly id: string;
  /** CSS colour of the impression. */
  readonly color: string;
  /** `UIKey` of the accessible label. */
  readonly labelKey: "workshopInkRed" | "workshopInkBlue" | "workshopInkGreen";
}

/** Archive red — what every profile printed before the ink picker existed. */
export const DEFAULT_STAMP_INK_ID = "red";

export const STAMP_INKS: readonly StampInk[] = [
  { id: DEFAULT_STAMP_INK_ID, color: "#9D281F", labelKey: "workshopInkRed" },
  { id: "blue", color: "#263E68", labelKey: "workshopInkBlue" },
  { id: "green", color: "#3F6847", labelKey: "workshopInkGreen" },
];

export function getStampInk(id: string | null | undefined): StampInk {
  return (
    STAMP_INKS.find((ink) => ink.id === id) ??
    STAMP_INKS.find((ink) => ink.id === DEFAULT_STAMP_INK_ID)!
  );
}

/** The impression colour for an ink id; `null`/unknown → archive red. */
export function getStampInkColor(id: string | null | undefined): string {
  return getStampInk(id).color;
}

/**
 * Purchasable entries only — the shop shelf, and the contents `bundles.ts`
 * prices. Pack captions carry no `productId`, so they stay out of every bundle
 * and can never inflate an advertised discount.
 */
export const PURCHASABLE_STAMP_TEXTS: readonly StampText[] = STAMP_TEXTS.filter(
  (stamp) => stamp.productId !== null,
);

/** Captions that come with an archive pack rather than with a price. */
export const PACK_STAMP_TEXTS: readonly StampText[] = STAMP_TEXTS.filter(
  (stamp) => stamp.packId !== undefined,
);

/**
 * Whether a caption may be inked. Free default → always; pack caption → only
 * with the pack bought; everything else → only when purchased. Kept here so the
 * store guard and the workshop grid can never disagree about ownership.
 */
export function isStampTextUnlocked(
  stampTextId: string,
  ownedStampTextIds: readonly string[],
  purchasedPackIds: readonly string[],
): boolean {
  if (stampTextId === DEFAULT_STAMP_TEXT_ID) return true;
  const stamp = STAMP_TEXTS.find((entry) => entry.id === stampTextId);
  if (!stamp) return false;
  if (stamp.packId !== undefined) return purchasedPackIds.includes(stamp.packId);
  return ownedStampTextIds.includes(stampTextId);
}

export function getStampText(id: string | null | undefined): StampText {
  return (
    STAMP_TEXTS.find((stamp) => stamp.id === id) ??
    STAMP_TEXTS.find((stamp) => stamp.id === DEFAULT_STAMP_TEXT_ID)!
  );
}

export function getStampTextByProductId(
  productId: string,
): StampText | undefined {
  return STAMP_TEXTS.find((stamp) => stamp.productId === productId);
}

/** The localized ink caption printed on a stamped evidence card. */
export function getStampCaption(
  id: string | null | undefined,
  lang: Language,
): string {
  const stamp = getStampText(id);
  return stamp.caption ? stamp.caption[lang] : t("contradiction", lang);
}

/**
 * Latin sub-line under the modal's big ink stamp — always the English caption,
 * mirroring the way real bilingual office stamps are cut. For `classic` this is
 * exactly `CONTRADICTION`, i.e. unchanged from before the shop existed.
 */
export function getStampSubline(id: string | null | undefined): string {
  return getStampCaption(id, "en").toUpperCase();
}
