# Change set: дело 40 / case-042

## Данные

- campaignOrder: 40
- requiredLevel: 20
- title.ru: Клинок, проданный до кражи
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-display — photo; contradiction=true
- 2. ev-bank — bank_statement; contradiction=true
- 3. ev-courier — seal_match; contradiction=true
- 4. ev-access — usage_log; contradiction=true
- 5. ev-guard — witness_statement; contradiction=true
- 6. ev-valuation — document; contradiction=false

## Интерактивные изменения

- ev-courier: social_media → seal_match; contradicts claim_forced_entry.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-042. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
