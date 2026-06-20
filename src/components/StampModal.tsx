import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Evidence, Language } from '../types';
import { loc, t } from '../i18n/ui';
import { EVIDENCE_TAG_KEY } from './icons';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface Props {
  evidence: Evidence | null;
  lang: Language;
  stamped: boolean;
  /** True if a paid "Inspector Note" hint revealed this card's true status. */
  revealed: boolean;
  onToggle: () => void;
  onClose: () => void;
}

/** Full-screen evidence viewer with the "Mark as Contradiction" toggle. */
export function StampModal({
  evidence,
  lang,
  stamped,
  revealed,
  onToggle,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = evidence
    ? `stamp-modal-title-${evidence.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    : undefined;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!evidence) return undefined;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [evidence]);

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => !element.hasAttribute('disabled'));

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (!firstElement || !lastElement) return;

    if (event.shiftKey && document.activeElement === dialog) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <AnimatePresence>
      {evidence && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-5"
          style={{ background: 'rgba(8,11,17,.8)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-full w-full max-w-[420px] flex-col overflow-auto bg-paper shadow-modal"
            style={{ borderRadius: 9 }}
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.2, 0.9, 0.3, 1] }}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleDialogKeyDown}
          >
            {/* Dark folder-edge header */}
            <div className="flex items-center justify-between gap-2 bg-folder-edge px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="rounded bg-white/[0.18] px-1.5 py-[3px] font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                  {t(EVIDENCE_TAG_KEY[evidence.type], lang)}
                </span>
                <span
                  id={titleId}
                  className="truncate text-[13px] font-semibold text-white"
                >
                  {loc(evidence.title, lang)}
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="px-1.5 text-lg leading-none text-white/85 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Document body + ink stamp overlay */}
            <div className="relative p-[18px]">
              {/* Inspector-note reveal: the card's true status, bought with a hint */}
              {revealed && (
                <div
                  className={`mb-3 rounded-md px-3 py-2 text-center font-mono text-xs font-semibold uppercase tracking-wide ${
                    evidence.isContradiction
                      ? 'bg-stamp/10 text-stamp'
                      : 'bg-success/10 text-success'
                  }`}
                >
                  {evidence.isContradiction
                    ? `⚠ ${t('revealedContradiction', lang)}`
                    : `✓ ${t('revealedClean', lang)}`}
                </div>
              )}

              <EvidenceBody evidence={evidence} lang={lang} />

              {stamped && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[42%]"
                  style={{ animation: 'stampIn .45s cubic-bezier(.2,1.3,.35,1)' }}
                >
                  <div
                    className="rounded-[5px] border-4 border-stamp px-[18px] py-2 text-center font-mono text-[22px] font-semibold uppercase tracking-wide text-stamp"
                    style={{
                      transform: 'translate(-50%,-50%) rotate(-13deg)',
                      opacity: 0.88,
                      background: 'rgba(255,255,255,.04)',
                    }}
                  >
                    {t('contradiction', lang)}
                    <div className="mt-0.5 text-[10px] tracking-[4px]">
                      CONTRADICTION
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mark / unmark toggle */}
            <div className="px-[18px] pb-[18px]">
              <button
                type="button"
                onClick={onToggle}
                className={`h-[50px] w-full rounded-[9px] border-2 border-stamp text-[13px] font-bold uppercase tracking-wide transition-all ${
                  stamped ? 'bg-stamp text-white' : 'bg-transparent text-stamp'
                }`}
              >
                {stamped
                  ? t('contradictionMarked', lang)
                  : t('markAsContradiction', lang)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Renders the document body styled to its evidence type (data-driven). */
function EvidenceBody({ evidence, lang }: { evidence: Evidence; lang: Language }) {
  const content = loc(evidence.content, lang);
  const lines = Array.isArray(content) ? content : [content];

  // GPS / tracker route — map placeholder + a mono coordinate table.
  if (evidence.type === 'gps') {
    return (
      <>
        <div
          className="flex h-[130px] items-center justify-center overflow-hidden rounded-md border border-[#c2c7ce]"
          style={{
            background:
              'repeating-linear-gradient(45deg,#dfe3e8 0 8px,#d6dbe1 8px 16px)',
          }}
        >
          <span className="font-mono text-[11px] text-ink/50">[ GPS ]</span>
        </div>
        <div className="mt-3 font-mono text-xs text-ink/90">
          {lines.map((line, i) => (
            <div
              key={i}
              className="flex justify-between gap-3 border-b border-black/10 py-[5px] last:border-0"
            >
              <span>{line}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Photo / camera still — polaroid placeholder + serif caption.
  if (evidence.type === 'photo' || evidence.type === 'camera_recording') {
    return (
      <div
        className="rounded-md border border-black/10 bg-white px-3 pt-3 shadow-sm"
        style={{ transform: 'rotate(-1.5deg)' }}
      >
        <div
          className="flex h-[150px] items-center justify-center rounded-sm"
          style={{
            background:
              'repeating-linear-gradient(45deg,#cfd3d8 0 9px,#c4c8cd 9px 18px)',
          }}
        >
          <span className="font-mono text-[11px] text-ink/50">[ 📷 ]</span>
        </div>
        <div className="px-1 pb-3.5 pt-2.5 font-serif text-[13px] text-ink/80">
          {lines.join(' ')}
        </div>
      </div>
    );
  }

  // Witness statement — serif quote with a stamp-coloured rule.
  if (evidence.type === 'witness_statement') {
    return (
      <div className="border-l-[3px] border-stamp bg-white px-4 py-3">
        {lines.map((line, i) => (
          <p
            key={i}
            className="mb-1.5 font-serif text-[15px] leading-relaxed text-ink/90 last:mb-0"
          >
            {line}
          </p>
        ))}
      </div>
    );
  }

  // Document / usage log — archive printout in a dashed mono box.
  return (
    <div className="rounded-md border border-dashed border-[#c7c2b6] bg-white p-4 font-mono text-[12.5px] leading-relaxed text-ink">
      {lines.map((line, i) => (
        <div
          key={i}
          className="border-b border-dashed border-black/10 py-1 last:border-0"
        >
          {line}
        </div>
      ))}
    </div>
  );
}
