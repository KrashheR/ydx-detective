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
  onApprove: () => void;
  onReject: () => void;
}

/** Dark verdict panel: prompt + twin payout buttons (Reject / Approve). */
export function VerdictPanel({
  lang,
  canApprove,
  canReject,
  approveBlockedReason,
  onApprove,
  onReject,
}: Props) {
  return (
    <div className="rounded-[10px] border border-border bg-surface p-4">
      <p className="mb-3 text-center text-xs text-text-muted">
        {t("verdictPrompt", lang)}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Tooltip
          className="block"
          label={canReject ? null : t("rejectNeedsProof", lang)}
        >
          <motion.button
            type="button"
            onClick={onReject}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={`h-[54px] w-full rounded-[9px] text-[13px] font-bold uppercase tracking-wide text-white transition-[filter] ${
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
            onClick={onApprove}
            disabled={!canApprove}
            whileTap={canApprove ? { scale: 0.96 } : undefined}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={`h-[54px] w-full rounded-[9px] text-[13px] font-bold uppercase tracking-wide text-white transition-[filter] ${
              canApprove
                ? "bg-success hover:brightness-110"
                : "cursor-not-allowed bg-success/30"
            }`}
          >
            {t("approvePayout", lang)}
          </motion.button>
        </Tooltip>
      </div>
    </div>
  );
}
