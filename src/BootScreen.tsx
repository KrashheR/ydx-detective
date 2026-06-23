import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import {
  GameLoader,
  areBootSignalsReady,
  calculateBootProgress,
  getBootPhase,
  useSmoothedProgress,
  type BootSignals,
} from './components/GameLoader';
import { initYandex, notifyGameReady } from './services/yandexSDK';
import { useGameStore } from './store/gameStore';

const appModulePromise = import('./App');

function loaderAsset(filename: string): string {
  return `${import.meta.env.BASE_URL}game-loader/${filename}`;
}

function waitForImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
    if (image.complete) resolve();
  });
}

async function waitForCriticalAssets(): Promise<void> {
  const portrait = window.matchMedia?.('(max-width: 700px), (orientation: portrait)').matches
    ?? window.innerWidth <= 700;
  const background = loaderAsset(
    portrait ? 'loader-bg-mobile.webp' : 'loader-bg-desktop.webp',
  );
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  await Promise.race([
    Promise.all([waitForImage(background), fontsReady]),
    new Promise<void>((resolve) => window.setTimeout(resolve, 2500)),
  ]);
}

export default function BootScreen() {
  const language = useGameStore((state) => state.stats.language);
  const isHydrated = useGameStore((state) => state.isHydrated);
  const [AppComponent, setAppComponent] = useState<ComponentType | null>(null);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const readyNotified = useRef(false);
  const [signals, setSignals] = useState<BootSignals>({
    sdkReady: false,
    playerReady: false,
    saveHydrated: false,
    casesValidated: false,
    assetsReady: false,
  });

  useLayoutEffect(() => {
    // The React loader is now committed with the same DOM/CSS as the static
    // precursor, so removing the latter does not expose an empty frame.
    document.getElementById('static-game-loader')?.remove();
  }, []);

  useEffect(() => {
    let active = true;

    void initYandex().then(() => {
      if (!active) return;
      // initYandex resolves for both the online SDK and the offline fallback.
      setSignals((current) => ({ ...current, sdkReady: true, playerReady: true }));
    });

    void appModulePromise.then(({ default: App }) => {
      if (!active) return;
      // App imports the static case registry; resolution means Zod validation
      // has completed and invalid content has already been rejected.
      setAppComponent(() => App);
      setSignals((current) => ({ ...current, casesValidated: true }));
    });

    void waitForCriticalAssets().then(() => {
      if (active) setSignals((current) => ({ ...current, assetsReady: true }));
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      setSignals((current) => ({ ...current, saveHydrated: true }));
    }
  }, [isHydrated]);

  const ready = areBootSignalsReady(signals);
  const rawProgress = useMemo(
    () => 10 + calculateBootProgress(signals) * 0.9,
    [signals],
  );
  const progress = useSmoothedProgress(rawProgress, ready, { initialValue: 10 });
  const phase = getBootPhase(signals);

  useEffect(() => {
    if (!ready || progress < 99.5 || readyNotified.current) return;
    readyNotified.current = true;

    const timeout = window.setTimeout(() => {
      notifyGameReady();
      setLoaderVisible(false);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [progress, ready]);

  return (
    <>
      {AppComponent ? <AppComponent /> : null}
      <GameLoader
        visible={loaderVisible}
        progress={progress}
        phase={phase}
        locale={language}
      />
    </>
  );
}
