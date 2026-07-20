# Требуемые интерактивные ассеты — дело 31

| Файл | Улика | Тип | Размер | Формат | Прозрачность | Источник | Постобработка |
|---|---|---|---|---|---|---|---|
| assets/interactive/ev-relay-master-a.webp | ev-relay | seal_match | 1400×500 | WebP | да | image_model | Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed. |
| assets/interactive/ev-relay-master-b.webp | ev-relay | seal_match | 1400×500 | WebP | да | image_model | Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed. |
| assets/interactive/ev-relay-fragments.json | ev-relay | seal_match | normalized component space | JSON | да | frontend | Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap. |

Файлы с generatedBy=frontend не нужно генерировать изображением: они создаются из JSON/SVG/Canvas после утверждения base/master ассета.
