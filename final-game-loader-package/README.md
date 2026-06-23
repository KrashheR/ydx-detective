# GameLoader — готовый пакет для «Где ложь?»

Drop-in загрузочный экран для React + TypeScript + Vite + Framer Motion.

Внутри уже есть:

- адаптивный React-компонент;
- desktop-фон 1920×1080;
- mobile-фон 1080×1920;
- локализация `ru / en / tr / ar / kk`;
- RTL для арабского;
- типы TypeScript;
- расчёт прогресса по реальным этапам загрузки;
- плавное отображение прогресса без ложного достижения 100%;
- пример подключения;
- инструкция для Codex.

## Состав

```text
src/components/GameLoader/
├── assets/
│   ├── loader-bg-desktop.webp
│   └── loader-bg-mobile.webp
├── example/
│   └── AppBootExample.tsx
├── assets.d.ts
├── bootProgress.ts
├── GameLoader.css
├── GameLoader.tsx
├── index.ts
├── loaderI18n.ts
├── types.ts
└── useSmoothedProgress.ts

CODEX_INTEGRATION_PROMPT.md
INTEGRATION_CHECKLIST.md
README.md
```

## Установка

Скопируй папку:

```text
src/components/GameLoader
```

в одноимённое место проекта.

Убедись, что установлен `framer-motion`:

```bash
npm install framer-motion
```

Для проекта из описания зависимость уже должна быть установлена.

## Минимальное использование

```tsx
import { GameLoader } from './components/GameLoader';

<GameLoader
  visible={isBooting}
  progress={progress}
  phase="content"
  locale="ru"
/>
```

## Рекомендуемая интеграция

Не используй искусственный таймер как источник готовности. Собери реальные сигналы:

```ts
const signals = {
  sdkReady,
  playerReady,
  saveHydrated,
  casesValidated,
  assetsReady,
};
```

Затем:

```tsx
import {
  GameLoader,
  areBootSignalsReady,
  calculateBootProgress,
  getBootPhase,
  useSmoothedProgress,
} from './components/GameLoader';

const ready = areBootSignalsReady(signals);
const rawProgress = calculateBootProgress(signals);
const progress = useSmoothedProgress(rawProgress, ready);
const phase = getBootPhase(signals);
```

После достижения 100% оставь состояние «Дело готово» примерно на 350 мс и скрой loader:

```tsx
useEffect(() => {
  if (!ready || progress < 99.5) return;

  const timeout = window.setTimeout(() => {
    setLoaderVisible(false);
  }, 350);

  return () => window.clearTimeout(timeout);
}, [progress, ready]);
```

Полный пример находится в:

```text
src/components/GameLoader/example/AppBootExample.tsx
```

## Как связать этапы с текущей игрой

Рекомендуемое соответствие:

| Сигнал | Когда становится `true` |
|---|---|
| `sdkReady` | завершена инициализация Yandex Games SDK или сработал офлайн-фолбэк |
| `playerReady` | получен player / определён guest-режим |
| `saveHydrated` | Zustand загрузил облачный сейв или LocalStorage-фолбэк |
| `casesValidated` | JSON дел загружены и прошли Zod-валидацию |
| `assetsReady` | предзагружены критические изображения и шрифты, необходимые для первого экрана |

Loader не должен ждать второстепенные изображения всех дел. Достаточно ассетов первого отображаемого экрана.

## Смена языка

```tsx
<GameLoader locale={language} />
```

Тип языка:

```ts
type LoaderLocale = 'ru' | 'en' | 'tr' | 'ar' | 'kk';
```

## Переопределение текста

```tsx
<GameLoader
  copy={{
    stamp: 'Проверяем архив',
    tip: 'Любое противоречие должно подтверждаться уликой.',
  }}
/>
```

## Замена фонов

```tsx
<GameLoader
  backgroundDesktopSrc={desktopImage}
  backgroundMobileSrc={mobileImage}
/>
```

Фоны уже оптимизированы в WebP. На них оставлена чистая бумажная область: название и служебный текст рисуются React-слоями, поэтому корректно локализуются.

## Дизайн-токены

Компонент сначала использует переменные проекта, а затем fallback-цвета:

```css
--paper
--folder
--folder-edge
--ink
--accent
--stamp
--gold
```

Поэтому он совместим с текущей темой `manila`, но не ломается и без неё.

## Доступность

- `role="status"` и `aria-live="polite"`;
- настоящий `role="progressbar"`;
- поддержка `prefers-reduced-motion`;
- учёт safe-area на мобильных устройствах;
- декоративный арт скрыт от screen reader.

## Важное ограничение

Исходный арт был подготовлен как часть этого loader-пакета. В боковых декоративных документах могут оставаться малозаметные русские архивные надписи, но все основные пользовательские тексты и прогресс являются HTML-слоями и локализуются. На мобильном боковые документы почти полностью исключены кадрированием.
