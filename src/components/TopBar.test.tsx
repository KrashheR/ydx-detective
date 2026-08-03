import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TopBar } from './TopBar';
import { t } from '../i18n/ui';

/**
 * The restore notice is the only place a player learns what the platform said
 * about their purchases. "We could not reach the store" and "this account owns
 * nothing" must never print the same sentence: the first is a retry, the second
 * means they are signed in as the wrong player.
 */
function renderTopBar(onRestorePurchases: () => Promise<{ ok: boolean; count: number }>) {
  render(
    <TopBar
      lang="ru"
      xp={0}
      balance={0}
      bureauOpen={false}
      bureauHasNews={false}
      onOpenInvestigation={vi.fn()}
      onOpenBureau={vi.fn()}
      onRestorePurchases={onRestorePurchases}
      paymentsAvailable
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: t('settings', 'ru') }));
  fireEvent.click(screen.getByRole('button', { name: t('restorePurchases', 'ru') }));
}

describe('TopBar restore notice', () => {
  it('reports a successful restore', async () => {
    renderTopBar(async () => ({ ok: true, count: 2 }));
    expect(await screen.findByText(t('purchaseRestored', 'ru'))).toBeInTheDocument();
  });

  it('says the account simply owns nothing', async () => {
    renderTopBar(async () => ({ ok: true, count: 0 }));
    expect(await screen.findByText(t('purchaseRestoreEmpty', 'ru'))).toBeInTheDocument();
  });

  it('does not blame the account when the store was unreachable', async () => {
    renderTopBar(async () => ({ ok: false, count: 0 }));
    expect(await screen.findByText(t('platformUnavailable', 'ru'))).toBeInTheDocument();
    expect(screen.queryByText(t('purchaseRestoreEmpty', 'ru'))).not.toBeInTheDocument();
  });
});
