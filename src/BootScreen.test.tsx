import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const sdk = vi.hoisted(() => ({
  initYandex: vi.fn(async () => undefined),
  notifyGameReady: vi.fn(),
}));

vi.mock('./services/yandexSDK', () => sdk);
vi.mock('./store/gameStore', () => ({
  useGameStore: (selector: (state: unknown) => unknown) => selector({
    stats: { language: 'ru' },
    isHydrated: true,
  }),
}));
vi.mock('./App', () => ({
  default: () => <main>game-ready</main>,
}));
vi.mock('./components/GameLoader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./components/GameLoader')>();
  return {
    ...actual,
    GameLoader: ({ visible }: { visible: boolean }) => (
      visible ? <div data-testid="react-loader" /> : null
    ),
    useSmoothedProgress: (_target: number, ready: boolean) => ready ? 100 : 10,
  };
});

import BootScreen from './BootScreen';

describe('BootScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="static-game-loader"></div>';
    vi.stubGlobal('Image', class {
      complete = true;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {}
    });
  });

  it('hands off the static splash and notifies Yandex after full readiness', async () => {
    render(<BootScreen />);

    expect(document.getElementById('static-game-loader')).toBeNull();
    expect(await screen.findByText('game-ready')).toBeInTheDocument();
    expect(screen.getByTestId('react-loader')).toBeInTheDocument();

    await waitFor(() => expect(sdk.notifyGameReady).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId('react-loader')).not.toBeInTheDocument();
  });
});
