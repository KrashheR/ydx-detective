import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Case, Language, RewardBreakdown } from '../types';
import { loc, t } from '../i18n/ui';

interface Props {
  result: RewardBreakdown;
  caseData: Case;
  lang: Language;
  /** Fired on mount so the host can flush an immediate cloud save. */
  onMounted: () => void;
  onNext: () => void;
  onBackToDesk: () => void;
}

/** Post-verdict resolution overlay with reward breakdown + explanation memo. */
export function ResultSheet({
  result,
  caseData,
  lang,
  onMounted,
  onNext,
  onBackToDesk,
}: Props) {
  // Case closure = critical save moment (un-debounced cloud write).
  useEffect(onMounted, [onMounted]);

  const win = result.verdictCorrect;
  const stampText = win
    ? caseData.truth === 'fraud'
      ? t('fraudExposed', lang)
      : t('caseClosed', lang)
    : t('investigatorError', lang);

  const positive = result.verdictComponent + result.proofComponent;
  const verdictPct = positive > 0 ? (result.verdictComponent / positive) * 100 : 0;
  const proofPct = positive > 0 ? (result.proofComponent / positive) * 100 : 0;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="paper-sheet w-full max-w-md overflow-hidden p-6"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        {/* Resolution stamp */}
        <motion.div
          className="mb-5 flex justify-center"
          initial={{ scale: 1.5, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: -6 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.15 }}
        >
          <span
            className={`ink-stamp rounded-md border-4 px-5 py-2 text-xl ${
              win ? 'border-success text-success' : 'border-danger text-danger'
            }`}
          >
            {stampText}
          </span>
        </motion.div>

        {/* Reward breakdown bar */}
        <div className="mb-2 h-4 w-full overflow-hidden rounded-full bg-black/10">
          <motion.div
            className="float-left h-full bg-success/70"
            initial={{ width: 0 }}
            animate={{ width: `${verdictPct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
          />
          <motion.div
            className="float-left h-full bg-accent/70"
            initial={{ width: 0 }}
            animate={{ width: `${proofPct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 1.1 }}
          />
        </div>

        <dl className="mb-5 space-y-1 text-sm text-ink/80">
          <Row label={t('verdictReward', lang)} value={result.verdictComponent} />
          <Row label={t('proofReward', lang)} value={result.proofComponent} />
          {result.penalty > 0 && (
            <Row label={t('penalty', lang)} value={-result.penalty} danger />
          )}
          {result.dailyMultiplierApplied > 1 && (
            <div className="flex justify-between text-gold">
              <dt>{t('dailyCase', lang)}</dt>
              <dd>×{result.dailyMultiplierApplied}</dd>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-black/10 pt-2 text-base font-bold text-ink">
            <dt>{t('rewardEarned', lang)}</dt>
            <dd>{result.total >= 0 ? '+' : ''}{result.total}</dd>
          </div>
        </dl>

        {/* Administrative explanation memo */}
        <div className="mb-5 rounded-sm bg-black/5 p-4">
          <ol className="list-decimal space-y-1 pl-5 font-serif text-[15px] leading-relaxed text-ink/90">
            {loc(caseData.explanation, lang).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBackToDesk}
            className="h-12 flex-1 rounded-md border border-ink/20 font-semibold text-ink hover:bg-black/5"
          >
            {t('backToDesk', lang)}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="h-12 flex-1 rounded-md bg-accent font-semibold text-white hover:bg-accent/90"
          >
            {t('nextCase', lang)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Row({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className={danger ? 'text-danger' : ''}>
        {value >= 0 ? '+' : ''}
        {value}
      </dd>
    </div>
  );
}
