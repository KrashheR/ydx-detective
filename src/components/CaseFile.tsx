import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type {
  ActiveSession,
  Case,
  Language,
} from "../types";
import type { HintKind } from "../store/gameStore";
import { GAME_CONFIG } from "../config/gameConfig";
import { RTL_LANGUAGES, loc, t } from "../i18n/ui";
import { formatCaseLabel } from "../utils/caseDisplay";
import { asset } from "../utils/asset";
import { EvidenceCard } from "./EvidenceCard";
import { VerdictPanel } from "./VerdictPanel";
import { Tooltip } from "./Tooltip";
import { tapHaptic } from "../utils/haptics";

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
  /** Rewarded placements are deliberately unavailable on the Basic portal tier. */
  rewardedAdsAvailable: boolean;
  onOpenEvidence: (id: string) => void;
  onBuyHint: (kind: HintKind, targetEvidenceId?: string) => void;
  onApprove: () => void;
  /** Returns false if rejection is unjustified, triggering the prompt. */
  onReject: () => boolean;
  onBackToDesk?: () => void;
  onTabSwitch?: (from: Tab, to: Tab) => void;
}

type Tab = "statement" | "evidence";

/** Horizontal slide for the swipeable mobile panels; `dir` sets the direction. */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

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
  rewardedAdsAvailable,
  onOpenEvidence,
  onBuyHint,
  onApprove,
  onReject,
  onBackToDesk,
  onTabSwitch,
}: Props) {
  const isRTL = RTL_LANGUAGES.has(lang);
  const [tab, setTab] = useState<Tab>("statement");
  // Slide direction for the mobile panel swap: +1 → reveal evidence, −1 → statement.
  const [dir, setDir] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [claimPeekOpen, setClaimPeekOpen] = useState(false);
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);

  // Hint targeting mode: after clicking a hint button, the player picks which
  // card to reveal instead of getting "the next one in order". Esc or a click
  // outside the materials/hints region cancels without spending anything.
  const [targeting, setTargeting] = useState<HintKind | null>(null);
  const targetingScopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!targeting) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTargeting(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (
        targetingScopeRef.current &&
        !targetingScopeRef.current.contains(e.target as Node)
      ) {
        setTargeting(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [targeting]);

  const goToTab = (next: Tab) => {
    if (next === tab) return;
    onTabSwitch?.(tab, next);
    setDir(next === "evidence" ? 1 : -1);
    setTab(next);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const p = e.touches[0];
    if (!p) return;
    touchStart.current = { x: p.clientX, y: p.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    const p = e.changedTouches[0];
    if (!start || !p) return;
    const dx = p.clientX - start.x;
    const dy = p.clientY - start.y;
    // Only react to a clearly horizontal flick, so vertical scrolling is untouched.
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const forward = isRTL ? dx > 0 : dx < 0;
    goToTab(forward ? "evidence" : "statement");
  };
  const isDaily = caseData.type === "daily";
  const viewedIds = new Set(session?.viewedEvidenceIds ?? []);
  const visibleEvidences = caseData.evidences.filter((item) =>
    item.evidenceTier !== "arc" &&
    (item.unlocksAfterEvidenceIds?.every((id) => viewedIds.has(id)) ?? true),
  );

  // Hint state. Both hints reveal one evidence card's true status; Inspector
  // Note costs 20% of the claim, Witness Canvass is unlocked by a rewarded video.
  const noteCost = Math.round(
    caseData.claimAmount * GAME_CONFIG.hints.inspectorNoteClaimPct,
  );
  const canAffordNote = balance >= noteCost;
  const allRevealed =
    (session?.revealedEvidenceIds.length ?? 0) >= visibleEvidences.length;

  const evCount = visibleEvidences.length;
  const contradictionCount = visibleEvidences.filter((ev) => ev.isContradiction).length;

  const handleReject = () => {
    if (!onReject()) return showToast(t("rejectNeedsProof", lang));
    tapHaptic();
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3800);
  };

  const handleApprove = () => {
    tapHaptic();
    onApprove();
  };

  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const claimStory = loc(caseData.claim.story, lang);
  const claimExcerpt =
    claimStory.length > 260 ? `${claimStory.slice(0, 257).trimEnd()}…` : claimStory;

  /* ---------------------------------- Statement sheet ----------------------- */
  const statement = (
    <div
      className="overflow-hidden bg-paper md:shadow-doc"
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
        <div className="flex gap-[18px] items-start md:gap-[18px]">
          {/* Photo column */}
          <div className="w-[104px] md:w-[124px] shrink-0">
            {caseData.personImage ? (
              <div
                className="overflow-hidden rounded-[4px] border border-photo-border bg-photo-bg shadow-photo-id"
              >
                <img
                  src={asset(caseData.personImage)}
                  alt={loc(caseData.claim.person, lang)}
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1.2",
                    objectFit: "cover",
                    objectPosition: "center top",
                    display: "block",
                    filter: "saturate(.9) contrast(.97)",
                  }}
                />
              </div>
            ) : (
              <div
                className="flex items-center justify-center overflow-hidden rounded-[4px] border border-photo-border bg-photo-placeholder shadow-photo-id"
                style={{
                  aspectRatio: "1 / 1.2",
                }}
              />
            )}
            <div className="mt-[5px] text-center font-mono text-[7px] font-medium tracking-[1.5px] text-photo-caption md:text-[8px]">
              ФОТО · ID
            </div>
          </div>

          {/* Name + meta column */}
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[18px] font-semibold leading-[1.15] text-document-title md:text-[20px]">
              {loc(caseData.claim.person, lang)}
            </div>
            {caseData.client && (
              <div className="mt-[3px] text-[12px] font-medium text-document-muted">
                {loc(caseData.client.role, lang)}
              </div>
            )}
            {caseData.client?.meta && caseData.client.meta.length > 0 && (
              <div
                className="mt-[11px] grid md:mt-[14px]"
                style={{
                  gridTemplateColumns: "auto 1fr",
                  gap: "5px 12px",
                }}
              >
                {caseData.client.meta.map((row, i) => (
                  <Fragment key={i}>
                    <div className="whitespace-nowrap text-[12px] font-medium text-document-faint md:text-[11px]">
                      {loc(row.k, lang)}
                    </div>
                    <div className="font-mono text-[12px] font-semibold text-document-copy md:text-[11px]">
                      {loc(row.v, lang)}
                    </div>
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="my-[18px] h-px bg-document-rule" />

        <div className="mb-2 text-[12px] font-semibold tracking-[1px] text-text-muted md:text-[11px]">
          {t("circumstances", lang)}
        </div>
        <p
          className="m-0 font-serif text-[15px] leading-[1.7] text-ink"
          style={{ textWrap: "pretty" } as React.CSSProperties}
        >
          {loc(caseData.claim.story, lang)}
        </p>

        {/* {caseData.claimStatements && (
          <div className="mt-4 space-y-2" aria-label={t("statement", lang)}>
            {caseData.claimStatements.filter((item) => item.id !== "claim_main").map((item, index) => {
              const stamped = session?.stamps?.some((stamp) => stamp.statementId === item.id) ?? false;
              const active = selectedStatementId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedStatementId(item.id)}
                  className={`flex min-h-11 w-full items-start gap-3 rounded-md border px-3 py-2 text-start text-sm leading-relaxed transition-colors ${active ? "border-accent bg-accent/10 text-ink" : "border-document-dash bg-white text-text-light"}`}
                >
                  <span className="font-mono text-xs font-bold text-text-muted">{index + 1}.</span>
                  <span className="flex-1">{loc(item.text, lang)}</span>
                  {stamped && <span className="rotate-[-8deg] border-2 border-stamp px-1 font-mono text-[9px] font-bold text-stamp">✓</span>}
                </button>
              );
            })}
          </div>
        )} */}

        {/* Claim sum box */}
        <div className="mt-[18px] flex items-center justify-between gap-3 rounded-md border border-dashed border-document-dash bg-white px-[15px] py-[13px]">
          <span className="text-xs font-medium text-text-dim">
            {t("claimLabel", lang)}
            {isDaily && <span className="ml-1 font-bold text-gold">×2</span>}
          </span>
          <span className="font-mono text-lg font-bold text-ink">
            {fmt(caseData.claimAmount)} $
          </span>
        </div>
      </div>
    </div>
  );

  /* ---------------------------------- Evidence grid ------------------------- */
  const evidence = (
    <div className="grid grid-cols-2 gap-3">
      {visibleEvidences.map((ev) => {
        const viewed = session?.viewedEvidenceIds.includes(ev.id) ?? false;
        const revealed = session?.revealedEvidenceIds.includes(ev.id) ?? false;
        const targetable = targeting != null && !revealed;
        return (
          <EvidenceCard
            key={ev.id}
            evidence={ev}
            lang={lang}
            viewed={viewed}
            stamped={session?.selectedEvidenceIds.includes(ev.id) ?? false}
            revealed={revealed}
            // On a budgeted case, un-opened cards seal once the budget is spent.
            sealed={budgetExhausted && !viewed}
            targetable={targetable}
            dimmed={targeting != null && !targetable}
            onClick={() => {
              if (targeting) {
                if (!targetable) return;
                onBuyHint(targeting, ev.id);
                setTargeting(null);
                return;
              }
              onOpenEvidence(ev.id);
            }}
          />
        );
      })}
    </div>
  );

  const materialsHeader = (
    <div className="my-[14px] flex items-center justify-between gap-2">
      <span className="text-xs font-semibold tracking-[1px] text-text-light">
        {t("caseMaterials", lang)} · {evCount} {t("documents", lang)}
      </span>
      <div className="flex items-center gap-2.5">
        {/* Investigation-budget counter — only on budgeted cases */}
        {budget != null ? (
          <span
            className={`rounded border border-border bg-paper px-2 py-1 font-mono text-[14px] font-semibold leading-none shadow-sm ${
              budgetExhausted ? "text-stamp" : "text-gold"
            }`}
            title={t("budgetHint", lang)}
          >
            🔎 {opensRemaining ?? 0} / {budget} {t("budgetChecks", lang)}
          </span>
        ) : (
          <span className="font-mono text-[12px] font-semibold text-text-muted">
            {t("viewedCount", lang)} {session?.viewedEvidenceIds.length ?? 0}/{evCount}
          </span>
        )}
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
      {/* ── Desktop header: pill + breadcrumb + badge ── */}
      <div className="mb-3 hidden items-center justify-between gap-2 md:flex">
        <div className="flex min-w-0 items-center gap-3">
          {onBackToDesk && (
            <button
              type="button"
              onClick={onBackToDesk}
              className="flex shrink-0 items-center gap-[7px] rounded-[9px] border border-border bg-surface py-[7px] pr-[13px] pl-[11px] text-[12.5px] font-semibold text-text-muted transition-colors hover:border-accent hover:bg-surface-2 hover:text-ink"
            >
              <span className="text-[15px] leading-none" aria-hidden>
                {isRTL ? "→" : "←"}
              </span>
              {t("backToDesk", lang)}
            </button>
          )}
          <span className="truncate font-mono text-[13px] font-semibold text-text-muted">
            {formatCaseLabel(caseData, lang)} · {loc(caseData.title, lang)}
          </span>
        </div>
        <span className="shrink-0 rounded-sm border border-stamp px-[7px] py-[3px] font-mono text-[10px] font-semibold text-stamp">
          {t("confidential", lang)}
        </span>
      </div>

      {/* ── Mobile header: app-bar pill + badge, then case label + title ── */}
      <div className="mb-3 border-b border-border pb-[14px] md:hidden">
        <div className="flex items-center justify-between gap-2">
          {onBackToDesk && (
            <button
              type="button"
              onClick={onBackToDesk}
              className="flex shrink-0 items-center gap-[7px] rounded-[11px] border border-border bg-surface py-[9px] pr-[15px] pl-[12px] text-[13px] font-bold text-text-muted active:bg-surface-2"
            >
              <span className="text-[17px] leading-none" aria-hidden>
                {isRTL ? "→" : "←"}
              </span>
              {t("backToDesk", lang)}
            </button>
          )}
          <span className="shrink-0 rounded-sm border border-stamp px-[8px] py-[4px] font-mono text-[9.5px] font-semibold text-stamp">
            {t("confidential", lang)}
          </span>
        </div>
        <div className="mt-[14px]">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[.1em] text-text-muted">
            {formatCaseLabel(caseData, lang)}
          </div>
          <div className="mt-[3px] font-serif text-[22px] font-bold leading-[1.15] text-ink">
            {loc(caseData.title, lang)}
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="mb-3 flex border-b border-border md:hidden">
        {(["statement", "evidence"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => goToTab(key)}
            className={`flex-1 border-b-2 py-3 text-center text-xs font-semibold transition-colors ${
              tab === key
                ? "border-accent text-text-light"
                : "border-transparent text-text-dim"
            }`}
          >
            {key === "statement"
              ? t("statement", lang)
              : t("evidence", lang)}
          </button>
        ))}
      </div>

      <div ref={targetingScopeRef}>
        {/* Mobile: one panel at a time, swipeable left/right. Desktop: stacked. */}
        <div
          className="overflow-hidden md:hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={dir}>
            <motion.div
              key={tab}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              {tab === "statement" ? (
                statement
              ) : (
                <>
                  <button
                    type="button"
                    aria-expanded={claimPeekOpen}
                    onClick={() => setClaimPeekOpen((open) => !open)}
                    className="mb-1 w-full rounded-[9px] border border-border bg-paper px-3.5 py-3 text-start shadow-panel"
                  >
                    <span className="flex items-center justify-between gap-3 text-[13px] font-bold text-text-light">
                      <span>{t("statementPeek", lang)}</span>
                      <span aria-hidden className="text-accent">{claimPeekOpen ? "−" : "+"}</span>
                    </span>
                    <span className="mt-1 block truncate font-serif text-[13px] text-ink">
                      {loc(caseData.claim.person, lang)} · {fmt(caseData.claimAmount)} $ · {claimStory}
                    </span>
                    <AnimatePresence initial={false}>
                      {claimPeekOpen && (
                        <motion.span
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="block overflow-hidden"
                        >
                          {caseData.client?.meta.map((row, index) => (
                            <span key={index} className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 text-[12px]">
                              <span className="text-text-muted">{loc(row.k, lang)}</span>
                              <span className="font-mono font-semibold text-ink">{loc(row.v, lang)}</span>
                            </span>
                          ))}
                          <span className="mt-3 block font-serif text-[13px] leading-relaxed text-ink">
                            {claimExcerpt}
                          </span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  {materialsHeader}
                  {evidence}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="hidden md:block">
          {statement}
          {materialsHeader}
          {evidence}
        </div>

        {/* Targeting-mode prompt — appears once a hint button starts aiming */}
        <AnimatePresence initial={false}>
          {targeting && (
            <motion.div
              initial={{ height: 0, marginTop: 0, opacity: 0 }}
              animate={{ height: "auto", marginTop: 14, opacity: 1 }}
              exit={{ height: 0, marginTop: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-4 right-4 top-3 z-[35] overflow-hidden md:static"
            >
              <motion.div
                initial={{ y: -6 }}
                animate={{ y: 0 }}
                exit={{ y: -6 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-center justify-between gap-2 rounded-[9px] border border-accent/60 bg-accent/10 px-3.5 py-2.5 text-sm font-medium text-text-light"
              >
                <span>{t("hintTargetPrompt", lang)}</span>
                <button type="button" onClick={() => setTargeting(null)} className="shrink-0 rounded-md border border-accent/40 px-3 py-1.5 text-[12px] font-bold text-accent">
                  {t("cancel", lang)}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  onClick={() => {
                    if (!canAffordNote) {
                      showToast(t("tipNoteUnaffordable", lang).replace("{amount}", fmt(noteCost)));
                      return;
                    }
                    goToTab("evidence");
                    setTargeting((cur) => (cur === "note" ? null : "note"));
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-[9px] border px-3 py-2.5 text-sm font-medium text-text-light transition-colors ${!canAffordNote ? "opacity-50" : ""} ${
                    targeting === "note"
                      ? "border-accent bg-accent/15"
                      : "border-accent/50 hover:bg-accent/10"
                  }`}
                >
                  <span>{t("hintNote", lang)}</span>
                  <span className="font-mono text-text-muted">${noteCost}</span>
                </button>
              </Tooltip>
              {rewardedAdsAvailable && <button
                type="button"
                onClick={() => {
                  goToTab("evidence");
                  setTargeting((cur) => (cur === "canvass" ? null : "canvass"));
                }}
                className={`flex flex-1 items-center justify-between gap-2 rounded-[9px] border px-3 py-2.5 text-sm font-medium text-text-light transition-colors overflow-hidden ${
                  targeting === "canvass"
                    ? "border-gold bg-gold/15"
                    : "border-gold/50 hover:bg-gold/10"
                }`}
              >
                <span>{t("hintCanvass", lang)}</span>
                <span className="whitespace-nowrap text-gold">
                  ▶ {t("watchAd", lang)}
                </span>
              </button>}
            </div>
          )}
        </div>
      </div>

      <div className="h-[88px] md:hidden" aria-hidden />
      <div className="mt-[18px]">
        <VerdictPanel
          variant="responsive"
          lang={lang}
          canApprove={canApprove}
          canReject={canReject}
          approveBlockedReason={budget != null ? t("tipApproveBudget", lang) : t("reviewAllFirst", lang)}
          stampedCount={session?.selectedEvidenceIds.length ?? 0}
          budget={budget}
          opensRemaining={opensRemaining}
          onBlocked={showToast}
          onApprove={handleApprove}
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
            className="fixed bottom-[104px] left-1/2 z-[60] max-w-[86%] -translate-x-1/2 rounded-[9px] border border-stamp bg-toast px-[18px] py-3 text-center text-[13px] font-medium leading-snug text-toast-ink shadow-lift md:bottom-[22px]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
