import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ResultSheet } from './ResultSheet';
import { getCaseById } from '../data/caseLoader';
import { t } from '../i18n/ui';

const caseData = getCaseById('case-001')!;
/** Archive packs carry no `resolution` — their разбор falls back to `explanation`. */
const packCase = getCaseById('dacha-romashka-01')!;

const noop = () => undefined;

const renderSheet = (
  verdictCorrect: boolean,
  overrides: { onNext?: () => void; caseData?: typeof caseData } = {},
) => {
  const activeCase = overrides.caseData ?? caseData;
  const result = {
    verdictCorrect,
    verdictComponent: verdictCorrect ? 600 : 0,
    proofComponent: verdictCorrect ? 300 : 0,
    efficiencyComponent: 0,
    penalty: 0,
    falseStamps: 0,
    dailyMultiplierApplied: 1,
    bonusComponent: 0,
    bonusPct: 0,
    total: verdictCorrect ? 900 : -400,
    xpGained: 40,
    promotedToLevel: null,
    newAchievementIds: [],
    stampedEvidenceIds: verdictCorrect
      ? activeCase.evidences.filter((e) => e.isContradiction).map((e) => e.id)
      : [],
    mastery: 'none' as const,
  };

  return render(
    <ResultSheet
      result={result}
      caseData={activeCase}
      lang="ru"
      xpGained={result.xpGained}
      promotedToLevel={null}
      newAchievementIds={[]}
      onMounted={noop}
      onDoubleReward={noop}
      rewardDoubled={false}
      onNext={overrides.onNext ?? noop}
      onReplay={noop}
      onBackToDesk={noop}
    />,
  );
};

describe('ResultSheet', () => {
  it('closes the case in one sheet: the person, then the reward', () => {
    renderSheet(true);

    expect(screen.getByText('Игорь Семёнов')).toBeInTheDocument();
    expect(screen.getByText(/Прорыв был настоящим/)).toBeInTheDocument();
    // …and the numbers live in the same modal, not a second one.
    expect(screen.getByText(t('yourFee', 'ru'))).toBeInTheDocument();
    expect(screen.getByText(/\+40/)).toBeInTheDocument();
  });

  it('opens and closes the разбор drawer, closed by default', () => {
    renderSheet(true);

    const toggle = screen.getByRole('button', { name: t('resolutionWhy', 'ru') });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/440 минут/)).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/440 минут/)).toBeInTheDocument();

    // The header stays put, so what was opened can be shut again.
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('hides the post-mortem behind a drawer after a loss', () => {
    renderSheet(false);

    const toggle = screen.getByRole('button', { name: t('whatYouMissed', 'ru') });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(t('verdictItem', 'ru'))).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(t('verdictItem', 'ru'))).toBeInTheDocument();
  });

  it('renders the archive entry when the case carries one', () => {
    renderSheet(true);

    expect(screen.getByText(t('resolutionArchiveEntry', 'ru'))).toBeInTheDocument();
  });

  it('never hands over the closing line after a wrong verdict', () => {
    renderSheet(false);

    // Several closing lines contain an indirect confession.
    expect(screen.queryByText(/Прорыв был настоящим/)).not.toBeInTheDocument();
    expect(screen.getByText(t('whatYouMissed', 'ru'))).toBeInTheDocument();
    // The разбор still explains the case to a player who got it wrong.
    expect(
      screen.getByRole('button', { name: t('resolutionWhy', 'ru') }),
    ).toBeInTheDocument();
  });

  it('explains a pack case through its explanation lines when no chain is authored', () => {
    renderSheet(false, { caseData: packCase });

    const firstLine = packCase.explanation.ru[0]!;
    // Nothing stands open on the sheet…
    expect(screen.queryByText(firstLine)).not.toBeInTheDocument();
    // …but the разбор button still has something to show.
    fireEvent.click(screen.getByRole('button', { name: t('resolutionWhy', 'ru') }));
    expect(screen.getByText(firstLine)).toBeInTheDocument();
  });

  it('drops the truth block — the case is explained, not restated', () => {
    renderSheet(true);

    expect(screen.queryByText(t('truthOfCase', 'ru'))).not.toBeInTheDocument();
    expect(screen.queryByText(t('budgetSaved', 'ru'))).not.toBeInTheDocument();
  });

  it('moves on from a single action row — no second sheet in between', () => {
    const onNext = vi.fn();
    renderSheet(true, { onNext });

    expect(
      screen.getByRole('button', { name: `← ${t('backToDesk', 'ru')}` }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: `${t('nextCase', 'ru')} →` }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
