import type { CSSProperties } from 'react';

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

/** The splash is text-free by design: no copy, locale or phase label. */
export interface GameLoaderProps {
  visible: boolean;
  progress: number;
  backgroundDesktopSrc?: string;
  backgroundMobileSrc?: string;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
  onExited?: () => void;
}
