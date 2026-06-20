import type { Language } from '../types';
import { t } from '../i18n/ui';

interface Props {
  lang: Language;
  canApprove: boolean;
  /** Reject stays clickable; the prompt is shown by the handler when unproven. */
  onApprove: () => void;
  onReject: () => void;
}

/** Permanent twin-verdict panel: Approve (green) / Reject (red). */
export function VerdictPanel({ lang, canApprove, onApprove, onReject }: Props) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onApprove}
        disabled={!canApprove}
        title={canApprove ? undefined : t('reviewAllFirst', lang)}
        className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-md text-base font-semibold text-white transition-all active:scale-[0.98] ${
          canApprove
            ? 'bg-success hover:bg-success/90'
            : 'cursor-not-allowed bg-success/30'
        }`}
      >
        ✓ {t('approve', lang)}
      </button>
      <button
        type="button"
        onClick={onReject}
        className="flex h-14 flex-1 items-center justify-center gap-2 rounded-md bg-danger text-base font-semibold text-white transition-all hover:bg-danger/90 active:scale-[0.98]"
      >
        ✕ {t('reject', lang)}
      </button>
    </div>
  );
}
