# Change set: дело 23 / case-025

## Данные

- campaignOrder: 23
- requiredLevel: 12
- title.ru: Последний кофе перед пожаром
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 5
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-fire — surface_reveal; contradiction=false
- 2. ev-cctv — camera_recording; contradiction=false
- 3. ev-repair — document; contradiction=false
- 4. ev-ledger — document; contradiction=false
- 5. ev-evacuation — witness_statement; contradiction=false

## Интерактивные изменения

- ev-fire: document → surface_reveal; supports claim_cause.

## Ассеты

- Всего новых/условно новых файлов: 2.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-025. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
