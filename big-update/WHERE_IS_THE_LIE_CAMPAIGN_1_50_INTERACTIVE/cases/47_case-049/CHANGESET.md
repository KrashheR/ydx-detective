# Change set: дело 47 / case-049

## Данные

- campaignOrder: 47
- requiredLevel: 27
- title.ru: Контейнер M-7
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. photo-49 — surface_reveal; contradiction=true
- 2. document-49 — document; contradiction=true
- 3. camera-49 — camera_recording; contradiction=false
- 4. log-49 — usage_log; contradiction=true
- 5. bank-49 — bank_statement; contradiction=false
- 6. witness-49 — witness_statement; contradiction=false

## Интерактивные изменения

- photo-49: photo → surface_reveal; contradicts claim_entry_route.

## Ассеты

- Всего новых/условно новых файлов: 5.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-049. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
