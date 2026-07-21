import { getCrazyGamesLocale, getCrazyGamesSdk, initCrazyGames, isCrazyGamesReady } from './crazyGamesSDK';

export type AdPlacement = 'verdict' | 'inspector_note' | 'double_reward' | 'restore_funds' | 'witness_canvass' | 'daily_unlock' | 'archive_unlock' | 'unknown';
export type AdResult = { status: 'finished' | 'unavailable' | 'error'; code?: string };
export interface PlatformAdapter {
  readonly id: 'crazygames' | 'local'; init(): Promise<void>; loadingStart(): void; loadingStop(): void;
  gameplayStart(): void; gameplayStop(): void; getLocale(): string | null; getCurrentTimeMs(): number;
  getItem(key: string): string | null; setItem(key: string, value: string): void;
  requestAd(kind: 'midgame' | 'rewarded', placement?: AdPlacement): Promise<AdResult>;
}
const LOCAL_KEY = 'claimDetectiveSave';
let selected: PlatformAdapter | null = null;
let gameplay = false;
const pauseListeners = new Set<(paused: boolean) => void>();
const mutedListeners = new Set<(muted: boolean) => void>();
// CrazyGames Basic launch forbids monetization. Ads are enabled only for a
// Full-launch build after the portal has approved the placements.
const adsEnabled = import.meta.env.VITE_CRAZYGAMES_ADS_ENABLED === 'true';
const local: PlatformAdapter = {
  id: 'local', async init() {}, loadingStart() {}, loadingStop() {}, gameplayStart() {}, gameplayStop() {},
  getLocale: () => null, getCurrentTimeMs: () => Date.now(),
  getItem: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  setItem: (key, value) => { try { localStorage.setItem(key, value); } catch {} },
  async requestAd() { return { status: 'unavailable', code: 'adsDisabledBasicLaunch' }; },
};
const crazy: PlatformAdapter = {
  id: 'crazygames', async init() {},
  loadingStart: () => getCrazyGamesSdk()?.game?.loadingStart?.(), loadingStop: () => getCrazyGamesSdk()?.game?.loadingStop?.(),
  gameplayStart: () => { if (!gameplay) { gameplay = true; getCrazyGamesSdk()?.game?.gameplayStart?.(); } },
  gameplayStop: () => { if (gameplay) { gameplay = false; getCrazyGamesSdk()?.game?.gameplayStop?.(); } },
  getLocale: getCrazyGamesLocale, getCurrentTimeMs: () => Date.now(),
  getItem: (key) => { try { return getCrazyGamesSdk()?.data?.getItem(key) ?? null; } catch { return null; } },
  setItem: (key, value) => { try { getCrazyGamesSdk()?.data?.setItem(key, value); } catch {} },
  requestAd(kind) {
    if (!adsEnabled) return Promise.resolve({ status: 'unavailable', code: 'adsDisabledBasicLaunch' });
    const request = getCrazyGamesSdk()?.ad?.requestAd;
    if (!request) return Promise.resolve({ status: 'unavailable', code: 'sdkUnavailable' });
    return new Promise((resolve) => {
      let started = false; let settled = false;
      const finish = (result: AdResult) => { if (!settled) { settled = true; if (started) pauseListeners.forEach((fn) => fn(false)); resolve(result); } };
      try { request(kind, { adStarted: () => { if (!started) { started = true; pauseListeners.forEach((fn) => fn(true)); } }, adFinished: () => finish({ status: 'finished' }), adError: (error) => finish({ status: 'error', code: String(error ?? 'adError') }) }); }
      catch (error) { finish({ status: 'error', code: String(error) }); }
    });
  },
};
export async function initPlatform(): Promise<void> { if (selected) return; selected = await initCrazyGames() && isCrazyGamesReady() ? crazy : local; const settings = getCrazyGamesSdk()?.game?.settings; if (selected === crazy && settings?.addEventListener) settings.addEventListener('muteAudio', (muted) => mutedListeners.forEach((fn) => fn(muted))); }
export const getPlatformAdapter = () => selected ?? local;
export const notifyLoadingStart = () => getPlatformAdapter().loadingStart();
export const notifyLoadingStop = () => getPlatformAdapter().loadingStop();
export const notifyGameplayStart = () => getPlatformAdapter().gameplayStart();
export const notifyGameplayStop = () => getPlatformAdapter().gameplayStop();
export const getCurrentTimeMs = () => getPlatformAdapter().getCurrentTimeMs();
export const getPlatformLocale = () => getPlatformAdapter().getLocale();
export const storageGet = (key = LOCAL_KEY) => getPlatformAdapter().getItem(key);
export const storageSet = (value: string, key = LOCAL_KEY) => getPlatformAdapter().setItem(key, value);
export function showFullscreenAd(doneOrPlacement?: (() => void) | AdPlacement, placement?: AdPlacement, onShown?: () => void): Promise<AdResult> { const done = typeof doneOrPlacement === 'function' ? doneOrPlacement : undefined; const target = typeof doneOrPlacement === 'string' ? doneOrPlacement : placement; return getPlatformAdapter().requestAd('midgame', target).then((result) => { if (result.status === 'finished') onShown?.(); done?.(); return result; }); }
export function showRewardedAd(rewardOrPlacement?: (() => void) | AdPlacement, placement?: AdPlacement): Promise<AdResult> { const reward = typeof rewardOrPlacement === 'function' ? rewardOrPlacement : undefined; const target = typeof rewardOrPlacement === 'string' ? rewardOrPlacement : placement; return getPlatformAdapter().requestAd('rewarded', target).then((result) => { if (result.status === 'finished') reward?.(); return result; }); }
export const onPauseChange = (listener: (paused: boolean) => void) => { pauseListeners.add(listener); return () => pauseListeners.delete(listener); };
export const onPlatformMuteChange = (listener: (muted: boolean) => void) => { mutedListeners.add(listener); return () => mutedListeners.delete(listener); };
export const areRewardedAdsEnabled = () => adsEnabled;
export const trackAdOffer = (_kind: 'fullscreen' | 'rewarded', _placement: AdPlacement) => {};
