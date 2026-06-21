# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Где ложь? Симулятор детектива** (*Where is the Lie? Detective Simulator*) — a data-driven insurance-investigation game built for the **Yandex Games** platform. React + TypeScript + Zustand + Zod + Tailwind + Framer Motion, bundled with Vite. The player reviews a claim file, opens evidence cards, stamps the ones that contradict the claim, and renders an approve/reject verdict; reward is scored on both the verdict and the precision of the stamping

## 📚 Documentation map (read these to save tokens)

Detailed, up-to-date docs live in **`docs/`**. This file is the rules + condensed map; jump straight to the targeted doc instead of re-deriving from source. Index: **[docs/README.md](docs/README.md)**.

| Doc | Read when |
| --- | --------- |
| [docs/01-overview.md](docs/01-overview.md) | Need product context, audience, game loop |
| [docs/02-architecture.md](docs/02-architecture.md) | Touching architecture, store, engines, data flow, lifecycle |
| [docs/03-gameplay.md](docs/03-gameplay.md) | Changing the investigation flow, stamping, verdict gating, budget, hints, campaign unlocks |
| [docs/04-economy-progression.md](docs/04-economy-progression.md) | Tuning reward formula, XP/levels, streaks, achievements, daily, bankruptcy |
| [docs/05-design.md](docs/05-design.md) | Changing UI/visuals/tokens/evidence renderers/components |
| [docs/06-yandex-platform.md](docs/06-yandex-platform.md) | Touching SDK, cloud saves, server time, ads, leaderboard, rating, persistence |
| [docs/07-authoring-content.md](docs/07-authoring-content.md) | Adding a case, language, achievement, or evidence type (+ `src/data/CASE_AUTHORING_GUIDE.json`) |
| [docs/08-build-test-deploy.md](docs/08-build-test-deploy.md) | Build, test, verify, deploy to Yandex |

The non-obvious behaviors below remain the authoritative quick-reference for engine/store rules; `docs/` expands on each. If a doc and the source disagree, **source wins** — fix the doc.

> **🔄 Keep the docs current (required).** After any change that alters behavior, architecture, mechanics, economy/config, design tokens, the Yandex integration, or the content-authoring process, update the matching `docs/*.md` file **in the same change** — and this `CLAUDE.md` if a non-obvious behavior or the doc map shifted. Treat the docs as part of "done": a change isn't finished until the docs describing it match. When you add a new doc, also add it to the map above and to `docs/README.md`. Keep edits surgical — fix the affected lines, don't rewrite whole files. If you discover a doc that already drifted from the code, correct it as you pass through.

## Commands

```bash
npm install
npm run dev        # Vite dev server. SDK auto-falls back to LocalStorage when not on Yandex.
npm run build      # Production bundle → dist/ (base './', ready to ZIP for Yandex)
npm run typecheck  # tsc --noEmit — static gate; run before considering work done
npm test           # vitest run — full suite (~169 tests across engines, store, UI)
npm run test:watch # vitest in watch mode
npm run test:cov   # vitest run --coverage
```

**Verification = `npm run typecheck` AND `npm test`** — both must pass before work is done. There is a Vitest suite (`*.test.ts(x)` colocated next to sources; config lives in `vite.config.ts`, jsdom + Testing Library for `App.test.tsx`). There is no linter config or CI. The engine is written to be deterministic, so the type system + Zod + the test suite are the safety net.

## The one rule that shapes everything: static/runtime separation

Two concerns are kept strictly apart and must never mix:

1. **Static case data** — immutable content authored as JSON in `src/data/cases/`, validated by Zod at load. Defined by `Case`/`Evidence` in `src/types/index.ts`.
2. **Runtime player state** — mutable progression/economy, persisted to Yandex cloud or LocalStorage. Lives entirely in the Zustand store and is described by `PlayerStats`/`ActiveSession`/`PersistedState`.

Never store a `Case` inside `PlayerStats`, and never store player progress inside a `Case`. `Case` data is passed _into_ store actions by the React layer (after Zod validation) — the store never holds case content. The persistence layer only ever serializes the runtime slice (`PersistedState`).

## Architecture / data flow

The store (`src/store/gameStore.ts`) is the single runtime authority and composes lower layers it depends on (and which never depend on it):

- **`src/engine/rewardEngine.ts`** — pure scoring + daily-availability math. No state, no SDK, no side effects; every function is deterministic given its inputs. This is where the reward formula and daily cooldown live. Player-derived modifiers (rank/streak bonus %) are passed _in_ as arguments so the engine stays pure.
- **`src/engine/rankEngine.ts`** — pure career-progression math: `evaluateXpGain` (case → XP) and `evaluateRank` (cumulative XP → rank + progress).
- **`src/engine/streakEngine.ts`** — pure daily-streak math: consecutive _server_-days → streak length + capped reward bonus.
- **`src/engine/achievementsEngine.ts`** — pure unlock predicates keyed by achievement id, evaluated against post-case stats; catalog metadata (i18n text + bonuses) lives in `src/data/achievements.ts`.
- **`src/services/persistence.ts`** — owns _where_ the snapshot lives and _when_ it's written. Knows nothing about cases or rewards. Also owns the save-version migration.
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

- **Reward formula** (`evaluateReward`): `BaseReward = claimAmount × (daily ? 5 : 1)`. Verdict component = 50% of base iff `decision === correctDecision`. Proof component = 50% of base × (correctStamps / totalContradictions). **Bonus component** = (rank% + streak%) applied to the _positive_ base only (verdict + proof + efficiency, never the penalty). Penalty = 50 per _falsely_ stamped card. Net total may be negative. A case with **zero** contradictions awards the full proof component automatically (guards divide-by-zero). All tuning lives in `src/config/gameConfig.ts` — adjust the economy there, not in the engine.
- **Investigation budget** (the budgeted-case variant — see `Case.investigationBudget`). When a case sets `investigationBudget: N`, the player may open at most N evidence cards before deciding, and the reward split shifts from 50/50 to **40 verdict / 40 proof / 20 efficiency** (`reward.budgeted` in `gameConfig.ts`; the three shares sum to 1.0 so the positive ceiling stays 100% of base). The **efficiency component** = `efficiencyShare × base × (unusedOpens / budget)`, paid **only** on a correct verdict; `opensUsed` is passed into `evaluateReward` from `session.viewedEvidenceIds.length` and **defaults to the full budget (zero efficiency) when omitted**. Un-budgeted cases are completely unaffected (no efficiency component, classic gate). Touch-points if you change this: `evaluateReward`, `selectCaseInvestigationGate`, `markEvidenceAsViewed`, `EvidenceCard`'s `sealed` prop, and `RewardBreakdown.efficiencyComponent`.
- **Two economies, kept separate.** `balance` is the spendable currency (grows from rewards, spent on hints, reset by bankruptcy). `xp` is permanent career progress that only ever increases and drives the rank ladder. Never conflate them.
- **Ranks & XP** (`rankEngine`). Each closed case grants XP (difficulty weight × proof quality, ×2 daily; a small flat award for a wrong verdict). Cumulative XP maps to an investigator level (`GAME_CONFIG.progression.ranks`, the `level_01`…`level_30` ladder), which grants an additive reward-bonus %. The level bonus applied to a case is read _before_ that case's XP is added (it reflects standing at solve time); promotion detection uses the _post_-bonus XP so an achievement bonus can also tip a threshold. Level titles are i18n keys `level_<id>` (e.g. `level_01`).
- **Streaks** (`streakEngine`). Consecutive _server_-days with ≥1 closed case; +5%/day reward bonus capped at +50%. Same-day replays don't stack; a skipped day resets to 1. Evaluated only in `submitVerdict`, against server time.
- **Hints** (`buyHint`). Two hints, both revealing the next unrevealed card's true status (appended to `session.revealedEvidenceIds`, so they survive resume; the reveal is shown on the EvidenceCard grid and in the StampModal). They differ only in unlock method: **Inspector Note** charges `balance` (20% of `claimAmount`, via `hints.inspectorNoteClaimPct`) and is a no-op when unaffordable; **Witness Canvass** is free but gated on a rewarded Yandex video (`showRewardedAd` → reveal on `onRewarded`; dev/offline grants instantly). Hints never trigger bankruptcy.
- **Achievements** (`achievementsEngine` + `data/achievements.ts`). One-time unlocks evaluated against post-case stats after every verdict; each grants a one-time XP + currency bonus and is recorded in `stats.unlockedAchievementIds`. Newly unlocked ones surface on the ResultSheet; the full archive opens from the right sidebar.
- **Server time only for daily gating.** Daily lock/unlock evaluates against `getServerTimeMs()` (Yandex `serverTime()`), never the device clock. Device time is used only as an offline fallback and is explicitly best-effort.
- **Persistence is dual-write.** LocalStorage is written synchronously on every change (instant, offline-safe); the cloud write is debounced to ≤1 per 10s. Case closure and unload call `flushSync` to bypass the debounce. On load, cloud wins over local when present.
- **Resume mid-case.** `ActiveSession` is persisted alongside stats, so quitting mid-investigation restores stamps, viewed cards, and bought hints (`revealedEvidenceIds` / `briefingRevealed`). `startCase` deliberately does _not_ wipe an existing session for the same case.
- **Save migration.** `GAME_CONFIG.saveVersion` is the persisted-snapshot schema version (currently **3**). `migrate()` in `persistence.ts` spreads current defaults under older saves to backfill new fields (v1→v2 added the xp/streak/achievement stats and the session's hint fields; v2→v3 added `ratingDismissals`). Bump the version and extend `migrate()` whenever the persisted shape changes.
- **Pause guard.** Any ad open/close (fullscreen or rewarded) broadcasts through `onPauseChange`, flipping the global `isPaused` flag that freezes the game and shows the pause overlay.
- **Bankruptcy.** Balance ≤ 0 sets `isBankrupt`, which gates progression behind a rewarded-video "restore funds" → resets to 2000. In dev/offline, `showRewardedAd` grants the reward immediately so the game stays playable.
- **Campaign unlocks** (`caseUnlockEngine`). Standard cases are gated by an investigator-level requirement (`GAME_CONFIG.caseUnlocks.standardCaseRequiredLevelById`, falling back to `defaultRequiredLevel`) **and** strict sequence (the previous case must be completed). Daily cases are gated only by the 24h cooldown, never by level. Locked cases surface a reason toast (`formatCaseLockMessage`). Availability is derived at render time from immutable case data + `PlayerStats`, so no case content is persisted.
- **Verdict gating** (`selectCaseInvestigationGate`): on a **classic (un-budgeted)** case you may only _approve_ after viewing every evidence card; you may only _reject_ with at least one stamped card. On a **budgeted** case, _approve_ unlocks as soon as ≥1 card is opened (decide under uncertainty); _reject_ is unchanged. The selector also returns `budget / opensRemaining / budgetExhausted` for the UI counter and card-sealing. `markEvidenceAsViewed(id, caseData)` now **takes the case and returns a boolean** — `false` means the open was refused (budget exhausted on a new card); `App.handleOpenEvidence` shows the `budgetExhausted` toast and skips opening the modal. Already-opened cards are always re-readable and never refused.
- **`Tooltip` (`src/components/Tooltip.tsx`) duplicates its label into the DOM** as a hidden `<span role="tooltip">` (pure-CSS hover, works over `disabled` buttons). It wraps blocked controls (reject/approve buttons, sealed cards, unaffordable hints). **Test gotcha:** when a tooltip label reuses a string that also appears elsewhere (e.g. `rejectNeedsProof` shows in both the reject tooltip and the click toast), `findByText` finds two matches and throws — query with `{ ignore: '[role="tooltip"]' }` to target the visible element.
- **`devCheat` is DEV-only.** `store.devCheat()` grants a huge balance + top-rank XP; bound to **Ctrl+Shift+M** and exposed as `window.__cheat()` in the console. Hard no-op in production (`import.meta.env.DEV` guard) — never reaches a shipped economy.

## Adding content

- **New case:** drop a JSON into `src/data/cases/` and add it to the `RAW_CASES` array in `src/data/caseLoader.ts`. Every case is Zod-validated at load (`src/data/caseSchema.ts`) — malformed content is logged and skipped, never silently accepted. Evidence ids must be unique within a case (enforced by a `superRefine`).
- **New language:** add the code to `SUPPORTED_LANGUAGES` in `src/types/index.ts`, then fill that column in **every** case JSON and in `src/i18n/ui.ts`. The Zod `localizedShape` is `.strict()` and requires an entry for every supported language, so a missing translation fails loudly at load. RTL languages are listed in `RTL_LANGUAGES` (currently `ar`).
- The schema in `caseSchema.ts` and the interfaces in `types/index.ts` are kept in lockstep by compile-time `AssertAssignable` guards — if you change one, change the other or `typecheck` breaks.
- **New achievement:** add an entry to `ACHIEVEMENTS` in `src/data/achievements.ts` (id, icon, i18n title/desc — `LocalizedString` enforces all 5 languages at compile time — plus xp/currency bonus) **and** a matching predicate keyed by that id in `PREDICATES` (`src/engine/achievementsEngine.ts`). A missing predicate just never unlocks (safe). No store or UI changes needed.
- **Economy tuning:** rank table, XP weights, streak %/cap, and hint costs all live under `GAME_CONFIG` (`progression` / `streak` / `hints`). The roadmap that introduced these is `DEVELOPMENT_PLAN.json`.

## Design language (the visual metaphor is a hard constraint)

The product is deliberately **not** a flashy mobile game. The screen is an _"Investigation Folder laid out on a detective's desk"_ — physical paper documents, official forms, ink stamps, and archive folders. Target audience is 30–60, so the UI prioritizes **high text readability, minimalist layout, clear data hierarchy, and large hit targets** over spectacle.

**Red lines — do not introduce:** neon effects, cartoon graphics, gaming/sci-fi gradients, fantasy elements, or mobile-casino aesthetics. Core emotion to serve: _"I noticed the lie and exposed the fraudster."_

Design tokens are wired into `tailwind.config.js` (do not hardcode hex — use these names).
The chrome was redesigned from a dark night-desk to a warm **cream "manila archive"** per the
Claude Design mockup (`ClaimGame.dc.html`), and the accent moved blue → teal:

| Token        | Hex       | Use                                |
| ------------ | --------- | ---------------------------------- |
| `bg`         | `#ECE3D2` | desk background (cream)            |
| `surface`    | `#F6EFE1` | sidebars / panels                  |
| `surface-2`  | `#E2D7C2` | nested blocks inside panels        |
| `border`     | `#D2C4A8` | panel / block borders              |
| `paper`      | `#F5F1E8` | document sheets (`--paper`)        |
| `ink`        | `#1F2937` | text on white document paper       |
| `text-light` | `#3A3024` | primary text on cream chrome       |
| `text-muted`/`text-dim` | `#7A6C54` | secondary text on chrome |
| `accent`     | `#2F8F83` | primary actions (desk teal)        |
| `success`    | `#16A34A` | Approve                            |
| `danger`     | `#DC2626` | Reject                             |
| `gold`       | `#D9A441` | daily-case highlight               |
| `stamp`      | `#B4231F` | ink "contradiction" stamp (`--stamp`) |

Fonts: `font-serif` (IBM Plex Serif) for document/headline text, `font-sans` (Inter) for UI chrome. Custom `shadow-folder` / `shadow-lift` give sheets physical depth.

**Layout:** three-column "investigation desk" on desktop — left sidebar 280px (case nav + progress + language selector), centered case folder (max ~480px), right sidebar 280px (rank badge + XP bar, streak, balance, accuracy %, achievements archive button, leaderboard). Collapses to a single focused column on mobile (`md:` breakpoints in `App.tsx`).

**Daily case** is visually premium: gold borders + an "URGENT" stamp on the folder cover, and it carries the ×5 reward multiplier.

**Stamping flow:** rejecting a claim requires justification — opening an evidence card and tapping "Mark as Contradiction". Rejecting with zero stamps must surface the prompt _"Rejection must be justified…"_ rather than submitting (see `handleReject` in `App.tsx`). Animations (card lift, document slide, ink-stamp scale dampener) use Framer Motion.

## Yandex deploy

`npm run build`, then upload the contents of `dist/` as a ZIP in the Yandex Games developer console. The build uses a relative base (`./` in `vite.config.ts`) so it runs from the platform's hosting path as-is. The leaderboard is named `balance` (`LEADERBOARD_NAME` in `services/yandexSDK.ts`) and must be created in the developer console to function; it's best-effort and a no-op if absent.
