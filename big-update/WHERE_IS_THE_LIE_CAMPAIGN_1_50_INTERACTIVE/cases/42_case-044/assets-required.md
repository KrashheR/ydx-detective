# Требуемые интерактивные ассеты — дело 42

| Файл | Улика | Тип | Размер | Формат | Прозрачность | Источник | Постобработка |
|---|---|---|---|---|---|---|---|
| assets/interactive/photo-44-scene.webp | photo-44 | thermal_scan | 1600×1000 | WebP | нет | image_model | Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones. |
| assets/interactive/photo-44-heat-zones.json | photo-44 | thermal_scan | normalized percent coordinates | JSON | да | frontend | Откалибровать зоны после утверждения изображения. |

Файлы с generatedBy=frontend не нужно генерировать изображением: они создаются из JSON/SVG/Canvas после утверждения base/master ассета.
