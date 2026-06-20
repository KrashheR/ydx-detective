import { motion } from 'framer-motion';
import type { Evidence, Language } from '../types';
import { loc, t } from '../i18n/ui';
import { EVIDENCE_ICON } from './icons';

interface Props {
  evidence: Evidence;
  lang: Language;
  viewed: boolean;
  stamped: boolean;
  onClick: () => void;
}

/** A single physical evidence artifact in the investigation grid. */
export function EvidenceCard({ evidence, lang, viewed, stamped, onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`relative flex min-h-[96px] flex-col gap-1 rounded-sm border bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-lift ${
        stamped ? 'border-danger ring-1 ring-danger' : 'border-black/10'
      }`}
    >
      {/* Stamped corner fold + watermark */}
      {stamped && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-0 w-0 border-l-[18px] border-t-[18px] border-l-transparent border-t-danger"
          />
          <span
            aria-hidden
            className="ink-stamp pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-danger/15"
            style={{ transform: 'rotate(-12deg)' }}
          >
            {t('markContradiction', lang)}
          </span>
        </>
      )}

      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          {EVIDENCE_ICON[evidence.type]}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink/50">
          {evidence.type.replace('_', ' ')}
        </span>
      </div>

      <span className="text-sm font-semibold leading-snug text-ink">
        {loc(evidence.title, lang)}
      </span>

      {/* Read indicator — drives the "approve requires full review" gate */}
      <span
        className={`mt-auto text-[11px] ${viewed ? 'text-ink/40' : 'text-accent'}`}
      >
        {viewed ? '✓' : '●'}
      </span>
    </motion.button>
  );
}
