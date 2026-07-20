# Change set: дело 50 / case-417

## Данные

- campaignOrder: 50
- requiredLevel: 30
- title.ru: Последний чемодан
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 7
- interactiveEvidenceCount: 2
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-boarding — document; contradiction=false
- 2. ev-tracking — usage_log; contradiction=true
- 3. ev-garage — camera_recording; contradiction=true
- 4. ev-listing — photo; contradiction=true
- 5. ev-payment — bank_statement; contradiction=false
- 6. ev-bottom — document_scan; contradiction=false
- 7. ev-suitcase-seal — seal_match; contradiction=false

## Интерактивные изменения

- ev-bottom: document → document_scan; reveals_season_clue claim_main.
- ev-suitcase-seal: new → seal_match; reveals_season_clue claim_main.

## Ассеты

- Всего новых/условно новых файлов: 7.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-417. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
