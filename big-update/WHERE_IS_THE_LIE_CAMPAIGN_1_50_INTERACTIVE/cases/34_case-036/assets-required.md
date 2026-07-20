# Требуемые интерактивные ассеты — дело 34

| Файл | Улика | Тип | Размер | Формат | Прозрачность | Источник | Постобработка |
|---|---|---|---|---|---|---|---|
| assets/interactive/ev-melt-scene.webp | ev-melt | thermal_scan | 1600×1000 | WebP | нет | image_model | Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones. |
| assets/interactive/ev-melt-heat-zones.json | ev-melt | thermal_scan | normalized percent coordinates | JSON | да | frontend | Откалибровать зоны после утверждения изображения. |

Файлы с generatedBy=frontend не нужно генерировать изображением: они создаются из JSON/SVG/Canvas после утверждения base/master ассета.
