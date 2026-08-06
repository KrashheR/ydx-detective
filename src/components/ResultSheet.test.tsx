import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ResultSheet } from './ResultSheet';
import { evaluateCaseSuccess, mandatoryContradictions } from '../engine/caseSuccessEngine';
import { getCaseById } from '../data/caseLoader';
import { t } from '../i18n/ui';

const caseData = getCaseById('case-001')!;
/** Archive packs carry no `resolution` — their разбор falls back to `explanation`. */
const packCase = getCaseById('dacha-romashka-01')!;

const noop = () => undefined;
const noopAd = () => undefined;

type Outcome = 'solved' | 'wrong_verdict' | 'insufficient';

const renderSheet = (
  outcome: Outcome,
  overrides: {
    onNext?: () => void;
    onReplay?: () => void;
    onDoubleReward?: (settle: (granted: boolean) => void) => void;
    onRevealClue?: (settle: (granted: boolean) => void) => void;
    clueRevealed?: boolean;
    rewardDoubled?: boolean;
    caseData?: typeof caseData;
  } = {},
) => {
  const activeCase = overrides.caseData ?? caseData;
  const verdictCorrect = outcome !== 'wrong_verdict';
  // "insufficient" = the right call with none of the mandatory stamps placed.
  const stampedEvidenceIds =
    outcome === 'solved'
      ? activeCase.evidences.filter((e) => e.isContradiction).map((e) => e.id)
      : [];

  const success = evaluateCaseSuccess(activeCase, {
    verdictCorrect,
    stampedEvidenceIds,
    falseStamps: 0,
  });

  const result = {
    verdictCorrect,
    verdictComponent: verdictCorrect ? 600 : 0,
    proofComponent: outcome === 'solved' ? 300 : 0,
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
    stampedEvidenceIds,
    mastery: 'none' as const,
    success,
  };

  return render(
    <ResultSheet
      result={result}
      caseData={activeCase}
      lang="ru"
      xpGained={result.xpGained}
      promotedToLevel={null}
      newAchievementIds={[]}
      streakCount={3}
      onMounted={noop}
      onDoubleReward={overrides.onDoubleReward ?? noopAd}
      rewardDoubled={overrides.rewardDoubled ?? false}
      onRevealClue={overrides.onRevealClue ?? noopAd}
      clueRevealed={overrides.clueRevealed ?? false}
      onNext={overrides.onNext ?? noop}
      onReplay={overrides.onReplay ?? noop}
      onBackToDesk={noop}
    />,
  );
};

/** case-001 must actually carry a mandatory contradiction for these to mean anything. */
describe('ResultSheet fixtures', () => {
  it('is built on a case with mandatory contradictions', () => {
    expect(mandatoryContradictions(caseData).length).toBeGreaterThan(0);
  });
});

describe('ResultSheet — success', () => {
  it('closes the case: money, accuracy and the way forward in one sheet', () => {
    renderSheet('solved');

    expect(screen.getByText(t('resultKickerConfirmed', 'ru'))).toBeInTheDocument();
    expect(screen.getByText(t('resultCompanySaved', 'ru'))).toBeInTheDocument();
    expect(screen.getByText(t('resultAccuracy', 'ru'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `${t('nextCase', 'ru')} →` }),
    ).toBeInTheDocument();
  });

  it('keeps «Следующее дело» the primary action and the ad an offer', () => {
    const onNext = vi.fn();
    renderSheet('solved', { onNext });

    // The rewarded offer is present…
    expect(
      screen.getByRole('button', { name: new RegExp(t('resultAdDoubleTitle', 'ru')) }),
    ).toBeInTheDocument();
    // …but nothing blocks moving on.
    fireEvent.click(screen.getByRole('button', { name: `${t('nextCase', 'ru')} →` }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('credits the double only after a completed view, and only once', () => {
    let settle: ((granted: boolean) => void) | null = null;
    const onDoubleReward = vi.fn((cb: (granted: boolean) => void) => {
      settle = cb;
    });
    renderSheet('solved', { onDoubleReward });

    const button = screen.getByRole('button', {
      name: new RegExp(t('resultAdDoubleTitle', 'ru')),
    });
    fireEvent.click(button);
    // In flight: disabled, announced, and a second click cannot start a second ad.
    expect(screen.getByText(t('resultAdLoading', 'ru'))).toBeInTheDocument();
    fireEvent.click(button);
    expect(onDoubleReward).toHaveBeenCalledTimes(1);

    act(() => settle!(true));
    // A duplicate callback must not re-arm anything.
    act(() => settle!(true));
    expect(onDoubleReward).toHaveBeenCalledTimes(1);
  });

  it('restores the ad button and explains a no-fill instead of hanging', () => {
    let settle: ((granted: boolean) => void) | null = null;
    renderSheet('solved', { onDoubleReward: (cb) => { settle = cb; } });

    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(t('resultAdDoubleTitle', 'ru')) }),
    );
    act(() => settle!(false));

    expect(screen.getByText(t('resultAdFailed', 'ru'))).toBeInTheDocument();
    expect(screen.queryByText(t('resultAdLoading', 'ru'))).not.toBeInTheDocument();
  });

  it('replaces the offer with a confirmed state once the reward is banked', () => {
    renderSheet('solved', { rewardDoubled: true });

    expect(screen.getByText(new RegExp(t('rewardDoubled', 'ru')))).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: new RegExp(t('resultAdDoubleTitle', 'ru')) }),
    ).not.toBeInTheDocument();
  });

  it('opens and closes the разбор drawer, closed by default', () => {
    renderSheet('solved');

    const toggle = screen.getByRole('button', { name: t('resultDebrief', 'ru') });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/440 минут/)).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/440 минут/)).toBeInTheDocument();
  });
});

describe('ResultSheet — failure', () => {
  it('never offers the next case, and never reveals the clue for free', () => {
    renderSheet('wrong_verdict');

    expect(
      screen.queryByRole('button', { name: `${t('nextCase', 'ru')} →` }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(t('resultNextLockedTitle', 'ru'))).toBeInTheDocument();
    // Only the general signal is free…
    expect(screen.getByText(t('resultMissedIntro', 'ru'))).toBeInTheDocument();
    expect(screen.getByText(t('resultClueLockedTitle', 'ru'))).toBeInTheDocument();
    // …and the closing line stays sealed: several confess indirectly.
    expect(screen.queryByText(/Прорыв был настоящим/)).not.toBeInTheDocument();
  });

  it('keeps the free retry available when the ad fails', () => {
    let settle: ((granted: boolean) => void) | null = null;
    const onReplay = vi.fn();
    renderSheet('wrong_verdict', {
      onRevealClue: (cb) => { settle = cb; },
      onReplay,
    });

    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(t('resultClueOpen', 'ru')) }),
    );
    act(() => settle!(false));

    expect(screen.getByText(t('resultAdFailed', 'ru'))).toBeInTheDocument();
    expect(screen.getByText(t('resultClueLockedTitle', 'ru'))).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(t('resultRetryNoHint', 'ru')) }),
    );
    expect(onReplay).toHaveBeenCalledTimes(1);
  });

  it('shows the clue and re-labels the retry once the reveal is granted', () => {
    renderSheet('wrong_verdict', { clueRevealed: true });

    expect(screen.getByText(t('resultClueRevealedLabel', 'ru'))).toBeInTheDocument();
    expect(screen.queryByText(t('resultClueLockedTitle', 'ru'))).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(t('resultRetryWithHint', 'ru')) }),
    ).toBeInTheDocument();
    // Still an offer, not a gate: the ad button is gone, progress is not.
    expect(
      screen.queryByRole('button', { name: new RegExp(t('resultClueOpen', 'ru')) }),
    ).not.toBeInTheDocument();
  });

  it('explains a pack case through its explanation lines when no chain is authored', () => {
    renderSheet('wrong_verdict', { caseData: packCase });

    const firstLine = packCase.explanation.ru[0]!;
    expect(screen.queryByText(new RegExp(firstLine))).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t('resultDebrief', 'ru') }));
    expect(screen.getByText(new RegExp(firstLine))).toBeInTheDocument();
  });
});

describe('ResultSheet — right call, not enough proof', () => {
  it('is its own state: not a failure, but not a closed case either', () => {
    renderSheet('insufficient');

    expect(screen.getByText(t('resultTitleIncomplete', 'ru'))).toBeInTheDocument();
    expect(screen.getByText(t('resultIncompleteIntro', 'ru'))).toBeInTheDocument();
    // The money was earned…
    expect(screen.getByText(t('resultCompanySaved', 'ru'))).toBeInTheDocument();
    // …but the campaign does not advance.
    expect(
      screen.queryByRole('button', { name: `${t('nextCase', 'ru')} →` }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(t('resultNextLockedTitle', 'ru'))).toBeInTheDocument();
  });

  it('counts the mandatory evidence the player still owes', () => {
    renderSheet('insufficient');

    const total = mandatoryContradictions(caseData).length;
    expect(
      screen.getByText(
        t('resultProofProgress', 'ru').replace('{n}', '0').replace('{total}', String(total)),
      ),
    ).toBeInTheDocument();
  });
});
