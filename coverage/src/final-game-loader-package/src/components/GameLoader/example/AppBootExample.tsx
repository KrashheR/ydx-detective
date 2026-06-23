import { useEffect, useState, type ReactNode } from 'react';
import {
  GameLoader,
  areBootSignalsReady,
  calculateBootProgress,
  getBootPhase,
  useSmoothedProgress,
  type BootSignals,
  type LoaderLocale,
} from '..';

interface AppBootExampleProps {
  locale: LoaderLocale;
  signals: BootSignals;
  children: ReactNode;
}

/**
 * Example only. In the real project, pass flags from Yandex SDK init,
 * Zustand persistence hydration, case validation and critical asset preload.
 */
export function AppBootExample({ locale, signals, children }: AppBootExampleProps) {
  const [loaderVisible, setLoaderVisible] = useState(true);
  const ready = areBootSignalsReady(signals);
  const rawProgress = calculateBootProgress(signals);
  const progress = useSmoothedProgress(rawProgress, ready);
  const phase = getBootPhase(signals);

  useEffect(() => {
    if (!ready || progress < 99.5) return;

    const timeout = window.setTimeout(() => {
      setLoaderVisible(false);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [progress, ready]);

  return (
    <>
      <GameLoader
        visible={loaderVisible}
        progress={progress}
        phase={phase}
        locale={locale}
      />
      {children}
    </>
  );
}
