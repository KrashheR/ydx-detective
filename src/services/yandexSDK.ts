/**
 * Yandex Games SDK boundary.
 *
 * The engine NEVER touches `window.YaGames` directly. Everything funnels through
 * this adapter so that:
 *   • the store stays unit-testable (swap in a mock SDK);
 *   • a missing / failed SDK degrades gracefully to offline mode;
 *   • SDK quirks (sync auth state, ad lifecycle callbacks) live in one place.
 *
 * SDK surface used:
 *   ysdk.getPlayer()      → player.setData / getData  (cloud saves)
 *   ysdk.serverTime()     → authoritative time for daily gating
 *   ysdk.adv.showFullscreenAdv / showRewardedVideo → ad lifecycle (pause guard)
 */

/* ----------------------------- Minimal SDK typings ------------------------ */
// We type only what we consume. The real SDK exposes far more.

interface YandexPlayer {
  setData(data: Record<string, unknown>, flush?: boolean): Promise<void>;
  getData(keys?: string[]): Promise<Record<string, unknown>>;
  getMode(): 'lite' | ''; // 'lite' === anonymous (no cloud persistence guaranteed)
}

interface AdvCallbacks {
  onOpen?: () => void;
  onClose?: (wasShown: boolean) => void;
  onError?: (error: unknown) => void;
  /** Rewarded video only: fires when the reward is actually granted. */
  onRewarded?: () => void;
}

/** Subset of the leaderboards API we consume. */
interface YandexLeaderboardEntry {
  rank: number;
  score: number;
  player: {
    publicName: string;
    getAvatarSrc(size: 'small' | 'medium' | 'large'): string;
  };
}

interface YandexLeaderboardEntries {
  /** The requesting player's own rank, or 0 when they are not ranked yet. */
  userRank: number;
  entries: YandexLeaderboardEntry[];
}

interface YandexLeaderboards {
  setLeaderboardScore(name: string, score: number): Promise<void>;
  getLeaderboardEntries(
    name: string,
    opts?: { quantityTop?: number; includeUser?: boolean; quantityAround?: number },
  ): Promise<YandexLeaderboardEntries>;
}

interface YandexSDK {
  getPlayer(options?: { scopes?: boolean }): Promise<YandexPlayer>;
  getLeaderboards(): Promise<YandexLeaderboards>;
  /** Player/UI locale, e.g. 'ru', 'en', 'tr'. Source of the auto language. */
  environment: { i18n: { lang: string } };
  serverTime(): number; // epoch ms, authoritative
  adv: {
    showFullscreenAdv(opts: { callbacks?: AdvCallbacks }): void;
    showRewardedVideo(opts: { callbacks?: AdvCallbacks }): void;
  };
  /** Optional feedback (rating) API — absent on older SDK builds. */
  feedback?: {
    canReview(): Promise<{ value: boolean; reason?: string }>;
    requestReview(): Promise<{ feedbackSent: boolean }>;
  };
  features?: {
    LoadingAPI?: { ready(): void };
  };
}

declare global {
  interface Window {
    YaGames?: { init(): Promise<YandexSDK> };
  }
}

/* ------------------------------- Lifecycle hooks -------------------------- */

/**
 * Subscribers (e.g. the Zustand store's pause guard, audio manager) register
 * here. Every ad open/close — fullscreen *or* rewarded — broadcasts so a single
 * `isPaused` flag can freeze the game and mute audio contexts deterministically.
 */
type PauseListener = (paused: boolean) => void;
const pauseListeners = new Set<PauseListener>();

export function onPauseChange(listener: PauseListener): () => void {
  pauseListeners.add(listener);
  return () => pauseListeners.delete(listener);
}

function broadcastPause(paused: boolean): void {
  for (const l of pauseListeners) l(paused);
}

/* --------------------------------- State --------------------------------- */

let sdk: YandexSDK | null = null;
let player: YandexPlayer | null = null;
let leaderboards: YandexLeaderboards | null = null;
let isAuthenticated = false;

/** Resolves once init has been attempted (success or fail). Idempotent. */
let initPromise: Promise<void> | null = null;

/**
 * The SDK `<script>` is `async`, so it may not be present the instant React
 * mounts. Poll briefly for `window.YaGames` before giving up to offline mode.
 */
function waitForYaGames(timeoutMs = 4000): Promise<Window['YaGames'] | null> {
  return new Promise((resolve) => {
    if (window.YaGames) return resolve(window.YaGames);
    const start = Date.now();
    const id = setInterval(() => {
      if (window.YaGames) {
        clearInterval(id);
        resolve(window.YaGames);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(id);
        resolve(null);
      }
    }, 100);
  });
}

/**
 * Initialize the SDK and player. Safe to call repeatedly. On any failure the
 * adapter silently flips to offline mode and the engine falls back to
 * LocalStorage — gameplay is never blocked by a missing SDK.
 */
export function initYandex(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const yaGames = await waitForYaGames();
      if (!yaGames) throw new Error('YaGames not present');
      sdk = await yaGames.init();
      // `scopes: false` → no permission prompt; cloud saves still work for
      // logged-in players, and getMode() tells us if we're anonymous.
      player = await sdk.getPlayer({ scopes: false });
      isAuthenticated = player.getMode() !== 'lite';
      // Leaderboards are best-effort: absent if not configured in the console.
      try {
        leaderboards = await sdk.getLeaderboards();
      } catch {
        leaderboards = null;
      }
    } catch {
      sdk = null;
      player = null;
      leaderboards = null;
      isAuthenticated = false;
    }
  })();
  return initPromise;
}

/** Notify Yandex only after the loader has reached 100% and the UI is ready. */
export function notifyGameReady(): void {
  sdk?.features?.LoadingAPI?.ready();
}

/** True only when cloud persistence is actually available. */
export function canUseCloud(): boolean {
  return sdk !== null && player !== null && isAuthenticated;
}

/**
 * Authoritative time for daily-case gating. Falls back to device time ONLY when
 * the SDK is unavailable — callers should treat a non-cloud session's daily
 * timers as best-effort. Returns epoch ms.
 */
export function getServerTimeMs(): number {
  if (sdk) {
    try {
      return sdk.serverTime();
    } catch {
      /* fall through */
    }
  }
  return Date.now();
}

/**
 * The player's Yandex locale (`environment.i18n.lang`), e.g. 'ru' / 'en' / 'tr'.
 * Returns null when the SDK is unavailable (offline) or the field is missing, so
 * callers can fall back to the default language. The store maps this onto the
 * set of supported languages.
 */
export function getYandexLang(): string | null {
  try {
    return sdk?.environment?.i18n?.lang ?? null;
  } catch {
    return null;
  }
}

/* ------------------------------ Cloud saves ------------------------------ */

const CLOUD_KEY = 'claimDetectiveSave';

/** Write the snapshot to Yandex cloud. Throws on failure so callers can fall back. */
export async function cloudSet(snapshot: unknown): Promise<void> {
  if (!player) throw new Error('No Yandex player');
  // `flush: true` forces an immediate network write; our debounce upstream
  // already rate-limits these calls to respect Yandex quotas.
  await player.setData({ [CLOUD_KEY]: snapshot }, true);
}

/** Read the snapshot from Yandex cloud. Returns null when absent/unavailable. */
export async function cloudGet(): Promise<unknown | null> {
  if (!player) return null;
  const data = await player.getData([CLOUD_KEY]);
  return data?.[CLOUD_KEY] ?? null;
}

/* --------------------------------- Ads ----------------------------------- */

/**
 * Show an interstitial. Wraps the open/close callbacks so the global pause flag
 * toggles automatically. `onDone` lets callers continue the user action once
 * the ad lifecycle has ended.
 */
export function showFullscreenAd(onDone?: () => void): void {
  if (!sdk) {
    onDone?.();
    return;
  }
  sdk.adv.showFullscreenAdv({
    callbacks: {
      onOpen: () => broadcastPause(true),
      onClose: () => {
        broadcastPause(false);
        onDone?.();
      },
      onError: () => {
        broadcastPause(false);
        onDone?.();
      },
    },
  });
}

/**
 * Show a rewarded video. `onReward` fires only when the player earned the
 * reward (e.g. "restore funds"). Pause is managed automatically.
 */
export function showRewardedAd(onReward: () => void): void {
  if (!sdk) {
    // Offline / no SDK: in dev we grant the reward so the game stays playable.
    onReward();
    return;
  }
  let rewarded = false;
  sdk.adv.showRewardedVideo({
    callbacks: {
      onOpen: () => broadcastPause(true),
      onRewarded: () => {
        rewarded = true;
      },
      onClose: () => {
        broadcastPause(false);
        if (rewarded) onReward();
      },
      onError: () => broadcastPause(false),
    },
  });
}

/* ------------------------------ Feedback --------------------------------- */

/**
 * Whether the player can currently rate the game via the Yandex native dialog.
 * Returns false when the SDK is unavailable or canReview() says no
 * (e.g. already rated, or not enough sessions logged by Yandex).
 * In dev/offline mode always returns true so the modal stays testable.
 */
export async function canReview(): Promise<boolean> {
  if (!sdk) return true; // offline / dev — always eligible for testing
  if (!sdk.feedback) return false;
  try {
    const { value } = await sdk.feedback.canReview();
    return value;
  } catch {
    return false;
  }
}

/**
 * Open the Yandex native rating dialog. Returns true when the player actually
 * submitted a rating, false otherwise (dismissed or unavailable).
 * In dev/offline mode resolves immediately with true so the flow is testable.
 */
export async function requestReview(): Promise<boolean> {
  if (!sdk) return true; // offline / dev
  if (!sdk.feedback) return false;
  try {
    const { feedbackSent } = await sdk.feedback.requestReview();
    return feedbackSent;
  } catch {
    return false;
  }
}

/* ----------------------------- Leaderboards ------------------------------ */

/** Name of the leaderboard configured in the Yandex developer console. */
export const LEADERBOARD_NAME = 'balance';

/** Normalized leaderboard row consumed by the UI. */
export interface LeaderboardRow {
  rank: number;
  name: string;
  score: number;
  avatar: string | null;
  isCurrentPlayer: boolean;
}

/**
 * Submit the player's score. Fire-and-forget and fully optional — a missing
 * leaderboard or offline session is a no-op, never an error.
 */
export async function submitLeaderboardScore(score: number): Promise<void> {
  if (!leaderboards) return;
  try {
    await leaderboards.setLeaderboardScore(LEADERBOARD_NAME, score);
  } catch {
    /* leaderboard not configured / network — ignore */
  }
}

/**
 * Fetch the leaderboard window the UI renders: the global top `topN`, plus —
 * when the player sits below that — a band of `around` rows on each side of
 * them (so the default 5 / 2 yields the top 5 followed by "2 above ▸ you ▸ 2
 * below"). Yandex returns both blocks in one `entries` array, already sorted by
 * rank; when the player is inside the top the two blocks overlap and we dedupe.
 *
 * The current player is flagged via the response's `userRank` (matching by rank
 * is robust even for anonymous players that share a blank public name). Returns
 * null when the leaderboard is unavailable so callers fall back to a local view.
 */
export async function fetchLeaderboard(
  topN = 5,
  around = 2,
): Promise<LeaderboardRow[] | null> {
  if (!leaderboards) return null;
  try {
    const { entries, userRank } = await leaderboards.getLeaderboardEntries(
      LEADERBOARD_NAME,
      { quantityTop: topN, includeUser: true, quantityAround: around },
    );
    const seen = new Set<number>();
    return entries
      .filter((e) => !seen.has(e.rank) && (seen.add(e.rank), true))
      .sort((a, b) => a.rank - b.rank)
      .map((e) => ({
        rank: e.rank,
        name: e.player.publicName || 'Player',
        score: e.score,
        avatar: e.player.getAvatarSrc('small') ?? null,
        isCurrentPlayer: userRank > 0 && e.rank === userRank,
      }));
  } catch {
    return null;
  }
}
