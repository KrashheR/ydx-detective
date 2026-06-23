import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { notifyGameReady } from './services/yandexSDK';
import { useGameStore } from './store/gameStore';

function AppWithoutLoader() {
  const isHydrated = useGameStore((state) => state.isHydrated);
  const readyNotified = React.useRef(false);

  React.useEffect(() => {
    if (!isHydrated || readyNotified.current) return;
    readyNotified.current = true;
    notifyGameReady();
  }, [isHydrated]);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithoutLoader />
  </React.StrictMode>,
);
