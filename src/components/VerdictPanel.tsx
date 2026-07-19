import { motion } from "framer-motion";
import type { Language } from "../types";
import { t } from "../i18n/ui";
import { Tooltip } from "./Tooltip";

interface Props {
  lang: Language;
  canApprove: boolean;
  /** Reject is gated in the handler so an unjustified click can show guidance. */
  canReject: boolean;
  /**
   * Why approve is blocked, for the tooltip. Differs by case type (review the
   * whole file vs. open at least one card on budgeted cases), so it's computed
   * by the parent that knows the gate.
   */
  approveBlockedReason: string;
  variant?: "inline" | "bar" | "responsive";
  stampedCount?: number;
  budget?: number | null;
  opensRemaining?: number | null;
  onBlocked: (reason: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

/** Dark verdict panel: prompt + twin payout buttons (Reject / Approve). */
export function VerdictPanel({
  lang,
  canApprove,
  canReject,
  approveBlockedReason,
  variant = "inline",
  stampedCount = 0,
  budget = null,
  opensRemaining = null,
  onBlocked,
  onApprove,
  onReject,
}: Props) {
  const isBar = variant !== "inline";
  const isResponsive = variant === "responsive";
  const handleApprove = () => {
    if (!canApprove) {
      onBlocked(approveBlockedReason);
      return;
    }
    onApprove();
  };

  return (
    <div
      className={
        isResponsive
          ? "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-lift backdrop-blur-sm md:static md:rounded-[10px] md:border md:bg-surface md:p-4 md:shadow-none md:backdrop-blur-none"
          : isBar
          ? "border-t border-border bg-surface/95 px-3 pt-2 shadow-lift backdrop-blur-sm"
          : "rounded-[10px] border border-border bg-surface p-4"
      }
      style={variant === "bar" ? { paddingBottom: "max(10px, env(safe-area-inset-bottom))" } : undefined}
    >
      <p
        className={
          isResponsive
            ? "mb-2 text-center text-[12px] font-semibold text-text-muted md:mb-3 md:text-xs"
            : isBar
              ? "mb-2 text-center text-[12px] font-semibold text-text-muted"
              : "mb-3 text-center text-xs text-text-muted"
        }
      >
        {isResponsive ? (
          <>
            <span className="md:hidden">{`${t("markedCount", lang)}: ${stampedCount}${budget != null ? ` · 🔎 ${budget - (opensRemaining ?? 0)} / ${budget}` : ""}`}</span>
            <span className="hidden md:inline">{t("verdictPrompt", lang)}</span>
          </>
        ) : isBar ? (
          `${t("markedCount", lang)}: ${stampedCount}${budget != null ? ` · 🔎 ${budget - (opensRemaining ?? 0)} / ${budget}` : ""}`
        ) : (
          t("verdictPrompt", lang)
        )}
      </p>
      <div
        className={
          isResponsive
            ? "grid grid-cols-2 gap-2 md:gap-3"
            : isBar
              ? "grid grid-cols-2 gap-2"
              : "grid grid-cols-2 gap-3"
        }
      >
        <Tooltip
          className="block"
          label={canReject ? null : t("rejectNeedsProof", lang)}
        >
          <motion.button
            type="button"
            onClick={onReject}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={`h-[54px] w-full rounded-[9px] text-[15px] font-bold uppercase tracking-wide text-white transition-[filter] md:text-[13px] ${
              canReject
                ? "bg-danger hover:brightness-110"
                : "bg-danger/60 hover:brightness-110"
            }`}
          >
            {t("rejectPayout", lang)}
          </motion.button>
        </Tooltip>
        <Tooltip
          className="block"
          label={canApprove ? null : approveBlockedReason}
        >
          <motion.button
            type="button"
            onClick={handleApprove}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={`h-[54px] w-full rounded-[9px] text-[15px] font-bold uppercase tracking-wide text-white transition-[filter] md:text-[13px] ${
              canApprove
                ? "bg-success hover:brightness-110"
                : "bg-success/30"
            }`}
          >
            {t("approvePayout", lang)}
          </motion.button>
        </Tooltip>
      </div>
    </div>
  );
}
