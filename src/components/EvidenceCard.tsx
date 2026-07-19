import { motion } from "framer-motion";
import type { Evidence, Language } from "../types";
import { loc, t } from "../i18n/ui";
import { EVIDENCE_TAG_KEY } from "./icons";
import { Tooltip } from "./Tooltip";

interface Props {
  evidence: Evidence;
  lang: Language;
  viewed: boolean;
  stamped: boolean;
  /** True if a hint revealed this card's true contradiction status. */
  revealed: boolean;
  /**
   * True on a budgeted case when the investigation budget is spent and this
   * card was never opened — it can no longer be inspected.
   */
  sealed?: boolean;
  /**
   * True while a hint's targeting mode is active and this card is a valid
   * pick (not yet revealed) — draws the pulsing "choose me" outline and
   * accepts a click even when `sealed`, since hints don't spend budget opens.
   */
  targetable?: boolean;
  /** Visually de-emphasize cards that cannot be selected in hint targeting mode. */
  dimmed?: boolean;
  onClick: () => void;
}

/** A single physical evidence artifact in the investigation grid. */
export function EvidenceCard({
  evidence,
  lang,
  viewed,
  stamped,
  revealed,
  sealed = false,
  targetable = false,
  dimmed = false,
  onClick,
}: Props) {
  const unavailable = sealed && !targetable;
  return (
    <Tooltip
      className="block h-full"
      label={unavailable ? t("tipSealedCard", lang) : null}
    >
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={unavailable ? undefined : { y: -4 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={`relative flex h-full w-full flex-col overflow-hidden rounded-[7px] border border-black/[0.08] bg-paper p-3.5 text-left md:shadow-card transition-shadow ${
          unavailable
            ? "opacity-50 grayscale"
            : dimmed
              ? "opacity-45"
              : "hover:shadow-card-hover"
        }`}
      >
        {/* Targeting-mode pulse: an animated outline inviting the pick */}
        {targetable && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[7px] border-2 border-accent"
            animate={{
              boxShadow: [
                "0 0 0 0 rgb(var(--accent) / 0.5)",
                "0 0 0 7px rgb(var(--accent) / 0)",
              ],
            }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        {/* Mono chip-tag on the folder-edge colour */}
        <span className="inline-block w-fit rounded font-mono text-[10px] font-bold uppercase tracking-wider text-white bg-folder-edge px-2 py-[3px]">
          {t(EVIDENCE_TAG_KEY[evidence.type], lang)}
        </span>

        <span className="mt-2.5 font-serif text-sm font-semibold leading-snug text-ink">
          {loc(evidence.title, lang)}
        </span>

        {/* Hint reveal — shows the card's true status once a hint exposed it */}
        {revealed && (
          <span
            className={`mt-2 inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
              evidence.isContradiction
                ? "bg-stamp/10 text-stamp"
                : "bg-success/10 text-success"
            }`}
          >
            {evidence.isContradiction
              ? `⚠ ${t("revealedContradiction", lang)}`
              : `✓ ${t("revealedClean", lang)}`}
          </span>
        )}

        {/* CTA doubles as the read indicator (drives the "review-all" gate) */}
        <span
          className={`mt-3 text-[11px] font-semibold ${
            sealed ? "text-ink/40" : viewed ? "text-ink/45" : "text-accent"
          }`}
        >
          {sealed
            ? `🔒 ${t("sealedDossier", lang)}`
            : viewed
              ? `${t("viewedDossier", lang)} ✓`
              : `${t("openDossier", lang)} →`}
        </span>

        {/* Diagonal corner stamp once marked as a contradiction */}
        {stamped && (
          <span
            aria-hidden
            className="absolute right-[-26px] top-3 rotate-[34deg] bg-stamp px-7 py-[3px] font-mono text-[8px] font-bold uppercase tracking-wider text-white"
          >
            {t("contradiction", lang)}
          </span>
        )}
      </motion.button>
    </Tooltip>
  );
}
