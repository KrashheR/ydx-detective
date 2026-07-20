# Change set: дело 10 / case-005

## Данные

- campaignOrder: 10
- requiredLevel: 5
- title.ru: Полтергейст вышел в эфир
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-stream — camera_recording; contradiction=false
- 2. ev-network — usage_log; contradiction=false
- 3. ev-entry-camera — camera_recording; contradiction=true
- 4. ev-raw-camera — camera_recording; contradiction=true
- 5. ev-consultant-chat — document; contradiction=true
- 6. ev-17k-scan — document_scan; contradiction=false

## Интерактивные изменения

- ev-17k-scan: new → document_scan; reveals_season_clue claim_main.

## Ассеты

- Всего новых/условно новых файлов: 2.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-005. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
