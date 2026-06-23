# Package manifest

## Production files

- `src/components/GameLoader/GameLoader.tsx` — основной React-компонент.
- `src/components/GameLoader/GameLoader.css` — автономные адаптивные стили.
- `src/components/GameLoader/types.ts` — публичные TypeScript-типы.
- `src/components/GameLoader/loaderI18n.ts` — тексты пяти локалей.
- `src/components/GameLoader/bootProgress.ts` — расчёт реального boot-прогресса и фазы.
- `src/components/GameLoader/useSmoothedProgress.ts` — плавное отображение прогресса.
- `src/components/GameLoader/index.ts` — barrel exports.
- `src/components/GameLoader/assets.d.ts` — декларация WebP-импортов.
- `src/components/GameLoader/assets/loader-bg-desktop.webp` — desktop 1920×1080.
- `src/components/GameLoader/assets/loader-bg-mobile.webp` — mobile 1080×1920.

## Documentation and integration

- `README.md` — инструкция.
- `CODEX_INTEGRATION_PROMPT.md` — готовое задание для Codex.
- `INTEGRATION_CHECKLIST.md` — чек-лист проверки.
- `src/components/GameLoader/example/AppBootExample.tsx` — пример подключения.
- `package-snippet.json` — напоминание о зависимости.
