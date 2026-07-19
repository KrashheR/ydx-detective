# 07 · Авторинг контента

> **🗺️ Ключевые файлы:** `src/data/CASE_AUTHORING_GUIDE.json` (первоисточник), `src/data/cases/*.json`, `src/data/caseLoader.ts` (реестр), `src/data/caseSchema.ts` (Zod), `src/types/index.ts`, `src/i18n/ui.ts`, `src/data/achievements.ts`.

Контент — это данные. Машиночитаемый первоисточник для генерации дел —
`src/data/CASE_AUTHORING_GUIDE.json` (схема, meta-поля по типам, шпаргалки, чек-листы,
уже занятые значения, промпт-шаблон). Этот документ — человекочитаемая обвязка над ним.

## Структура дела (`Case`)

Корневые поля (полная схема — `src/data/caseSchema.ts`, типы — `src/types/index.ts`):

| Поле | Тип | Заметки |
| ---- | --- | ------- |
| `id` | string | `case-NNN` или `case-NNN-daily`; уникален |
| `type` | `standard \| daily` | daily → ×5 награда, ×2 XP, файл в `cases/daily/` |
| `difficulty` | `easy \| medium \| hard` | вес XP: 10 / 20 / 35 |
| `claimAmount` | number | сумма заявки (EUR/база награды) |
| `truth` | `valid \| fraud` | истина дела; для авторинга/аналитики |
| `title` | LocalizedString | 5 языков |
| `claim` | `{ person, story }` | имя+возраст и история от первого лица (LocalizedString) |
| `client` | `{ role, meta[] }` | `role`, ключ `meta[].k` и значение `meta[].v` — LocalizedString на 5 языках |
| `coverImage` | string | путь под `public/`, напр. `covers/case-NNN.svg` |
| `personImage` | string? | опц. портрет WebP, напр. `people/<firstname>.webp` |
| `evidences` | Evidence[] | улики |
| `correctDecision` | `approve \| reject` | `reject` если fraud, `approve` если valid |
| `explanation` | LocalizedLines | ровно 3 коротких вывода для ResultSheet (массив строк, 5 языков) |
| `investigationBudget` | number? | если задан — бюджетное дело (см. ниже) |

Улика (`Evidence`):

| Поле | Тип | Заметки |
| ---- | --- | ------- |
| `id` | string | уникален **внутри дела** (enforced `superRefine`) |
| `type` | `EvidenceType` | см. список ниже |
| `title` | LocalizedString | |
| `content` | LocalizedContent | строка ИЛИ массив строк, per-language |
| `isContradiction` | boolean | истинно только у реально противоречащих улик |
| `contradictionExplanation` | LocalizedString | **всегда** заполнять, даже если false |
| `meta` | EvidenceMeta? | per-renderer метаданные (см. ниже) |
| `relation` | `supports \| contradicts \| context`? | авторская метадата (движком не используется) |

**Правило truth ↔ улики:** fraud → `isContradiction: true` у **≥2** улик и
`correctDecision: reject`. valid → **0** противоречий и `correctDecision: approve`.

## Типы улик (`EvidenceType`)

`photo`, `gps`, `document`, `witness_statement`, `camera_recording`, `usage_log`, `xray`,
`bank_statement`, `phone_records`, `social_media`.

`content` для `usage_log` (и обычно `gps` / `bank_statement` / `phone_records`) — **массив
строк** на каждый язык (строки лога/трека/транзакций). Для `photo` / `document` /
`witness_statement` / `social_media` — обычно строка.

meta-поля по типам (детали и примеры — в `CASE_AUTHORING_GUIDE.json` → `meta_fields_by_type`):
- `photo` → `filename` (`IMG_YYYYMMDD_HHMMSS.jpg`, дата = хронология дела)
- `gps` → `company` / `department` / `requestId` / `gpsFooter`
- `camera_recording` → `cameraId` / `cameraModel` (реальная модель · разрешение · кодек)
- `usage_log` → `logPrompt` (`user@host:~$ tail -f /var/log/xxx.log`)
- `xray` → `clinicName`
- `bank_statement` → `bankName` / `accountMask`
- `phone_records` → `carrierName` / `phoneMask`
- `social_media` → `socialPlatform`

Видимые текстовые meta-поля (`company`, `department`, `requestId`, `gpsFooter`, `docHeader`,
`docFooter`, `clinicName`, `bankName`, `carrierName`) — **LocalizedString на 5 языках**. Технические
значения (`filename`, `imageUrl`, `cameraId`, `cameraModel`, `logPrompt`, маски счетов/телефонов,
`socialPlatform`) остаются обычными строками.
- `document` / `witness_statement` → meta не нужен

> Не переиспользуй уже занятые значения (названия GPS-сервисов, модели камер, log-промпты)
> — список в `CASE_AUTHORING_GUIDE.json` → `meta_values_used`.

## Как добавить новое дело

1. Создай JSON в `src/data/cases/` (стандартное), `src/data/cases/daily/` (ежедневное) или
   `src/data/cases/archives/<archive-id>/` (дело особого архива; один архив — одна папка).
   Следуй схеме выше; заполни **все 5 языков** (`ru/en/tr/ar/kk`) во **всех** LocalizedString,
   включая `client.meta[].v` и видимые текстовые поля `evidence.meta`.
2. Дополнительная регистрация не нужна: Vite-плагин summary и lazy glob в
   `caseLoader.ts` рекурсивно подхватят JSON автоматически.
3. Положи обложку `public/covers/case-NNN.svg` (и при наличии портрет `public/people/<name>.webp`).
4. Для **стандартного** дела задай требование уровня в
   `GAME_CONFIG.caseUnlocks.standardCaseRequiredLevelById` (иначе оно получит
   `defaultRequiredLevel = 30` и будет почти недоступно). Этот уровень задаёт и **позицию
   в кампании** (сортировка `(requiredLevel, caseNumber)`) — см. кривую сложности ниже.
5. Прогон: `npm run typecheck && npm test`. Невалидное дело останавливает сборку с путём
   к проблемному JSON; lazy-загрузка повторно валидирует полное дело перед геймплеем.

Чек-лист качества — `CASE_AUTHORING_GUIDE.json` → `quality_checklist`.

Контент дела должен быть полностью оригинальным: не используй реальные бренды и модели, названия
платформ и организаций, известных персонажей или публичных лиц, узнаваемые цитаты, коды и сочетания
сюжетных маркеров из существующих произведений. Для технических метаданных используй вымышленные
служебные обозначения (`SentinelCam SC-2143`, `Settlement Office 23`, домены `.local`). `personImage`
опционален; портрет не должен содержать логотипы, документы, государственную символику или создавать
узнаваемое сходство с реальным человеком либо персонажем.

Для особых архивов держи антологию игровой, а не только тематической: в паке должен быть микс
`fraud` и `valid`, разные типы развязок и уникальные финальные объяснения. Лучше строить архив как
мини-сезон: один повторяющийся след, организация, предмет или код проявляется в 3–4 делах, но не
каждый заявитель одинаково виновен. Не оставляй `Archive file detail`/копипастные заглушки в
`client`, уликах или переводах — фан-сервис работает только когда дело остаётся полноценной
страховой загадкой.

### Кривая сложности — обязательный инвариант

Кампания нарастает по сложности (механика и тир-таблица — [03-gameplay.md](03-gameplay.md)).
Тест `src/data/campaignProgression.test.ts` требует, чтобы по порядку кампании:

- число улик **не убывало** (онбординг 2 улики → экспертные 6);
- первые два дела использовали **только** `photo`/`document`;
- продвинутые типы (`bank_statement`, `phone_records`, `social_media`) дебютировали
  **поздно** (позиция ≥ 18);
- `requiredLevel` не убывал и оставался ≤ 16 (без XP-стены).

Подбирай `requiredLevel` нового дела так, чтобы оно встало в нужный тир по числу улик и не
нарушило монотонность.

### Уже задействованные типы улик

`bank_statement`, `phone_records`, `social_media` ранее не использовались; теперь они
работают в экспертном тире (case-023…051). Их рендереры (`BankBody`/`PhoneBody`/`SocialBody`
в `StampModal.tsx`), иконки и i18n-ярлыки уже на месте — достаточно сослаться на тип в JSON.

### Бюджетное дело

Добавь `investigationBudget: N` в корень дела. Тогда игрок открывает максимум N улик, а
сплит награды смещается на 40/40/20 (вердикт/доказательства/эффективность). Механика —
[03-gameplay.md](03-gameplay.md), формула — [04-economy-progression.md](04-economy-progression.md).

## Как добавить новый язык

1. Добавь код в `SUPPORTED_LANGUAGES` (`src/types/index.ts`).
2. Заполни эту колонку в **каждом** деле JSON **и** в `src/i18n/ui.ts` (включая названия
   уровней `level_01…level_30` и тексты ачивок).
3. RTL-языки перечислены в `RTL_LANGUAGES` (сейчас только `ar`).

Zod `localizedShape` — `.strict()` и требует запись для каждого поддерживаемого языка,
поэтому пропущенный перевод падает громко при загрузке, а `LocalizedString` ловит часть
на компиляции.

## Как добавить достижение

1. Добавь запись в `ACHIEVEMENTS` (`src/data/achievements.ts`): `id`, `icon` (сдержанный
   эмодзи — без мультяшности/неона), `title`/`description` (`LocalizedString` форсит все 5
   языков на компиляции), `xpBonus`, `rubBonus`.
2. Добавь предикат по тому же `id` в `PREDICATES` (`src/engine/achievementsEngine.ts`).
   Предикат получает `{ stats, result, caseData }` (пост-кейс) → boolean.

Отсутствующий предикат = ачивка никогда не анлокается (безопасно). Изменений стора/UI не
требуется.

## Как добавить тип улики

1. Добавь литерал в `EvidenceType` (`src/types/index.ts`) и при необходимости поля в
   `EvidenceMeta`.
2. Отрази в `caseSchema.ts` (типы и схема держатся в синхроне `satisfies`-проверками).
3. Добавь рендерер в компонент карточки/модалки улики (`EvidenceCard` / `StampModal`),
   фолбэча на дефолты для дел без `meta`.

## Тюнинг экономики

Таблица уровней, веса XP, %/кап серий, стоимость подсказок, доли награды, пороги
банкротства/рейтинга — всё под `GAME_CONFIG` (`src/config/gameConfig.ts`). Меняй там, не в
движках. Контекст изменений мета-прогрессии — `DEVELOPMENT_PLAN.json`.
