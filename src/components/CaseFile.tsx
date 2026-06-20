import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ActiveSession, Case, Language } from "../types";
import type { HintKind } from "../store/gameStore";
import { GAME_CONFIG } from "../config/gameConfig";
import { loc, t } from "../i18n/ui";
import { formatCaseLabel, tDifficulty } from "../utils/caseDisplay";
import { asset } from "../utils/asset";
import { EvidenceCard } from "./EvidenceCard";
import { VerdictPanel } from "./VerdictPanel";
import { Tooltip } from "./Tooltip";

interface Props {
  caseData: Case;
  session: ActiveSession | null;
  lang: Language;
  canApprove: boolean;
  canReject: boolean;
  /** Investigation budget for this case, or null if unlimited. */
  budget: number | null;
  /** Opens left before the budget is spent, or null if unlimited. */
  opensRemaining: number | null;
  /** True once a budgeted case has no opens left. */
  budgetExhausted: boolean;
  /** Spendable balance — gates whether a hint is bought with cash or an ad. */
  balance: number;
  onOpenEvidence: (id: string) => void;
  onBuyHint: (kind: HintKind) => void;
  onApprove: () => void;
  /** Returns false if rejection is unjustified, triggering the prompt. */
  onReject: () => boolean;
}

type Tab = "statement" | "evidence";

/** The active physical Case Folder — main column. */
export function CaseFile({
  caseData,
  session,
  lang,
  canApprove,
  canReject,
  budget,
  opensRemaining,
  budgetExhausted,
  balance,
  onOpenEvidence,
  onBuyHint,
  onApprove,
  onReject,
}: Props) {
  const [tab, setTab] = useState<Tab>("statement");
  const [toast, setToast] = useState<string | null>(null);
  const isDaily = caseData.type === "daily";

  // Hint state. Both hints reveal one evidence card's true status; Inspector
  // Note costs 20% of the claim, Witness Canvass is unlocked by a rewarded video.
  const noteCost = Math.round(
    caseData.claimAmount * GAME_CONFIG.hints.inspectorNoteClaimPct,
  );
  const canAffordNote = balance >= noteCost;
  const allRevealed =
    (session?.revealedEvidenceIds.length ?? 0) >= caseData.evidences.length;

  const stampedCount = session?.selectedEvidenceIds.length ?? 0;
  const evCount = caseData.evidences.length;

  const handleReject = () => {
    if (!onReject()) {
      setToast(t("rejectNeedsProof", lang));
      window.setTimeout(() => setToast(null), 3800);
    }
  };

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  /* ---------------------------------- Statement sheet ----------------------- */
  const statement = (
    <div
      className="overflow-hidden bg-paper shadow-doc"
      style={{ borderRadius: 7 }}
    >
      {/* Dark folder-edge header */}
      <div className="flex items-center justify-between bg-folder-edge px-[18px] py-[11px]">
        <span className="text-xs font-semibold tracking-[1px] text-white">
          {t("clientStatement", lang)}
        </span>
        <span className="font-mono text-[11px] text-white/70">
          {t("formCt1", lang)}
        </span>
      </div>

      <div className="p-5">
        {/* Client ID block */}
        <div className="flex items-center gap-3.5">
          {caseData.personImage ? (
            <img
              src={asset(caseData.personImage)}
              alt={loc(caseData.claim.person, lang)}
              className="h-[72px] w-[58px] shrink-0 rounded-sm border border-[#b8b1a0] object-cover"
            />
          ) : (
            <div
              className="flex h-[72px] w-[58px] shrink-0 items-center justify-center rounded-sm border border-[#b8b1a0] text-center"
              style={{
                background:
                  "repeating-linear-gradient(45deg,#d8d3c7 0 6px,#cfc9bb 6px 12px)",
              }}
            >
              <span className="font-mono text-[8px] font-medium text-[#8a8472]">
                ФОТО ID
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-serif text-lg font-semibold text-ink">
              {loc(caseData.claim.person, lang)}
            </div>
            <div className="mt-0.5 text-xs font-medium text-text-dim">
              {tDifficulty(caseData.difficulty, lang)}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded bg-[#e5e7eb] px-[7px] py-[3px] font-mono text-[11px] font-medium text-[#374151]">
                {formatCaseLabel(caseData, lang)}
              </span>
            </div>
          </div>
        </div>

        <div className="my-[18px] h-px bg-[#d1cfc8]" />

        <div className="mb-2 text-[11px] font-semibold tracking-[1px] text-text-muted">
          {t("circumstances", lang)}
        </div>
        <p
          className="m-0 font-serif text-[15px] leading-[1.7] text-ink"
          style={{ textWrap: "pretty" } as React.CSSProperties}
        >
          {loc(caseData.claim.story, lang)}
        </p>

        {/* Claim sum box */}
        <div className="mt-[18px] flex items-center justify-between gap-3 rounded-md border border-dashed border-[#c7c2b6] bg-white px-[15px] py-[13px]">
          <span className="text-xs font-medium text-text-dim">
            {t("claimLabel", lang)}
            {isDaily && <span className="ml-1 font-bold text-gold">×5</span>}
          </span>
          <span className="font-mono text-lg font-bold text-ink">
            {fmt(caseData.claimAmount)} ₽
          </span>
        </div>
      </div>
    </div>
  );

  /* ---------------------------------- Evidence grid ------------------------- */
  const evidence = (
    <div className="grid grid-cols-2 gap-3">
      {caseData.evidences.map((ev) => {
        const viewed = session?.viewedEvidenceIds.includes(ev.id) ?? false;
        return (
          <EvidenceCard
            key={ev.id}
            evidence={ev}
            lang={lang}
            viewed={viewed}
            stamped={session?.selectedEvidenceIds.includes(ev.id) ?? false}
            revealed={session?.revealedEvidenceIds.includes(ev.id) ?? false}
            // On a budgeted case, un-opened cards seal once the budget is spent.
            sealed={budgetExhausted && !viewed}
            onClick={() => onOpenEvidence(ev.id)}
          />
        );
      })}
    </div>
  );

  const materialsHeader = (
    <div className="my-[14px] flex items-center justify-between gap-2">
      <span className="text-xs font-semibold tracking-[1px] text-[#d1d5db]">
        {t("caseMaterials", lang)} · {evCount} {t("documents", lang)}
      </span>
      <div className="flex items-center gap-2.5">
        {/* Investigation-budget counter — only on budgeted cases */}
        {budget != null && (
          <span
            className={`font-mono text-[11px] font-semibold ${
              budgetExhausted ? "text-stamp" : "text-gold"
            }`}
            title={t("budgetHint", lang)}
          >
            🔎 {opensRemaining ?? 0} / {budget} {t("budgetChecks", lang)}
          </span>
        )}
        <span className="font-mono text-[11px] font-semibold text-stamp">
          {stampedCount} / {evCount} {t("marked", lang)}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div
      key={caseData.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative w-full max-w-[540px]"
    >
      {/* Case header row */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[13px] font-semibold text-text-muted">
          {formatCaseLabel(caseData, lang)} · {loc(caseData.title, lang)}
        </span>
        <span className="shrink-0 rounded-sm border border-stamp px-[7px] py-[3px] font-mono text-[10px] font-semibold text-stamp">
          {t("confidential", lang)}
        </span>
      </div>

      {/* Mobile tabs */}
      <div className="mb-3 flex border-b border-border md:hidden">
        {(["statement", "evidence"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 border-b-2 py-3 text-center text-xs font-semibold transition-colors ${
              tab === key
                ? "border-accent text-[#f3f4f6]"
                : "border-transparent text-text-dim"
            }`}
          >
            {key === "statement"
              ? t("statement", lang)
              : `${t("evidence", lang)} · ${stampedCount}/${evCount}`}
          </button>
        ))}
      </div>

      {/* Mobile: one panel at a time. Desktop: stacked. */}
      <div className="md:hidden">
        {tab === "statement" ? (
          statement
        ) : (
          <>
            {materialsHeader}
            {evidence}
          </>
        )}
      </div>
      <div className="hidden md:block">
        {statement}
        {materialsHeader}
        {evidence}
      </div>

      {/* Paid investigation hints (extended feature, styled to the desk) */}
      <div className="mt-[18px] rounded-[10px] border border-border bg-surface p-4">
        <div className="mb-3 text-[11px] font-semibold tracking-[1px] text-text-dim">
          {t("hints", lang)}
        </div>
        {allRevealed ? (
          <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-center text-sm text-text-muted">
            {t("allRevealed", lang)}
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Tooltip
              className="flex-1"
              label={
                canAffordNote
                  ? null
                  : t("tipNoteUnaffordable", lang).replace(
                      "{amount}",
                      fmt(noteCost),
                    )
              }
            >
              <button
                type="button"
                disabled={!canAffordNote}
                onClick={() => onBuyHint("note")}
                className="flex w-full items-center justify-between gap-2 rounded-[9px] border border-accent/50 px-3 py-2.5 text-sm font-medium text-[#e5e7eb] transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>{t("hintNote", lang)}</span>
                <span className="font-mono text-text-muted">₽{noteCost}</span>
              </button>
            </Tooltip>
            <button
              type="button"
              onClick={() => onBuyHint("canvass")}
              className="flex flex-1 items-center justify-between gap-2 rounded-[9px] border border-gold/50 px-3 py-2.5 text-sm font-medium text-[#e5e7eb] transition-colors hover:bg-gold/10 overflow-hidden"
            >
              <span>{t("hintCanvass", lang)}</span>
              <span className="whitespace-nowrap text-gold">
                ▶ {t("watchAd", lang)}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Verdict */}
      <div className="mt-[18px]">
        <VerdictPanel
          lang={lang}
          canApprove={canApprove}
          canReject={canReject}
          approveBlockedReason={
            budget != null
              ? t("tipApproveBudget", lang)
              : t("reviewAllFirst", lang)
          }
          onApprove={onApprove}
          onReject={handleReject}
        />
      </div>

      {/* Justification prompt toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="fixed bottom-[22px] left-1/2 z-[60] max-w-[86%] -translate-x-1/2 rounded-[9px] border border-stamp bg-surface-2 px-[18px] py-3 text-center text-[13px] font-medium leading-snug text-[#fee2e2] shadow-lift"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
