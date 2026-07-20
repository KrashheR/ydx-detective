import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { getStandardCases } from '../data/caseLoader';
import { loc, t } from '../i18n/ui';
import { EvidenceLinkBoard } from './EvidenceLinkBoard';

const finalCase = () => {
  const value = getStandardCases().find((item) => item.finalSynthesis);
  if (!value?.finalSynthesis) throw new Error('Campaign final synthesis is missing');
  return { caseData: value, config: value.finalSynthesis };
};

describe('EvidenceLinkBoard', () => {
  it('reveals the conclusion only after the JSON-defined links are correct', () => {
    const { caseData, config } = finalCase();
    const attempt = vi.fn();
    render(<EvidenceLinkBoard caseData={caseData} config={config} lang="en" onAttempt={attempt} onSkip={vi.fn()} onComplete={vi.fn()} />);

    expect(screen.queryByText(loc(config.successConclusion, 'en'))).not.toBeInTheDocument();
    for (const [from, to] of config.requiredLinks) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(loc(config.nodes.find((n) => n.id === from)!.label, 'en')) }));
      fireEvent.click(screen.getByRole('button', { name: new RegExp(loc(config.nodes.find((n) => n.id === to)!.label, 'en')) }));
    }
    fireEvent.click(screen.getByRole('button', { name: t('interactiveCompare', 'en') }));

    expect(attempt).toHaveBeenCalledWith(config.requiredLinks, true);
    expect(screen.getByText(loc(config.successConclusion, 'en'))).toBeInTheDocument();
  });

  it('offers a non-blocking skip after the configured number of failures', () => {
    const { caseData, config } = finalCase();
    const skip = vi.fn();
    render(<EvidenceLinkBoard caseData={caseData} config={config} progress={{ completed: false, skipped: false, attempts: config.skippableAfterAttempts, links: [] }} lang="ar" onAttempt={vi.fn()} onSkip={skip} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: t('finalSynthesisSkip', 'ar') }));
    expect(skip).toHaveBeenCalledWith([]);
    expect(screen.getByRole('dialog').parentElement).toHaveAttribute('dir', 'rtl');
  });
});
