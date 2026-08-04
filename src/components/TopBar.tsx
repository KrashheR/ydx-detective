import { useEffect, useRef, useState, type ReactNode } from "react";
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

/** Ruled dossier card — the mark of the investigation route. */
function CaseFileMark({ current }: { current: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative h-[26px] w-[26px] shrink-0 rounded-[3px] border bg-topbar md:h-[30px] md:w-[30px] ${
        current ? "border-bureau-gold" : "border-topbar-chip-border"
      }`}
    >
      {[7, 12, 17].map((top) => (
        <span
          key={top}
          style={{ top }}
          className={`absolute inset-x-[5px] block h-px ${
            current ? "bg-bureau-gold/70" : "bg-topbar-tab-mark/40"
          }`}
        />
      ))}
    </span>
  );
}

/** Wax seal — the mark of the Bureau route, with its unseen-content dot. */
function BureauSealMark({
  current,
  hasNews,
}: {
  current: boolean;
  hasNews: boolean;
}) {
  return (
    <span aria-hidden className="relative shrink-0">
      <span
        className={`grid h-[26px] w-[26px] -rotate-[7deg] place-items-center rounded-full border font-mono text-[8px] font-bold md:h-[30px] md:w-[30px] ${
          current
            ? "border-bureau-gold text-bureau-gold"
            : "border-bureau-gold-dim text-topbar-tab-mark"
        }`}
      >
        AR
      </span>
      {hasNews && (
        <span className="absolute -end-px -top-px h-2 w-2 rounded-full bg-bureau-copper ring-1 ring-topbar-rail" />
      )}
    </span>
  );
}

interface NavTabProps {
  current: boolean;
  onClick: () => void;
  label: string;
  /** Second line — dropped on narrow desktop, where only the label fits. */
  sub: string;
  /** Below `md` the copy collapses to this one word under the mark. */
  short: string;
  accessibleName?: string;
  mark: ReactNode;
}

/**
 * One destination in the letterhead rail. Selected state is carried by the
 * raised plate plus the gold marker underneath — no full-perimeter frame, so
 * the header never competes with the case on screen.
 */
function NavTab({
  current,
  onClick,
  label,
  sub,
  short,
  accessibleName,
  mark,
}: NavTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      // The visible copy changes with width; the accessible name must not.
      aria-label={accessibleName ?? label}
      className={`relative flex shrink-0 items-center justify-center gap-1 rounded-[4px] px-2 transition-[background-color,color,transform] duration-150 active:translate-y-px md:justify-start md:gap-2.5 md:px-2.5 lg:px-3.5 ${
        current
          ? "bg-gradient-to-b from-topbar-tab-on to-topbar-tab-on-2 text-topbar-ink shadow-panel"
          : "text-topbar-tab-ink hover:bg-topbar-tab-hover hover:text-topbar-muted"
      }`}
    >
      {mark}
      <span
        aria-hidden
        className="hidden whitespace-nowrap text-start md:block"
      >
        <span className="block font-sans text-[11px] font-extrabold leading-tight lg:text-[13px]">
          {label}
        </span>
        <span
          className={`mt-[3px] hidden font-sans text-[7px] font-bold uppercase leading-tight tracking-[.08em] lg:block ${
            current ? "text-topbar-muted" : "text-topbar-tab-sub"
          }`}
        >
          {sub}
        </span>
      </span>
      <span
        aria-hidden
        className={`font-sans text-[8px] font-extrabold md:hidden ${
          current ? "text-topbar-ink" : ""
        }`}
      >
        {short}
      </span>
      {current && (
        <span
          aria-hidden
          className="absolute inset-x-[5px] -bottom-[4px] h-[2px] bg-gradient-to-r from-transparent via-bureau-gold to-transparent md:inset-x-[13px] md:-bottom-[5px] md:h-[3px]"
        />
      )}
    </button>
  );
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
    <header className="sticky top-0 z-40 flex h-[58px] shrink-0 items-center gap-1.5 border-b border-bureau-gold/35 bg-topbar px-2.5 text-topbar-ink shadow-panel md:h-[68px] md:gap-3 md:px-4 lg:gap-6 lg:px-6">
      {/* Brand — also the shortest way back to the open case */}
      <button
        type="button"
        onClick={onOpenInvestigation}
        // Not `shrink-0`: the brand is the only elastic element in the row, so
        // the title truncates instead of the nav rail overflowing the header.
        className="flex min-w-0 items-center gap-2.5 text-start"
        aria-label={t("navInvestigation", lang)}
      >
        <span className="grid h-[34px] w-[34px] -rotate-2 place-items-center rounded-[4px] border border-bureau-gold font-serif text-[13px] font-black text-bureau-gold md:h-[38px] md:w-[38px]">
          {t("brandShort", lang)}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate font-serif text-[13px] font-bold tracking-[.03em] md:text-[17px]">
            {t("brandTitle", lang)}
          </span>
          {/* Narrow desktop needs the width for the nav rail, not the tagline */}
          <span className="hidden font-mono text-[8px] uppercase tracking-[.18em] text-topbar-muted lg:block">
            {t("brandTagline", lang)}
          </span>
        </span>
      </button>

      {/* The two top-level destinations live in one sunken rail, so neither
          reads as a stray button next to an ad banner. Both survive on mobile
          as compact marks — a main route must never disappear at a width. */}
      <nav
        className="ms-auto flex h-full min-w-0 items-center"
        aria-label={t("navBureau", lang)}
      >
        {/* Content-sized tabs: each destination takes exactly the width its
            own label needs, so nothing is clipped and nothing is padded out. */}
        <div className="flex h-[48px] items-stretch gap-[2px] rounded-[7px] border border-bureau-gold/80 bg-topbar-rail p-[3px] shadow-panel md:h-[56px] md:gap-[3px] md:p-1">
          <NavTab
            current={!bureauOpen}
            onClick={onOpenInvestigation}
            label={t("navInvestigation", lang)}
            sub={t("navInvestigationSub", lang)}
            short={t("navInvestigationShort", lang)}
            mark={<CaseFileMark current={!bureauOpen} />}
          />
          <NavTab
            current={bureauOpen}
            onClick={onOpenBureau}
            label={t("navBureau", lang)}
            sub={t("navBureauSub", lang)}
            short={t("navBureauShort", lang)}
            // The NEW state is a dot on the seal; it has to reach screen
            // readers through the name, since the dot itself is decoration.
            accessibleName={
              bureauHasNews
                ? `${t("navBureau", lang)} — ${t("newArchive", lang)}`
                : t("navBureau", lang)
            }
            mark={
              <BureauSealMark current={bureauOpen} hasNews={bureauHasNews} />
            }
          />
        </div>
      </nav>

      <div className="flex shrink-0 items-center gap-1.5 lg:gap-2.5">
        <span className="hidden items-center gap-1.5 rounded-[4px] border border-topbar-chip-border bg-topbar-chip px-2 py-2 font-mono text-[12px] sm:flex lg:px-2.5">
          <span className="text-bureau-gold" aria-hidden>
            ★
          </span>
          {xp.toLocaleString("ru-RU")}
        </span>
        <span className="flex items-center gap-1.5 rounded-[4px] border border-topbar-chip-border bg-topbar-chip px-2 py-2 font-mono text-[11px] md:text-[12px] lg:px-2.5">
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
