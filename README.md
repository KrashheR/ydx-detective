# Где ложь? Симулятор детектива

Data-driven insurance-investigation game for **Yandex Games and CrazyGames**.
React + TypeScript + Zustand + Zod + Tailwind + Framer Motion.

## Run

```bash
npm install
npm run dev      # local dev (SDK auto-falls back to LocalStorage)
npm run build    # production bundle → dist/ (base './', ready for Yandex)
npm run typecheck
```

## Architecture

Static case content and runtime player state are strictly separated.

```
src/
├── types/            # domain interfaces (Case, Evidence, PlayerStats, …)
├── config/           # economy/sync tuning (no logic)
├── data/             # Zod schema + JSON cases + loader (add a case = add JSON)
├── engine/           # pure reward math + daily evaluator (no SDK/state)
├── services/         # portal adapter + Yandex/CrazyGames cloud/local persistence
├── store/            # Zustand store (single runtime authority)
├── i18n/             # UI chrome strings (5 languages, RTL for ar)
├── components/       # Case File screen (folder, evidence, stamp modal, result)
└── utils/            # asset path resolver
public/covers, public/people  # placeholder SVG art
```

### Adding content
- **New case:** drop a JSON in `src/data/cases/`, list it in `caseLoader.ts`. It
  is Zod-validated at load — malformed content fails loudly, never silently.
- **New language:** add the code to `SUPPORTED_LANGUAGES` and fill the column in
  each case JSON + `i18n/ui.ts`.

## Campaign 1–50

- 50 canonical cases are ordered by `campaignOrder` without changing stable case IDs.
- Claim text is split into atomic `claimStatements`; a stamp stores the exact
  `{ caseId, statementId, evidenceId }` link.
- Five JSON-driven interactive evidence types are available: document scan,
  thermal scan, shadow-time check, seal match and surface reveal.
- Cases 1–3 form a guided onboarding flow; case 50 ends with `EvidenceLinkBoard` synthesis.

## Platform integration

- **Cloud saves** via `player.setData`, debounced to ≤1 write / 10 s; case
  closure forces an immediate flush. Offline → LocalStorage fallback.
- **Server time** (`ysdk.serverTime()`) gates the daily case — never device time.
- **Ad pause guard:** ad open/close toggles a global `isPaused` flag (freeze +
  mute). Bankruptcy (balance ≤ 0) is recovered via a rewarded video → 2000.
- **Portal contract:** `services/platformAdapter.ts` routes lifecycle, ads,
  locale and cloud saves to Yandex or CrazyGames; LocalStorage remains the fallback.
- **Leaderboard:** create a leaderboard named **`xp`** in the Yandex developer
  console (change `LEADERBOARD_NAME` in `services/yandexSDK.ts` to rename).

## Deploy
`npm run build`, then upload the contents of `dist/` as a ZIP in the Yandex
Games developer console. The build uses a relative base, so it works from the
platform's hosting path as-is.

## Content source

The reproducible campaign import lives in `scripts/import-campaign-50.mjs`; it
adapts the shipped update package to the runtime schema and generates only
procedural frontend assets. Generated image-model WebPs are served lazily from `public/cases/`.
