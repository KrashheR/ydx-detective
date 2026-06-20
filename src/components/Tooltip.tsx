import { type ReactNode } from 'react';

interface Props {
  /**
   * Explanatory text — why the wrapped control is blocked and what to do to
   * unblock it. When null/empty the children render with no tooltip (so an
   * enabled control carries zero tooltip chrome).
   */
  label?: string | null;
  /** Layout classes for the wrapper box (e.g. 'block', 'w-full', 'flex-1'). */
  className?: string;
  /** Side the bubble appears on. Default 'top'. */
  side?: 'top' | 'bottom';
  children: ReactNode;
}

/**
 * Lightweight hover/focus tooltip for explaining *blocked* controls.
 *
 * Pure CSS (group-hover / group-focus-within) with no portal or JS state, so it
 * works even on `disabled` buttons: the pointer hovers this wrapper, not the
 * inert button underneath. Styled to the investigation desk — a dark panel with
 * light text — and sized for readability over spectacle.
 *
 * The wrapper is always rendered (even with no label) so a control's box model
 * doesn't shift between its enabled and blocked states.
 */
export function Tooltip({ label, className = '', side = 'top', children }: Props) {
  if (!label) return <span className={className}>{children}</span>;

  return (
    <span className={`group/tip relative ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-[80] w-max max-w-[230px] -translate-x-1/2 rounded-md border border-border bg-surface px-3 py-2 text-center text-[11px] font-medium leading-snug text-text-light opacity-0 shadow-lift transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 ${
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
      >
        {label}
      </span>
    </span>
  );
}
