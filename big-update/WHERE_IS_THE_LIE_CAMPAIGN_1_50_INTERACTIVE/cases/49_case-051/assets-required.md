# Требуемые интерактивные ассеты — дело 49

| Файл | Улика | Тип | Размер | Формат | Прозрачность | Источник | Постобработка |
|---|---|---|---|---|---|---|---|
| assets/interactive/photo-staged-van-scene.webp | photo-staged-van | shadow_time_check | 1600×1000 | WebP | нет | image_model | Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон. |
| assets/interactive/photo-staged-van-shadow-reference.svg | photo-staged-van | shadow_time_check | viewBox 0 0 100 100 | SVG | да | frontend | Откалибровать angle/length по принятому изображению. |

Файлы с generatedBy=frontend не нужно генерировать изображением: они создаются из JSON/SVG/Canvas после утверждения base/master ассета.
