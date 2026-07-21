/** The only boundary allowed to access window.CrazyGames. */
export type CrazyEnvironment = 'local' | 'crazygames' | 'disabled';
export type AdKind = 'midgame' | 'rewarded';
export type CrazyAdCallbacks = {
  adStarted?: () => void;
  adFinished?: () => void;
  adError?: (error?: unknown) => void;
};

interface CrazySdk {
  environment: CrazyEnvironment;
  init(): Promise<void>;
  game?: {
    loadingStart?: () => void; loadingStop?: () => void;
    gameplayStart?: () => void; gameplayStop?: () => void;
    settings?: { muteAudio?: boolean; addEventListener?: (name: 'muteAudio', listener: (muted: boolean) => void) => void };
  };
  ad?: { requestAd?: (kind: AdKind, callbacks: CrazyAdCallbacks) => void };
  data?: { getItem(key: string): string | null; setItem(key: string, value: string): void };
  user?: { systemInfo?: { locale?: string } };
}

declare global { interface Window { CrazyGames?: { SDK?: CrazySdk } } }

let initPromise: Promise<boolean> | null = null;
let usable = false;

function sdk(): CrazySdk | null {
  return typeof window === 'undefined' ? null : window.CrazyGames?.SDK ?? null;
}

/** Initializes exactly once and never lets an unavailable portal break the game. */
export function initCrazyGames(): Promise<boolean> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const current = sdk();
    if (!current) return false;
    try {
      await current.init();
      usable = current.environment === 'local' || current.environment === 'crazygames';
      return usable;
    } catch { return false; }
  })();
  return initPromise;
}

export const isCrazyGamesReady = () => usable;
export const getCrazyGamesSdk = () => usable ? sdk() : null;
export const getCrazyGamesLocale = () => getCrazyGamesSdk()?.user?.systemInfo?.locale ?? null;

/** Test-only reset; production code must never re-initialize the portal. */
export function __resetCrazyGamesForTests(): void { initPromise = null; usable = false; }
