import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { getStandardCases } from '../data/caseLoader';
import { t } from '../i18n/ui';
import type { InteractiveEvidence, InteractiveEvidenceProgress, ThermalScanEvidence } from '../types';
import { InteractiveEvidenceView, makeInteractiveProgress } from './InteractiveEvidence';

const TYPES = ['document_scan', 'thermal_scan', 'shadow_time_check', 'seal_match', 'surface_reveal'] as const;

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

function evidenceOf(type: typeof TYPES[number]): InteractiveEvidence {
  const evidence = getStandardCases().flatMap((item) => item.evidences).find((item) => item.type === type);
  if (!evidence) throw new Error(`Missing campaign evidence: ${type}`);
  return evidence as InteractiveEvidence;
}

function Harness({ evidence, lang = 'en' }: { evidence: InteractiveEvidence; lang?: 'en' | 'ar' }) {
  const [progress, setProgress] = useState<InteractiveEvidenceProgress>(() => makeInteractiveProgress(evidence.id));
  return <InteractiveEvidenceView evidence={evidence} progress={progress} lang={lang} onProgress={setProgress} />;
}

describe('interactive evidence renderers', () => {
  it.each(TYPES)('renders %s with shared three-level hints and reset', (type) => {
    const { container } = render(<Harness evidence={evidenceOf(type)} />);
    fireEvent.click(screen.getByRole('button', { name: /Hint 0\/3/ }));
    expect(screen.getByRole('button', { name: /Hint 1\/3/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t('interactiveReset', 'en') }));
    expect(screen.getByRole('button', { name: /Hint 0\/3/ })).toBeInTheDocument();
    expect(container.querySelector('section')).toHaveAttribute('dir', 'ltr');
  });

  it('restores progress and completes the first thermal scan by pointer-safe buttons', () => {
    const evidence = evidenceOf('thermal_scan') as ThermalScanEvidence;
    render(<Harness evidence={evidence} />);
    fireEvent.click(screen.getByRole('button', { name: t('interactiveThermal', 'en') }));
    fireEvent.click(screen.getByRole('button', { name: evidence.data.heatZones[0]!.labelEn! }));
    expect(screen.getByRole('status')).toHaveTextContent(t('interactiveComplete', 'en'));
  });

  it('uses RTL layout for Arabic without changing mechanics', () => {
    const { container } = render(<Harness evidence={evidenceOf('shadow_time_check')} lang="ar" />);
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
  });
});
