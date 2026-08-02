import { useState } from "react";
import { motion } from "framer-motion";
import type { Language } from "../types";
import type { PaymentsProduct } from "../services/platformAdapter";
import { t } from "../i18n/ui";
import {
  DEFAULT_STAMP_TEXT_ID,
  PURCHASABLE_STAMP_TEXTS,
  getStampCaption,
  getStampSubline,
  type StampText,
} from "../data/stampTexts";

interface Props {
  lang: Language;
  /** Stamp captions the player owns (the free default is always implied). */
  ownedStampTextIds: string[];
  /** Caption currently inked; `null` = the free default. */
  activeStampTextId: string | null;
  /** False off-Yandex or when the Payments API failed to init — buying is dead. */
  paymentsAvailable: boolean;
  /** Live Yandex prices keyed by product id; empty offline. */
  catalogByProductId: Record<string, PaymentsProduct>;
  onPurchase: (stamp: StampText) => Promise<boolean>;
  onEquip: (stampTextId: string | null) => void;
  onRestore: () => Promise<number>;
  onClose: () => void;
}

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  ru: "ru-RU",
  en: "en-US",
  tr: "tr-TR",
  ar: "ar-EG",
  kk: "kk-KZ",
};

function formatCurrency(value: number, lang: Language): string {
  return new Intl.NumberFormat(LOCALE_BY_LANGUAGE[lang], {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

/** The ink block as it will look on an evidence card — the whole product. */
function StampPreview({
  stampTextId,
  lang,
  muted,
}: {
  stampTextId: string;
  lang: Language;
  muted: boolean;
}) {
  const caption = getStampCaption(stampTextId, lang);
  return (
    <div
      aria-hidden
      className={`flex shrink-0 -rotate-[9deg] flex-col items-center whitespace-nowrap rounded-[4px] border-[3px] border-stamp px-3 py-1.5 text-center font-mono font-semibold uppercase text-stamp ${
        muted ? "opacity-40 grayscale" : "opacity-90"
      } ${caption.length > 13 ? "text-[11px]" : "text-[14px]"}`}
    >
      {caption}
      <span className="mt-0.5 text-[7px] tracking-[3px]">
        {getStampSubline(stampTextId)}
      </span>
    </div>
  );
}

/**
 * Stamp workshop — the cosmetic IAP shelf. Sells only the wording printed on
 * the contradiction stamp; it never touches the economy or the scoring.
 */
export function StampShopModal({
  lang,
  ownedStampTextIds,
  activeStampTextId,
  paymentsAvailable,
  catalogByProductId,
  onPurchase,
  onEquip,
  onRestore,
  onClose,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const owned = new Set(ownedStampTextIds);
  const activeId = activeStampTextId ?? DEFAULT_STAMP_TEXT_ID;

  const priceLabel = (stamp: StampText): string => {
    const product = stamp.productId
      ? catalogByProductId[stamp.productId]
      : undefined;
    return product?.price ?? formatCurrency(stamp.fallbackPriceRub, lang);
  };

  const handleBuy = async (stamp: StampText) => {
    if (!paymentsAvailable) {
      setNotice(t("stampPurchaseUnavailable", lang));
      return;
    }
    setBusyId(stamp.id);
    const ok = await onPurchase(stamp);
    setBusyId(null);
    setNotice(ok ? t("purchased", lang) : t("stampPurchaseFailed", lang));
  };

  const handleRestore = async () => {
    setBusyId("restore");
    const restored = await onRestore();
    setBusyId(null);
    setNotice(
      restored > 0
        ? t("purchaseRestored", lang)
        : t("stampPurchaseUnavailable", lang),
    );
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(8,11,17,.8)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex max-h-full w-full max-w-[420px] flex-col overflow-hidden bg-paper shadow-modal"
        style={{ borderRadius: 9 }}
        initial={{ y: 16, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.2, 0.9, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark folder-edge header */}
        <div className="flex items-center justify-between bg-folder-edge px-4 py-3">
          <span className="text-[13px] font-semibold text-white">
            {t("stampShop", lang)}
            <span className="ml-2 font-mono text-xs font-normal text-white/70">
              {owned.size + 1} / {PURCHASABLE_STAMP_TEXTS.length + 1}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close", lang)}
            className="px-1.5 text-lg leading-none text-white/85 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="overflow-auto p-[18px]">
          <p className="text-sm font-semibold text-ink">
            {t("stampShopSubtitle", lang)}
          </p>
          <p className="mt-1 text-xs text-ink/60">{t("stampShopNote", lang)}</p>

          <ul className="mt-4 space-y-2.5">
            {/* The free default always sits at the top of the shelf */}
            <li className="rounded-md border border-black/10 bg-black/[0.03] p-3">
              <div className="flex items-center gap-3">
                <StampPreview
                  stampTextId={DEFAULT_STAMP_TEXT_ID}
                  lang={lang}
                  muted={activeId !== DEFAULT_STAMP_TEXT_ID}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">
                    {t("stampClassicName", lang)}
                  </p>
                  <button
                    type="button"
                    disabled={activeId === DEFAULT_STAMP_TEXT_ID}
                    onClick={() => onEquip(null)}
                    className="mt-2 h-9 w-full rounded-[7px] border-2 border-stamp text-[12px] font-bold uppercase tracking-wide text-stamp disabled:border-black/15 disabled:text-ink/40"
                  >
                    {activeId === DEFAULT_STAMP_TEXT_ID
                      ? t("stampEquipped", lang)
                      : t("stampEquip", lang)}
                  </button>
                </div>
              </div>
            </li>

            {PURCHASABLE_STAMP_TEXTS.map((stamp) => {
              const isOwned = owned.has(stamp.id);
              const isActive = activeId === stamp.id;
              const busy = busyId === stamp.id;
              return (
                <li
                  key={stamp.id}
                  className={`rounded-md border p-3 ${
                    isActive
                      ? "border-stamp/50 bg-stamp/[0.06]"
                      : "border-black/10 bg-black/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <StampPreview
                      stampTextId={stamp.id}
                      lang={lang}
                      muted={!isOwned}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-ink/45">
                        {t("stampInkPreview", lang)}
                      </p>
                      {isOwned ? (
                        <button
                          type="button"
                          disabled={isActive}
                          onClick={() => onEquip(stamp.id)}
                          className="mt-2 h-9 w-full rounded-[7px] border-2 border-stamp text-[12px] font-bold uppercase tracking-wide text-stamp disabled:border-black/15 disabled:text-ink/40"
                        >
                          {isActive
                            ? t("stampEquipped", lang)
                            : t("stampEquip", lang)}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy || busyId !== null || !paymentsAvailable}
                          onClick={() => void handleBuy(stamp)}
                          className="mt-2 h-9 w-full rounded-[7px] border-2 border-stamp bg-stamp text-[12px] font-bold uppercase tracking-wide text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {busy ? "…" : priceLabel(stamp)}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            disabled={busyId !== null || !paymentsAvailable}
            onClick={() => void handleRestore()}
            className="mt-4 h-10 w-full rounded-[7px] border border-border text-[12px] font-semibold text-text-light disabled:opacity-45"
          >
            {t("restorePurchases", lang)}
          </button>

          {notice && (
            <p className="mt-3 text-center text-[12px] font-semibold text-ink/70">
              {notice}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
