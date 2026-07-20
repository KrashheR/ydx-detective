# «Где ложь? Симулятор детектива» — единая кампания 1–50

Это готовое сценарно-техническое задание для Codex: все пять актов, все пятьдесят дел, JSON-blueprint, новая система интерактивных экспертиз, промпты ассетов, миграция, аналитика и QA находятся в одном архиве.

## Что внутри

- 50 папок дел с сохранёнными стабильными case ID.
- 35 дел с новыми интерактивными уликами.
- 36 интерактивных карточек: document_scan, thermal_scan, shadow_time_check, seal_match и surface_reveal.
- Две разные интерактивные проверки в финальном деле №50.
- Для каждой интерактивной карточки: готовый JSON, отдельный prompt-файл, список создаваемых и программных ассетов.
- Сюжетная линия Архива №17, Восточного двора, Серого конвоя и Карелина от первого намёка до финальной физической улики.

## Структура

- `00_MASTER/IMPLEMENTATION_PROMPT.md` — стартовая инструкция Codex.
- `00_MASTER/ARCHITECTURE_CHECKLIST_TOP_TIER.md` — обязательные изменения архитектуры, UX, загрузки и платформенных адаптеров.
- `00_MASTER/CAMPAIGN_BIBLE_RETENTION_ADDENDUM.md` — обновлённый канон пролога, ритма, доказательств и финала.
- `00_MASTER/RETENTION_REVISION_NOTES.md` — что именно усилено после экспертного ревью.
- `00_MASTER/ALL_CASES_1_50_RU.json` — единый канонический JSON.
- `00_MASTER/NEW_EVIDENCE_INDEX.md` — индекс всех новых интерактивных карточек.
- `00_MASTER/IMAGE_GENERATION_HANDOFF.md` — безопасный протокол передачи архива в отдельный чат генерации.
- `00_MASTER/ASSET_TODO.json` — возобновляемая очередь со статусом каждого изображения.
- `00_MASTER/BUILD_VALIDATION_REPORT.md` — итог автоматических и редакторских проверок сборки.
- `00_MASTER/ALL_INTERACTIVE_ASSET_PROMPTS.md` — сводный пакет промптов.
- `00_MASTER/REQUIRED_INTERACTIVE_ASSETS.json` — машинный перечень файлов.
- `generated-assets/` — 110 готовых WebP-ассетов персонажей, улик, документов и интерактивных сцен в путях, ожидаемых контент-планом.
- `cases/` — папки дел 01–50.
- `99_SOURCE_EXPORTS/` — исходные документы для сверки, не для прямого импорта.

## Важный принцип

Новая механика добавлена только там, где игрок может сам получить значимый вывод. Интерактив не используется как декоративная пауза и не заменяет сильную камеру, GPS или медицинскую улику без причины.

## Статус изображений

- Очередь `00_MASTER/ASSET_TODO.json`: 110/110 завершено.
- Формат: WebP; промежуточные PNG в архив не включены.
- Прозрачные процедурные элементы сохраняют alpha-канал.
- Изображения прошли визуальную проверку, контроль размеров, формата и SHA-256.

## English localization / Английская локализация

- `00_MASTER/ALL_CASES_1_50_RU_EN.json` — game-ready bilingual aggregate for all 50 cases.
- `00_MASTER/ALL_CASES_1_50_RU.json` and every `cases/*/case.rewrite.json` also contain paired `ru` / `en` fields, so existing Russian imports remain compatible.
- Interactive data strings use explicit English sidecars: `labelEn`, `coolingReferenceEn`, `orientationSourceEn`, `conclusionEn`, and `successEmotionEn`.
- IDs, evidence types, asset paths, amounts, timestamps, and campaign order are unchanged.
- English is neutral international English suitable for Yandex Games and CrazyGames.

## Привязка изображений к контенту

- Машинный индекс: `00_MASTER/ASSET_BINDINGS_1_50.json`.
- Инструкция подключения: `00_MASTER/ASSET_BINDINGS_IMPLEMENTATION.md`.
- В каждом деле портрет находится в `claimant.portrait`.
- В каждой улике изображения находятся в `evidence[].imageAssets`; быстрый путь — `evidence[].primaryImage`.
- Для установки скопируйте содержимое `generated-assets/src/` в папку `src/` проекта, сохраняя структуру.
