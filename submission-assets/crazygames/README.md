# CrazyGames submission package

## Metadata

- Title: `Where Is the Lie? Detective Simulator`
- Short description: `Review insurance evidence, spot contradictions, and deliver the right verdict.`
- Controls: `Mouse/touch: open documents and evidence; click a stamp to mark a contradiction.`
- Supported orientations: `landscape and portrait`
- Basic Launch: `yes — no advertising, IAP, external login, or fabricated social features`

## Cover images

- `cover-landscape-1920x1080.png` — required 16:9 landscape cover.
- `cover-portrait-800x1200.png` — required 2:3 portrait cover.
- `cover-square-800x800.png` — required square cover.

The visual has only the English game title, no borders, store icons, or calls to
action. Record the two required 15–20 second, silent gameplay previews separately
from the running Preview Portal build; do not use a static cover in place of them.

## Preview Portal checklist

1. Run `npm run build` and upload the contents of `dist/` to a new Portal preview.
2. Confirm the SDK initializes, `gameplayStart` fires after hydration, and
   `gameplayStop` fires when the app unmounts.
3. Verify English fallback, desktop and mobile layouts, LocalStorage persistence,
   and that no ad/IAP/leaderboard UI is visible in the Basic build.
4. Add the three covers, English description and controls above, then attach the
   two silent gameplay recordings before submitting.
