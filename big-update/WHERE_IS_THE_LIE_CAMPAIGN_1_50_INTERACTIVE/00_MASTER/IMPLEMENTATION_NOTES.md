# Implementation notes

## Рекомендуемый порядок разработки

1. Добавить общие типы, Zod discriminated union и progress model.
2. Реализовать `DocumentScanEvidence` и `ThermalScanEvidence`, затем `SealMatchEvidence`, `ShadowTimeCheckEvidence` и `SurfaceRevealEvidence`.
3. Реализовать единый onboarding дел 1–3: first contradiction → anti-bias approve → identity comparison; меню открыть только после третьего вердикта.
3.1. Подключить одноразовое обучение новых экспертиз: дело 1 thermal, дело 3 document, дело 6 seal, дело 7 shadow, дело 9 surface reveal.
4. Внедрять контент по актам 1–10, 11–20, 21–30, 31–40, 41–50.
5. Сначала использовать временные нейтральные base-ассеты, затем прогнать `ASSET_GENERATION_QUEUE.json`.
6. После каждого утверждённого изображения откалибровать JSON координаты и только затем считать улику готовой.

## Где брать данные

- Полный контент: `ALL_CASES_1_50_RU.json`.
- Схемы: `SCHEMA_ADDITIONS.json` и `INTERACTIVE_EVIDENCE_SCHEMA.json`.
- UI-локализация: `INTERACTIVE_UI_STRINGS.json`.
- Очередь генерации: `ASSET_GENERATION_QUEUE.json`.
- Детали конкретной улики: `cases/NN_case-id/interactive/evidenceId.json`.
- Prompt конкретной улики: `cases/NN_case-id/prompts/`.

## Asset pipeline

- `image_model`: сгенерировать по prompt, привести к указанному размеру, оптимизировать в WebP.
- `frontend`: создать воспроизводимо из JSON/SVG/Canvas; не отправлять в генератор изображений.
- Для seal_match хранить цельные master-файлы и seed, а не только готовые половины.
- Для thermal_scan хранить одну обычную сцену; цвета и шум тепловизора процедурные.
- Для document_scan важные символы создаются DOM/SVG; AI отвечает за бумагу и структуру.
- Для shadow_time_check финальное изображение обязательно проходит ручную геометрическую проверку.

- Для surface_reveal базовая сцена не содержит покрытия; cover texture и reveal masks создаются отдельно.
## Сохранения

Ключ интерактивного прогресса: `caseId/evidenceId`. Старый пользователь, уже завершивший дело, не обязан повторно проходить механику ради сохранения полученной награды; при повторном открытии улика доступна для анализа.
