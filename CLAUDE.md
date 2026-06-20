# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Claim Detective** — a data-driven insurance-investigation game built for the **Yandex Games** platform. React + TypeScript + Zustand + Zod + Tailwind + Framer Motion, bundled with Vite. The player reviews a claim file, opens evidence cards, stamps the ones that contradict the claim, and renders an approve/reject verdict; reward is scored on both the verdict and the precision of the stamping.

## Commands

```bash
npm install
npm run dev        # Vite dev server. SDK auto-falls back to LocalStorage when not on Yandex.
npm run build      # Production bundle → dist/ (base './', ready to ZIP for Yandex)
npm run typecheck  # tsc --noEmit — the only static gate; run this before considering work done
```

There is no test runner, linter config, or CI in this repo. `npm run typecheck` is the verification step — the engine is written to be deterministic and the type system + Zod are the safety net.

## The one rule that shapes everything: static/runtime separation

Two concerns are kept strictly apart and must never mix:

1. **Static case data** — immutable content authored as JSON in `src/data/cases/`, validated by Zod at load. Defined by `Case`/`Evidence` in `src/types/index.ts`.
2. **Runtime player state** — mutable progression/economy, persisted to Yandex cloud or LocalStorage. Lives entirely in the Zustand store and is described by `PlayerStats`/`ActiveSession`/`PersistedState`.

Never store a `Case` inside `PlayerStats`, and never store player progress inside a `Case`. `Case` data is passed *into* store actions by the React layer (after Zod validation) — the store never holds case content. The persistence layer only ever serializes the runtime slice (`PersistedState`).

## Architecture / data flow

The store (`src/store/gameStore.ts`) is the single runtime authority and composes three lower layers it depends on (and which never depend on it):

- **`src/engine/rewardEngine.ts`** — pure scoring + daily-availability math. No state, no SDK, no side effects; every function is deterministic given its inputs. This is where the reward formula and daily cooldown live.
- **`src/services/persistence.ts`** — owns *where* the snapshot lives and *when* it's written. Knows nothing about cases or rewards.
- **`src/services/yandexSDK.ts`** — the **only** place that touches `window.YaGames`. The engine never calls the SDK directly; everything funnels through this adapter so a missing/failed SDK degrades to offline mode.

`src/App.tsx` is the whole UI controller — it wires the store to the components, manages screen-local state (selected case, open modal, result sheet), and is the only component that calls store actions. Components in `src/components/` are presentational.

Key lifecycle map (also documented in the gameStore header):
```
init()             → initYandex() → loadSnapshot()    (cloud-first hydration)
any mutation       → persist()    → scheduleSync()    (10s debounced cloud write)
closeCase()/verdict→ persist(true)→ flushSync()       (immediate cloud write)
ad open/close      → onPauseChange() → setPaused()    (freeze + mute)
restoreFunds()     → showRewardedAd() → onReward → balance reset
daily gating       → getServerTimeMs()                (NEVER device time)
```

## Non-obvious behaviors to preserve

- **Reward formula** (`evaluateReward`): `BaseReward = claimAmount × (daily ? 5 : 1)`. Verdict component = 50% of base iff `decision === correctDecision`. Proof component = 50% of base × (correctStamps / totalContradictions). Penalty = 50 per *falsely* stamped card. Net total may be negative. A case with **zero** contradictions awards the full proof component automatically (guards divide-by-zero). All tuning lives in `src/config/gameConfig.ts` — adjust the economy there, not in the engine.
- **Server time only for daily gating.** Daily lock/unlock evaluates against `getServerTimeMs()` (Yandex `serverTime()`), never the device clock. Device time is used only as an offline fallback and is explicitly best-effort.
- **Persistence is dual-write.** LocalStorage is written synchronously on every change (instant, offline-safe); the cloud write is debounced to ≤1 per 10s. Case closure and unload call `flushSync` to bypass the debounce. On load, cloud wins over local when present.
- **Resume mid-case.** `ActiveSession` is persisted alongside stats, so quitting mid-investigation restores stamps and viewed cards. `startCase` deliberately does *not* wipe an existing session for the same case.
- **Pause guard.** Any ad open/close (fullscreen or rewarded) broadcasts through `onPauseChange`, flipping the global `isPaused` flag that freezes the game and shows the pause overlay.
- **Bankruptcy.** Balance ≤ 0 sets `isBankrupt`, which gates progression behind a rewarded-video "restore funds" → resets to 2000. In dev/offline, `showRewardedAd` grants the reward immediately so the game stays playable.
- **Verdict gating** (`selectCaseInvestigationGate`): you may only *approve* after viewing every evidence card; you may only *reject* with at least one stamped card (or after a full review).

## Adding content

- **New case:** drop a JSON into `src/data/cases/` and add it to the `RAW_CASES` array in `src/data/caseLoader.ts`. Every case is Zod-validated at load (`src/data/caseSchema.ts`) — malformed content is logged and skipped, never silently accepted. Evidence ids must be unique within a case (enforced by a `superRefine`).
- **New language:** add the code to `SUPPORTED_LANGUAGES` in `src/types/index.ts`, then fill that column in **every** case JSON and in `src/i18n/ui.ts`. The Zod `localizedShape` is `.strict()` and requires an entry for every supported language, so a missing translation fails loudly at load. RTL languages are listed in `RTL_LANGUAGES` (currently `ar`).
- The schema in `caseSchema.ts` and the interfaces in `types/index.ts` are kept in lockstep by compile-time `AssertAssignable` guards — if you change one, change the other or `typecheck` breaks.

## Design language (the visual metaphor is a hard constraint)

The product is deliberately **not** a flashy mobile game. The screen is an *"Investigation Folder laid out on a detective's desk"* — physical paper documents, official forms, ink stamps, and archive folders. Target audience is 30–60, so the UI prioritizes **high text readability, minimalist layout, clear data hierarchy, and large hit targets** over spectacle.

**Red lines — do not introduce:** neon effects, cartoon graphics, gaming/sci-fi gradients, fantasy elements, or mobile-casino aesthetics. Core emotion to serve: *"I noticed the lie and exposed the fraudster."*

Design tokens are wired into `tailwind.config.js` (do not hardcode hex — use these names):

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#111827` | desk background |
| `surface` | `#1F2937` | sidebars / panels |
| `paper` | `#F3F4F6` | document sheets |
| `ink` | `#1F2937` | text on paper |
| `accent` | `#2563EB` | primary actions |
| `success` | `#16A34A` | Approve |
| `danger` | `#DC2626` | Reject |
| `gold` | `#D97706` | daily-case highlight |

Fonts: `font-serif` (IBM Plex Serif) for document/headline text, `font-sans` (Inter) for UI chrome. Custom `shadow-folder` / `shadow-lift` give sheets physical depth.

**Layout:** three-column "investigation desk" on desktop — left sidebar 280px (case nav + progress + language selector), centered case folder (max ~480px), right sidebar 280px (balance, accuracy %, leaderboard). Collapses to a single focused column on mobile (`md:` breakpoints in `App.tsx`).

**Daily case** is visually premium: gold borders + an "URGENT" stamp on the folder cover, and it carries the ×5 reward multiplier.

**Stamping flow:** rejecting a claim requires justification — opening an evidence card and tapping "Mark as Contradiction". Rejecting with zero stamps must surface the prompt *"Rejection must be justified…"* rather than submitting (see `handleReject` in `App.tsx`). Animations (card lift, document slide, ink-stamp scale dampener) use Framer Motion.

## Yandex deploy

`npm run build`, then upload the contents of `dist/` as a ZIP in the Yandex Games developer console. The build uses a relative base (`./` in `vite.config.ts`) so it runs from the platform's hosting path as-is. The leaderboard is named `balance` (`LEADERBOARD_NAME` in `services/yandexSDK.ts`) and must be created in the developer console to function; it's best-effort and a no-op if absent.
