import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ActiveSession, Case, Language } from '../types';
import { loc, t } from '../i18n/ui';
import { asset } from '../utils/asset';
import { EvidenceCard } from './EvidenceCard';
import { VerdictPanel } from './VerdictPanel';

interface Props {
  caseData: Case;
  session: ActiveSession | null;
  lang: Language;
  canApprove: boolean;
  onOpenEvidence: (id: string) => void;
  onApprove: () => void;
  /** Returns false if rejection is unjustified, triggering the prompt. */
  onReject: () => boolean;
}

type Tab = 'statement' | 'evidence';

/** The active physical Case Folder — main column. */
export function CaseFile({
  caseData,
  session,
  lang,
  canApprove,
  onOpenEvidence,
  onApprove,
  onReject,
}: Props) {
  const [tab, setTab] = useState<Tab>('statement');
  const [toast, setToast] = useState<string | null>(null);
  const isDaily = caseData.type === 'daily';

  const handleReject = () => {
    const ok = onReject();
    if (!ok) {
      setToast(t('rejectNeedsProof', lang));
      window.setTimeout(() => setToast(null), 3500);
    }
  };

  const statement = (
    <div>
      <div className="flex items-start gap-3">
        {caseData.personImage ? (
          <img
            src={asset(caseData.personImage)}
            alt={loc(caseData.claim.person, lang)}
            className="h-16 w-16 shrink-0 -rotate-1 rounded-sm border-2 border-ink/70 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 -rotate-1 items-center justify-center rounded-sm border-2 border-ink/70 bg-black/5 text-2xl">
            🧑
          </div>
        )}
        <div>
          <p className="text-lg font-semibold text-ink">
            {loc(caseData.claim.person, lang)}
          </p>
          <p className="text-sm text-ink/60">
            {t('claimLabel', lang)}: ₽ {caseData.claimAmount.toLocaleString()}
            {isDaily && <span className="ml-1 font-semibold text-gold">×5</span>}
          </p>
        </div>
      </div>
      <p className="mt-4 font-serif text-[17px] leading-relaxed text-ink/90">
        {loc(caseData.claim.story, lang)}
      </p>
    </div>
  );

  const evidence = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {caseData.evidences.map((ev) => (
        <EvidenceCard
          key={ev.id}
          evidence={ev}
          lang={lang}
          viewed={session?.viewedEvidenceIds.includes(ev.id) ?? false}
          stamped={session?.selectedEvidenceIds.includes(ev.id) ?? false}
          onClick={() => onOpenEvidence(ev.id)}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      key={caseData.id}
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`paper-sheet relative w-full max-w-[480px] p-6 ${
        isDaily ? 'border-l-4 border-gold' : ''
      }`}
    >
      {isDaily && (
        <span
          className="ink-stamp absolute -right-2 top-3 rotate-12 rounded border-2 border-gold px-2 py-0.5 text-xs text-gold"
          aria-hidden
        >
          {t('urgent', lang)}
        </span>
      )}

      {/* Folder tab header */}
      <div className="mb-4 border-b border-black/10 pb-3">
        <div className="font-mono text-xs uppercase text-ink/40">
          {caseData.id} · {caseData.difficulty}
        </div>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          {loc(caseData.title, lang)}
        </h1>
      </div>

      {/* Folder cover art */}
      <img
        src={asset(caseData.coverImage)}
        alt=""
        className="mb-4 h-28 w-full rounded-sm border border-black/10 object-cover"
      />

      {/* Mobile tabs */}
      <div className="mb-4 flex gap-1 rounded-md bg-black/5 p-1 md:hidden">
        {(['statement', 'evidence'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded py-2 text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-ink shadow-sm' : 'text-ink/50'
            }`}
          >
            {t(key, lang)}
          </button>
        ))}
      </div>

      {/* Mobile: one panel at a time. Desktop: stacked. */}
      <div className="md:hidden">{tab === 'statement' ? statement : evidence}</div>
      <div className="hidden md:block">
        {statement}
        <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-widest text-ink/50">
          {t('evidence', lang)}
        </h2>
        {evidence}
      </div>

      <div className="mt-6 border-t border-black/10 pt-4">
        <VerdictPanel
          lang={lang}
          canApprove={canApprove}
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
            className="absolute inset-x-4 bottom-4 rounded-md bg-ink px-4 py-3 text-center text-sm text-paper shadow-lift"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
