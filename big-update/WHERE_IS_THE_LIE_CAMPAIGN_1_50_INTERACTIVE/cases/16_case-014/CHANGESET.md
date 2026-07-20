# Change set: дело 16 / case-014

## Данные

- campaignOrder: 16
- requiredLevel: 8
- title.ru: Белая полоса над полем
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 4
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-weather — document; contradiction=false
- 2. ev-satellite — shadow_time_check; contradiction=false
- 3. ev-agro — document; contradiction=false
- 4. ev-contract — document; contradiction=false

## Интерактивные изменения

- ev-satellite: photo → shadow_time_check; supports claim_event_time.

## Ассеты

- Всего новых/условно новых файлов: 3.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-014. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
