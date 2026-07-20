# Change set: дело 25 / case-027

## Данные

- campaignOrder: 25
- requiredLevel: 13
- title.ru: Семена после ливня
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 5
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-meteo — document; contradiction=false
- 2. ev-sensor — usage_log; contradiction=false
- 3. ev-photo — shadow_time_check; contradiction=false
- 4. ev-seed — document; contradiction=false
- 5. ev-invoice — document; contradiction=false

## Интерактивные изменения

- ev-photo: photo → shadow_time_check; supports claim_event_time.

## Ассеты

- Всего новых/условно новых файлов: 3.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-027. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
