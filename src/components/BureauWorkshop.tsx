import { useState } from "react";
import {
  DEFAULT_STAMP_TEXT_ID,
  STAMP_INKS,
  STAMP_TEXTS,
  getStampCaption,
  getStampInkColor,
  type StampText,
} from "../data/stampTexts";
import {
  STAMP_BUNDLE_ID,
  getBundle,
  getBundleDiscountPercent,
} from "../data/bundles";
import { t } from "../i18n/ui";
import type { Language } from "../types";

interface Props {
  lang: Language;
  ownedStampTextIds: string[];
  activeStampTextId: string | null;
  activeStampInkId: string | null;
  paymentsAvailable: boolean;
  priceLabel: (stamp: StampText) => string;
  bundlePriceLabel: (bundleId: string) => string;
  busyId: string | null;
  onPurchase: (stamp: StampText) => void;
  onEquip: (stampTextId: string | null) => void;
  onPickInk: (stampInkId: string | null) => void;
  onPurchaseBundle: (bundleId: string) => void;
}

/**
 * The workshop bench: a real claim form on the left with the stamp printed on
 * it, the caption catalogue on the right. Selecting a caption the player does
 * not own only changes the preview — it never counts as owning it.
 */
export function BureauWorkshop({
  lang,
  ownedStampTextIds,
  activeStampTextId,
  activeStampInkId,
  paymentsAvailable,
  priceLabel,
  bundlePriceLabel,
  busyId,
  onPurchase,
  onEquip,
  onPickInk,
  onPurchaseBundle,
}: Props) {
  const owned = new Set([DEFAULT_STAMP_TEXT_ID, ...ownedStampTextIds]);
  const equippedId = activeStampTextId ?? DEFAULT_STAMP_TEXT_ID;
  // What the paper shows: the equipped caption until the player tries another on.
  const [previewId, setPreviewId] = useState<string | null>(null);
  const shownId = previewId ?? equippedId;
  const inkColor = getStampInkColor(activeStampInkId);
  const caption = getStampCaption(shownId, lang);

  const stampBundle = getBundle(STAMP_BUNDLE_ID);
  const bundleOwned =
    stampBundle != null &&
    stampBundle.stampTextIds.every((id) => owned.has(id));

  return (
    <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 pb-14 pt-7 md:px-[5vw] lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]">
      {/* ------------------------------ Bench ------------------------------ */}
      <section className="relative">
        <span className="absolute -top-[11px] start-5 z-[2] bg-bureau-gold-dim px-3 py-1.5 font-mono text-[8px] font-black uppercase tracking-[.08em] text-ink shadow-card">
          {t("workshopFittingRoom", lang)}
        </span>
        <div className="flex items-center justify-between bg-bureau-paper-2 px-5 pb-3 pt-6 font-mono text-[9px] font-black uppercase tracking-[.1em] text-text-muted">
          <span>{t("workshopPreviewLabel", lang)}</span>
          <span className="hidden font-normal normal-case tracking-normal sm:inline">
            {t("workshopPreviewNote", lang)}
          </span>
        </div>

        <div className="relative mx-2.5 min-h-[400px] -rotate-[.35deg] bg-paper px-7 py-10 shadow-folder md:min-h-[470px] md:px-11 md:py-12">
          <span
            className="pointer-events-none absolute inset-2.5 border border-border"
            aria-hidden
          />
          <small className="font-mono text-[8px] font-bold uppercase tracking-[.06em] text-text-muted">
            {t("workshopPaperNumber", lang)}
          </small>
          <h2 className="mt-3 font-serif text-[19px] font-bold text-ink md:text-[21px]">
            {t("workshopPaperTitle", lang)}
          </h2>
          <p className="mt-4 text-[13px] leading-[1.8] text-ink/80">
            {t("workshopPaperBody", lang)}
          </p>

          <div
            className="absolute start-1/2 top-[58%] max-w-[82%] -translate-x-1/2 -translate-y-1/2 -rotate-[7deg] border-[5px] border-double px-4 py-3 text-center font-mono text-[clamp(15px,2vw,26px)] font-black uppercase opacity-[.82]"
            style={{ borderColor: inkColor, color: inkColor }}
            aria-hidden
          >
            {caption}
          </div>

          <div className="absolute bottom-10 end-8 text-[11px] text-ink/70">
            {t("workshopPaperSignature", lang)}
          </div>
        </div>

        {/* Ink colour — free cosmetics, applies instantly everywhere */}
        <div className="mx-1.5 mt-0 flex flex-wrap items-center gap-2 rotate-[.15deg] bg-bureau-paper-2 px-4 py-3.5">
          {STAMP_INKS.map((ink) => {
            const active = getStampInkColor(activeStampInkId) === ink.color;
            return (
              <button
                key={ink.id}
                type="button"
                aria-label={t(ink.labelKey, lang)}
                aria-pressed={active}
                onClick={() => onPickInk(ink.id)}
                className="grid h-11 w-11 place-items-center"
              >
                <span
                  className={`h-[26px] w-[26px] rounded-full border-[3px] border-surface-2 ${
                    active
                      ? "shadow-[0_0_0_2px_#332A20]"
                      : "shadow-[0_0_0_1px_#9C8C6C]"
                  }`}
                  style={{ background: ink.color }}
                />
              </button>
            );
          })}
          <span className="ms-1 font-mono text-[9px] text-text-muted">
            {t("workshopInkColor", lang)}
          </span>
        </div>
      </section>

      {/* ---------------------------- Catalogue ---------------------------- */}
      <section className="relative">
        <span className="absolute -top-[11px] start-5 z-[2] bg-bureau-gold-dim px-3 py-1.5 font-mono text-[8px] font-black uppercase tracking-[.08em] text-ink shadow-card">
          {t("workshopCatalogTab", lang)}
        </span>
        <div className="bg-bureau-paper-2 px-4 pb-5 pt-7 text-ink shadow-folder md:px-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[9px] font-black uppercase tracking-[.13em] text-bureau-copper">
                {t("workshopCollection", lang)}
              </div>
              <h2 className="mt-1 font-serif text-[22px] font-bold">
                {t("workshopChooseStamp", lang)}
              </h2>
            </div>
            <span className="shrink-0 font-mono text-[10px] text-text-muted">
              {owned.size} / {STAMP_TEXTS.length}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-3">
            {STAMP_TEXTS.map((stamp) => {
              const isOwned = owned.has(stamp.id);
              const isEquipped = equippedId === stamp.id;
              const isPreviewing = !isEquipped && previewId === stamp.id;
              const busy = busyId === stamp.id;
              const label = getStampCaption(stamp.id, lang);
              return (
                <button
                  key={stamp.id}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (isOwned) {
                      setPreviewId(null);
                      onEquip(stamp.id === DEFAULT_STAMP_TEXT_ID ? null : stamp.id);
                      return;
                    }
                    // Not owned: first tap tries it on, second tap buys it.
                    if (previewId === stamp.id) onPurchase(stamp);
                    else setPreviewId(stamp.id);
                  }}
                  className={`relative flex min-h-[142px] flex-col items-center justify-center gap-2.5 p-3 text-center shadow-card transition-transform hover:-translate-y-[3px] disabled:cursor-wait ${
                    isEquipped
                      ? "bg-[#F5EAD3] shadow-[inset_0_0_0_2px_#8D412D,0_7px_13px_rgba(50,35,18,.22)]"
                      : isPreviewing
                        ? "bg-[#F3E6CA] shadow-[inset_0_0_0_2px_#AD7741,0_7px_13px_rgba(50,35,18,.22)]"
                        : "bg-[#EADFC5]"
                  }`}
                >
                  {(isEquipped || isPreviewing) && (
                    <span
                      className={`absolute end-1.5 top-2 rotate-[4deg] px-1.5 py-1 font-mono text-[6px] font-bold uppercase text-white ${
                        isEquipped ? "bg-success" : "bg-bureau-gold-dim"
                      }`}
                    >
                      {isEquipped
                        ? t("workshopStampInUse", lang)
                        : t("workshopStampFitting", lang)}
                    </span>
                  )}
                  <span
                    className={`-rotate-[6deg] whitespace-nowrap border-[3px] border-double px-2 py-2 font-mono text-[10px] font-black uppercase ${
                      isOwned ? "" : "opacity-45"
                    }`}
                    style={{ borderColor: inkColor, color: inkColor }}
                    aria-hidden
                  >
                    {label}
                  </span>
                  <b className="text-[11px] font-bold">{label}</b>
                  <small
                    className={`font-mono text-[9px] font-bold ${
                      isEquipped ? "text-success" : "text-bureau-copper"
                    }`}
                  >
                    {busy
                      ? "…"
                      : isEquipped
                        ? t("workshopStampInUse", lang)
                        : isOwned
                          ? t("stampEquip", lang)
                          : `${t("buyAction", lang)} · ${priceLabel(stamp)}`}
                  </small>
                </button>
              );
            })}
          </div>

          {/* Novelty-stamp bundle — the same captions, one purchase */}
          {stampBundle && !bundleOwned && (
            <div className="mt-4 flex flex-col items-start justify-between gap-3 bg-bureau-2 p-4 text-bureau-ink shadow-card sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-[45px] w-[45px] shrink-0 place-items-center rounded-full bg-[#8B3628] font-mono text-[13px] font-bold text-bureau-gold"
                  aria-hidden
                >
                  ×{stampBundle.stampTextIds.length}
                </span>
                <p className="m-0">
                  <small className="block font-mono text-[8px] font-bold uppercase tracking-[.06em] text-bureau-gold-dim">
                    {t("bundleStampsEyebrow", lang).replace(
                      "{percent}",
                      String(getBundleDiscountPercent(stampBundle)),
                    )}
                  </small>
                  <b className="block font-serif text-[15px] font-bold">
                    {t("bundleStampsTitle", lang)}
                  </b>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <strong className="font-serif text-[18px] font-bold">
                  {bundlePriceLabel(stampBundle.id)}
                </strong>
                <button
                  type="button"
                  disabled={busyId !== null || !paymentsAvailable}
                  onClick={() => onPurchaseBundle(stampBundle.id)}
                  className="min-h-11 shrink-0 rounded-[3px] bg-bureau-copper px-4 text-[11px] font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {busyId === stampBundle.id ? "…" : t("bundleBuy", lang)}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
