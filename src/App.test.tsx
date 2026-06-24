import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { GAME_CONFIG } from './config/gameConfig';
import { loc, t } from './i18n/ui';

/* --------------------------------------------------------------------------
 * UI-smoke layer. These tests verify the wiring between the DOM and the store
 * (clicks dispatch the right actions; screens switch) — NOT pixels. To keep
 * them robust we stub the SDK/persistence boundaries and flatten framer-motion
 * so animation lifecycles don't introduce async flake.
 * ------------------------------------------------------------------------ */

// Flatten framer-motion: motion.<tag> → a plain <tag> (preserving role/semantics),
// AnimatePresence → a passthrough. Animation-only props are stripped.
vi.mock('framer-motion', async () => {
  const React = await import('react');
  const ANIM_PROPS = new Set([
    'initial', 'animate', 'exit', 'transition', 'variants',
    'whileHover', 'whileTap', 'whileInView', 'whileFocus', 'whileDrag',
    'drag', 'dragConstraints', 'layout', 'layoutId', 'onAnimationComplete',
  ]);
  const make = (tag: string) =>
    React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (!ANIM_PROPS.has(k)) clean[k] = v;
      }
      return React.createElement(tag, { ...clean, ref });
    });
  const cache = new Map<string, unknown>();
  const motion = new Proxy(
    {},
    {
      get: (_t, tag: string) => {
        if (!cache.has(tag)) cache.set(tag, make(tag));
        return cache.get(tag);
      },
    },
  );
  return {
    motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

// Stub the SDK boundary (offline-style, deterministic).
const sdk = vi.hoisted(() => ({
  initYandex: vi.fn(async () => undefined),
  onPauseChange: vi.fn(() => () => undefined),
  getServerTimeMs: vi.fn(() => 0),
  getYandexLang: vi.fn((): string | null => null),
  showRewardedAd: vi.fn((cb: () => void) => cb()),
  showFullscreenAd: vi.fn((onDone?: () => void) => onDone?.()),
  trackAdOffer: vi.fn(),
  submitLeaderboardScore: vi.fn(async () => undefined),
  fetchLeaderboard: vi.fn(async () => null),
  canUseCloud: vi.fn(() => false),
  cloudGet: vi.fn(async () => null),
  cloudSet: vi.fn(async () => undefined),
}));
vi.mock('./services/yandexSDK', () => sdk);

// Stub persistence so no real cloud/local writes happen; keep the real factories.
const persist = vi.hoisted(() => ({
  loadSnapshot: vi.fn(),
  scheduleSync: vi.fn(),
  flushSync: vi.fn(async () => undefined),
}));
vi.mock('./services/persistence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./services/persistence')>();
  return {
    ...actual,
    loadSnapshot: persist.loadSnapshot,
    scheduleSync: persist.scheduleSync,
    flushSync: persist.flushSync,
  };
});

import App from './App';
import { useGameStore } from './store/gameStore';
import { makeDefaultStats } from './services/persistence';
import { getStandardCases } from './data/caseLoader';

const RU = (key: Parameters<typeof t>[0]) => t(key, 'ru');

function defaultSnapshot(statsOverride = {}) {
  return {
    version: GAME_CONFIG.saveVersion,
    stats: { ...makeDefaultStats(), ...statsOverride },
    session: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  sdk.getServerTimeMs.mockReturnValue(0);
  sdk.onPauseChange.mockReturnValue(() => undefined);
  sdk.showRewardedAd.mockImplementation((cb: () => void) => cb());
  sdk.fetchLeaderboard.mockResolvedValue(null);
  persist.loadSnapshot.mockResolvedValue({ snapshot: defaultSnapshot(), isNew: true });
  useGameStore.setState({
    stats: makeDefaultStats(),
    session: null,
    isPaused: false,
    isHydrated: false,
    lastResult: null,
  });
});

/** Render and wait until hydration completes on the desk. */
async function renderHydrated() {
  const utils = render(<App />);
  await screen.findAllByText(RU('selectCasePrompt'));
  return utils;
}

/** Open the first story case from the desk and wait for its verdict panel. */
async function openFirstCase() {
  const firstCaseTitle = loc(getStandardCases()[0]!.title, 'ru');
  const caseButtons = within(screen.getByRole('main')).getAllByRole('button', {
    name: new RegExp(firstCaseTitle),
  });
  fireEvent.click(caseButtons[0]!);
  return screen.findByRole('button', { name: new RegExp(RU('rejectPayout')) });
}

describe('hydration', () => {
  it('shows the loading placeholder before hydration, then opens the desk', async () => {
    render(<App />);
    // Synchronous first render: store not hydrated yet.
    expect(screen.getByText('…')).toBeInTheDocument();
    // A fresh game waits for explicit case selection.
    expect((await screen.findAllByText(RU('selectCasePrompt'))).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: new RegExp(RU('rejectPayout')) })).not.toBeInTheDocument();
    expect(useGameStore.getState().session).toBeNull();
  });

  it('stays on the desk with a saved investigation until the player selects it', async () => {
    const firstCase = getStandardCases()[0]!;
    const savedSession = {
      caseId: firstCase.id,
      selectedEvidenceIds: [firstCase.evidences[0]!.id],
      viewedEvidenceIds: [firstCase.evidences[0]!.id],
      revealedEvidenceIds: [],
      startedAtServerMs: 0,
    };
    persist.loadSnapshot.mockResolvedValue({
      snapshot: { ...defaultSnapshot(), session: savedSession },
      isNew: false,
    });

    await renderHydrated();

    expect(screen.queryByRole('button', { name: new RegExp(RU('rejectPayout')) })).not.toBeInTheDocument();
    expect(useGameStore.getState().session).toEqual(savedSession);

    await openFirstCase();
    expect(useGameStore.getState().session).toEqual(savedSession);
  });
});

describe('opening a case', () => {
  it('switches from the desk to the investigation folder', async () => {
    await renderHydrated();
    const rejectBtn = await openFirstCase();
    expect(rejectBtn).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(RU('approvePayout')) })).toBeInTheDocument();
    // The store now has an active session.
    expect(useGameStore.getState().session).not.toBeNull();
  });
});

describe('stamping an evidence card', () => {
  it('marks a card as a contradiction via the modal', async () => {
    await renderHydrated();
    await openFirstCase();

    const main = screen.getByRole('main');
    const evidenceButtons = within(main)
      .getAllByRole('button')
      .filter((b) => b.textContent?.includes(RU('openDossier')));
    fireEvent.click(evidenceButtons[0]!);

    // Modal opens with the "Mark as Contradiction" CTA.
    const markBtn = await screen.findByRole('button', {
      name: new RegExp(RU('markAsContradiction')),
    });
    fireEvent.click(markBtn);

    // The CTA flips to the "marked" state.
    expect(
      await screen.findByRole('button', { name: /ОТМЕЧЕНО/ }),
    ).toBeInTheDocument();
    expect(useGameStore.getState().session?.selectedEvidenceIds.length).toBe(1);
  });
});

describe('verdict gating', () => {
  it('refuses to reject without stamped proof and shows the justification prompt', async () => {
    await renderHydrated();
    await openFirstCase();

    // Reject stays clickable, but the handler blocks an unjustified rejection.
    const rejectBtn = screen.getByRole('button', { name: new RegExp(RU('rejectPayout')) });
    fireEvent.click(rejectBtn);

    // The justification prompt appears and no verdict was submitted.
    // Ignore the (hidden) reject-button tooltip, which carries the same string.
    expect(
      await screen.findByText(RU('rejectNeedsProof'), {
        ignore: '[role="tooltip"]',
      }),
    ).toBeInTheDocument();
    expect(useGameStore.getState().lastResult).toBeNull();
  });

  it('completes a stamp → reject → result-sheet flow', async () => {
    await renderHydrated();
    await openFirstCase();

    const main = screen.getByRole('main');
    const evidenceButtons = within(main)
      .getAllByRole('button')
      .filter((b) => b.textContent?.includes(RU('openDossier')));
    fireEvent.click(evidenceButtons[0]!);

    fireEvent.click(
      await screen.findByRole('button', { name: new RegExp(RU('markAsContradiction')) }),
    );
    // Close the modal.
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    // Reject is now enabled; submit it.
    const rejectBtn = await screen.findByRole('button', { name: new RegExp(RU('rejectPayout')) });
    expect(rejectBtn).toBeEnabled();
    fireEvent.click(rejectBtn);

    // The result sheet appears (Back-to-Desk action present).
    expect(
      (await screen.findAllByRole('button', { name: new RegExp(RU('backToDesk')) }))[0],
    ).toBeInTheDocument();
    expect(useGameStore.getState().lastResult).not.toBeNull();
  });
});

describe('overlays', () => {
  it('shows the bankruptcy gate when the player is broke', async () => {
    persist.loadSnapshot.mockResolvedValue({
      snapshot: defaultSnapshot({ balance: 0, isBankrupt: true }),
      isNew: false,
    });
    render(<App />);
    expect(await screen.findByText(RU('bankruptTitle'))).toBeInTheDocument();
  });

  it('shows the pause overlay while an ad is on screen', async () => {
    await renderHydrated();
    act(() => useGameStore.setState({ isPaused: true }));
    expect(screen.getByText('⏸')).toBeInTheDocument();
  });
});
