# Требуемые интерактивные ассеты — дело 16

| Файл | Улика | Тип | Размер | Формат | Прозрачность | Источник | Постобработка |
|---|---|---|---|---|---|---|---|
| assets/interactive/ev-satellite-scene.webp | ev-satellite | shadow_time_check | 1600×1000 | WebP | нет | image_model | Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон. |
| assets/interactive/ev-satellite-shadow-reference.svg | ev-satellite | shadow_time_check | viewBox 0 0 100 100 | SVG | да | frontend | Откалибровать angle/length по принятому изображению. |

Файлы с generatedBy=frontend не нужно генерировать изображением: они создаются из JSON/SVG/Canvas после утверждения base/master ассета.
