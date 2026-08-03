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
  // Mirrors the real SDK order: `onShown` fires from `onOpen`, then `onDone`
  // from `onClose` — the ad-pacing cooldown restarts on the shown path only.
  showFullscreenAd: vi.fn((onDone?: () => void, _placement?: string, onShown?: () => void) => {
    onShown?.();
    onDone?.();
  }),
  getRemoteFlags: vi.fn(async (): Promise<Record<string, string>> => ({})),
  trackAdOffer: vi.fn(), getAnalyticsUserId: vi.fn(() => null),
  submitLeaderboardScore: vi.fn(async () => undefined),
  fetchLeaderboard: vi.fn(async () => null),
  // Payments boundary — the archives shelf and stamp shop read the catalog.
  isPaymentsAvailable: vi.fn(() => false),
  fetchPaymentsCatalog: vi.fn(async () => []),
  purchaseProduct: vi.fn(async () => false),
  restorePurchases: vi.fn(async () => ({ ok: false, productIds: [] })),
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
import { getCaseById, getStandardCases } from './data/caseLoader';
import { THEMATIC_PACKS, getThematicPackCaseIds } from './data/thematicPacks';
import type { ThermalScanEvidence } from './types';

const RU = (key: Parameters<typeof t>[0]) => t(key, 'ru');

function defaultSnapshot(statsOverride = {}) {
  return {
    version: GAME_CONFIG.saveVersion,
    // Most wiring tests exercise the established desk flow. Onboarding-lock
    // behaviour has its own coverage and is disabled here deliberately.
    stats: { ...makeDefaultStats(), metaUnlocked: true, ...statsOverride },
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

/**
 * Render and wait until hydration completes. The app boots straight into a case
 * (resumed session, else the next unlocked campaign case), so we wait for the
 * investigation folder rather than the desk.
 */
async function renderHydrated() {
  const utils = render(<App />);
  await screen.findByRole('button', { name: new RegExp(RU('rejectPayout')) });
  return utils;
}

/** Leave the auto-opened case and wait for the desk to render. */
async function goToDesk() {
  fireEvent.click(
    (await screen.findAllByRole('button', { name: new RegExp(RU('backToDesk')) }))[0]!,
  );
  await screen.findAllByText(RU('selectCasePrompt'));
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

/** Complete the one-click thermal tutorial attached to campaign case 1. */
async function completeFirstEvidenceAnalysis() {
  const evidence = getStandardCases()[0]!.evidences[0] as ThermalScanEvidence;
  fireEvent.click(
    await screen.findByRole('button', { name: RU('interactiveThermal') }),
  );
  fireEvent.click(
    await screen.findByRole('button', { name: evidence.data.heatZones[0]!.label }),
  );
}

describe('hydration', () => {
  it('shows the loading placeholder before hydration, then opens the first case', async () => {
    render(<App />);
    // Synchronous first render: store not hydrated yet.
    expect(screen.getByText('…')).toBeInTheDocument();
    // A fresh game boots straight into the first campaign case — no desk stop.
    expect(
      await screen.findByRole('button', { name: new RegExp(RU('rejectPayout')) }),
    ).toBeInTheDocument();
    expect(useGameStore.getState().session?.caseId).toBe(getStandardCases()[0]!.id);
  });

  it('prevents the browser context menu inside the game', async () => {
    const { container } = await renderHydrated();
    const appRoot = container.firstElementChild;
    expect(appRoot).not.toBeNull();

    const contextMenu = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });
    const allowed = appRoot!.dispatchEvent(contextMenu);

    expect(allowed).toBe(false);
    expect(contextMenu.defaultPrevented).toBe(true);
  });

  it('resumes a saved investigation on boot without wiping its progress', async () => {
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

    expect(useGameStore.getState().session).toEqual(expect.objectContaining(savedSession));
  });
});

describe('mobile desk visibility', () => {
  /** The 3-column layout wrapper; `hidden` on it means a blank mobile screen. */
  const columnsClassName = () => screen.getByRole('main').parentElement!.className;

  it('keeps the columns visible on small screens while onboarding suppresses the mobile menu', async () => {
    persist.loadSnapshot.mockResolvedValue({
      snapshot: defaultSnapshot({ metaUnlocked: false }),
      isNew: true,
    });

    await renderHydrated();

    expect(columnsClassName()).not.toMatch(/(^|\s)hidden(\s|$)/);
  });

  it('hides the columns on small screens once the mobile desk menu takes over', async () => {
    persist.loadSnapshot.mockResolvedValue({ snapshot: defaultSnapshot(), isNew: false });

    await renderHydrated();
    await goToDesk();

    expect(columnsClassName()).toMatch(/(^|\s)hidden md:flex(\s|$)/);
  });

  it('keeps both side columns mounted and desktop-visible during onboarding', async () => {
    persist.loadSnapshot.mockResolvedValue({
      snapshot: defaultSnapshot({ metaUnlocked: false }),
      isNew: true,
    });

    await renderHydrated();

    const columns = screen.getByRole('main').parentElement!;
    const [left, right] = [columns.firstElementChild!, columns.lastElementChild!];
    // `hidden md:block` is the desktop-only pattern; a bare `hidden` would mean
    // the panels never show up at all.
    for (const column of [left, right]) {
      expect(column.className).toMatch(/md:block/);
    }
  });
});

describe('opening a case', () => {
  it('switches from the desk to the investigation folder', async () => {
    await renderHydrated();
    await goToDesk();
    const rejectBtn = await openFirstCase();
    expect(rejectBtn).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(RU('approvePayout')) })).toBeInTheDocument();
    // The store now has an active session.
    expect(useGameStore.getState().session).not.toBeNull();
  });
});

describe('bureau of special cases', () => {
  /** Enter the Bureau through the top bar — the canonical entry point. */
  const openBureau = async () => {
    fireEvent.click(
      (await screen.findAllByRole('button', { name: new RegExp(RU('navBureau')) }))[0]!,
    );
  };

  it('opens the archives shelf from the top bar and lists every story pack', async () => {
    await renderHydrated();
    await goToDesk();
    await openBureau();

    // Every premium pack is on the shelf; retired expert archives are not.
    for (const pack of THEMATIC_PACKS) {
      expect((await screen.findAllByText(loc(pack.title, 'ru'))).length).toBeGreaterThan(0);
    }
    expect(screen.queryByText(/Пограничного Сектора/)).not.toBeInTheDocument();
  });

  it('opens a story-pack case from an archive page, bypassing the campaign gate', async () => {
    await renderHydrated();
    await goToDesk();
    await openBureau();

    const pack = THEMATIC_PACKS[0]!;
    // The shelf card is fully clickable and leads to the archive's own page.
    fireEvent.click(
      (await screen.findAllByRole('button', { name: new RegExp(loc(pack.title, 'ru')) }))[0]!,
    );

    const firstPackCaseId = getThematicPackCaseIds(pack)[0]!;
    const firstPackCase = getCaseById(firstPackCaseId)!;
    fireEvent.click(
      (await screen.findAllByRole('button', {
        name: new RegExp(loc(firstPackCase.title, 'ru')),
      }))[0]!,
    );

    await screen.findByRole('button', { name: new RegExp(RU('rejectPayout')) });
    expect(useGameStore.getState().session?.caseId).toBe(firstPackCaseId);
  });

  it('shows the whole shelf: archives, the stamp workshop and the bundle offer', async () => {
    await renderHydrated();
    await goToDesk();
    await openBureau();

    fireEvent.click(await screen.findByRole('tab', { name: new RegExp(RU('bureauTabStamps')) }));
    expect(await screen.findByText(RU('workshopChooseStamp'))).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('tab', { name: new RegExp(RU('bureauTabBundles')) }));
    expect(await screen.findByText(RU('bundleHeroTitle'))).toBeInTheDocument();
  });
});

describe('stamping an evidence card', () => {
  it('marks a card as a contradiction via the modal', async () => {
    await renderHydrated();

    const main = screen.getByRole('main');
    const evidenceButtons = within(main)
      .getAllByRole('button')
      .filter((b) => b.textContent?.includes(RU('openDossier')));
    fireEvent.click(evidenceButtons[0]!);

    await completeFirstEvidenceAnalysis();

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

    const main = screen.getByRole('main');
    const evidenceButtons = within(main)
      .getAllByRole('button')
      .filter((b) => b.textContent?.includes(RU('openDossier')));
    fireEvent.click(evidenceButtons[0]!);

    await completeFirstEvidenceAnalysis();

    fireEvent.click(
      await screen.findByRole('button', { name: new RegExp(RU('markAsContradiction')) }),
    );
    // Close the modal.
    fireEvent.click(screen.getByRole('button', { name: RU('close') }));

    // Reject is now enabled; submit it.
    const rejectBtn = await screen.findByRole('button', { name: new RegExp(RU('rejectPayout')) });
    expect(rejectBtn).toBeEnabled();
    fireEvent.click(rejectBtn);

    // The person reacts first: the reward sheet stays behind the resolution card.
    const resolution = getStandardCases()[0]!.resolution!;
    expect(await screen.findByText(new RegExp(loc(resolution.finalLine, 'ru')))).toBeInTheDocument();
    expect(screen.queryByText(RU('accuracyBreakdown'))).toBeNull();

    // Continue hands over to the reward sheet.
    fireEvent.click(screen.getByRole('button', { name: RU('resolutionContinue') }));

    expect(await screen.findByText(RU('accuracyBreakdown'))).toBeInTheDocument();
    expect(useGameStore.getState().lastResult).not.toBeNull();
  });
});

describe('overlays', () => {
  it('offers a voluntary top-up at zero balance without blocking the desk', async () => {
    persist.loadSnapshot.mockResolvedValue({
      snapshot: defaultSnapshot({ balance: 0, isBankrupt: true }),
      isNew: false,
    });
    await renderHydrated();
    await goToDesk();
    // The low-balance offer is visible on the desk…
    expect(await screen.findByText(RU('lowBalanceTitle'))).toBeInTheDocument();
    // …but the desk stays fully playable: a case can still be opened.
    await openFirstCase();
    expect(useGameStore.getState().session?.caseId).toBe(getStandardCases()[0]!.id);
  });

  it('dismissing the low-balance offer hides it', async () => {
    persist.loadSnapshot.mockResolvedValue({
      snapshot: defaultSnapshot({ balance: 0 }),
      isNew: false,
    });
    await renderHydrated();
    await goToDesk();
    const offer = (await screen.findByText(RU('lowBalanceTitle'))).closest('div.paper-sheet')!;
    fireEvent.click(within(offer as HTMLElement).getByRole('button', { name: RU('close') }));
    expect(screen.queryByText(RU('lowBalanceTitle'))).not.toBeInTheDocument();
  });

  it('shows the pause overlay while an ad is on screen', async () => {
    await renderHydrated();
    act(() => useGameStore.setState({ isPaused: true }));
    expect(screen.getByText('⏸')).toBeInTheDocument();
  });
});
