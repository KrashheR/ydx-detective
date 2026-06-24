# 08 · Сборка, тесты, деплой

> **🗺️ Ключевые файлы:** `package.json` (скрипты), `vite.config.ts` (бандл + vitest), `src/test/setup.ts` + `src/test/fixtures.ts`, `tsconfig.json`.

## Команды

```bash
npm install
npm run dev        # Vite dev-сервер. SDK авто-фолбэк на LocalStorage вне Yandex.
npm run build      # прод-бандл → dist/ (base './', готов к ZIP для Yandex)
npm run typecheck  # tsc --noEmit — статический гейт; гонять перед «готово»
npm test           # vitest run — полный прогон
npm run test:watch # vitest в watch-режиме
npm run test:cov   # vitest run --coverage
```

`BootScreen.tsx` загружает `App.tsx` динамическим чанком и продолжает статический
splash из `index.html` React-лоадером до завершения SDK/сейва/контента. Фоны остаются
в `public/game-loader/` и выбираются через responsive `<picture>`. Сейчас loader
временно отключён: entry point импортирует `App` напрямую, splash скрыт.

## Верификация = `npm run typecheck` И `npm test`

Оба должны проходить, прежде чем работа считается завершённой. Линтера/CI нет; типы + Zod
+ тесты — единственная страховочная сеть. Движок детерминирован специально, чтобы это
работало.

## Тесты

Vitest, файлы `*.test.ts(x)` рядом с источниками (конфиг в `vite.config.ts`; jsdom +
Testing Library для `App.test.tsx`). Покрытие — движки (reward/rank/streak/achievements/
caseUnlock), стор, persistence, yandexSDK, загрузчик/схема дел, утилиты, App.

Тест-гоча по `Tooltip` (дублирующиеся подписи) — см. [05-design.md](05-design.md).

## Dev-чит

`store.devCheat()` выдаёт огромный баланс + топ-XP; привязан к **Ctrl+Shift+M** и
выставлен как `window.__cheat()` в консоли. Жёсткий no-op в проде (гард
`import.meta.env.DEV`) — никогда не попадает в shipped-экономику.

## Деплой на Yandex Games

1. `npm run build`.
2. Загрузить **содержимое** `dist/` как ZIP в консоль разработчика Yandex Games.
3. Относительный base (`./`) гарантирует работу с хостинг-пути платформы.
4. Лидерборд `balance` должен быть создан в консоли (иначе тихий no-op).

## TODO перед запуском (из README)

- Заменить плейсхолдер-SVG в `public/` на финальный арт.
- Дописать полный каталог дел.
- (Опц.) Самохостить шрифты вместо Google Fonts для более строгого ревью.
