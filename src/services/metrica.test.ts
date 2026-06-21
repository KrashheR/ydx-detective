import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/* The counter id is read from gameConfig at call time, so we mock the config to
   flip between "disabled" (placeholder 0) and "enabled" (real id) per test. */
const config = vi.hoisted(() => ({ counterId: 0, webvisor: true }));
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
});

describe('metrica adapter — disabled (no-op) modes', () => {
  it('does not throw and never calls ym when the counter never loaded', async () => {
    config.counterId = 12345;
    const m = await freshAdapter();
    expect(() => m.initMetrica()).not.toThrow();
    expect(() => m.trackGoal(m.GOAL.caseStart, { a: 1 })).not.toThrow();
    expect(() => m.setUserParams({ level: 2 })).not.toThrow();
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
      kind: 'note',
      cost: 200,
    });
  });

  it('forwards setUserParams as a userParams call', () => {
    m.initMetrica();
    m.setUserParams({ level: 5, balance: 1000 });
    expect(ym).toHaveBeenCalledWith(99, 'userParams', {
      level: 5,
      balance: 1000,
    });
  });

  it('does not track before init (enabled flag is off)', () => {
    m.trackGoal(m.GOAL.caseStart, {});
    expect(ym).not.toHaveBeenCalled();
  });
});
