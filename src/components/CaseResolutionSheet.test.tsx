import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CaseResolutionSheet } from './CaseResolutionSheet';
import { getCaseById } from '../data/caseLoader';
import { t } from '../i18n/ui';

const caseData = getCaseById('case-001')!;

describe('CaseResolutionSheet', () => {
  it('leads with the person, not the reasoning', () => {
    render(<CaseResolutionSheet caseData={caseData} lang="ru" onContinue={vi.fn()} />);

    expect(screen.getByText('Игорь Семёнов')).toBeInTheDocument();
    expect(
      screen.getByText(/Прорыв был настоящим/),
    ).toBeInTheDocument();
    // The chain stays behind its button until the player asks for it.
    expect(screen.queryByText(t('resolutionChainTitle', 'ru'))).not.toBeInTheDocument();
  });

  it('opens the compact разбор on demand', () => {
    render(<CaseResolutionSheet caseData={caseData} lang="ru" onContinue={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: t('resolutionWhy', 'ru') }));

    expect(screen.getByText(t('resolutionChainTitle', 'ru'))).toBeInTheDocument();
    expect(screen.getByText(/440 минут/)).toBeInTheDocument();
  });

  it('states the verdict with a glyph and words, never colour alone', () => {
    render(<CaseResolutionSheet caseData={caseData} lang="ru" onContinue={vi.fn()} />);

    expect(screen.getByText(t('resolutionStampRejected', 'ru'))).toBeInTheDocument();
  });

  it('shows no reward figures — those belong to the result sheet', () => {
    render(<CaseResolutionSheet caseData={caseData} lang="ru" onContinue={vi.fn()} />);

    expect(screen.queryByText(/₽/)).not.toBeInTheDocument();
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument();
  });

  it('hands control on via Continue', () => {
    const onContinue = vi.fn();
    render(<CaseResolutionSheet caseData={caseData} lang="ru" onContinue={onContinue} />);

    fireEvent.click(screen.getByRole('button', { name: t('resolutionContinue', 'ru') }));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
