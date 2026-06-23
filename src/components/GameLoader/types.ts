import type { CSSProperties } from 'react';

export type LoaderLocale = 'ru' | 'en' | 'tr' | 'ar' | 'kk';

export type LoaderPhase = 'sdk' | 'save' | 'content' | 'ready';

export interface LoaderCopy {
  title: string;
  subtitle: string;
  stamp: string;
  phases: Record<LoaderPhase, string>;
  tip: string;
}

export interface BootSignals {
  sdkReady: boolean;
  playerReady: boolean;
  saveHydrated: boolean;
  casesValidated: boolean;
  assetsReady: boolean;
}

export interface BootWeights {
  sdkReady: number;
  playerReady: number;
  saveHydrated: number;
  casesValidated: number;
  assetsReady: number;
}

export interface GameLoaderProps {
  visible: boolean;
  progress: number;
  locale?: LoaderLocale;
  phase?: LoaderPhase;
  copy?: Partial<LoaderCopy>;
  backgroundDesktopSrc?: string;
  backgroundMobileSrc?: string;
  showTip?: boolean;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
  onExited?: () => void;
}
