import { afterEach, describe, expect, it, vi } from 'vitest';

const yandex = vi.hoisted(() => ({
  initYandex: vi.fn(async () => undefined), notifyGameReady: vi.fn(), getYandexLang: vi.fn(() => 'ru'),
  getServerTimeMs: vi.fn(() => 42), canUseCloud: vi.fn(() => false), cloudGet: vi.fn(async () => null),
  cloudSet: vi.fn(async () => undefined), showFullscreenAd: vi.fn(), showRewardedAd: vi.fn(),
  onPauseChange: vi.fn(() => () => undefined), trackAdOffer: vi.fn(), canReview: vi.fn(async () => false),
  requestReview: vi.fn(async () => false), isPaymentsAvailable: vi.fn(() => false),
  fetchPaymentsCatalog: vi.fn(async () => []), purchaseProduct: vi.fn(async () => false),
  restorePurchasedProductIds: vi.fn(async () => []), submitLeaderboardScore: vi.fn(async () => undefined),
  fetchLeaderboard: vi.fn(async () => null),
}));
vi.mock('./yandexSDK', () => yandex);

import { cloudGet, cloudSet, getPlatformAdapter, notifyGameplayStart, showRewardedAd } from './platformAdapter';

afterEach(() => { delete window.CrazyGames; vi.clearAllMocks(); });

describe('PlatformAdapter', () => {
  it('uses the safe Yandex/local adapter when no portal SDK is present', () => {
    expect(getPlatformAdapter().id).toBe('yandex');
  });

  it('routes CrazyGames lifecycle, rewarded ads and cloud data through one contract', async () => {
    const gameplayStart = vi.fn();
    const getItem = vi.fn(async () => ({ version: 9 }));
    const setItem = vi.fn(async () => undefined);
    window.CrazyGames = { SDK: {
      game: { gameplayStart },
      data: { getItem, setItem },
      ad: { requestAd: (_kind, callbacks) => callbacks.adFinished?.() },
    } };
    const reward = vi.fn();

    notifyGameplayStart();
    showRewardedAd(reward, 'double_reward');
    expect(await cloudGet()).toEqual({ version: 9 });
    await cloudSet({ version: 9 });

    expect(gameplayStart).toHaveBeenCalledOnce();
    expect(reward).toHaveBeenCalledOnce();
    expect(getItem).toHaveBeenCalledWith('claimDetectiveSave');
    expect(setItem).toHaveBeenCalledWith('claimDetectiveSave', { version: 9 });
  });
});
