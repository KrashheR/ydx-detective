import type { Language } from '../types';
import { t } from '../i18n/ui';

interface Props {
  lang: Language;
  canApprove: boolean;
  /** Reject is gated in the handler so an unjustified click can show guidance. */
  canReject: boolean;
  onApprove: () => void;
  onReject: () => void;
}

/** Dark verdict panel: prompt + twin payout buttons (Reject / Approve). */
export function VerdictPanel({
  lang,
  canApprove,
  canReject,
  onApprove,
  onReject,
}: Props) {
  return (
    <div className="rounded-[10px] border border-border bg-surface p-4">
      <p className="mb-3 text-center text-xs text-text-muted">
        {t('verdictPrompt', lang)}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onReject}
          title={canReject ? undefined : t('rejectNeedsProof', lang)}
          className={`h-[54px] rounded-[9px] text-sm font-bold uppercase tracking-wide text-white transition-[filter] ${
            canReject
              ? 'bg-danger hover:brightness-110'
              : 'bg-danger/60 hover:brightness-110'
          }`}
        >
          {t('rejectPayout', lang)}
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={!canApprove}
          title={canApprove ? undefined : t('reviewAllFirst', lang)}
          className={`h-[54px] rounded-[9px] text-sm font-bold uppercase tracking-wide text-white transition-[filter] ${
            canApprove
              ? 'bg-success hover:brightness-110'
              : 'cursor-not-allowed bg-success/30'
          }`}
        >
          {t('approvePayout', lang)}
        </button>
      </div>
    </div>
  );
}
