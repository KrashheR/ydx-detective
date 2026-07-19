import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/* The counter id is read from gameConfig at call time, so we mock the config to
   flip between "disabled" (placeholder 0) and "enabled" (real id) per test. */
const config = vi.hoisted(() => ({
  counterId: 0,
  webvisor: true,
  economyVersion: 'test-economy',
  contentVersion: 'test-content',
  experimentGroup: 'control',
}));
vi.mock('../config/gameConfig', () => ({
  GAME_CONFIG: { analytics: config },
}));

/* The adapter holds module-level `initialized`/`enabled` flags. Re-import a
   fresh copy each test so init() is exercised from a clean slate. */
async function freshAdapter() {
  vi.resetModules();
  return import('./metrica');
}

beforeEach(() => {
  config.counterId = 0;
  config.webvisor = true;
  delete (window as { ym?: unknown }).ym;
});

afterEach(() => {
  delete (window as { ym?: unknown }).ym;
  document.querySelectorAll('script[src="https://mc.yandex.ru/metrika/tag.js"]')
    .forEach((script) => script.remove());
});

describe('metrica adapter — disabled (no-op) modes', () => {
  it('creates the async loader without waiting for the counter script', async () => {
    config.counterId = 12345;
    const m = await freshAdapter();
    expect(() => m.initMetrica()).not.toThrow();
    expect(() => m.trackGoal(m.GOAL.caseStart, { a: 1 })).not.toThrow();
    expect(() => m.setUserParams({ level: 2 })).not.toThrow();
    const script = document.querySelector<HTMLScriptElement>(
      'script[src="https://mc.yandex.ru/metrika/tag.js"]',
    );
    expect(script?.async).toBe(true);
    expect(typeof window.ym).toBe('function');
  });

  it('stays a no-op when the counter id is a falsy placeholder', async () => {
    config.counterId = 0;
    const ym = vi.fn();
    (window as { ym?: unknown }).ym = ym;
    const m = await freshAdapter();
    m.initMetrica();
    m.trackGoal(m.GOAL.verdictSubmit, { total: 100 });
    m.setUserParams({ balance: 500 });
    expect(ym).not.toHaveBeenCalled();
  });
});

describe('metrica adapter — enabled', () => {
  let ym: ReturnType<typeof vi.fn>;
  let m: Awaited<ReturnType<typeof freshAdapter>>;

  beforeEach(async () => {
    config.counterId = 99;
    ym = vi.fn();
    (window as { ym?: unknown }).ym = ym;
    m = await freshAdapter();
  });

  it('initializes the counter once (idempotent)', () => {
    m.initMetrica();
    m.initMetrica();
    const initCalls = ym.mock.calls.filter((c) => c[1] === 'init');
    expect(initCalls).toHaveLength(1);
    const [firstInit] = initCalls;
    expect(firstInit?.[0]).toBe(99);
    expect(firstInit?.[2]).toMatchObject({ webvisor: true });
  });

  it('forwards trackGoal as a reachGoal call with params', () => {
    m.initMetrica();
    m.trackGoal(m.GOAL.hintBuy, { kind: 'note', cost: 200 });
    expect(ym).toHaveBeenCalledWith(99, 'reachGoal', 'hint_buy', {
      economyVersion: 'test-economy',
      contentVersion: 'test-content',
      experimentGroup: 'control',
      kind: 'note',
      cost: 200,
    });
  });

  it('forwards setUserParams as a userParams call', () => {
    m.initMetrica();
    m.setUserParams({ level: 5, balance: 1000 });
    expect(ym).toHaveBeenCalledWith(99, 'userParams', {
      economyVersion: 'test-economy',
      contentVersion: 'test-content',
      experimentGroup: 'control',
      level: 5,
      balance: 1000,
    });
  });

  it('does not track before init (enabled flag is off)', () => {
    m.trackGoal(m.GOAL.caseStart, {});
    expect(ym).not.toHaveBeenCalled();
  });

  it('tallies adsPerSession/verdictsSinceLastAd and merges them onto ad_open', () => {
    m.initMetrica();
    ym.mockClear();

    m.trackGoal(m.GOAL.verdictSubmit, { total: 100 });
    m.trackGoal(m.GOAL.verdictSubmit, { total: 200 });
    m.trackGoal(m.GOAL.adOpen, { kind: 'fullscreen', placement: 'verdict' });

    expect(ym).toHaveBeenCalledWith(
      99,
      'reachGoal',
      'ad_open',
      expect.objectContaining({
        adsPerSession: 1,
        verdictsSinceLastAd: 2,
      }),
    );

    // The counter resets after the ad and starts accumulating again.
    m.trackGoal(m.GOAL.verdictSubmit, { total: 50 });
    m.trackGoal(m.GOAL.adOpen, { kind: 'rewarded', placement: 'witness_canvass' });
    expect(ym).toHaveBeenCalledWith(
      99,
      'reachGoal',
      'ad_open',
      expect.objectContaining({
        adsPerSession: 2,
        verdictsSinceLastAd: 1,
      }),
    );
  });

  it('records active-time boundaries when an ad pauses play', () => {
    m.initMetrica();
    ym.mockClear();

    m.setAnalyticsAdPaused(true);
    m.setAnalyticsAdPaused(false);

    const goals = ym.mock.calls
      .filter((call) => call[1] === 'reachGoal')
      .map((call) => call[2]);
    expect(goals).toContain('active_interval');
    expect(goals).toContain('session_pause');
    expect(goals).toContain('session_resume');
  });
});
