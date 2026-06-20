import type { Language } from '../types';
import { t } from '../i18n/ui';

interface Props {
  lang: Language;
  canApprove: boolean;
  /** Reject stays clickable; the prompt is shown by the handler when unproven. */
  onApprove: () => void;
  onReject: () => void;
}

/** Dark verdict panel: prompt + twin payout buttons (Reject / Approve). */
export function VerdictPanel({ lang, canApprove, onApprove, onReject }: Props) {
  return (
    <div className="rounded-[10px] border border-border bg-surface p-4">
      <p className="mb-3 text-center text-xs text-text-muted">
        {t('verdictPrompt', lang)}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onReject}
          className="h-[54px] rounded-[9px] bg-danger text-sm font-bold uppercase tracking-wide text-white transition-[filter] hover:brightness-110"
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
