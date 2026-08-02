import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GAME_CONFIG } from '../config/gameConfig';

const getRemoteFlags = vi.fn(
  async (_defaults: Record<string, string>): Promise<Record<string, string>> => ({}),
);
vi.mock('./platformAdapter', () => ({
  getRemoteFlags: (defaults: Record<string, string>) => getRemoteFlags(defaults),
}));

const { AD_FLAG, getAdPolicyConfig, initRemoteConfig, parseAdPolicyFlags, resetRemoteConfig } =
  await import('./remoteConfig');

const DEFAULTS = {
  firstMinCompletedCases: GAME_CONFIG.advertising.firstMinCompletedCases,
  firstMinActiveMs: GAME_CONFIG.advertising.firstMinActiveMs,
  repeatMinActiveMs: GAME_CONFIG.advertising.repeatMinActiveMs,
  minCasesBetweenInterstitials: GAME_CONFIG.advertising.minCasesBetweenInterstitials,
};

beforeEach(() => {
  resetRemoteConfig();
  getRemoteFlags.mockReset();
  getRemoteFlags.mockResolvedValue({});
});

describe('parseAdPolicyFlags', () => {
  it('falls back to the local defaults when no flags are published', () => {
    expect(parseAdPolicyFlags({})).toEqual(DEFAULTS);
  });

  it('applies remote values, converting seconds to ms', () => {
    expect(
      parseAdPolicyFlags({
        [AD_FLAG.firstMinCompletedCases]: '3',
        [AD_FLAG.firstMinActiveSec]: '360',
        [AD_FLAG.repeatMinActiveSec]: '300',
        [AD_FLAG.minCasesBetween]: '1',
      }),
    ).toEqual({
      firstMinCompletedCases: 3,
      firstMinActiveMs: 360_000,
      repeatMinActiveMs: 300_000,
      minCasesBetweenInterstitials: 1,
    });
  });

  it('ignores malformed or negative values instead of producing NaN', () => {
    const parsed = parseAdPolicyFlags({
      [AD_FLAG.firstMinActiveSec]: 'soon',
      [AD_FLAG.repeatMinActiveSec]: '-60',
      [AD_FLAG.minCasesBetween]: '',
    });
    expect(parsed).toEqual(DEFAULTS);
  });

  it('clamps absurd values to the sanity rails', () => {
    const parsed = parseAdPolicyFlags({
      [AD_FLAG.firstMinActiveSec]: '999999',
      [AD_FLAG.minCasesBetween]: '999',
    });
    expect(parsed.firstMinActiveMs).toBe(60 * 60 * 1000);
    expect(parsed.minCasesBetweenInterstitials).toBe(20);
  });

  it('accepts zero as a deliberate "no gating" value', () => {
    expect(parseAdPolicyFlags({ [AD_FLAG.minCasesBetween]: '0' }).minCasesBetweenInterstitials)
      .toBe(0);
  });
});

describe('initRemoteConfig', () => {
  it('serves local defaults until the flags land', () => {
    expect(getAdPolicyConfig()).toEqual(DEFAULTS);
  });

  it('publishes the local defaults to the portal and adopts the remote answer', async () => {
    getRemoteFlags.mockResolvedValue({ [AD_FLAG.repeatMinActiveSec]: '420' });
    await initRemoteConfig();

    expect(getRemoteFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        [AD_FLAG.firstMinActiveSec]: String(DEFAULTS.firstMinActiveMs / 1000),
      }),
    );
    expect(getAdPolicyConfig().repeatMinActiveMs).toBe(420_000);
    expect(getAdPolicyConfig().firstMinActiveMs).toBe(DEFAULTS.firstMinActiveMs);
  });
});
