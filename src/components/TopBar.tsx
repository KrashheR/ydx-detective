import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Language } from "../types";
import { t } from "../i18n/ui";

interface Props {
  lang: Language;
  /** Cumulative career XP — the ★ resource chip. */
  xp: number;
  balance: number;
  /** True while a Bureau screen is open; flips which nav item reads as current. */
  bureauOpen: boolean;
  /** Bureau has something the player has not seen yet → NEW flag. */
  bureauHasNews: boolean;
  onOpenInvestigation: () => void;
  onOpenBureau: () => void;
  /**
   * Runs a restore. `ok` is false only when the payments API could not be
   * reached at all — a player who simply owns nothing gets `ok: true, count: 0`,
   * and the two must not read the same.
   */
  onRestorePurchases: () => Promise<{ ok: boolean; count: number }>;
  /** False off-Yandex or on an SDK build without the payments API. */
  paymentsAvailable: boolean;
}

/**
 * The department's letterhead: brand, the two top-level destinations
 * (investigation ⇄ Bureau of Special Cases), and the live resource chips.
 *
 * It is the only chrome that spans both the sepia desk and the dark Bureau, so
 * it keeps a single night-office palette on every screen.
 */
export function TopBar({
  lang,
  xp,
  balance,
  bureauOpen,
  bureauHasNews,
  onOpenInvestigation,
  onOpenBureau,
  onRestorePurchases,
  paymentsAvailable,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Click-away: a popover anchored in the header must not trap the whole page.
  useEffect(() => {
    if (!settingsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

  const handleRestore = async () => {
    setBusy(true);
    const { ok, count } = await onRestorePurchases();
    setBusy(false);
    setNotice(
      !ok
        ? t("platformUnavailable", lang)
        : count > 0
          ? t("purchaseRestored", lang)
          : t("purchaseRestoreEmpty", lang),
    );
  };

  return (
    <header className="sticky top-0 z-40 flex h-[58px] shrink-0 items-center gap-3 border-b border-topbar-line bg-topbar px-3 text-topbar-ink shadow-panel md:h-[68px] md:gap-6 md:px-6">
      {/* Brand — also the shortest way back to the open case */}
      <button
        type="button"
        onClick={onOpenInvestigation}
        className="flex shrink-0 items-center gap-2.5 text-start"
        aria-label={t("navInvestigation", lang)}
      >
        <span className="grid h-[34px] w-[34px] -rotate-2 place-items-center rounded-[4px] border border-bureau-gold font-serif text-[13px] font-black text-bureau-gold md:h-[38px] md:w-[38px]">
          {t("brandShort", lang)}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate font-serif text-[13px] font-bold tracking-[.03em] md:text-[17px]">
            {t("brandTitle", lang)}
          </span>
          <span className="hidden font-mono text-[8px] uppercase tracking-[.18em] text-topbar-muted md:block">
            {t("brandTagline", lang)}
          </span>
        </span>
      </button>

      <nav
        className="ms-auto flex h-full min-w-0 items-center gap-1.5"
        aria-label={t("navBureau", lang)}
      >
        <button
          type="button"
          onClick={onOpenInvestigation}
          aria-current={bureauOpen ? undefined : "page"}
          className={`hidden shrink-0 rounded-[3px] px-3.5 py-3 text-[13px] transition-colors md:block ${
            bureauOpen
              ? "text-topbar-muted hover:bg-white/[.06] hover:text-white"
              : "bg-white/[.06] text-white"
          }`}
        >
          {t("navInvestigation", lang)}
        </button>
        <button
          type="button"
          onClick={onOpenBureau}
          aria-current={bureauOpen ? "page" : undefined}
          // The label collapses to the seal below `md`; the accessible name
          // must stay the full destination on every width.
          aria-label={t("navBureau", lang)}
          className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-[3px] border border-bureau-gold/35 px-2.5 py-2 transition-colors md:px-3.5 ${
            bureauOpen ? "bg-white/[.08]" : "hover:bg-white/[.06]"
          }`}
        >
          <span
            className="grid h-[25px] w-[25px] shrink-0 -rotate-[7deg] place-items-center rounded-full border border-bureau-gold font-mono text-[8px] font-bold text-bureau-gold"
            aria-hidden
          >
            AR
          </span>
          <span className="hidden truncate text-[13px] font-bold text-bureau-gold md:inline">
            {t("navBureau", lang)}
          </span>
          {bureauHasNews && (
            <span className="rounded-[2px] bg-bureau-copper px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-white">
              {t("newArchive", lang)}
            </span>
          )}
        </button>
      </nav>

      <div className="flex shrink-0 items-center gap-1.5 md:gap-2.5">
        <span className="hidden items-center gap-1.5 rounded-[4px] border border-topbar-chip-border bg-topbar-chip px-2.5 py-2 font-mono text-[12px] sm:flex">
          <span className="text-bureau-gold" aria-hidden>
            ★
          </span>
          {xp.toLocaleString("ru-RU")}
        </span>
        <span className="flex items-center gap-1.5 rounded-[4px] border border-topbar-chip-border bg-topbar-chip px-2 py-2 font-mono text-[11px] md:px-2.5 md:text-[12px]">
          <span className="text-bureau-gold" aria-hidden>
            ₽
          </span>
          {balance.toLocaleString("ru-RU")}
        </span>

        <div className="relative hidden md:block" ref={settingsRef}>
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-label={t("settings", lang)}
            aria-expanded={settingsOpen}
            className="grid h-[38px] w-[38px] place-items-center rounded-[4px] border border-topbar-chip-border bg-topbar-chip text-[15px] text-topbar-muted transition-colors hover:text-topbar-ink"
          >
            ⚙
          </button>
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute end-0 top-[46px] w-[230px] rounded-[8px] border border-topbar-chip-border bg-topbar-chip p-2.5 shadow-lift"
              >
                <button
                  type="button"
                  disabled={busy || !paymentsAvailable}
                  onClick={() => void handleRestore()}
                  className="min-h-11 w-full rounded-[6px] border border-bureau-gold/40 px-3 text-[12px] font-semibold text-bureau-gold transition-colors hover:bg-white/[.06] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "…" : t("restorePurchases", lang)}
                </button>
                {notice && (
                  <p className="mt-2 text-center text-[11px] leading-snug text-topbar-muted">
                    {notice}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
