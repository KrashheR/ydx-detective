# 05 · Дизайн и визуальный язык

> **🗺️ Ключевые файлы:** `tailwind.config.js` (дизайн-токены), `src/components/*.tsx` (презентационные компоненты), `src/App.tsx` (трёхколоночный layout / `md:` брейкпоинты).

Визуальная метафора — **жёсткое ограничение**, а не украшение.

## Метафора

Экран — это _«Папка с делом, разложенная на столе детектива»_: физические бумажные
документы, официальные бланки, чернильные штампы, архивные папки. Аудитория 30–60, поэтому
UI ставит во главу **высокую читаемость текста, минимализм, чёткую иерархию данных и
крупные зоны нажатия** — а не зрелищность.

**Красные линии — НЕ вводить:** неоновые эффекты, мультяшную графику, игровые/sci-fi
градиенты, фэнтези-элементы, эстетику мобильного казино. Ядро эмоции: _«Я заметил ложь и
разоблачил мошенника»_.

## Токены дизайна

> **Редизайн (палитра «Сепия 1970-х»):** хром стола переведён на палитру поджаренной
> архивной бумаги с терракотовым акцентом (бриф `docs/prompts/from-design/SEPIA-1970-palette.md`).
> Метафора, вёрстка и структура токенов не менялись — только значения цветов; все пары
> текст/фон проверены на WCAG AA+. Прошлые «манильные» хром-токены (`bg #ECE3D2`,
> `accent #2F8F83`) больше не используются.

Заведены в `tailwind.config.js` — **не хардкодь hex**, используй имена:

| Токен | Hex | Назначение |
| ----- | --- | ---------- |
| `bg` | `#E5D7BD` | фон стола (поджаренная архивная бумага) |
| `surface` | `#F1E7D1` | сайдбары / панели (светлая архивная бумага) |
| `surface-2` | `#D7C6A5` | вложенные блоки внутри панелей |
| `border` | `#C5AF87` | границы панелей / блоков |
| `paper` | `#F7EFDD` (manila) / `#F3F4F6` (dossier) | листы документов (CSS-переменная `--paper`) |
| `ink` | `#2A2117` | текст на белой бумаге документа |
| `text-light` | `#3D3119` | основной текст на хроме стола |
| `text-muted` / `text-dim` | `#6B5733` | вторичный / приглушённый текст на хроме |
| `accent` | `#884A28` (manila) | основные действия — тёмная терракота (`--accent`) |
| `success` | `#5C7A33` | Approve (ретро-оливка) |
| `danger` | `#B23A2E` | Reject |
| `gold` | `#C98A2E` | подсветка ежедневного дела — **только заливка/рамка/иконка, не текст** |
| `stamp` | `#A8201C` (manila) / `#DC2626` (dossier) | чернильный штамп «противоречие» (`--stamp`) |

Мобильный стол дополнительно использует именованные токены `mobile-*`, `daily-*`,
`folder-gold-*`, `mobile-solved*`, `mobile-locked*`, а бумажный ID-блок — `photo-*` и
`document-*`. Это точные алиасы прежней мобильной палитры, включая `daily-card`,
`folder-sealed`, `photo-placeholder` и тени `mobile-daily`/`mobile-folder`/`photo-id`;
`modal-backdrop` задаёт затемнение диалогов. Компоненты не содержат inline hex/rgb.
У мобильных карточек базовые `bg-gold`/`bg-surface`/`bg-surface-2` служат непрозрачными
подложками под точные `daily-*`/`folder-gold-*`/`mobile-*` оттенки.

Скроллбар — `#C9B089` (см. `src/index.css`). Тосты остаются тёмными
(`#2B2018` + рамка `stamp`), чтобы читаться поверх стола. Папка манилы: обложка `--folder`
`#CBAA6C`, тёмная вкладка / шапка-баннер бланка `--folder-edge` `#8A6A30` (текст `--paper`).

Шрифты: `font-serif` (IBM Plex Serif) для документов/заголовков, `font-sans` (Inter) для
UI-хрома. Кастомные тени `shadow-folder` / `shadow-lift` дают листам физическую глубину.

## Экран начальной загрузки

`index.html` сразу показывает статический splash до выполнения JavaScript. После
старта React `BootScreen.tsx` подменяет его визуально идентичным `GameLoader` без
пустого кадра. Статическая полоса неопределённая — браузер не сообщает достоверный
процент загрузки module graph; после запуска JS процент строится по реальным сигналам
SDK, сейва, валидации дел и критических ресурсов. Общие стили находятся в
`src/components/GameLoader/GameLoader.css`, фоны — в `public/game-loader/`, а весь
локализованный текст — в `src/i18n/ui.ts` (компактная копия для pre-JS splash
синхронизирована в `index.html`).
Центрирование выполняется CSS-transform без конкурирующих transform-анимаций
Framer Motion; отдельные правила покрывают телефон, короткий portrait, планшет и
низкий landscape. Текст статического splash изначально пуст и заполняется нужной
локалью до первого содержательного кадра.

> Временно отключён: `main.tsx` запускает игру напрямую, а статический splash
> помечен `hidden`. Компоненты и ассеты сохранены.

## Layout

Десктоп — три колонки «следственного стола»:

- **Левый сайдбар** (~272–280px): навигация по делам + прогресс + выбор языка.
- **Центр** (макс ~480px): папка с делом.
- **Правый сайдбар** (~272–280px): бейдж уровня + XP-бар, серия, баланс, точность %,
  кнопка архива ачивок, лидерборд.

На мобильном стол заменяется `MobileDeskMenu`, а активное расследование становится одной
сфокусированной колонкой: боковые панели скрыты, снизу закреплён verdict action-bar с safe-area,
контент не уходит под него. Улика открывается полноэкранным bottom-sheet со скроллом только тела,
sticky-футером штампа и навигацией «‹ N/M ›». Тема папки задаётся `FOLDER_LOOK`
(`'manila' | 'dossier'`, сейчас `manila`) → класс `theme-*`. Хром-токены (`bg`/`surface`/…)
не зависят от темы — кремовый стол общий для обеих; `theme-*` переключает только цвета
папки/бумаги/штампа (`--folder` / `--paper` / `--accent` / `--stamp`).

## Особые архивы

> v2 layout note: `ThematicPacksModal` mirrors the Claude handoff in `todo/archive-design`: dark archive header, compact left pack index on desktop, mobile horizontal pack tabs in the header, one-column case rows on the archive sheet, and a clean bottom action zone for purchase/ad unlock/restore.

`SpecialArchivesEntry` выглядит как отдельный архивный объект, а не баннер: в левом сайдбаре и
мобильном меню после daily-блока лежит стопка папок с вкладкой, плашкой `NEW` и счётчиком
открытых дел. `ThematicPacksModal` оформлен как витрина-каталог: слева список архивов-паков,
справа лист выбранного архива с темой, составом дел, оформлением стола и коллекционным штампом.
На мобильном тот же контент складывается в полноэкранный лист со sticky-блоком действий снизу.
Каталог показывает три реальные тематические подборки из `case-040…051`, но коммерческие
действия остаются disabled до product ids и persisted-доступов. Системная оболочка остаётся
в метафоре следственного архива, даже если тема пака допускает более необычные материалы внутри.

## Ежедневное дело — премиальный вид

Золотые рамки + штамп «URGENT» на обложке папки, плюс ×2 множитель награды.

## Услуги и развитие отдела

Перед первым открытием улики `CaseFile` показывает лист «Распоряжение на расследование»:
можно выбрать одну доступную услугу отдела или начать без услуги. Выбранная услуга не
подсказывает вердикт напрямую: архив показывает только число противоречий, разрешение даёт
одно дополнительное открытие в бюджетном деле, эксперт раскрывает статус первой выбранной
улики. После первого открытия лист скрывается.

Правая колонка содержит «План отдела» с тремя подразделениями. Карточки оформлены как
официальные бухгалтерские строки: текущий уровень 0–3, следующий эффект и цена улучшения.
Уровень 1 открывает услугу, уровень 2 даёт скидку, уровень 3 — один бесплатный вызов за
серверный день.

## Поток штамповки и анимации

Отклонение требует обоснования (открыть любую улику → «Отметить как противоречие»). Штамп
доступен и на подтверждающих уликах: ошибочная отметка снижает награду. Отклонение с нулём
штампов выводит промпт _«Отклонение должно быть обосновано…»_ вместо сабмита
(см. `handleReject`). Анимации (подъём карточки, выезд документа, демпфер масштаба
чернильного штампа) — на Framer Motion.

## Рендереры улик

Каждый тип улики (`EvidenceType`) имеет свой визуальный рендерер, чтобы карточки выглядели
по-разному (GPS-трек, фото с filename, CCTV-запись с моделью камеры, терминальный лог,
рентген, банковская выписка, детализация звонков, соцсеть, документ, протокол свидетеля).
Метаданные рендера — опциональное поле `Evidence.meta` (`EvidenceMeta`); рендереры
фолбэчат на дефолты, поэтому старые дела без `meta` работают. Список meta-полей по типам —
[07-authoring-content.md](07-authoring-content.md) и `CASE_AUTHORING_GUIDE.json`.

Подробный бриф по редизайну карточек улик — `docs/prompts/DESIGN_PROMPT_EVIDENCE_CARDS.md`.

## Компоненты (`src/components/`)

`CaseFile` (папка), `CaseSelect` (выбор дела), `EvidenceCard` (карточка в сетке),
`StampModal` (модалка улики + штамп), `InvestigationServiceOrder` (предварительная услуга),
`DepartmentPlan` (развитие отдела), `VerdictPanel` (кнопки вердикта), `ResultSheet`
(разбор награды), `LeftSidebar` / `RightSidebar`, `SpecialArchivesEntry`,
`ThematicPacksModal`, `AchievementsModal`, `RatingModal`, `LanguageSelector`, `Tooltip`,
`icons.ts`.

`ResultSheet` отображается как самостоятельный светлый лист с тенью, без тёмной внешней
рамки; затемнение остаётся только на полноэкранной подложке.

Игровой root не допускает выделение текста и отменяет нативное контекстное меню по правому клику:
взаимодействие должно ощущаться как работа с физической папкой, а не как с веб-страницей.

### `Tooltip` — нюанс для тестов

`Tooltip` дублирует подпись в DOM как скрытый `<span role="tooltip">` (чистый CSS-hover).
На мобильном недоступное действие нельзя оставлять `disabled` с hover-only объяснением:
контрол остаётся тапаемым в приглушённом стиле и показывает причину тостом либо имеет видимую
инлайн-причину. Tooltip допускается как дополнительное desktop-объяснение. **Тест-гоча:** когда подпись тултипа
повторяет строку, встречающуюся ещё где-то (напр. `rejectNeedsProof` — и в тултипе, и в
тосте), `findByText` находит два совпадения и падает — фильтруй `{ ignore: '[role="tooltip"]' }`.
## Interactive evidence UI

`InteractiveEvidence.tsx` supplies five reusable, case-ID-independent renderers:
`DocumentScanEvidence`, `ThermalScanEvidence`, `ShadowTimeCheckEvidence`, `SealMatchEvidence` and
`SurfaceRevealEvidence`. Each receives only evidence JSON, persisted progress, locale and a progress
callback. Shared chrome provides reset and three hint levels; the conclusion and contradiction state
stay hidden until `successCondition` is met.

All controls have keyboard-sized hit targets and work with Pointer Events. Surface reveal uses a
128×128 service mask evaluated after each stroke and `touch-action: none`; seal matching supports
drag/rotate; Arabic switches the component and final link board to RTL. Visual assets use `asset()`
and lazy image loading, while thermal overlays, shadow geometry and masks are procedural.

Thermal scan hotspots are not pre-rendered: `heatZones` stay invisible on the grayscaled image until
the player's pointer comes within `THERMAL_SCAN_RADIUS` (percent units, tracked via `onPointerMove` on
the image container), at which point the zone's opacity ramps up by proximity — the player scans the
photo to discover the anomaly rather than clicking an already-glowing marker. A pointer-following ring
(fixed 84×84px, so it stays circular regardless of the 16:10 container) gives scanning feedback even
when no zone is nearby. A compact temperature readout follows at the ring's upper-right edge on an
opaque archive-paper backing: it blends `ambientTemperature` toward the nearest zone's `temperature`
by proximity and shifts from the standard muted brown to red as the pointer approaches heat. The
`observationTime`/elapsed-minutes cells stay below the image since they're needed for the cooling-time
reasoning. Hint level 3 force-reveals all zones (matching the
level-3 highlight convention in `DocumentScanEvidence`); clicking a zone still works before it is
visually revealed so keyboard/screen-reader users (who tab to the button's `aria-label`) aren't
disadvantaged by a mouse-only discovery mechanic.
