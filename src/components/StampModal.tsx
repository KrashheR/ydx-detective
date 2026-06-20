import { AnimatePresence, motion } from 'framer-motion';
import type { Evidence, Language } from '../types';
import { loc, t } from '../i18n/ui';
import { EVIDENCE_ICON } from './icons';

interface Props {
  evidence: Evidence | null;
  lang: Language;
  stamped: boolean;
  onToggle: () => void;
  onClose: () => void;
}

/** Full-screen evidence viewer with the "Mark as Contradiction" toggle. */
export function StampModal({ evidence, lang, stamped, onToggle, onClose }: Props) {
  return (
    <AnimatePresence>
      {evidence && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="paper-sheet relative w-full max-w-md p-6"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-black/5"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="mb-1 flex items-center gap-2 text-sm uppercase tracking-wide text-ink/50">
              <span aria-hidden>{EVIDENCE_ICON[evidence.type]}</span>
              {evidence.type.replace('_', ' ')}
            </div>
            <h3 className="mb-4 pr-8 text-xl font-semibold text-ink">
              {loc(evidence.title, lang)}
            </h3>

            {/* Enlarged document body + ink stamp overlay */}
            <div className="relative min-h-[160px] rounded-sm border border-black/10 bg-white p-4">
              <EvidenceBody evidence={evidence} lang={lang} />

              <AnimatePresence>
                {stamped && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 1.6, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: -8 }}
                    exit={{ scale: 1.3, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  >
                    <span className="ink-stamp rounded-md border-4 border-danger px-4 py-2 text-2xl text-danger">
                      ПРОТИВОРЕЧИЕ
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className={`mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-md border-2 text-base font-bold uppercase tracking-wide transition-colors ${
                stamped
                  ? 'border-danger bg-danger text-white'
                  : 'border-danger bg-transparent text-danger hover:bg-danger/5'
              }`}
            >
              🔴 {stamped ? t('unmarkContradiction', lang) : t('markContradiction', lang)}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EvidenceBody({ evidence, lang }: { evidence: Evidence; lang: Language }) {
  const content = loc(evidence.content, lang);
  if (Array.isArray(content)) {
    return (
      <ul className="space-y-1 font-mono text-sm text-ink/90">
        {content.map((line, i) => (
          <li key={i} className="border-b border-dashed border-black/10 pb-1">
            {line}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="font-serif text-[17px] leading-relaxed text-ink/90">{content}</p>
  );
}
