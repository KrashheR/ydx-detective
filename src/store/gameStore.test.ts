import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GAME_CONFIG } from '../config/gameConfig';
import {
  makeCase,
  makeStats,
  contradictionIds,
  cleanIds,
  realCases,
} from '../test/fixtures';

/* ----------------------------- Boundary mocks ---------------------------- */

const sdk = vi.hoisted(() => ({
  initYandex: vi.fn(async () => undefined),
  onPauseChange: vi.fn(),
  getServerTimeMs: vi.fn(() => 0),
  getYandexLang: vi.fn((): string | null => null),
  showRewardedAd: vi.fn((cb: () => void) => cb()),
  isPaymentsAvailable: vi.fn(() => false),
  fetchPaymentsCatalog: vi.fn(async () => []),
  purchaseProduct: vi.fn(async () => false),
  restorePurchases: vi.fn(async () => ({ ok: true, productIds: [] })),
  // Mirrors the real SDK order: `onShown` (from `onOpen`), then `onDone`.
  showFullscreenAd: vi.fn((onDone?: () => void, _placement?: string, onShown?: () => void) => {
    onShown?.();
    onDone?.();
  }),
  getRemoteFlags: vi.fn(async (): Promise<Record<string, string>> => ({})),
  trackAdOffer: vi.fn(), getAnalyticsUserId: vi.fn(() => null),
  submitLeaderboardScore: vi.fn(async () => undefined),
}));
vi.mock('../services/yandexSDK', () => sdk);

const metrica = vi.hoisted(() => ({
  initMetrica: vi.fn(),
  setUserParams: vi.fn(),
}));
vi.mock('../services/metrica', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/metrica')>();
  return {
    ...actual,
    initMetrica: metrica.initMetrica,
    setUserParams: metrica.setUserParams,
  };
});

const persist = vi.hoisted(() => ({
  scheduleSync: vi.fn(),
  flushSync: vi.fn(async () => undefined),
  loadSnapshot: vi.fn(),
}));
vi.mock('../services/persistence', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../services/persistence')>();
  return {
    ...actual,
    scheduleSync: persist.scheduleSync,
    flushSync: persist.flushSync,
    loadSnapshot: persist.loadSnapshot,
  };
});

import { useGameStore, selectCaseInvestigationGate } from './gameStore';
import { makeDefaultStats } from '../services/persistence';
import { THEMATIC_PACKS } from '../data/thematicPacks';
import { PURCHASABLE_STAMP_TEXTS } from '../data/stampTexts';
import {
  BUNDLES,
  COMPLETE_BUNDLE_ID,
  STAMP_BUNDLE_ID,
  getBundle,
  getBundleDiscountPercent,
  getBundleListPriceRub,
} from '../data/bundles';

const store = () => useGameStore.getState();

beforeEach(() => {
  vi.clearAllMocks();
  sdk.getServerTimeMs.mockReturnValue(0);
  sdk.getYandexLang.mockReturnValue(null);
  sdk.showRewardedAd.mockImplementation((cb: () => void) => cb());
  sdk.showFullscreenAd.mockImplementation(
    (onDone?: () => void, _placement?: string, onShown?: () => void) => {
      onShown?.();
      onDone?.();
    },
  );
  persist.loadSnapshot.mockResolvedValue({
    snapshot: { version: GAME_CONFIG.saveVersion, stats: makeDefaultStats(), session: null },
    isNew: true,
  });
  useGameStore.setState({
    stats: makeDefaultStats(),
    session: null,
    isPaused: false,
    isHydrated: false,
    lastResult: null,
  });
});

/* --------------------------------- init ---------------------------------- */

describe('init', () => {
  it('boots the SDK, wires the pause guard, and hydrates', async () => {
    await store().init();
    expect(sdk.initYandex).toHaveBeenCalledTimes(1);
    expect(sdk.onPauseChange).toHaveBeenCalledTimes(1);
    expect(store().isHydrated).toBe(true);
  });

  it('hydrates before starting Metrica in a deferred task', async () => {
    vi.useFakeTimers();
    try {
      await store().init();
      expect(store().isHydrated).toBe(true);
      expect(metrica.initMetrica).not.toHaveBeenCalled();

      await vi.runAllTimersAsync();
      expect(metrica.initMetrica).toHaveBeenCalled();
      expect(metrica.setUserParams).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('adopts the Yandex locale for a first-time player', async () => {
    sdk.getYandexLang.mockReturnValue('en');
    await store().init();
    expect(store().stats.language).toBe('en');
  });

  it('keeps the saved language for a returning player', async () => {
    sdk.getYandexLang.mockReturnValue('en');
    persist.loadSnapshot.mockResolvedValue({
      snapshot: {
        version: GAME_CONFIG.saveVersion,
        stats: makeStats({ language: 'tr' }),
        session: null,
      },
      isNew: false,
    });
    await store().init();
    expect(store().stats.language).toBe('tr');
  });
});

/* ------------------------------- session --------------------------------- */

describe('startCase', () => {
  it('opens a fresh session for a case', () => {
    const c = makeCase();
    store().startCase(c);
    expect(store().session?.caseId).toBe(c.id);
    expect(store().session?.selectedEvidenceIds).toEqual([]);
    expect(persist.scheduleSync).toHaveBeenCalled();
  });

  it('does not wipe an in-progress session for the same case (resume)', () => {
    const c = makeCase();
    store().startCase(c);
    const evId = c.evidences[0]!.id;
    store().toggleEvidenceStamp(evId);
    const sessionRef = store().session;

    store().startCase(c); // re-enter the same case
    expect(store().session).toBe(sessionRef); // untouched
    expect(store().session?.selectedEvidenceIds).toContain(evId);
  });

  it('starts a case even at zero balance — bankruptcy never blocks play', () => {
    useGameStore.setState({ stats: makeStats({ balance: 0, isBankrupt: true }) });
    const c = makeCase();
    store().startCase(c);
    expect(store().session?.caseId).toBe(c.id);
  });

  it('replaces the session when switching to a different case', () => {
    const a = makeCase({ id: 'case-a' });
    const b = makeCase({ id: 'case-b' });
    store().startCase(a);
    store().startCase(b);
    expect(store().session?.caseId).toBe('case-b');
    expect(store().session?.selectedEvidenceIds).toEqual([]);
  });
});

describe('markEvidenceAsViewed / toggleEvidenceStamp', () => {
  it('records a viewed card only once', () => {
    const c = makeCase();
    store().startCase(c);
    const id = c.evidences[0]!.id;
    store().markEvidenceAsViewed(id, c);
    store().markEvidenceAsViewed(id, c);
    expect(store().session?.viewedEvidenceIds).toEqual([id]);
  });

  it('toggles a stamp on and off', () => {
    const c = makeCase();
    store().startCase(c);
    const id = c.evidences[0]!.id;
    store().toggleEvidenceStamp(id);
    expect(store().session?.selectedEvidenceIds).toContain(id);
    store().toggleEvidenceStamp(id);
    expect(store().session?.selectedEvidenceIds).not.toContain(id);
  });

  it('allows a viewed supporting evidence card to be stamped as a contradiction', () => {
    const c = makeCase({ contradictions: 0, cleanCards: 1 });
    store().startCase(c);
    const id = c.evidences[0]!.id;
    store().markEvidenceAsViewed(id, c);

    expect(store().toggleEvidenceStamp(id, c)).toBe(true);
    expect(store().session?.selectedEvidenceIds).toContain(id);
  });
});

/* -------------------------------- hints ---------------------------------- */

describe('buyHint', () => {
  it('charges the balance and reveals the next card for an Inspector Note', () => {
    const c = makeCase({ claimAmount: 1000 }); // note cost = 200
    store().startCase(c);
    const ok = store().buyHint(c, 'note');
    expect(ok).toBe(true);
    expect(sdk.showFullscreenAd).not.toHaveBeenCalled();
    expect(store().stats.balance).toBe(GAME_CONFIG.economy.startingBalance - 200);
    expect(store().session?.revealedEvidenceIds).toEqual([c.evidences[0]!.id]);
  });

  it('is a no-op when the Inspector Note is unaffordable', () => {
    const c = makeCase({ claimAmount: 1000 });
    useGameStore.setState({ stats: makeStats({ balance: 100 }) });
    store().startCase(c);
    const ok = store().buyHint(c, 'note');
    expect(ok).toBe(false);
    expect(store().stats.balance).toBe(100);
    expect(store().session?.revealedEvidenceIds ?? []).toEqual([]);
  });

  it('reveals for free via Witness Canvass (ad-funded)', () => {
    const c = makeCase({ claimAmount: 1000 });
    store().startCase(c);
    const ok = store().buyHint(c, 'canvass');
    expect(ok).toBe(true);
    expect(sdk.showRewardedAd).toHaveBeenCalledTimes(1);
    expect(store().stats.balance).toBe(GAME_CONFIG.economy.startingBalance); // unchanged
    expect(store().session?.revealedEvidenceIds).toEqual([c.evidences[0]!.id]);
  });

  it('returns false once every card is already revealed', () => {
    const c = makeCase({ contradictions: 1, cleanCards: 0 });
    store().startCase(c);
    store().buyHint(c, 'note'); // reveals the only card
    expect(store().buyHint(c, 'note')).toBe(false);
  });

  it('returns false when the case does not match the active session', () => {
    const c = makeCase();
    store().startCase(c);
    expect(store().buyHint(makeCase({ id: 'other' }), 'note')).toBe(false);
  });

  it('reveals the targeted card instead of the next one in order', () => {
    const c = makeCase({ claimAmount: 1000 }); // note cost = 200
    store().startCase(c);
    const targetId = c.evidences[c.evidences.length - 1]!.id;
    const ok = store().buyHint(c, 'note', targetId);
    expect(ok).toBe(true);
    expect(store().session?.revealedEvidenceIds).toEqual([targetId]);
  });

  it('falls back to the next unrevealed card when the target is already revealed', () => {
    const c = makeCase({ claimAmount: 1000 });
    store().startCase(c);
    const firstId = c.evidences[0]!.id;
    store().buyHint(c, 'note'); // reveals firstId
    const ok = store().buyHint(c, 'note', firstId); // already revealed — falls back
    expect(ok).toBe(true);
    expect(store().session?.revealedEvidenceIds).toEqual([
      firstId,
      c.evidences[1]!.id,
    ]);
  });

  it('falls back to the next unrevealed card when the target does not belong to the case', () => {
    const c = makeCase({ claimAmount: 1000 });
    store().startCase(c);
    const ok = store().buyHint(c, 'note', 'not-a-real-id');
    expect(ok).toBe(true);
    expect(store().session?.revealedEvidenceIds).toEqual([c.evidences[0]!.id]);
  });

  it('reveals the targeted card for free via Witness Canvass', () => {
    const c = makeCase({ claimAmount: 1000 });
    store().startCase(c);
    const targetId = c.evidences[c.evidences.length - 1]!.id;
    const ok = store().buyHint(c, 'canvass', targetId);
    expect(ok).toBe(true);
    expect(sdk.showRewardedAd).toHaveBeenCalledTimes(1);
    expect(store().session?.revealedEvidenceIds).toEqual([targetId]);
  });

  it('allows repeated Witness Canvass ads within the same case', () => {
    const c = makeCase({ claimAmount: 1000 });
    store().startCase(c);
    expect(store().buyHint(c, 'canvass')).toBe(true);
    expect(store().buyHint(c, 'canvass')).toBe(true);
    expect(sdk.showRewardedAd).toHaveBeenCalledTimes(2);
    expect(store().session?.revealedEvidenceIds).toEqual([
      c.evidences[0]!.id,
      c.evidences[1]!.id,
    ]);
  });
});

/* ------------------------------ submitVerdict ---------------------------- */

describe('submitVerdict', () => {
  it('records the result, pays out, gains XP, and flushes', () => {
    const c = makeCase({
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 2,
      cleanCards: 1,
    });
    store().startCase(c);
    contradictionIds(c).forEach((id) => store().toggleEvidenceStamp(id));

    const breakdown = store().submitVerdict(c, 'reject');

    expect(breakdown.total).toBeGreaterThan(0);
    expect(store().stats.balance).toBeGreaterThan(GAME_CONFIG.economy.startingBalance);
    expect(store().stats.xp).toBeGreaterThan(0);
    expect(store().stats.completedCaseIds).toContain(c.id);
    expect(store().stats.results[c.id]?.verdictCorrect).toBe(true);
    expect(store().lastResult?.caseId).toBe(c.id);
    expect(persist.flushSync).toHaveBeenCalled();
    expect(sdk.submitLeaderboardScore).toHaveBeenCalledWith(store().stats.xp);
  });

  it('starts the daily streak at 1 against server time', () => {
    sdk.getServerTimeMs.mockReturnValue(5 * GAME_CONFIG.daily.cooldownMs);
    const c = makeCase({ correctDecision: 'approve', contradictions: 0, cleanCards: 1 });
    store().startCase(c);
    store().submitVerdict(c, 'approve');
    expect(store().stats.streakCount).toBe(1);
    expect(store().stats.lastPlayedServerDay).toBe(5);
  });

  it('builds a 100%-case streak on silver-or-better closures', () => {
    const c = makeCase({ correctDecision: 'approve', contradictions: 0, cleanCards: 1 });
    store().startCase(c);
    store().submitVerdict(c, 'approve');
    expect(store().stats.perfectCaseStreakCount).toBe(1);
  });

  it('resets the 100%-case streak after a first-time imperfect closure', () => {
    useGameStore.setState({ stats: makeStats({ perfectCaseStreakCount: 3 }) });
    const c = makeCase({ correctDecision: 'reject', contradictions: 1, cleanCards: 1 });
    store().startCase(c);
    cleanIds(c).forEach((id) => store().toggleEvidenceStamp(id));
    store().submitVerdict(c, 'reject');
    expect(store().stats.perfectCaseStreakCount).toBe(0);
  });

  it('does not let replays farm the 100%-case streak', () => {
    const c = makeCase({ id: 'case-replay', correctDecision: 'approve', contradictions: 0, cleanCards: 1 });
    useGameStore.setState({
      stats: makeStats({
        perfectCaseStreakCount: 2,
        completedCaseIds: [c.id],
      }),
    });
    store().startCase(c);
    store().submitVerdict(c, 'approve');
    expect(store().stats.perfectCaseStreakCount).toBe(2);
  });

  it('pays an unclosed case once, not once per retry', () => {
    // A correct verdict without the mandatory stamps leaves the case open and
    // still pays. «Повторить» then starts a fresh session — so without the
    // first-look/closing-attempt rule this pair prints money.
    const base = makeCase({
      id: 'case-farm',
      claimAmount: 1000,
      correctDecision: 'reject',
      contradictions: 2,
      cleanCards: 1,
    });
    const c = {
      ...base,
      evidences: base.evidences.map((e) =>
        e.isContradiction ? { ...e, requiredForVerdict: true } : e,
      ),
    };

    // 1st attempt: right verdict, no proof — paid, but the case stays open.
    store().startCase(c);
    const first = store().submitVerdict(c, 'reject');
    expect(first.total).toBeGreaterThan(0);
    expect(store().lastResult?.success.solved).toBe(false);
    expect(store().stats.completedCaseIds).not.toContain(c.id);

    // 2nd identical attempt: free practice, no second payout, no XP.
    const balanceAfterFirst = store().stats.balance;
    const xpAfterFirst = store().stats.xp;
    store().startCase(c);
    expect(store().submitVerdict(c, 'reject').total).toBe(0);
    expect(store().stats.balance).toBe(balanceAfterFirst);
    expect(store().stats.xp).toBe(xpAfterFirst);

    // The attempt that actually closes the case pays again — once.
    store().startCase(c);
    contradictionIds(c).forEach((id) => store().toggleEvidenceStamp(id));
    expect(store().submitVerdict(c, 'reject').total).toBeGreaterThan(0);
    expect(store().stats.completedCaseIds).toContain(c.id);

    // And a replay of a closed case is training, as it always was.
    const balanceAfterClosing = store().stats.balance;
    store().startCase(c);
    contradictionIds(c).forEach((id) => store().toggleEvidenceStamp(id));
    expect(store().submitVerdict(c, 'reject').total).toBe(0);
    expect(store().stats.balance).toBe(balanceAfterClosing);
  });

  it('detects a rank promotion across an XP threshold', () => {
    // level_02 starts at 10 XP; a fresh player earning a clean easy case (+10)
    // crosses from level_01 into level_02.
    useGameStore.setState({ stats: makeStats({ xp: 0 }) });
    const c = makeCase({
      difficulty: 'easy',
      correctDecision: 'approve',
      contradictions: 0,
      cleanCards: 1,
    });
    store().startCase(c);
    store().submitVerdict(c, 'approve');
    expect(store().lastResult?.promotedToLevel).toBe(2);
  });

  it('unlocks an achievement and grants its one-time bonuses', () => {
    const c = makeCase({ correctDecision: 'reject', contradictions: 1, cleanCards: 0 });
    store().startCase(c);
    contradictionIds(c).forEach((id) => store().toggleEvidenceStamp(id));
    store().submitVerdict(c, 'reject');

    expect(store().stats.unlockedAchievementIds).toContain('first-fraud');
    expect(store().lastResult?.newAchievementIds).toContain('first-fraud');
  });

  it('uses the fixed difficulty payout instead of a tiny claim amount', () => {
    useGameStore.setState({ stats: makeStats({ balance: 10 }) });
    const c = makeCase({
      claimAmount: 100,
      correctDecision: 'approve',
      contradictions: 0,
      cleanCards: 3,
    });
    store().startCase(c);
    cleanIds(c).forEach((id) => store().toggleEvidenceStamp(id)); // 3 false stamps
    store().submitVerdict(c, 'approve');

    expect(store().stats.balance).toBeGreaterThan(0);
    expect(store().stats.isBankrupt).toBe(false);
  });

  it('records a daily claim timestamp for daily cases', () => {
    sdk.getServerTimeMs.mockReturnValue(999);
    const c = makeCase({ type: 'daily', correctDecision: 'approve', contradictions: 0, cleanCards: 1 });
    store().startCase(c);
    store().submitVerdict(c, 'approve');
    expect(store().stats.lastDailyClaimServerMs).toBe(999);
  });
});

/* --------------------------- close / restore ----------------------------- */

describe('closeCase', () => {
  it('clears the session and flushes to the cloud', async () => {
    const c = makeCase();
    store().startCase(c);
    await store().closeCase();
    expect(store().session).toBeNull();
    expect(persist.flushSync).toHaveBeenCalled();
  });
});

describe('restoreFunds', () => {
  it('restores the balance when the rewarded ad pays out', () => {
    useGameStore.setState({ stats: makeStats({ balance: 0, isBankrupt: true }) });
    store().restoreFunds();
    expect(store().stats.balance).toBe(GAME_CONFIG.economy.restoreFundsTo);
    expect(store().stats.isBankrupt).toBe(false);
  });

  it('does nothing when the ad is skipped (no reward)', () => {
    sdk.showRewardedAd.mockImplementation(() => undefined); // never calls back
    useGameStore.setState({ stats: makeStats({ balance: 0, isBankrupt: true }) });
    store().restoreFunds();
    expect(store().stats.balance).toBe(0);
    expect(store().stats.isBankrupt).toBe(true);
  });

  it('never lowers a balance already at or above the restore target', () => {
    useGameStore.setState({ stats: makeStats({ balance: 5000 }) });
    store().restoreFunds();
    expect(sdk.showRewardedAd).not.toHaveBeenCalled();
    expect(store().stats.balance).toBe(5000);
  });
});

describe('recordInterstitialShown', () => {
  it('accumulates the persisted interstitial counter', () => {
    store().recordInterstitialShown();
    store().recordInterstitialShown();
    expect(store().stats.interstitialsSeenTotal).toBe(2);
    expect(persist.scheduleSync).toHaveBeenCalled();
  });
});

describe('archive unlocks', () => {
  it('grants the purchased pack permanently', () => {
    store().grantArchivePurchase('frontier-sector');
    expect(store().stats.archivePurchasedPackIds).toContain('frontier-sector');
  });

  it('restores multiple purchased packs without duplicates', () => {
    useGameStore.setState({
      stats: makeStats({ archivePurchasedPackIds: ['frontier-sector'] }),
    });
    store().grantArchivePurchases(['frontier-sector', 'closed-collegium']);
    expect(store().stats.archivePurchasedPackIds).toEqual([
      'frontier-sector',
      'closed-collegium',
    ]);
  });

  it('maps restored product ids onto pack + No Ads entitlements', () => {
    store().applyRestoredPurchases([
      'archive_closed_collegium',
      GAME_CONFIG.advertising.noAdsProductId,
      'unknown.product',
    ]);
    expect(store().stats.archivePurchasedPackIds).toEqual(['closed-collegium']);
    expect(store().stats.noAdsPurchased).toBe(true);
  });

  it('grants the pack when the restored id is the cheaper intro-offer product', () => {
    const pack = THEMATIC_PACKS[0]!;
    // An offer is a *second* product id for the same entitlement — restoring it
    // must unlock the archive, or a discounted purchase is lost on reinstall.
    store().applyRestoredPurchases([pack.offer!.productId]);
    expect(store().stats.archivePurchasedPackIds).toEqual([pack.id]);
  });

  it('grants a bundle when the restored id is its offer product', () => {
    const bundle = getBundle(COMPLETE_BUNDLE_ID)!;
    store().applyRestoredPurchases([bundle.offer!.productId]);
    expect(store().stats.purchasedBundleIds).toEqual([bundle.id]);
    expect(store().stats.archivePurchasedPackIds).toHaveLength(THEMATIC_PACKS.length);
  });

  it('writes nothing when a restore repeats what the player already owns', () => {
    // Every boot re-grants the platform's list, so the steady state is a restore
    // that changes nothing — it must not spend a cloud write on an identical save.
    const bundle = getBundle(COMPLETE_BUNDLE_ID)!;
    store().applyRestoredPurchases([bundle.productId]);
    persist.flushSync.mockClear();

    store().applyRestoredPurchases([bundle.productId]);
    expect(persist.flushSync).not.toHaveBeenCalled();
    expect(store().stats.purchasedBundleIds).toEqual([bundle.id]);
  });

  it('leaves No Ads untouched when it was not among the restored products', () => {
    store().applyRestoredPurchases(['archive_closed_collegium']);
    expect(store().stats.noAdsPurchased).toBe(false);
  });

  it('grants No Ads once and persists it', () => {
    store().grantNoAds();
    store().grantNoAds();
    expect(store().stats.noAdsPurchased).toBe(true);
    expect(persist.flushSync).toHaveBeenCalled();
  });

  it('unlocks one archive case via rewarded ad and records the server day', () => {
    sdk.getServerTimeMs.mockReturnValue(2 * GAME_CONFIG.daily.cooldownMs);
    const ok = store().unlockArchiveCaseViaAd('night-train', 'night-train-02');
    expect(ok).toBe(true);
    expect(store().stats.archiveUnlockedCaseIds).toContain('night-train-02');
    expect(store().stats.archiveAdUnlockServerDayByPack['night-train']).toBe(2);
  });

  it('refuses a second rewarded unlock from the same pack on the same day', () => {
    sdk.getServerTimeMs.mockReturnValue(3 * GAME_CONFIG.daily.cooldownMs);
    expect(store().unlockArchiveCaseViaAd('night-train', 'night-train-02')).toBe(true);
    expect(store().unlockArchiveCaseViaAd('night-train', 'night-train-03')).toBe(false);
    expect(store().stats.archiveUnlockedCaseIds).toEqual(['night-train-02']);
  });
});

describe('stamp captions (cosmetic IAP)', () => {
  it('grants a bought caption and inks it immediately', () => {
    store().grantStampTextPurchase('storyteller');
    expect(store().stats.ownedStampTextIds).toEqual(['storyteller']);
    expect(store().stats.activeStampTextId).toBe('storyteller');
  });

  it('ignores an unknown or free caption id', () => {
    store().grantStampTextPurchase('classic');
    store().grantStampTextPurchase('nope');
    expect(store().stats.ownedStampTextIds).toEqual([]);
    expect(store().stats.activeStampTextId).toBeNull();
  });

  it('refuses to ink a caption the player does not own', () => {
    store().setActiveStampText('smells-fishy');
    expect(store().stats.activeStampTextId).toBeNull();
  });

  it('inks an owned caption and falls back to the free default on null', () => {
    useGameStore.setState({
      stats: makeStats({ ownedStampTextIds: ['smells-fishy'] }),
    });
    store().setActiveStampText('smells-fishy');
    expect(store().stats.activeStampTextId).toBe('smells-fishy');
    store().setActiveStampText(null);
    expect(store().stats.activeStampTextId).toBeNull();
  });

  it('restores captions from product ids without inking or duplicating them', () => {
    useGameStore.setState({
      stats: makeStats({ ownedStampTextIds: ['storyteller'] }),
    });
    store().applyRestoredPurchases([
      'stamp_storyteller',
      'stamp_doesnt_add_up',
      'unknown.product',
    ]);
    expect(store().stats.ownedStampTextIds).toEqual([
      'storyteller',
      'doesnt-add-up',
    ]);
    // Restore is a silent entitlement sync — it never changes what is inked.
    expect(store().stats.activeStampTextId).toBeNull();
  });
});

describe('stamp ink (free cosmetic)', () => {
  it('records a known ink and normalizes the default back to null', () => {
    store().setActiveStampInk('blue');
    expect(store().stats.activeStampInkId).toBe('blue');
    store().setActiveStampInk('red');
    expect(store().stats.activeStampInkId).toBeNull();
  });

  it('falls back to the default for an unknown ink id', () => {
    store().setActiveStampInk('chartreuse');
    expect(store().stats.activeStampInkId).toBeNull();
  });
});

describe('bundles (IAP)', () => {
  it('grants every archive and caption the complete bundle contains', () => {
    store().grantBundlePurchase(COMPLETE_BUNDLE_ID);
    const { stats } = store();
    expect(stats.purchasedBundleIds).toEqual([COMPLETE_BUNDLE_ID]);
    for (const pack of THEMATIC_PACKS) {
      expect(stats.archivePurchasedPackIds).toContain(pack.id);
    }
    for (const stamp of PURCHASABLE_STAMP_TEXTS) {
      expect(stats.ownedStampTextIds).toContain(stamp.id);
    }
  });

  it('grants only the captions for the stamp bundle', () => {
    store().grantBundlePurchase(STAMP_BUNDLE_ID);
    expect(store().stats.archivePurchasedPackIds).toEqual([]);
    expect(store().stats.ownedStampTextIds).toHaveLength(
      PURCHASABLE_STAMP_TEXTS.length,
    );
  });

  it('re-grants the whole bundle on restore — a reinstall loses nothing', () => {
    // The bundle product id matches no pack and no caption on its own, so this
    // is the path that silently drops a purchase if the mapping is missing.
    store().applyRestoredPurchases([getBundle(COMPLETE_BUNDLE_ID)!.productId]);
    const { stats } = store();
    expect(stats.archivePurchasedPackIds).toHaveLength(THEMATIC_PACKS.length);
    expect(stats.ownedStampTextIds).toHaveLength(PURCHASABLE_STAMP_TEXTS.length);
  });

  it('ignores an unknown bundle id', () => {
    store().grantBundlePurchase('bundle.nope');
    expect(store().stats.purchasedBundleIds).toEqual([]);
  });

  it('never advertises a discount the contents do not support', () => {
    for (const bundle of BUNDLES) {
      const list = getBundleListPriceRub(bundle);
      expect(bundle.fallbackPriceRub).toBeLessThan(list);
      const advertised = getBundleDiscountPercent(bundle);
      // Floored, so the real saving is always at least what is advertised.
      expect((list - bundle.fallbackPriceRub) / list).toBeGreaterThanOrEqual(
        advertised / 100,
      );
    }
  });

  it('keeps the offer price below the regular one and above zero', () => {
    // The shelf prints one saving derived from the *resolved* price, so an
    // offer that is not actually cheaper would advertise a negative discount.
    for (const bundle of BUNDLES) {
      if (!bundle.offer) continue;
      expect(bundle.offer.fallbackPriceRub).toBeGreaterThan(0);
      expect(bundle.offer.fallbackPriceRub).toBeLessThan(bundle.fallbackPriceRub);
      expect(bundle.offer.fallbackPriceRub).toBeLessThan(
        getBundleListPriceRub(bundle),
      );
    }
    for (const pack of THEMATIC_PACKS) {
      if (!pack.offer) continue;
      expect(pack.offer.fallbackPriceRub).toBeLessThan(pack.fallbackPriceRub);
    }
  });
});

/* ----------------------------- daily / gates ----------------------------- */

describe('isDailyUnlocked', () => {
  it('is unlocked when never claimed', () => {
    expect(store().isDailyUnlocked()).toBe(true);
  });

  it('is locked within the cooldown window', () => {
    const now = 10 * GAME_CONFIG.daily.cooldownMs + 1000;
    sdk.getServerTimeMs.mockReturnValue(now);
    useGameStore.setState({ stats: makeStats({ lastDailyClaimServerMs: now - 500 }) });
    expect(store().isDailyUnlocked()).toBe(false);
  });
});

describe('selectCaseInvestigationGate', () => {
  it('always allows approve, even before any card is viewed', () => {
    const c = makeCase({ contradictions: 1, cleanCards: 1 });
    store().startCase(c);
    expect(selectCaseInvestigationGate(c, { session: store().session }).canApprove).toBe(true);
    c.evidences.forEach((e) => store().markEvidenceAsViewed(e.id, c));
    expect(selectCaseInvestigationGate(c, { session: store().session }).canApprove).toBe(true);
  });

  it('allows reject only once a contradiction is stamped', () => {
    const c = makeCase({ contradictions: 1, cleanCards: 1 });
    store().startCase(c);
    expect(selectCaseInvestigationGate(c, { session: store().session }).canReject).toBe(false);
    store().toggleEvidenceStamp(c.evidences[0]!.id);
    expect(selectCaseInvestigationGate(c, { session: store().session }).canReject).toBe(true);
  });

  it('on a budgeted case, allows approve from the start and tracks budget', () => {
    const c = makeCase({ contradictions: 1, cleanCards: 3, investigationBudget: 2 });
    store().startCase(c);
    let gate = selectCaseInvestigationGate(c, { session: store().session });
    expect(gate.canApprove).toBe(true); // approve is always available
    expect(gate.budget).toBe(2);
    expect(gate.opensRemaining).toBe(2);

    store().markEvidenceAsViewed(c.evidences[0]!.id, c);
    gate = selectCaseInvestigationGate(c, { session: store().session });
    expect(gate.canApprove).toBe(true);
    expect(gate.opensRemaining).toBe(1);
  });
});

describe('investigation budget — open limit', () => {
  it('blocks opening new cards once the budget is spent', () => {
    const c = makeCase({ contradictions: 2, cleanCards: 3, investigationBudget: 2 });
    store().startCase(c);
    expect(store().markEvidenceAsViewed(c.evidences[0]!.id, c)).toBe(true);
    expect(store().markEvidenceAsViewed(c.evidences[1]!.id, c)).toBe(true);
    // Budget (2) exhausted → opening a third *new* card is refused.
    expect(store().markEvidenceAsViewed(c.evidences[2]!.id, c)).toBe(false);
    expect(store().session?.viewedEvidenceIds).toEqual([
      c.evidences[0]!.id,
      c.evidences[1]!.id,
    ]);
    const gate = selectCaseInvestigationGate(c, { session: store().session });
    expect(gate.budgetExhausted).toBe(true);
    expect(gate.opensRemaining).toBe(0);
  });

  it('always allows re-reading an already-opened card after the budget is spent', () => {
    const c = makeCase({ contradictions: 1, cleanCards: 2, investigationBudget: 1 });
    store().startCase(c);
    const first = c.evidences[0]!.id;
    expect(store().markEvidenceAsViewed(first, c)).toBe(true);
    // Re-opening the same card is free even though the budget is now spent.
    expect(store().markEvidenceAsViewed(first, c)).toBe(true);
    // A different, never-opened card is still blocked.
    expect(store().markEvidenceAsViewed(c.evidences[1]!.id, c)).toBe(false);
  });

  it('does not gate opens on un-budgeted cases', () => {
    const c = makeCase({ contradictions: 1, cleanCards: 4 });
    store().startCase(c);
    for (const e of c.evidences) {
      expect(store().markEvidenceAsViewed(e.id, c)).toBe(true);
    }
  });
});

/* --------------------- full flow over every real case -------------------- */

describe('end-to-end flow for every shipped case', () => {
  const cases = realCases();

  it.each(cases.map((c) => [c.id, c] as const))(
    'plays %s through to a clean correct verdict',
    (_id, caseData) => {
      store().startCase(caseData);
      // Study every document, then stamp exactly the real contradictions.
      caseData.evidences.forEach((e) => store().markEvidenceAsViewed(e.id, caseData));
      contradictionIds(caseData).forEach((id) => store().toggleEvidenceStamp(id));

      const xpBefore = store().stats.xp;
      const breakdown = store().submitVerdict(caseData, caseData.correctDecision);

      expect(breakdown.verdictCorrect).toBe(true);
      expect(breakdown.penalty).toBe(0);
      expect(breakdown.total).toBeGreaterThan(0);
      expect(store().stats.results[caseData.id]?.falseStamps).toBe(0);
      expect(store().stats.completedCaseIds).toContain(caseData.id);
      expect(store().stats.xp).toBeGreaterThan(xpBefore);
    },
  );
});
