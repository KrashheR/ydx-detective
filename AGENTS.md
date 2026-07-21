# AGENTS.md

Guidance for Codex working in this repo. **This file is rules + map only.** Detailed,
authoritative docs live in `docs/` and are loaded on demand — jump to the targeted doc instead of
re-deriving from source or expanding everything here. **If a doc and the source disagree, source wins — fix the doc.**

## What this is

**Где ложь? Симулятор детектива** (*Where is the Lie? Detective Simulator*) — a data-driven
insurance-investigation game for **Yandex Games**. React + TypeScript + Zustand + Zod + Tailwind +
Framer Motion, bundled with Vite. The player reviews a claim, opens evidence cards, stamps the ones
that contradict the claim, and renders an approve/reject verdict; reward scores both the verdict and
the precision of the stamping.

## 📚 Documentation map — read the one doc that matches your task, nothing more

Index: **[docs/README.md](docs/README.md)**. Each doc starts with a "Ключевые файлы" note.

| Doc | Read when |
| --- | --------- |
| [docs/01-overview.md](docs/01-overview.md) | Product context, audience, game loop |
| [docs/02-architecture.md](docs/02-architecture.md) | Architecture, store, engines, data flow, lifecycle |
| [docs/03-gameplay.md](docs/03-gameplay.md) | Investigation flow, stamping, verdict gating, evidence budget, hints, campaign unlocks |
| [docs/04-economy-progression.md](docs/04-economy-progression.md) | Reward formula, XP/levels, streaks, achievements, daily, bankruptcy |
| [docs/05-design.md](docs/05-design.md) | UI/visuals/tokens/evidence renderers/components/Tooltip |
| [docs/06-yandex-platform.md](docs/06-yandex-platform.md) | SDK, cloud saves, server time, ads, leaderboard, rating, persistence, save migration |
| [docs/07-authoring-content.md](docs/07-authoring-content.md) | Adding a case, language, achievement, or evidence type (+ `src/data/CASE_AUTHORING_GUIDE.json`) |
| [docs/08-build-test-deploy.md](docs/08-build-test-deploy.md) | Build, test, verify, deploy, devCheat |
| [docs/09-synthetic-playtesting.md](docs/09-synthetic-playtesting.md) | Synthetic personas, browser playtest runner, report artifacts |

### 🗺️ Key file map (jump here, don't grep)

Paths are stable. Read the matching doc for *why*, then the source for *how*.

| Concern | File |
| ------- | ---- |
| Runtime authority / all store actions / lifecycle | `src/store/gameStore.ts` |
| Whole UI controller (wires store ↔ components, only caller of store actions) | `src/App.tsx` |
| Reward & daily-cooldown math | `src/engine/rewardEngine.ts` |
| Rank / XP math | `src/engine/rankEngine.ts` |
| Daily-streak math | `src/engine/streakEngine.ts` |
| Achievement unlock predicates | `src/engine/achievementsEngine.ts` (catalog: `src/data/achievements.ts`) |
| Case unlock / sequence / level gating | `src/engine/caseUnlockEngine.ts` |
| All economy/tuning constants (reward split, ranks, streak, hints, saveVersion) | `src/config/gameConfig.ts` |
| Persistence: where/when snapshot is written + save migration | `src/services/persistence.ts` |
| Portal-neutral SDK contract | `src/services/platformAdapter.ts` (Yandex implementation: `src/services/yandexSDK.ts`) |
| The **only** `window.ym` adapter (Yandex Metrica analytics: goals + user params) | `src/services/metrica.ts` |
| Types (`Case`/`Evidence`/`PlayerStats`/`ActiveSession`/`PersistedState`) | `src/types/index.ts` |
| Case Zod validation (kept in lockstep with types) | `src/data/caseSchema.ts` |
| Case registry (add new case JSON here) | `src/data/caseLoader.ts` + `src/data/cases/*.json` |
| UI strings / i18n | `src/i18n/ui.ts` |
| Presentational components | `src/components/*.tsx` |
| Design tokens (do not hardcode hex — use token names) | `tailwind.config.js` |

Tests are colocated as `*.test.ts(x)` next to each source file.

## ⚡ Working efficiently (token budget — read narrow, test narrow, delegate wide)

1. **Read the matching doc first, then the source — don't pre-load extra files "just in case."** The doc tells you which 1–2 source files a task actually touches; trust the Key file map over grepping blind.
2. **Read giant files surgically.** `src/components/StampModal.tsx` (~1122 lines), `src/i18n/ui.ts` (~994), `src/store/gameStore.ts` (~597): `grep` the symbol/string first, then `Read` with `offset`/`limit` on just that range — never read the whole file.
3. **Run tests narrowly while iterating** (`npx vitest run <path>`). Reserve the full `npm test` + `npm run typecheck` for the final verification gate only.
4. **Delegate broad/uncertain searches to an `Explore` subagent** and bring back only the conclusion, so raw result dumps don't accumulate in main context.

## Commands

```bash
npm install
npm run dev        # Vite dev server. SDK auto-falls back to LocalStorage when not on Yandex.
npm run build      # Production bundle → dist/ (base './', ready to ZIP for Yandex)
npm run typecheck  # tsc --noEmit — static gate
npm test           # vitest run — full suite (~169 tests across engines, store, UI)
npm run test:watch # vitest in watch mode
npm run test:cov   # vitest run --coverage
```

**Verification = `npm run typecheck` AND `npm test`** — both must pass before work is done. No
linter, no CI; the type system + Zod + the deterministic test suite are the safety net. Build/deploy
details: [docs/08-build-test-deploy.md](docs/08-build-test-deploy.md).

## Invariants you must never break (the cheap-insurance list)

These cut across the whole codebase; everything else lives in the docs above.

1. **Static/runtime separation (the rule that shapes everything).** Static case data — immutable JSON
   in `src/data/cases/`, Zod-validated at load, typed by `Case`/`Evidence`. Runtime player state —
   mutable progression/economy in the Zustand store, typed by `PlayerStats`/`ActiveSession`/
   `PersistedState`, persisted to cloud/LocalStorage. **Never store a `Case` in `PlayerStats` or
   player progress in a `Case`.** Cases are passed *into* store actions by the React layer; the store
   never holds case content; persistence only serializes the runtime slice. Details: [docs/02](docs/02-architecture.md).
2. **Two economies, never conflated.** `balance` is spendable currency (rewards in, hints/bankruptcy out);
   `xp` is permanent career progress that only ever increases and drives the rank ladder. Details: [docs/04](docs/04-economy-progression.md).
3. **Server time only for daily gating** — `getServerTimeMs()` (Yandex `serverTime()`), never device clock
   (offline fallback only). Details: [docs/06](docs/06-yandex-platform.md).
4. **`src/services/yandexSDK.ts` is the only place that touches `window.YaGames`** — a missing/failed SDK
   must degrade to offline mode. Engines never call the SDK directly. The same single-adapter rule applies to
   analytics: **`src/services/metrica.ts` is the only place that touches `window.ym`** (Yandex Metrica), and a
   missing counter / placeholder `counterId` makes every track call a silent no-op. Details: [docs/06](docs/06-yandex-platform.md).
5. **All economy tuning lives in `src/config/gameConfig.ts`**, not in the engines — and bump
   `GAME_CONFIG.saveVersion` + extend `migrate()` whenever the persisted shape changes. Details: [docs/04](docs/04-economy-progression.md) / [docs/06](docs/06-yandex-platform.md).
6. **All user-facing text must go through i18n — never hardcode strings in components or engines.**
   Every new UI string belongs in `src/i18n/ui.ts`: add it as a `UIKey`, then provide translations for
   **all five languages** (`ru`, `en`, `tr`, `ar`, `kk`). Case content (titles, evidence text, claim
   body) is localized inside the case JSON itself using `LocalizedString`/`LocalizedContent` (see
   `src/types/index.ts`). A missing key in any language is a bug — the `Language` type is the exhaustive
   list; don't add a key for only some locales. Details: [docs/07](docs/07-authoring-content.md).
7. **The standard campaign has exactly 50 canonical positions.** Order by the immutable
   `campaignOrder` field; stable case IDs must never be renumbered. Every case has an integer
   investigation budget, atomic claim statements and validated evidence links. Cases 1–3 are the
   onboarding flow; three interactive evidence types (`thermal_scan`, `shadow_time_check`,
   `surface_reveal`) are introduced through the campaign, and case 50
   owns the generic final synthesis. `requiredLevel` remains capped at 16. The invariant is enforced by
   `src/data/campaignProgression.test.ts`; all 15 evidence types have renderers.
   Details: [docs/03](docs/03-gameplay.md) / [docs/07](docs/07-authoring-content.md).

## Design language (hard constraint)

The product is **not** a flashy mobile game. The screen is an *"Investigation Folder on a detective's
desk"* — physical paper, official forms, ink stamps, archive folders. Audience 30–60: prioritize **high
text readability, minimalist layout, clear hierarchy, large hit targets** over spectacle. Core emotion:
*"I noticed the lie and exposed the fraudster."*

**Red lines — never introduce:** neon, cartoon graphics, gaming/sci-fi gradients, fantasy elements,
mobile-casino aesthetics. **Never hardcode hex — use the Tailwind token names** (`bg`, `surface`,
`accent`, `stamp`, …). Full token table, layout, fonts, and evidence renderers: [docs/05-design.md](docs/05-design.md).

## 🔄 Keep the docs current (part of "done")

After any change to behavior, architecture, mechanics, economy/config, design tokens, the Yandex
integration, or content authoring, update the matching `docs/*.md` **in the same change** — and this
`AGENTS.md` only if the doc map or an invariant shifted. Edit surgically (touch affected lines, don't
rewrite files). New doc → add it to the map above and to `docs/README.md`. Spot a doc that already
drifted from the code while passing through? Fix it then.
