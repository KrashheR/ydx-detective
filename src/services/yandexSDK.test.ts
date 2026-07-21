import { describe, it, expect, afterEach, vi } from 'vitest';

/** The ad-lifecycle callbacks the adapter hands to the SDK (we only consume these). */
interface AdvCallbacksCapture {
  onOpen?: () => void;
  onClose?: (wasShown: boolean) => void;
  onError?: (error: unknown) => void;
  onRewarded?: () => void;
}

/**
 * The adapter holds module-level state (the resolved SDK handle, the pause
 * listener set). We re-import it fresh per scenario so "offline" and "online"
 * tests can't bleed into each other.
 */
async function freshOffline() {
  vi.resetModules();
  delete (window as any).YaGames;
  return import('./yandexSDK');
}

interface MockAdv {
  showFullscreenAdv: ReturnType<typeof vi.fn>;
  showRewardedVideo: ReturnType<typeof vi.fn>;
}

async function freshOnline(opts?: { mode?: 'lite' | '' }) {
  vi.resetModules();
  const adv: MockAdv = {
    showFullscreenAdv: vi.fn(),
    showRewardedVideo: vi.fn(),
  };
  const player = {
    getMode: () => opts?.mode ?? '',
    setData: vi.fn(async () => undefined),
    getData: vi.fn(async () => ({})),
  };
  const leaderboards = {
    setLeaderboardScore: vi.fn(async () => undefined),
    getLeaderboardEntries: vi.fn(async () => ({ entries: [] })),
  };
  const payments = {
    getCatalog: vi.fn(async () => []),
    getPurchases: vi.fn(async () => []),
    purchase: vi.fn(async () => ({ productID: 'archive.frontier-sector' })),
  };
  const mockSdk = {
    getPlayer: vi.fn(async () => player),
    getLeaderboards: vi.fn(async () => leaderboards),
    getPayments: vi.fn(async () => payments),
    environment: { i18n: { lang: 'en' } },
    serverTime: vi.fn(() => 1_700_000_000_000),
    adv,
    features: { LoadingAPI: { ready: vi.fn() } },
  };
  (window as any).YaGames = { init: vi.fn(async () => mockSdk) };
  const mod = await import('./yandexSDK');
  await mod.initYandex();
  return { mod, adv, player, leaderboards, payments, mockSdk };
}

/** Pull the callbacks the adapter handed to a rewarded-video call. */
function lastRewardedCallbacks(adv: MockAdv): AdvCallbacksCapture {
  const calls = adv.showRewardedVideo.mock.calls;
  const call = calls[calls.length - 1]?.[0];
  return call.callbacks;
}

afterEach(() => {
  delete (window as any).YaGames;
  vi.restoreAllMocks();
});

describe('offline mode (no SDK present)', () => {
  it('reports the cloud as unavailable', async () => {
    const mod = await freshOffline();
    expect(mod.canUseCloud()).toBe(false);
  });

  it('getServerTimeMs falls back to device time', async () => {
    const mod = await freshOffline();
    const spy = vi.spyOn(Date, 'now').mockReturnValue(123_456);
    expect(mod.getServerTimeMs()).toBe(123_456);
    spy.mockRestore();
  });

  it('getYandexLang returns null', async () => {
    const mod = await freshOffline();
    expect(mod.getYandexLang()).toBeNull();
  });

  it('showRewardedAd grants the reward immediately (keeps dev playable)', async () => {
    const mod = await freshOffline();
    const onReward = vi.fn();
    mod.showRewardedAd(onReward);
    expect(onReward).toHaveBeenCalledTimes(1);
  });

  it('showFullscreenAd continues the action immediately when no SDK', async () => {
    const mod = await freshOffline();
    const onDone = vi.fn();
    mod.showFullscreenAd(onDone);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('cloudGet resolves null and cloudSet rejects without a player', async () => {
    const mod = await freshOffline();
    await expect(mod.cloudGet()).resolves.toBeNull();
    await expect(mod.cloudSet({})).rejects.toThrow();
  });

  it('leaderboard calls are no-ops', async () => {
    const mod = await freshOffline();
    await expect(mod.submitLeaderboardScore(100)).resolves.toBeUndefined();
    await expect(mod.fetchLeaderboard()).resolves.toBeNull();
  });

  it('payment calls degrade to empty/no-op without the SDK', async () => {
    const mod = await freshOffline();
    expect(mod.isPaymentsAvailable()).toBe(false);
    await expect(mod.fetchPaymentsCatalog()).resolves.toEqual([]);
    await expect(mod.restorePurchasedProductIds()).resolves.toEqual([]);
    await expect(mod.purchaseProduct('archive.frontier-sector')).resolves.toBe(false);
  });
});

describe('online mode (mocked SDK)', () => {
  it('notifies LoadingAPI only when the game explicitly reports readiness', async () => {
    const { mod, mockSdk } = await freshOnline();
    expect(mockSdk.features.LoadingAPI.ready).not.toHaveBeenCalled();
    mod.notifyGameReady();
    expect(mockSdk.features.LoadingAPI.ready).toHaveBeenCalledTimes(1);
  });

  it('initializes the cloud for an authenticated player', async () => {
    const { mod, mockSdk } = await freshOnline({ mode: '' });
    expect(mod.canUseCloud()).toBe(true);
    expect(mockSdk.getPayments).toHaveBeenCalledWith({ signed: false });
  });

  it('treats a "lite" (anonymous) player as no cloud', async () => {
    const { mod } = await freshOnline({ mode: 'lite' });
    expect(mod.canUseCloud()).toBe(false);
  });

  it('getServerTimeMs uses the SDK clock', async () => {
    const { mod } = await freshOnline();
    expect(mod.getServerTimeMs()).toBe(1_700_000_000_000);
  });

  it('getYandexLang reads the SDK locale', async () => {
    const { mod } = await freshOnline();
    expect(mod.getYandexLang()).toBe('en');
  });

  it('cloudSet/cloudGet round-trip through the player API', async () => {
    const { mod, player } = await freshOnline();
    await mod.cloudSet({ hello: 'world' });
    expect(player.setData).toHaveBeenCalledWith(
      { claimDetectiveSave: { hello: 'world' } },
      true,
    );
  });

  it('exposes the payments catalog and restore surface when available', async () => {
    const { mod, payments } = await freshOnline();
    payments.getCatalog.mockResolvedValueOnce([
      { id: 'archive.frontier-sector', title: 'Frontier', price: '₽299' },
    ] as any);
    payments.getPurchases.mockResolvedValueOnce([
      { productID: 'archive.frontier-sector' },
      { productId: 'archive.closed-collegium' },
    ] as any);

    expect(mod.isPaymentsAvailable()).toBe(true);
    await expect(mod.fetchPaymentsCatalog()).resolves.toEqual([
      {
        id: 'archive.frontier-sector',
        title: 'Frontier',
        price: '₽299',
        priceValue: null,
        priceCurrencyCode: null,
      },
    ]);
    await expect(mod.restorePurchasedProductIds()).resolves.toEqual([
      'archive.frontier-sector',
      'archive.closed-collegium',
    ]);
  });

  it('runs a product purchase through the payments API', async () => {
    const { mod, payments } = await freshOnline();
    await expect(mod.purchaseProduct('archive.frontier-sector')).resolves.toBe(true);
    expect(payments.purchase).toHaveBeenCalledWith({ id: 'archive.frontier-sector' });
  });
});

describe('pause guard', () => {
  it('broadcasts pause on rewarded-ad open and resume on close', async () => {
    const { mod, adv } = await freshOnline();
    const listener = vi.fn();
    mod.onPauseChange(listener);

    mod.showRewardedAd(vi.fn());
    const cbs = lastRewardedCallbacks(adv);

    cbs.onOpen?.();
    expect(listener).toHaveBeenLastCalledWith(true);
    cbs.onClose?.(true);
    expect(listener).toHaveBeenLastCalledWith(false);
  });

  it('unsubscribes a pause listener', async () => {
    const { mod, adv } = await freshOnline();
    const listener = vi.fn();
    const off = mod.onPauseChange(listener);
    off();

    mod.showRewardedAd(vi.fn());
    lastRewardedCallbacks(adv).onOpen?.();
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('fullscreen-ad lifecycle (online)', () => {
  it('pauses on open and runs onDone on close', async () => {
    const { mod, adv } = await freshOnline();
    const listener = vi.fn();
    mod.onPauseChange(listener);
    const onDone = vi.fn();

    mod.showFullscreenAd(onDone);
    const calls = adv.showFullscreenAdv.mock.calls;
    const cbs = calls[calls.length - 1]?.[0].callbacks as AdvCallbacksCapture;

    cbs.onOpen?.();
    expect(listener).toHaveBeenLastCalledWith(true);
    cbs.onClose?.(true);
    expect(listener).toHaveBeenLastCalledWith(false);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe('rewarded-ad state machine (online)', () => {
  it('does NOT fire the reward when closed without being rewarded', async () => {
    const { mod, adv } = await freshOnline();
    const onReward = vi.fn();
    mod.showRewardedAd(onReward);

    const cbs = lastRewardedCallbacks(adv);
    cbs.onOpen?.();
    cbs.onClose?.(true); // closed early, never rewarded
    expect(onReward).not.toHaveBeenCalled();
  });

  it('fires the reward when rewarded before close', async () => {
    const { mod, adv } = await freshOnline();
    const onReward = vi.fn();
    mod.showRewardedAd(onReward);

    const cbs = lastRewardedCallbacks(adv);
    cbs.onOpen?.();
    cbs.onRewarded?.();
    cbs.onClose?.(true);
    expect(onReward).toHaveBeenCalledTimes(1);
  });
});
