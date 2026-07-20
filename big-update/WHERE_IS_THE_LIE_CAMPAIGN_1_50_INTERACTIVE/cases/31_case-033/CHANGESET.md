# Change set: дело 31 / case-033

## Данные

- campaignOrder: 31
- requiredLevel: 16
- title.ru: Рука в прессе
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-medical — document; contradiction=false
- 2. ev-photo — photo; contradiction=false
- 3. ev-machine — usage_log; contradiction=false
- 4. ev-witness — witness_statement; contradiction=false
- 5. ev-relay — seal_match; contradiction=false
- 6. ev-safety — document; contradiction=false

## Интерактивные изменения

- ev-relay: document → seal_match; reveals_season_clue claim_main.

## Ассеты

- Всего новых/условно новых файлов: 5.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-033. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
