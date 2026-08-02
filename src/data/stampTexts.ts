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
  /** Yandex IAP product id; `null` for the free default. */
  readonly productId: string | null;
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
    fallbackPriceRub: 79,
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
    fallbackPriceRub: 79,
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
    fallbackPriceRub: 79,
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
    fallbackPriceRub: 79,
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
    fallbackPriceRub: 79,
    caption: l(
      "НЕ СХОДИТСЯ",
      "DOESN'T ADD UP",
      "HESAP TUTMUYOR",
      "لا يستقيم",
      "СӘЙКЕС ЕМЕС",
    ),
  },
];

/** Purchasable entries only — the shop shelf. */
export const PURCHASABLE_STAMP_TEXTS: readonly StampText[] = STAMP_TEXTS.filter(
  (stamp) => stamp.productId !== null,
);

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
