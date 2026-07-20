# Change set: дело 42 / case-044

## Данные

- campaignOrder: 42
- requiredLevel: 22
- title.ru: Слишком удобная серая лента
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. photo-44 — thermal_scan; contradiction=true
- 2. document-44 — document; contradiction=false
- 3. camera-44 — camera_recording; contradiction=false
- 4. log-44 — usage_log; contradiction=true
- 5. bank-44 — bank_statement; contradiction=false
- 6. tape-44 — document; contradiction=false

## Интерактивные изменения

- photo-44: photo → thermal_scan; contradicts claim_spontaneous_overheat.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-044. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
