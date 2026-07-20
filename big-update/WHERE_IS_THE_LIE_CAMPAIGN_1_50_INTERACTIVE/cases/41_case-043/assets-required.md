# Требуемые интерактивные ассеты — дело 41

| Файл | Улика | Тип | Размер | Формат | Прозрачность | Источник | Постобработка |
|---|---|---|---|---|---|---|---|
| assets/interactive/protocol-base.webp | protocol | document_scan | 1600×1100 | WebP | нет | image_model | Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв. |
| assets/interactive/protocol-scan-overlay.svg | protocol | document_scan | viewBox 0 0 100 100 | SVG | да | frontend | После финального base.webp откалибровать hotspot и режим проявления. |

Файлы с generatedBy=frontend не нужно генерировать изображением: они создаются из JSON/SVG/Canvas после утверждения base/master ассета.
