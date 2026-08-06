import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loc, t } from "../i18n/ui";
import type { ThematicPack } from "../data/thematicPacks";
import type { CaseSummary, Language } from "../types";

interface Props {
  /** The locked case the player pressed, or `null` when the modal is closed. */
  lockedCase: CaseSummary | null;
  lockedCaseIndex: number;
  pack: ThematicPack;
  totalCases: number;
  lang: Language;
  priceLabel: string;
  purchaseBusy: boolean;
  paymentsAvailable: boolean;
  /** True once today's rewarded archive unlock has been spent for this pack. */
  rewardedSpentToday: boolean;
  onPurchase: () => void;
  /** Rewarded-ad path out of the modal — the free way into this one case. */
  onUnlockWithAd: (caseData: CaseSummary) => void;
  onClose: () => void;
}

/**
 * The sealed-file dialog: pressing a locked case in an archive opens the
 * purchase here rather than doing nothing. It confirms *what the player is
 * buying* (the whole archive, not the one file they pressed) and offers the
 * rewarded-ad unlock as the free alternative, then hands over to the platform's
 * own payment window — this dialog never takes money itself.
 */
export function ArchivePurchaseModal({
  lockedCase,
  lockedCaseIndex,
  pack,
  totalCases,
  lang,
  priceLabel,
  purchaseBusy,
  paymentsAvailable,
  rewardedSpentToday,
  onPurchase,
  onUnlockWithAd,
  onClose,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const isOpen = lockedCase != null;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {lockedCase && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-modal-backdrop p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-purchase-title"
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[540px] overflow-y-auto overscroll-contain rounded-[10px] border border-bureau-gold/70 bg-bureau-2 p-6 text-center shadow-modal md:p-8"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: 0.24, ease: [0.2, 0.9, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Inner rule — the double border of an official form */}
            <span
              className="pointer-events-none absolute inset-1.5 rounded-[6px] border border-bureau-gold/20"
              aria-hidden
            />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label={t("close", lang)}
              className="absolute end-1 top-1 z-[2] flex h-11 w-11 items-center justify-center text-[20px] leading-none text-bureau-dim hover:text-bureau-ink"
            >
              ✕
            </button>

            <div className="relative">
              <span
                className="mx-auto grid h-[88px] w-[88px] -rotate-[6deg] place-items-center rounded-full border-2 border-dashed border-bureau-gold px-3 text-center font-serif text-[12px] font-bold uppercase leading-[1.15] text-bureau-gold"
                aria-hidden
              >
                {t("archiveModalStamp", lang)}
              </span>
              <div className="mt-4 font-mono text-[9px] font-black uppercase tracking-[.13em] text-bureau-gold-dim">
                {t("archiveModalEyebrow", lang)}
              </div>
              <h2
                id="archive-purchase-title"
                className="mt-1.5 font-serif text-[24px] font-bold leading-tight text-bureau-ink md:text-[30px]"
              >
                {t("archiveModalTitle", lang)}
              </h2>

              {/* Which file the player actually pressed */}
              <div className="mx-auto mt-4 max-w-[420px] border border-bureau-line bg-bureau-3 px-3 py-2.5">
                <div className="font-mono text-[8px] font-black uppercase tracking-[.12em] text-bureau-gold-dim">
                  {t("archiveCaseNumber", lang).replace(
                    "{n}",
                    String(lockedCaseIndex + 1).padStart(2, "0"),
                  )}
                </div>
                <div className="mt-1 font-serif text-[14px] font-bold text-bureau-ink">
                  {loc(lockedCase.title, lang)}
                </div>
              </div>

              <p className="mx-auto mt-4 max-w-[430px] text-[13px] leading-[1.6] text-bureau-muted">
                {t("archiveModalBody", lang)
                  .replace("{total}", String(totalCases))
                  .replace("{stamp}", loc(pack.stampTitle, lang))}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-bureau-ink">
                <Perk
                  label={t("archiveModalBenefitCases", lang).replace(
                    "{total}",
                    String(totalCases),
                  )}
                />
                <Perk label={t("archivePerkNoAds", lang)} />
                <Perk label={t("archivePerkForever", lang)} />
              </div>

              <button
                type="button"
                disabled={purchaseBusy || !paymentsAvailable}
                onClick={onPurchase}
                className="mt-6 min-h-[58px] w-full rounded-[8px] bg-gradient-to-b from-bureau-gold-lit to-bureau-gold px-5 text-[13px] font-black uppercase tracking-[.02em] text-ink shadow-[0_6px_0_rgba(55,24,13,.28)] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              >
                {purchaseBusy
                  ? "…"
                  : t("archiveModalCta", lang).replace("{price}", priceLabel)}
              </button>

              {/* The free way in: one case for one rewarded ad, once a day */}
              <button
                type="button"
                disabled={rewardedSpentToday}
                onClick={() => onUnlockWithAd(lockedCase)}
                className="mt-3 min-h-11 w-full rounded-[8px] border border-bureau-gold/35 px-4 text-[12px] font-semibold text-bureau-gold disabled:cursor-not-allowed disabled:opacity-55"
              >
                {rewardedSpentToday
                  ? t("nextUnlockTomorrow", lang)
                  : t("archiveModalUnlockThisWithAd", lang)}
              </button>

              <div className="mt-4 text-[9px] leading-snug text-bureau-dim">
                {t("archiveModalLegal", lang)}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Perk({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i className="not-italic font-black text-bureau-gold" aria-hidden>
        ✓
      </i>
      {label}
    </span>
  );
}
