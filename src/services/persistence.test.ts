import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GAME_CONFIG } from '../config/gameConfig';
import type { PersistedState } from '../types';

// Mock the SDK boundary so persistence's cloud calls are fully controllable.
const sdk = vi.hoisted(() => ({
  canUseCloud: vi.fn(() => false),
  cloudGet: vi.fn(async () => null as unknown),
  cloudSet: vi.fn(async () => undefined),
}));
vi.mock('./yandexSDK', () => sdk);

const LOCAL_KEY = 'claimDetectiveSave';

/** Re-import persistence fresh so its module-level debounce state is reset. */
async function freshPersistence() {
  vi.resetModules();
  return import('./persistence');
}

beforeEach(() => {
  localStorage.clear();
  sdk.canUseCloud.mockReturnValue(false);
  sdk.cloudGet.mockResolvedValue(null);
  sdk.cloudSet.mockResolvedValue(undefined);
  sdk.canUseCloud.mockClear();
  sdk.cloudGet.mockClear();
  sdk.cloudSet.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('defaults', () => {
  it('makeDefaultStats seeds the starting economy', async () => {
    const { makeDefaultStats } = await freshPersistence();
    const s = makeDefaultStats();
    expect(s.balance).toBe(GAME_CONFIG.economy.startingBalance);
    expect(s.xp).toBe(0);
    expect(s.completedCaseIds).toEqual([]);
    expect(s.unlockedAchievementIds).toEqual([]);
    expect(s.lastPlayedServerDay).toBeNull();
  });

  it('makeDefaultSnapshot uses the current save version', async () => {
    const { makeDefaultSnapshot } = await freshPersistence();
    expect(makeDefaultSnapshot().version).toBe(GAME_CONFIG.saveVersion);
    expect(makeDefaultSnapshot().session).toBeNull();
  });
});

describe('loadSnapshot', () => {
  it('returns a fresh default and isNew when nothing is stored', async () => {
    const { loadSnapshot } = await freshPersistence();
    const { snapshot, isNew } = await loadSnapshot();
    expect(isNew).toBe(true);
    expect(snapshot.version).toBe(GAME_CONFIG.saveVersion);
  });

  it('reads from LocalStorage when the cloud is unavailable', async () => {
    sdk.canUseCloud.mockReturnValue(false);
    const stored: PersistedState = {
      version: GAME_CONFIG.saveVersion,
      stats: {
        balance: 777,
        language: 'en',
        completedCaseIds: ['x'],
        results: {},
        lastDailyClaimServerMs: null,
        isBankrupt: false,
        xp: 5,
        streakCount: 1,
        lastPlayedServerDay: 3,
        unlockedAchievementIds: [],
      },
      session: null,
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(stored));

    const { loadSnapshot } = await freshPersistence();
    const { snapshot, isNew } = await loadSnapshot();
    expect(isNew).toBe(false);
    expect(snapshot.stats.balance).toBe(777);
    expect(snapshot.stats.language).toBe('en');
  });

  it('prefers the cloud over local and refreshes the local cache', async () => {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ version: 2, stats: { balance: 1 }, session: null }),
    );
    sdk.canUseCloud.mockReturnValue(true);
    sdk.cloudGet.mockResolvedValue({
      version: 2,
      stats: { balance: 9999, language: 'ru' },
      session: null,
    });

    const { loadSnapshot } = await freshPersistence();
    const { snapshot, isNew } = await loadSnapshot();
    expect(isNew).toBe(false);
    expect(snapshot.stats.balance).toBe(9999);
    // Cloud value should have been written back to LocalStorage.
    const cached = JSON.parse(localStorage.getItem(LOCAL_KEY)!);
    expect(cached.stats.balance).toBe(9999);
  });

  it('falls back to local when the cloud read throws', async () => {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ version: 2, stats: { balance: 42 }, session: null }),
    );
    sdk.canUseCloud.mockReturnValue(true);
    sdk.cloudGet.mockRejectedValue(new Error('network'));

    const { loadSnapshot } = await freshPersistence();
    const { snapshot } = await loadSnapshot();
    expect(snapshot.stats.balance).toBe(42);
  });

  it('returns a default for corrupt JSON in LocalStorage', async () => {
    localStorage.setItem(LOCAL_KEY, '{not valid json');
    const { loadSnapshot } = await freshPersistence();
    const { snapshot, isNew } = await loadSnapshot();
    expect(isNew).toBe(true);
    expect(snapshot.stats.balance).toBe(GAME_CONFIG.economy.startingBalance);
  });
});

describe('migration (v1 → v2) via loadSnapshot', () => {
  it('backfills new stats + session fields from an old save', async () => {
    // A v1 save: no xp/streak/achievement stats, session without revealedEvidenceIds.
    const v1 = {
      version: 1,
      stats: {
        balance: 1234,
        language: 'tr',
        completedCaseIds: ['a'],
        results: {},
        lastDailyClaimServerMs: null,
        isBankrupt: false,
      },
      session: {
        caseId: 'c1',
        selectedEvidenceIds: ['e1'],
        viewedEvidenceIds: ['e1'],
        startedAtServerMs: 50,
      },
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(v1));

    const { loadSnapshot } = await freshPersistence();
    const { snapshot } = await loadSnapshot();

    // Preserved values.
    expect(snapshot.stats.balance).toBe(1234);
    expect(snapshot.stats.language).toBe('tr');
    expect(snapshot.stats.completedCaseIds).toEqual(['a']);
    // Backfilled stats.
    expect(snapshot.stats.xp).toBe(0);
    expect(snapshot.stats.streakCount).toBe(0);
    expect(snapshot.stats.lastPlayedServerDay).toBeNull();
    expect(snapshot.stats.unlockedAchievementIds).toEqual([]);
    // Backfilled session field + upgraded version.
    expect(snapshot.session?.revealedEvidenceIds).toEqual([]);
    expect(snapshot.version).toBe(GAME_CONFIG.saveVersion);
  });
});

describe('sync (debounce + flush)', () => {
  const snap = (balance: number): PersistedState => ({
    version: GAME_CONFIG.saveVersion,
    stats: {
      balance,
      language: 'ru',
      completedCaseIds: [],
      results: {},
      lastDailyClaimServerMs: null,
      isBankrupt: false,
      xp: 0,
      streakCount: 0,
      lastPlayedServerDay: null,
      unlockedAchievementIds: [],
    },
    session: null,
  });

  it('coalesces rapid scheduleSync calls into a single debounced cloud write', async () => {
    vi.useFakeTimers();
    sdk.canUseCloud.mockReturnValue(true);
    const { scheduleSync } = await freshPersistence();

    scheduleSync(snap(1));
    scheduleSync(snap(2));
    scheduleSync(snap(3));
    expect(sdk.cloudSet).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(GAME_CONFIG.sync.debounceMs);

    expect(sdk.cloudSet).toHaveBeenCalledTimes(1);
    // The latest snapshot wins.
    expect(sdk.cloudSet).toHaveBeenCalledWith(snap(3));
  });

  it('always writes LocalStorage synchronously on scheduleSync', async () => {
    const { scheduleSync } = await freshPersistence();
    scheduleSync(snap(555));
    const cached = JSON.parse(localStorage.getItem(LOCAL_KEY)!);
    expect(cached.stats.balance).toBe(555);
  });

  it('flushSync writes immediately and cancels the pending debounce', async () => {
    vi.useFakeTimers();
    sdk.canUseCloud.mockReturnValue(true);
    const { scheduleSync, flushSync } = await freshPersistence();

    scheduleSync(snap(1)); // arms the debounce timer
    await flushSync(snap(2)); // should write now and cancel the timer

    expect(sdk.cloudSet).toHaveBeenCalledTimes(1);
    expect(sdk.cloudSet).toHaveBeenCalledWith(snap(2));

    // No additional write when the (cancelled) debounce window elapses.
    await vi.advanceTimersByTimeAsync(GAME_CONFIG.sync.debounceMs);
    expect(sdk.cloudSet).toHaveBeenCalledTimes(1);
  });

  it('swallows a LocalStorage quota error without throwing', async () => {
    const { scheduleSync } = await freshPersistence();
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });
    expect(() => scheduleSync(snap(1))).not.toThrow();
    spy.mockRestore();
  });
});
