# Требуемые интерактивные ассеты — дело 50

| Файл | Улика | Тип | Размер | Формат | Прозрачность | Источник | Постобработка |
|---|---|---|---|---|---|---|---|
| assets/interactive/ev-bottom-base.webp | ev-bottom | document_scan | 1600×1100 | WebP | нет | image_model | Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв. |
| assets/interactive/ev-bottom-scan-overlay.svg | ev-bottom | document_scan | viewBox 0 0 100 100 | SVG | да | frontend | После финального base.webp откалибровать hotspot и режим проявления. |
| assets/interactive/ev-suitcase-seal-master-a.webp | ev-suitcase-seal | seal_match | 1400×500 | WebP | да | image_model | Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed. |
| assets/interactive/ev-suitcase-seal-fragments.json | ev-suitcase-seal | seal_match | normalized component space | JSON | да | frontend | Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap. |

Файлы с generatedBy=frontend не нужно генерировать изображением: они создаются из JSON/SVG/Canvas после утверждения base/master ассета.
