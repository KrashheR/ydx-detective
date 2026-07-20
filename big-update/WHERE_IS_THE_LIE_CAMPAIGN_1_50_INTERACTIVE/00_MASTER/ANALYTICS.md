# Аналитика удержания

## Версия контента

Передавать campaignContentVersion = archive17_full_v1.

## События

- case_started
- evidence_opened
- contradiction_stamped
- verdict_submitted
- case_completed
- post_verdict_note_seen
- season_clue_revealed
- next_case_teaser_seen
- next_case_clicked
- act_completed
- campaign_exited
- daily_case_opened

## Параметры

caseId, campaignOrder, act, truth, evidenceId, openedEvidenceCount, stampedCount, verdictCorrect, elapsedSeconds, seasonClueId, sessionCaseCount.

## Главные воронки

- 10 → 11: продолжает ли игрок после первого мини-финала.
- 15 → 16: удерживает ли эмоциональное valid-дело.
- 20 → 21: работает ли раскрытие подписи Карелина.
- 25 → 30: удерживает ли возвращение Болата и открытие Восточного двора.
- 30 → 31: понятен ли переход в отдел особых рисков.
- 38 → 40: верит ли игрок, что сеть стала реальной угрозой.
- 43 → 45: различает ли игрок настоящие и поддельные следы.
- 48 → 50: работает ли возвращение Тернова и Феррейра.
- D1/D3/D7 среди игроков, увидевших хотя бы один сюжетный фрагмент, против контрольной версии.

Нельзя заявлять удвоение удержания без A/B-сравнения или исторического baseline. Сюжетная версия должна иметь отдельный флаг эксперимента.

# Интерактивная аналитика

События: `evidence_interactive_opened`, `evidence_mode_changed`, `evidence_anomaly_selected`, `evidence_analysis_completed`, `evidence_reset`, `evidence_hint_used`, `evidence_abandoned`.

Параметры: `caseId`, `campaignOrder`, `evidenceId`, `evidenceType`, `timeSpentMs`, `attempts`, `hintLevel`, `success`, `inputMethod`, `relation`.

Surface reveal события: `surface_reveal_opened`, `surface_reveal_stroke_started`, `surface_reveal_trace_discovered`, `surface_reveal_completed`, `surface_reveal_reset`, `surface_reveal_hint_used`, `surface_reveal_abandoned`.

Surface reveal параметры: `coverType`, `strokeCount`, `revealedPercent`, `discoveredTraceIds`, `brushRadius`, `pointerType`.

Основные метрики: completion rate каждой механики, median time, reset rate, hint rate, abandon rate, доля правильных штампов после анализа, влияние на next_case_clicked и D1/D3/D7.

Пролог: `onboarding_started`, `first_evidence_opened`, `first_contradiction_found`, `first_stamp_placed`, `case_1_completed`, `valid_case_approved`, `case_3_completed`, `meta_unlocked`, `archive_17_board_opened`. Обязательные параметры: `timeFromLaunchMs`, `attempts`, `hintLevel`, `quitStep`, `inputMethod`.

Финал: `campaign_final_synthesis_opened`, `campaign_final_link_attempted`, `campaign_final_synthesis_completed`, `campaign_epilogue_viewed`.

Не считать более длинное время автоматически успехом: целевой диапазон взаимодействия 5–20 секунд. A/B-тестировать новую версию против той же сюжетной кампании без интерактивного слоя.
