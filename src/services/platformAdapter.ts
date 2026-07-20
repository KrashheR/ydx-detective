/** Portal-neutral boundary used by the game runtime. */
import * as yandex from './yandexSDK';
import type { AdPlacement, LeaderboardRow, PaymentsProduct } from './yandexSDK';

export type { AdPlacement, LeaderboardRow, PaymentsProduct } from './yandexSDK';

type CrazyCallbacks = {
  adStarted?: () => void;
  adFinished?: () => void;
  adError?: () => void;
};

type CrazySdk = {
  init?: () => Promise<void>;
  environment?: { locale?: string };
  game?: { gameplayStart?: () => void; gameplayStop?: () => void; happytime?: () => void };
  ad?: { requestAd?: (kind: 'midgame' | 'rewarded', callbacks: CrazyCallbacks) => void };
  data?: { getItem?: (key: string) => Promise<unknown> | unknown; setItem?: (key: string, value: unknown) => Promise<void> | void };
  user?: { getUser?: () => Promise<unknown> };
};

declare global {
  interface Window {
    CrazyGames?: { SDK?: CrazySdk };
  }
}

export interface PlatformAdapter {
  readonly id: 'yandex' | 'crazygames' | 'local';
  init(): Promise<void>;
  ready(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  getLocale(): string | null;
  getServerTimeMs(): number;
  canUseCloud(): boolean;
  cloudGet(): Promise<unknown | null>;
  cloudSet(snapshot: unknown): Promise<void>;
  showFullscreenAd(done?: () => void, placement?: AdPlacement): void;
  showRewardedAd(reward: () => void, placement?: AdPlacement): void;
}

const CRAZY_SAVE_KEY = 'claimDetectiveSave';
const crazyPauseListeners = new Set<(paused: boolean) => void>();
const crazySdk = (): CrazySdk | undefined =>
  typeof window === 'undefined' ? undefined : window.CrazyGames?.SDK;
const emitCrazyPause = (paused: boolean) => crazyPauseListeners.forEach((listener) => listener(paused));

const yandexAdapter: PlatformAdapter = {
  id: 'yandex',
  init() { return yandex.initYandex(); },
  ready() { yandex.notifyGameReady(); },
  gameplayStart: () => undefined,
  gameplayStop: () => undefined,
  getLocale() { return yandex.getYandexLang(); },
  getServerTimeMs() { return yandex.getServerTimeMs(); },
  canUseCloud() { return yandex.canUseCloud(); },
  cloudGet() { return yandex.cloudGet(); },
  cloudSet(snapshot) { return yandex.cloudSet(snapshot); },
  showFullscreenAd(done, placement) { yandex.showFullscreenAd(done, placement); },
  showRewardedAd(reward, placement) { yandex.showRewardedAd(reward, placement); },
};

const crazyAdapter: PlatformAdapter = {
  id: 'crazygames',
  async init() { await crazySdk()?.init?.(); },
  ready() {},
  gameplayStart() { crazySdk()?.game?.gameplayStart?.(); },
  gameplayStop() { crazySdk()?.game?.gameplayStop?.(); },
  getLocale() { return crazySdk()?.environment?.locale ?? null; },
  getServerTimeMs() { return Date.now(); },
  canUseCloud() { return Boolean(crazySdk()?.data?.getItem && crazySdk()?.data?.setItem); },
  async cloudGet() { return (await crazySdk()?.data?.getItem?.(CRAZY_SAVE_KEY)) ?? null; },
  async cloudSet(snapshot) { await crazySdk()?.data?.setItem?.(CRAZY_SAVE_KEY, snapshot); },
  showFullscreenAd(done) {
    const request = crazySdk()?.ad?.requestAd;
    if (!request) { done?.(); return; }
    emitCrazyPause(true);
    request('midgame', {
      adFinished: () => { emitCrazyPause(false); done?.(); },
      adError: () => { emitCrazyPause(false); done?.(); },
    });
  },
  showRewardedAd(reward) {
    const request = crazySdk()?.ad?.requestAd;
    if (!request) { reward(); return; }
    emitCrazyPause(true);
    request('rewarded', {
      adFinished: () => { emitCrazyPause(false); reward(); },
      adError: () => emitCrazyPause(false),
    });
  },
};

export function getPlatformAdapter(): PlatformAdapter {
  if (crazySdk()) return crazyAdapter;
  if (typeof window !== 'undefined' && window.YaGames) return yandexAdapter;
  return yandexAdapter; // its adapter is deliberately no-op/local-safe without YaGames
}

export const initYandex = () => getPlatformAdapter().init();
export const notifyGameReady = () => getPlatformAdapter().ready();
export const notifyGameplayStart = () => getPlatformAdapter().gameplayStart();
export const notifyGameplayStop = () => getPlatformAdapter().gameplayStop();
export const getServerTimeMs = () => getPlatformAdapter().getServerTimeMs();
export const getYandexLang = () => getPlatformAdapter().getLocale();
export const canUseCloud = () => getPlatformAdapter().canUseCloud();
export const cloudGet = () => getPlatformAdapter().cloudGet();
export const cloudSet = (snapshot: unknown) => getPlatformAdapter().cloudSet(snapshot);
export const showFullscreenAd = (done?: () => void, placement?: AdPlacement) =>
  getPlatformAdapter().showFullscreenAd(done, placement);
export const showRewardedAd = (reward: () => void, placement?: AdPlacement) =>
  getPlatformAdapter().showRewardedAd(reward, placement);
export function onPauseChange(listener: (paused: boolean) => void): () => void {
  if (getPlatformAdapter().id !== 'crazygames') return yandex.onPauseChange(listener);
  crazyPauseListeners.add(listener);
  return () => crazyPauseListeners.delete(listener);
}

// Portal-specific optional capabilities are disabled outside Yandex.
const onYandex = () => getPlatformAdapter().id === 'yandex';
export const trackAdOffer = (kind: 'fullscreen' | 'rewarded', placement: AdPlacement) => {
  if (onYandex()) yandex.trackAdOffer(kind, placement);
};
export const canReview = () => onYandex() ? yandex.canReview() : Promise.resolve(false);
export const requestReview = () => onYandex() ? yandex.requestReview() : Promise.resolve(false);
export const isPaymentsAvailable = () => onYandex() && yandex.isPaymentsAvailable();
export const fetchPaymentsCatalog = (): Promise<PaymentsProduct[]> => onYandex() ? yandex.fetchPaymentsCatalog() : Promise.resolve([]);
export const purchaseProduct = (id: string) => onYandex() ? yandex.purchaseProduct(id) : Promise.resolve(false);
export const restorePurchasedProductIds = () => onYandex() ? yandex.restorePurchasedProductIds() : Promise.resolve([]);
export const submitLeaderboardScore = (score: number) => onYandex() ? yandex.submitLeaderboardScore(score) : Promise.resolve();
export const fetchLeaderboard = (): Promise<LeaderboardRow[] | null> => onYandex() ? yandex.fetchLeaderboard() : Promise.resolve(null);
